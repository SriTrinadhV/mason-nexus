-- Mason Nexus — Phase 13 backend schema
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query → paste → Run)
-- against a fresh project, before running seed.sql.
--
-- Design notes:
--   * Every table uses a UUID primary key (gen_random_uuid()) — continues the
--     Phase 9B "no Date.now() IDs" rule at the database level.
--   * "Real" accounts (created via supabase.auth.signUp) get a profiles row
--     whose id EQUALS their auth.users id (see handle_new_user() below), so
--     `profiles.id = auth.uid()` is always a valid ownership check.
--   * Demo/seed profiles (Jordan Lee, Priya Patel, etc.) are NOT backed by a
--     real auth.users row — they exist purely as browsable directory/demo
--     content, exactly like the old mock data, and can never be "signed in
--     as" or edited by anyone, because no auth.uid() will ever match their id.
--   * Mutable counters (member counts, like counts, vote totals) are never
--     stored — they're always derived with COUNT(*), so there is nothing for
--     concurrent/duplicate actions to desynchronize.
--   * Every action that has both a uniqueness requirement AND a side effect
--     (join → notification, capacity-checked join, vote-or-change-vote) goes
--     through a SECURITY DEFINER function and has NO direct table-level
--     INSERT/DELETE policy for authenticated users — the function is the only
--     write path, so client code cannot bypass capacity checks or dedup logic
--     by calling the REST endpoint directly.

create extension if not exists pgcrypto;

-- Row Level Security only filters WHICH ROWS a role can touch — Postgres
-- still requires a base table-level GRANT before a role can attempt an
-- operation on a table at all, independent of RLS. Every table below has
-- RLS enabled with deliberately narrow policies (many tables have no
-- INSERT/UPDATE/DELETE policy at all, forcing writes through the SECURITY
-- DEFINER functions further down) — granting broad privileges here is safe
-- specifically because RLS is the real authorization boundary underneath it,
-- not this GRANT. anon does not need this: every public.* table requires a
-- signed-in user by design, and every policy below is scoped `to authenticated`.
-- (The actual table GRANT is at the bottom of this file, after every table
-- exists — "grant ... on all tables" only affects tables that already exist
-- at the moment it runs. This default-privileges line covers any table
-- created later, by this same role, that a future migration might add.)
grant usage on schema public to authenticated;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;

-- =========================================================================
-- PROFILES
-- =========================================================================

create table public.profiles (
  id uuid primary key,
  email text not null,
  real_name text not null default '',
  display_name text not null default '',
  pseudonymous boolean not null default false,
  major text not null default '',
  year text not null default 'Sophomore' check (year in ('Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate')),
  courses text[] not null default '{}',
  interests text[] not null default '{}',
  skills text[] not null default '{}',
  looking_for text[] not null default '{}',
  bio text not null default '',
  avatar_color text not null default 'mason-green-500',
  available_for text[] not null default '{}',
  role text not null default 'Student' check (role in ('Student', 'Moderator', 'Community Organizer')),
  -- Honest scope: this reflects the signup email passing the @gmu.edu /
  -- @masonlive.gmu.edu domain check (see enforce_gmu_email below), NOT real
  -- institutional SSO verification. The UI must not claim more than this.
  verified boolean not null default true,
  discoverable boolean not null default true,
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A non-discoverable profile is invisible to everyone except its own owner —
-- this is the backend-enforced version of the Phase 2 discoverability rule.
create policy "profiles_select" on public.profiles
  for select to authenticated
  using (discoverable = true or id = auth.uid());

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- No insert policy: rows are created only by handle_new_user() (SECURITY
-- DEFINER) or by seed.sql running as the project owner. No delete policy:
-- account deletion is out of scope for this phase.

create table public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  link text,
  placeholder_color text not null default 'mason-green-200',
  created_at timestamptz not null default now()
);

alter table public.portfolio_items enable row level security;

create policy "portfolio_items_select" on public.portfolio_items
  for select to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = portfolio_items.profile_id and (p.discoverable = true or p.id = auth.uid())
    )
  );

create policy "portfolio_items_owner_write" on public.portfolio_items
  for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- =========================================================================
-- COMMUNITIES
-- =========================================================================

create table public.communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('class', 'club', 'interest')),
  description text not null default '',
  tags text[] not null default '{}',
  color text not null default 'mason-green',
  course_code text,
  created_by uuid references public.profiles(id) on delete set null,
  pending_review boolean not null default false,
  recent_activity_summary text not null default 'Just created',
  created_at timestamptz not null default now()
);

alter table public.communities enable row level security;

create policy "communities_select_all" on public.communities
  for select to authenticated using (true);

create policy "communities_insert_own" on public.communities
  for insert to authenticated
  with check (created_by = auth.uid());

-- Interest-category communities are always pending review, regardless of
-- what the client sends — mirrors the old createCommunity() rule but makes
-- it impossible to bypass from the client.
create or replace function public.set_pending_review()
returns trigger
language plpgsql
as $$
begin
  new.pending_review := (new.category = 'interest');
  return new;
end;
$$;

create trigger trg_communities_pending_review
  before insert on public.communities
  for each row execute function public.set_pending_review();

create table public.community_members (
  community_id uuid not null references public.communities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

alter table public.community_members enable row level security;

-- Public: member counts are a public stat in this app (no membership-list UI
-- exists, but counts must be derivable by everyone via COUNT(*)).
create policy "community_members_select_all" on public.community_members
  for select to authenticated using (true);

-- No insert/delete policy — join_community()/leave_community() are the only
-- write path (see below), which is what guarantees idempotency + the
-- join notification firing exactly once.

-- =========================================================================
-- POSTS / COMMENTS / LIKES / SAVES
-- =========================================================================

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  body text not null default '' check (char_length(body) <= 5000),
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy "posts_select_all" on public.posts
  for select to authenticated using (true);

create policy "posts_insert_own" on public.posts
  for insert to authenticated
  with check (author_id = auth.uid());

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

alter table public.comments enable row level security;

create policy "comments_select_all" on public.comments
  for select to authenticated using (true);

create policy "comments_insert_own" on public.comments
  for insert to authenticated
  with check (author_id = auth.uid());

create table public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (post_id, user_id)
);

alter table public.post_likes enable row level security;

create policy "post_likes_select_all" on public.post_likes
  for select to authenticated using (true);
-- Writes only via toggle_post_like().

create table public.post_saves (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (post_id, user_id)
);

alter table public.post_saves enable row level security;

create policy "post_saves_select_own" on public.post_saves
  for select to authenticated using (user_id = auth.uid());
-- Writes only via toggle_post_save().

-- =========================================================================
-- STUDY GROUPS
-- =========================================================================

create table public.study_groups (
  id uuid primary key default gen_random_uuid(),
  course_code text not null,
  title text not null,
  description text not null default '',
  capacity integer not null check (capacity > 0),
  meeting_time text not null default '',
  location text not null default '',
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.study_groups enable row level security;

create policy "study_groups_select_all" on public.study_groups
  for select to authenticated using (true);

create policy "study_groups_insert_own" on public.study_groups
  for insert to authenticated
  with check (created_by = auth.uid());

-- The creator is automatically a member of their own group (matches the old
-- mock behavior: memberIds: [createdBy]). This is the ONE exception to
-- "study_group_members writes only go through join_study_group()" — it's
-- safe because it always adds exactly the creator, exactly once, and every
-- group's capacity check (capacity > 0) guarantees room for at least them.
create or replace function public.add_creator_as_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into study_group_members (study_group_id, user_id)
  values (new.id, new.created_by)
  on conflict (study_group_id, user_id) do nothing;
  return new;
end;
$$;

create trigger trg_study_group_add_creator
  after insert on public.study_groups
  for each row execute function public.add_creator_as_member();

create table public.study_group_members (
  study_group_id uuid not null references public.study_groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (study_group_id, user_id)
);

alter table public.study_group_members enable row level security;

create policy "study_group_members_select_all" on public.study_group_members
  for select to authenticated using (true);
-- Writes only via join_study_group() — this is what makes the capacity
-- check atomic under concurrent joins (see the function below).

-- Students who've signalled interest in a study partner for a course but
-- haven't joined a specific group yet. There is no UI action that writes to
-- this table today (it was static decorative seed data in the old mock
-- array too) — it powers the "N students looking for a study partner"
-- signal in Nexus Now / For You. Kept as a static demo table, not a
-- regression from current behavior.
create table public.study_group_seekers (
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_code text not null,
  primary key (user_id, course_code)
);

alter table public.study_group_seekers enable row level security;

create policy "study_group_seekers_select_all" on public.study_group_seekers
  for select to authenticated using (true);
-- No insert policy — seed-only, matching its static role in the current app.

-- =========================================================================
-- OPPORTUNITIES
-- =========================================================================

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  required_skills text[] not null default '{}',
  community_context text not null default '',
  posted_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.opportunities enable row level security;

create policy "opportunities_select_all" on public.opportunities
  for select to authenticated using (true);

create policy "opportunities_insert_own" on public.opportunities
  for insert to authenticated
  with check (posted_by = auth.uid());

create table public.opportunity_interest (
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (opportunity_id, user_id)
);

alter table public.opportunity_interest enable row level security;

-- Row visibility is public, but the *display name* of an interested student
-- is only resolvable if their profile passes the discoverability policy
-- above — this is how "interested students respect discoverability" is
-- enforced without duplicating the discoverability check here.
create policy "opportunity_interest_select_all" on public.opportunity_interest
  for select to authenticated using (true);
-- Writes only via express_opportunity_interest().

-- =========================================================================
-- NOTIFICATIONS
-- =========================================================================

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in (
    'reply', 'study_group', 'community_recommendation', 'collaboration_interest',
    'opportunity_match', 'community_joined', 'interest_recorded'
  )),
  title text not null,
  body text not null default '',
  link_to text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "notifications_select_own" on public.notifications
  for select to authenticated
  using (recipient_id = auth.uid());

create policy "notifications_update_own" on public.notifications
  for update to authenticated
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

-- No insert policy: notifications are only ever created by the SECURITY
-- DEFINER action functions below, as a side effect of a real event — a user
-- can never insert a notification (for themselves or anyone else) directly.

-- =========================================================================
-- POLLS
-- =========================================================================

create table public.polls (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  created_at timestamptz not null default now()
);

create table public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  label text not null
);

create table public.poll_votes (
  poll_id uuid not null references public.polls(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  voted_at timestamptz not null default now(),
  primary key (poll_id, user_id)
);

alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;

create policy "polls_select_all" on public.polls for select to authenticated using (true);
create policy "poll_options_select_all" on public.poll_options for select to authenticated using (true);
create policy "poll_votes_select_all" on public.poll_votes for select to authenticated using (true);
-- No insert policy on polls/poll_options (seed/admin-authored catalog).
-- No insert/update policy on poll_votes — vote_in_poll() is the only write
-- path, which is what makes "one vote per user, safe vote-changing" a
-- database guarantee instead of a client-side promise.

-- =========================================================================
-- REPORTS
-- =========================================================================

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('post', 'comment', 'student', 'community')),
  target_id uuid not null,
  reason text not null check (reason in (
    'Spam', 'Harassment', 'Inappropriate content', 'Privacy/doxxing concern', 'Academic integrity concern'
  )),
  details text,
  status text not null default 'queued_for_review' check (status in ('queued_for_review', 'ai_flagged', 'resolved')),
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

-- Only the reporter can ever read their own report back. There is no
-- moderator role/UI in this phase, so nobody else can read reports at all —
-- an honest limitation, not a placeholder for one that doesn't exist yet.
create policy "reports_select_own" on public.reports
  for select to authenticated
  using (reporter_id = auth.uid());

create policy "reports_insert_own" on public.reports
  for insert to authenticated
  with check (reporter_id = auth.uid());

create or replace function public.set_report_status()
returns trigger
language plpgsql
as $$
declare
  high_priority text[] := array['Harassment', 'Privacy/doxxing concern', 'Academic integrity concern'];
begin
  new.status := case when new.reason = any(high_priority) then 'ai_flagged' else 'queued_for_review' end;
  return new;
end;
$$;

create trigger trg_reports_status
  before insert on public.reports
  for each row execute function public.set_report_status();

-- =========================================================================
-- SIGNUP: GMU email domain gate + auto-create profile
-- =========================================================================

-- Domain-restriction only — this cannot and does not prove someone is a
-- currently-enrolled/authorized GMU student (that would require real
-- institutional SSO, which this project does not have access to). It only
-- rejects signups whose email isn't on the gmu.edu/masonlive.gmu.edu domain.
create or replace function public.enforce_gmu_email()
returns trigger
language plpgsql
as $$
begin
  if new.email !~* '^[^@]+@(gmu\.edu|masonlive\.gmu\.edu)$' then
    raise exception 'Use a GMU email address (@gmu.edu or @masonlive.gmu.edu) to sign up.';
  end if;
  return new;
end;
$$;

create trigger trg_enforce_gmu_email
  before insert on auth.users
  for each row execute function public.enforce_gmu_email();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text := coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1));
begin
  insert into public.profiles (id, email, real_name, display_name)
  values (new.id, new.email, v_name, v_name);
  return new;
end;
$$;

create trigger trg_handle_new_user
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================================
-- ACTION FUNCTIONS — the only write path for idempotent/side-effecting actions
-- =========================================================================

create or replace function public.join_community(p_community_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_name text;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  insert into community_members (community_id, user_id)
  values (p_community_id, v_user_id)
  on conflict (community_id, user_id) do nothing;

  if not found then
    return; -- already a member: no-op, no duplicate notification
  end if;

  select name into v_name from communities where id = p_community_id;

  insert into notifications (recipient_id, type, title, body, link_to)
  values (
    v_user_id,
    'community_joined',
    'You joined ' || coalesce(v_name, 'a community'),
    'You joined ' || coalesce(v_name, 'a community') || '. Check out recent posts and discussions.',
    '/communities/' || p_community_id
  );
end;
$$;

create or replace function public.leave_community(p_community_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  delete from community_members
  where community_id = p_community_id and user_id = auth.uid();
end;
$$;

create or replace function public.join_study_group(p_group_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_capacity integer;
  v_member_count integer;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Row lock on the study group serializes concurrent joins to the SAME
  -- group, so the capacity check below is atomic even under a burst of
  -- simultaneous requests.
  select capacity into v_capacity from study_groups where id = p_group_id for update;
  if v_capacity is null then
    raise exception 'Study group not found';
  end if;

  select count(*) into v_member_count from study_group_members where study_group_id = p_group_id;
  if v_member_count >= v_capacity then
    raise exception 'This study group is full';
  end if;

  insert into study_group_members (study_group_id, user_id)
  values (p_group_id, v_user_id)
  on conflict (study_group_id, user_id) do nothing;
end;
$$;

create or replace function public.express_opportunity_interest(p_opportunity_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_title text;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  insert into opportunity_interest (opportunity_id, user_id)
  values (p_opportunity_id, v_user_id)
  on conflict (opportunity_id, user_id) do nothing;

  if not found then
    return;
  end if;

  select title into v_title from opportunities where id = p_opportunity_id;

  insert into notifications (recipient_id, type, title, body, link_to)
  values (
    v_user_id,
    'interest_recorded',
    'Interest recorded',
    'You expressed interest in "' || coalesce(v_title, 'this opportunity') || '". The poster will be able to see you''re interested.',
    '/opportunities/' || p_opportunity_id
  );
end;
$$;

create or replace function public.vote_in_poll(p_poll_id uuid, p_option_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (select 1 from poll_options where id = p_option_id and poll_id = p_poll_id) then
    raise exception 'Invalid poll option';
  end if;

  insert into poll_votes (poll_id, user_id, option_id)
  values (p_poll_id, v_user_id, p_option_id)
  on conflict (poll_id, user_id) do update set option_id = excluded.option_id, voted_at = now();
end;
$$;

create or replace function public.toggle_post_like(p_post_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  delete from post_likes where post_id = p_post_id and user_id = v_user_id;
  if found then
    return false;
  end if;

  insert into post_likes (post_id, user_id) values (p_post_id, v_user_id);
  return true;
end;
$$;

create or replace function public.toggle_post_save(p_post_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  delete from post_saves where post_id = p_post_id and user_id = v_user_id;
  if found then
    return false;
  end if;

  insert into post_saves (post_id, user_id) values (p_post_id, v_user_id);
  return true;
end;
$$;

grant execute on function
  public.join_community(uuid),
  public.leave_community(uuid),
  public.join_study_group(uuid),
  public.express_opportunity_interest(uuid),
  public.vote_in_poll(uuid, uuid),
  public.toggle_post_like(uuid),
  public.toggle_post_save(uuid)
to authenticated;

-- =========================================================================
-- TABLE-LEVEL GRANTS (must run after every table above exists)
-- =========================================================================
-- See the note at the top of this file: RLS policies above are the real
-- authorization boundary (many tables intentionally have no INSERT/UPDATE/
-- DELETE policy, e.g. community_members, poll_votes, notifications — RLS
-- denies those regardless of this grant). This just satisfies Postgres'
-- separate, coarser "is this role allowed to touch this table at all" check
-- that sits in front of RLS.
grant select, insert, update, delete on all tables in schema public to authenticated;

-- Mason Nexus — Phase 13 demo/seed data
-- Run this once, AFTER schema.sql, in the Supabase SQL Editor.
--
-- This is the exact content that used to live in src/data/*.ts, migrated
-- into the database. These profiles are demo/directory content only — they
-- have no auth.users row, so nobody can sign in as them or edit them (see
-- the design note at the top of schema.sql). Real accounts created via the
-- signup flow are entirely separate rows, created by handle_new_user().
--
-- Fixed UUIDs are used (instead of gen_random_uuid()) purely so this file's
-- own INSERTs can cross-reference each other by id.

-- =========================================================================
-- PROFILES
-- =========================================================================

insert into public.profiles (id, email, real_name, display_name, pseudonymous, major, year, courses, interests, skills, looking_for, bio, avatar_color, available_for, role, verified, discoverable, onboarded) values
('a1111111-1111-1111-1111-111111111101', 'alex.johnson@masonlive.gmu.edu', 'Alex Johnson', 'Alex Johnson', false, 'Computer Science', 'Sophomore', array['CS 310','CS 330'], array['Artificial Intelligence','Photography','Hiking','Startups'], array['Python','Video Editing','UI Design'], array['Study partners','Collaboration','People with similar interests'], 'Sophomore CS major figuring out the intersection of AI and creative tools. Always down to talk about weekend hikes or trail photos.', 'mason-green-500', array['Study groups','Hackathon teams'], 'Student', true, true, true),
('a1111111-1111-1111-1111-111111111102', 'jordan.lee@masonlive.gmu.edu', 'Jordan Lee', 'Jordan Lee', false, 'Computer Science', 'Sophomore', array['CS 310','CS 321'], array['Artificial Intelligence','Gaming','Robotics'], array['Python','Java','Machine Learning'], array['Study partners','Collaboration'], 'Building small ML side projects between problem sets. Happy to pair on recursion or trees.', 'mason-green-400', array['Study groups','Hackathon teams'], 'Student', true, true, true),
('a1111111-1111-1111-1111-111111111103', 'priya.patel@masonlive.gmu.edu', 'Priya Patel', 'Priya Patel', false, 'Information Technology', 'Junior', array['CS 310','IT 305'], array['Entrepreneurship','Artificial Intelligence','Design'], array['UI Design','Product Strategy','Figma'], array['Collaboration','Opportunities'], 'Junior IT major, co-running a small startup idea out of the Mason Innovation Lab. Looking for a technical co-founder.', 'mason-gold-400', array['Hackathon teams','Startup collaboration'], 'Community Organizer', true, true, true),
('a1111111-1111-1111-1111-111111111104', 'sam.rivera@masonlive.gmu.edu', 'Sam Rivera', 'Sam Rivera', false, 'Film and Video Studies', 'Junior', array['FILM 220'], array['Photography','Video Editing','Hiking'], array['Video Editing','Photography','Color Grading'], array['Collaboration','Communities'], 'Editing a short documentary about campus life this semester. Always looking for footage from student events.', 'mason-gold-300', array['Video projects','Campus event coverage'], 'Student', true, true, true),
('a1111111-1111-1111-1111-111111111105', 'maria.gonzalez@masonlive.gmu.edu', 'Maria Gonzalez', 'Maria Gonzalez', false, 'Computer Science', 'Sophomore', array['CS 310','CS 330','MATH 125'], array['Artificial Intelligence','Gaming'], array['Python','C++'], array['Study partners'], 'Trying to survive CS 330 proofs one theorem at a time. Down for regular study sessions.', 'mason-green-300', array['Study groups'], 'Student', true, true, true),
('a1111111-1111-1111-1111-111111111106', 'ben.carter@masonlive.gmu.edu', 'Ben Carter', 'coach_ben', true, 'Kinesiology', 'Senior', array[]::text[], array['Hiking','Fitness'], array['Event Planning','Leadership'], array['Communities','Friends'], 'Hiking Club officer. Planning the fall trip schedule — always want more people on the trail.', 'mason-green-600', array['Club events'], 'Moderator', true, true, true),
('a1111111-1111-1111-1111-111111111107', 'chris.nguyen@masonlive.gmu.edu', 'Chris Nguyen', 'Chris Nguyen', false, 'Computer Science', 'Senior', array['CS 421','CS 480'], array['Artificial Intelligence','Startups'], array['Python','React','Backend Development'], array['Collaboration','Opportunities'], 'Senior looking to mentor underclassmen on AI coursework. Building a capstone project on recommendation systems.', 'mason-green-700', array['Mentorship','Hackathon teams'], 'Student', true, true, true),
('a1111111-1111-1111-1111-111111111108', 'devon.brooks@masonlive.gmu.edu', 'Devon Brooks', 'Devon Brooks', false, 'Computer Science', 'Sophomore', array['CS 310'], array['Gaming','Artificial Intelligence'], array['Python','Game Design'], array['Study partners','People with similar interests'], 'Working through the CS 310 recursion unit. Also building a small roguelike on the side.', 'mason-gold-500', array['Study groups'], 'Student', true, true, true),
('a1111111-1111-1111-1111-111111111109', 'taylor.morgan@masonlive.gmu.edu', 'Taylor Morgan', 'Taylor Morgan', false, 'Marketing', 'Junior', array[]::text[], array['Entrepreneurship','Photography'], array['Marketing','Social Media','Photography'], array['Collaboration','Opportunities'], 'Marketing lead for a student organization looking for creative collaborators this semester.', 'mason-gold-600', array['Marketing projects'], 'Community Organizer', true, true, true);

insert into public.portfolio_items (profile_id, title, description, link, placeholder_color) values
('a1111111-1111-1111-1111-111111111101', 'Trailcam — hiking route planner', 'A weekend project mapping GMU Outdoors club hikes with elevation data.', 'https://github.com/example/trailcam', 'mason-green-200'),
('a1111111-1111-1111-1111-111111111101', 'Fall Foliage Reel', 'Short video edit from a hiking trip at Great Falls, cut in Premiere.', null, 'mason-gold-200'),
('a1111111-1111-1111-1111-111111111103', 'StudySync — onboarding flow', 'Figma prototype for a study-matching app pitched at Mason Startup Weekend.', null, 'mason-gold-200'),
('a1111111-1111-1111-1111-111111111104', 'Fenwick After Dark', 'Short documentary about late-night study culture at Fenwick Library.', null, 'mason-green-200'),
('a1111111-1111-1111-1111-111111111107', 'CourseMatch capstone', 'Recommendation engine for elective course selection, built for CS 480 capstone.', 'https://github.com/example/coursematch', 'mason-gold-200');

-- =========================================================================
-- COMMUNITIES
-- =========================================================================

insert into public.communities (id, name, category, description, tags, color, course_code, created_by, recent_activity_summary) values
('b2222222-2222-2222-2222-222222222201', 'CS 310', 'class', 'Data Structures — official course community for discussion, study groups, and problem-set help.', array['Computer Science','Sophomore','Required Course'], 'mason-green', 'CS 310', null, '12 new posts this week'),
('b2222222-2222-2222-2222-222222222202', 'CS 330', 'class', 'Formal Methods and Models — proofs, automata, and everything in between.', array['Computer Science','Theory','Required Course'], 'mason-green', 'CS 330', null, '5 new posts this week'),
('b2222222-2222-2222-2222-222222222203', 'MATH 125', 'class', 'Discrete Mathematics — problem sets, proof-writing help, and exam prep.', array['Mathematics','Required Course'], 'mason-green', 'MATH 125', null, '8 new posts this week'),
('b2222222-2222-2222-2222-222222222204', 'Mason Developers', 'club', 'GMU''s largest student dev club. Weekly build nights, hackathon teams, and workshops on shipping real projects.', array['Software','Hackathons','Careers'], 'mason-gold', null, null, 'Build night Thursday, 7 PM'),
('b2222222-2222-2222-2222-222222222205', 'Photography Club', 'club', 'Official student org for photographers of all levels. Weekend shoots, gear swaps, and a campus photo showcase each semester.', array['Photography','Creative','Events'], 'mason-gold', null, null, 'Event tomorrow: Golden hour shoot at the Quad'),
('b2222222-2222-2222-2222-222222222206', 'Hiking Club', 'club', 'Weekend trips around Northern Virginia — Great Falls, Shenandoah, and everything in between. No experience required.', array['Outdoors','Fitness','Social'], 'mason-green', null, null, 'Trip signup closes Friday'),
('b2222222-2222-2222-2222-222222222207', 'Mason Gamers', 'club', 'Casual and competitive gaming club — tournaments, LAN nights, and a Discord that never sleeps.', array['Gaming','Esports','Social'], 'mason-gold', null, null, 'Smash tournament this weekend'),
('b2222222-2222-2222-2222-222222222208', 'AI & Machine Learning at Mason', 'interest', 'Student-run community for anyone curious about AI/ML — paper discussions, project pairing, and beginner-friendly threads.', array['Artificial Intelligence','Machine Learning','Research'], 'mason-green', null, null, 'New thread: intro to transformers'),
('b2222222-2222-2222-2222-222222222209', 'Student Startups', 'interest', 'For students building something on the side — idea validation, cofounder matching, and pitch practice.', array['Entrepreneurship','Startups','Business'], 'mason-gold', null, null, '2 new collaboration requests'),
('b2222222-2222-2222-2222-222222222210', 'Shutterbugs at Mason', 'interest', 'A casual space for people who love photography as a hobby — phone photography welcome, no club dues.', array['Photography','Hobby'], 'mason-gold', null, null, 'Photo-of-the-week thread is live'),
('b2222222-2222-2222-2222-222222222211', 'Pokémon at Mason', 'interest', 'Trading, competitive battling, and general Pokémon chat between classes.', array['Gaming','Pokémon','Hobby'], 'mason-green', null, null, 'Trade thread updated today'),
('b2222222-2222-2222-2222-222222222212', 'Robotics at Mason', 'interest', 'For students interested in robotics, from FRC alumni to first-timers who just like the idea of building things that move.', array['Robotics','Engineering'], 'mason-green', null, null, '3 new posts this week');

-- Membership (mirrors the old memberCount-by-proxy — every join below is a
-- real row, so COUNT(*) reproduces a plausible member count without
-- pretending 200+ demo accounts exist; UI copy states these are prototype
-- numbers where it matters, e.g. Nexus Now already labels itself as demo).
insert into public.community_members (community_id, user_id) values
('b2222222-2222-2222-2222-222222222201','a1111111-1111-1111-1111-111111111101'),
('b2222222-2222-2222-2222-222222222201','a1111111-1111-1111-1111-111111111102'),
('b2222222-2222-2222-2222-222222222201','a1111111-1111-1111-1111-111111111103'),
('b2222222-2222-2222-2222-222222222201','a1111111-1111-1111-1111-111111111105'),
('b2222222-2222-2222-2222-222222222201','a1111111-1111-1111-1111-111111111108'),
('b2222222-2222-2222-2222-222222222202','a1111111-1111-1111-1111-111111111101'),
('b2222222-2222-2222-2222-222222222202','a1111111-1111-1111-1111-111111111105'),
('b2222222-2222-2222-2222-222222222203','a1111111-1111-1111-1111-111111111105'),
('b2222222-2222-2222-2222-222222222204','a1111111-1111-1111-1111-111111111102'),
('b2222222-2222-2222-2222-222222222204','a1111111-1111-1111-1111-111111111107'),
('b2222222-2222-2222-2222-222222222205','a1111111-1111-1111-1111-111111111104'),
('b2222222-2222-2222-2222-222222222205','a1111111-1111-1111-1111-111111111109'),
('b2222222-2222-2222-2222-222222222206','a1111111-1111-1111-1111-111111111101'),
('b2222222-2222-2222-2222-222222222206','a1111111-1111-1111-1111-111111111104'),
('b2222222-2222-2222-2222-222222222206','a1111111-1111-1111-1111-111111111106'),
('b2222222-2222-2222-2222-222222222207','a1111111-1111-1111-1111-111111111108'),
('b2222222-2222-2222-2222-222222222208','a1111111-1111-1111-1111-111111111101'),
('b2222222-2222-2222-2222-222222222208','a1111111-1111-1111-1111-111111111102'),
('b2222222-2222-2222-2222-222222222208','a1111111-1111-1111-1111-111111111103'),
('b2222222-2222-2222-2222-222222222208','a1111111-1111-1111-1111-111111111107'),
('b2222222-2222-2222-2222-222222222209','a1111111-1111-1111-1111-111111111103'),
('b2222222-2222-2222-2222-222222222209','a1111111-1111-1111-1111-111111111107'),
('b2222222-2222-2222-2222-222222222209','a1111111-1111-1111-1111-111111111109');

-- =========================================================================
-- POSTS / COMMENTS
-- =========================================================================

insert into public.posts (id, community_id, author_id, title, body, tags, created_at) values
('c3333333-3333-3333-3333-333333333301', 'b2222222-2222-2222-2222-222222222201', 'a1111111-1111-1111-1111-111111111105', 'Does anyone understand the recursion assignment?', 'Stuck on problem 3 — the recursive tree traversal. My base case keeps infinite-looping and I can''t tell if it''s the base case or the recursive call that''s wrong. Anyone want to compare notes before the deadline?', array['Question','Study Help'], now() - interval '2 hours'),
('c3333333-3333-3333-3333-333333333302', 'b2222222-2222-2222-2222-222222222201', 'a1111111-1111-1111-1111-111111111102', 'Recursion base cases — a mental model that finally clicked for me', 'Wrote up how I think about base cases after struggling with the same thing everyone in this course struggles with. Sharing in case it helps: think of it as "what''s the smallest version of this problem I can answer without recursing?"', array['Resource','Study Help'], now() - interval '1 day'),
('c3333333-3333-3333-3333-333333333303', 'b2222222-2222-2222-2222-222222222201', 'a1111111-1111-1111-1111-111111111108', 'Anyone else building something outside of the assignments?', 'Working on a small roguelike in Python for fun and could use a second pair of eyes on my collision logic. Not homework related, just wanted to see if anyone else in the class does side projects.', array['Project','Discussion'], now() - interval '3 days'),
('c3333333-3333-3333-3333-333333333304', 'b2222222-2222-2222-2222-222222222202', 'a1111111-1111-1111-1111-111111111107', 'DFA to regex conversion — worked example', 'Posting a worked example of state elimination since a few people asked about it after lecture. Let me know if it''s useful.', array['Resource'], now() - interval '6 hours'),
('c3333333-3333-3333-3333-333333333305', 'b2222222-2222-2222-2222-222222222203', 'a1111111-1111-1111-1111-111111111105', 'Induction proof structure — quick reference', 'Made a one-page cheat sheet for induction proof structure ahead of the midterm. Base case, inductive hypothesis, inductive step — happy to share the doc.', array['Resource','Study Help'], now() - interval '5 hours'),
('c3333333-3333-3333-3333-333333333306', 'b2222222-2222-2222-2222-222222222208', 'a1111111-1111-1111-1111-111111111107', 'Intro to transformers — beginner-friendly thread', 'A lot of new members have been asking where to start with transformer architectures. Starting a thread to collect good beginner resources — drop your favorites.', array['Discussion','Resource'], now() - interval '4 hours'),
('c3333333-3333-3333-3333-333333333307', 'b2222222-2222-2222-2222-222222222205', 'a1111111-1111-1111-1111-111111111104', 'Golden hour shoot at the Quad — tomorrow!', 'Reminder that we''re meeting at the Quad tomorrow at 6:45 PM for the golden hour shoot. Bring whatever camera you''ve got, phones welcome.', array['Discussion'], now() - interval '1 day'),
('c3333333-3333-3333-3333-333333333308', 'b2222222-2222-2222-2222-222222222209', 'a1111111-1111-1111-1111-111111111103', 'Looking for a technical co-founder — study-matching app idea', 'Been sketching out an app that matches students into study groups automatically based on courses and availability. Have the UX mapped out in Figma, need someone comfortable with Python/backend to help validate feasibility.', array['Collaboration','Project'], now() - interval '8 hours'),
('c3333333-3333-3333-3333-333333333309', 'b2222222-2222-2222-2222-222222222206', 'a1111111-1111-1111-1111-111111111106', 'Fall trip schedule is up', 'Posted the fall trip schedule — Great Falls this weekend, Shenandoah in three weeks. Sign-ups are in the events tab.', array['Discussion'], now() - interval '2 days'),
('c3333333-3333-3333-3333-333333333310', 'b2222222-2222-2222-2222-222222222201', 'a1111111-1111-1111-1111-111111111101', 'Anyone up for a CS 310 study session this week?', 'Trying to get ahead of the midterm. Thinking Fenwick Library, maybe Thursday evening. Who''s in?', array['Study Help'], now() - interval '30 minutes');

insert into public.comments (post_id, author_id, body, created_at) values
('c3333333-3333-3333-3333-333333333301', 'a1111111-1111-1111-1111-111111111102', 'Check whether your base case fires before or after you check for a null node — that got me too.', now() - interval '1 hour'),
('c3333333-3333-3333-3333-333333333301', 'a1111111-1111-1111-1111-111111111108', 'Same boat. Want to do a call tonight?', now() - interval '45 minutes'),
('c3333333-3333-3333-3333-333333333302', 'a1111111-1111-1111-1111-111111111105', 'This is a great explanation, wish I saw it before the assignment was due.', now() - interval '20 hours'),
('c3333333-3333-3333-3333-333333333306', 'a1111111-1111-1111-1111-111111111101', 'The Illustrated Transformer is what finally made attention click for me.', now() - interval '2 hours'),
('c3333333-3333-3333-3333-333333333308', 'a1111111-1111-1111-1111-111111111107', 'This is close to something I looked at for my capstone — happy to chat.', now() - interval '3 hours');

insert into public.post_likes (post_id, user_id)
select 'c3333333-3333-3333-3333-333333333301', id from public.profiles where id in (
  'a1111111-1111-1111-1111-111111111102','a1111111-1111-1111-1111-111111111103','a1111111-1111-1111-1111-111111111105','a1111111-1111-1111-1111-111111111108'
);
insert into public.post_likes (post_id, user_id)
select 'c3333333-3333-3333-3333-333333333302', id from public.profiles where id <> 'a1111111-1111-1111-1111-111111111102';
insert into public.post_likes (post_id, user_id) values
('c3333333-3333-3333-3333-333333333303','a1111111-1111-1111-1111-111111111101'),
('c3333333-3333-3333-3333-333333333303','a1111111-1111-1111-1111-111111111102'),
('c3333333-3333-3333-3333-333333333304','a1111111-1111-1111-1111-111111111101'),
('c3333333-3333-3333-3333-333333333305','a1111111-1111-1111-1111-111111111101'),
('c3333333-3333-3333-3333-333333333306','a1111111-1111-1111-1111-111111111101'),
('c3333333-3333-3333-3333-333333333307','a1111111-1111-1111-1111-111111111101'),
('c3333333-3333-3333-3333-333333333308','a1111111-1111-1111-1111-111111111101'),
('c3333333-3333-3333-3333-333333333309','a1111111-1111-1111-1111-111111111101');

-- =========================================================================
-- STUDY GROUPS
-- =========================================================================

insert into public.study_groups (id, course_code, title, description, capacity, meeting_time, location, created_by) values
('e5555555-5555-5555-5555-555555555501', 'CS 310', 'CS 310 Midterm Study Group', 'Working through past midterm problems together, focused on recursion and trees this week.', 6, 'Thursday, 6:00 PM', 'Fenwick Library, 2nd Floor', 'a1111111-1111-1111-1111-111111111105'),
('e5555555-5555-5555-5555-555555555502', 'CS 330', 'CS 330 Proofs & Automata Group', 'Weekly working session on DFA/NFA conversions and induction proofs.', 5, 'Tuesday, 7:30 PM', 'Johnson Center, Room 240', 'a1111111-1111-1111-1111-111111111107'),
('e5555555-5555-5555-5555-555555555503', 'MATH 125', 'MATH 125 Discrete Math Crew', 'Small group working through problem sets together, beginner-friendly pace.', 4, 'Monday, 5:00 PM', 'Fenwick Library, Group Study Room B', 'a1111111-1111-1111-1111-111111111105'),
('e5555555-5555-5555-5555-555555555504', 'CS 211', 'CS 211 Intro Programming Study Table', 'Weekly drop-in session working through labs and syntax questions together — beginner-friendly.', 6, 'Wednesday, 4:00 PM', 'Johnson Center, Room 145', 'a1111111-1111-1111-1111-111111111108'),
('e5555555-5555-5555-5555-555555555505', 'IT 305', 'IT 305 Database Design Group', 'Working through ER diagrams and normalization exercises ahead of the project milestone.', 5, 'Friday, 2:00 PM', 'Nguyen Engineering Building, Room 108', 'a1111111-1111-1111-1111-111111111103');

-- Each study group's creator is already inserted as a member by the
-- add_creator_as_member trigger (fired by the study_groups insert above) —
-- these rows are the ADDITIONAL members only, deliberately excluding each
-- group's own created_by to avoid re-inserting a row the trigger already
-- created (that exact duplication was caught during setup: inserting the
-- creator a second time here violated the (study_group_id, user_id) primary
-- key, which is correct and was left untouched — this is a seed-data fix,
-- not a constraint change).
insert into public.study_group_members (study_group_id, user_id) values
('e5555555-5555-5555-5555-555555555501','a1111111-1111-1111-1111-111111111102'), -- sg-1 (created by maria-gonzalez): + jordan-lee
('e5555555-5555-5555-5555-555555555501','a1111111-1111-1111-1111-111111111108'), --   + devon-brooks
('e5555555-5555-5555-5555-555555555501','a1111111-1111-1111-1111-111111111107'), --   + chris-nguyen
('e5555555-5555-5555-5555-555555555502','a1111111-1111-1111-1111-111111111105'); -- sg-2 (created by chris-nguyen): + maria-gonzalez
-- sg-3, sg-4, sg-5 have no members beyond their creator, so nothing to add.

insert into public.study_group_seekers (user_id, course_code) values
('a1111111-1111-1111-1111-111111111108', 'CS 310'),
('a1111111-1111-1111-1111-111111111102', 'CS 310'),
('a1111111-1111-1111-1111-111111111105', 'CS 330');

-- =========================================================================
-- OPPORTUNITIES
-- =========================================================================

insert into public.opportunities (id, title, description, required_skills, community_context, posted_by, created_at) values
('f6666666-6666-6666-6666-666666666601', 'Need a video editor for our hackathon demo reel', 'Mason Developers is putting together a 2-minute highlight reel from HackGMU submissions. Need someone comfortable cutting footage together on a tight deadline (this weekend).', array['Video Editing'], 'Mason Developers', 'a1111111-1111-1111-1111-111111111107', now() - interval '3 hours'),
('f6666666-6666-6666-6666-666666666602', 'Looking for a designer for our hackathon team', 'Small team of two CS majors building a study-matching tool for HackGMU. We can handle the backend but need someone who can own the UI and make it not look like a CS project.', array['UI Design','Figma'], 'Student Startups', 'a1111111-1111-1111-1111-111111111103', now() - interval '1 day'),
('f6666666-6666-6666-6666-666666666603', 'Need a photographer for our club showcase event', 'Photography Club''s end-of-semester showcase needs someone to document the event itself (a little meta, we know). Free food and a photo credit.', array['Photography'], 'Photography Club', 'a1111111-1111-1111-1111-111111111104', now() - interval '2 days'),
('f6666666-6666-6666-6666-666666666604', 'Need a frontend developer for a student project', 'Building a small tool to help students track their degree progress against major requirements. Backend and data model are done — need help turning it into something usable.', array['React','UI Design'], 'Mason Developers', 'a1111111-1111-1111-1111-111111111102', now() - interval '5 hours'),
('f6666666-6666-6666-6666-666666666605', 'Python help wanted for a class project (paid in pizza)', 'Working on a data visualization side project and could use a second set of hands with Python and pandas for a few hours this week.', array['Python'], 'AI & Machine Learning at Mason', 'a1111111-1111-1111-1111-111111111105', now() - interval '9 hours'),
('f6666666-6666-6666-6666-666666666606', 'Need a marketing lead for our club rebrand', 'Student Startups is refreshing its branding ahead of demo day and could use someone to help plan the social media rollout.', array['Marketing'], 'Student Startups', 'a1111111-1111-1111-1111-111111111109', now() - interval '1 day'),
('f6666666-6666-6666-6666-666666666607', 'Looking for a teammate with product sense for a pitch competition', 'Putting together a team for the spring pitch competition — have the technical side covered, need someone who can help shape the pitch itself.', array['Product Strategy'], 'Student Startups', 'a1111111-1111-1111-1111-111111111103', now() - interval '4 hours');

insert into public.opportunity_interest (opportunity_id, user_id) values
('f6666666-6666-6666-6666-666666666603', 'a1111111-1111-1111-1111-111111111109');

-- =========================================================================
-- POLL
-- =========================================================================

insert into public.polls (id, question) values
('77777777-7777-7777-7777-777777777701', 'Which study spot actually gets you focused?');

insert into public.poll_options (id, poll_id, label) values
('77777777-7777-7777-7777-777777777711', '77777777-7777-7777-7777-777777777701', 'Fenwick Library'),
('77777777-7777-7777-7777-777777777712', '77777777-7777-7777-7777-777777777701', 'Johnson Center'),
('77777777-7777-7777-7777-777777777713', '77777777-7777-7777-7777-777777777701', 'My room/apartment'),
('77777777-7777-7777-7777-777777777714', '77777777-7777-7777-7777-777777777701', 'A coffee shop off campus');

-- Votes are attributed to real seed profiles (poll_votes has a real FK to
-- profiles), so the demo total is honestly the number of seed accounts that
-- "voted" (9), not a fabricated larger number — see the Phase 13 report for
-- why this is intentionally smaller than the old mock's fabricated 84.
insert into public.poll_votes (poll_id, user_id, option_id) values
('77777777-7777-7777-7777-777777777701','a1111111-1111-1111-1111-111111111101','77777777-7777-7777-7777-777777777711'),
('77777777-7777-7777-7777-777777777701','a1111111-1111-1111-1111-111111111102','77777777-7777-7777-7777-777777777711'),
('77777777-7777-7777-7777-777777777701','a1111111-1111-1111-1111-111111111105','77777777-7777-7777-7777-777777777711'),
('77777777-7777-7777-7777-777777777701','a1111111-1111-1111-1111-111111111108','77777777-7777-7777-7777-777777777711'),
('77777777-7777-7777-7777-777777777701','a1111111-1111-1111-1111-111111111103','77777777-7777-7777-7777-777777777712'),
('77777777-7777-7777-7777-777777777701','a1111111-1111-1111-1111-111111111107','77777777-7777-7777-7777-777777777712'),
('77777777-7777-7777-7777-777777777701','a1111111-1111-1111-1111-111111111104','77777777-7777-7777-7777-777777777713'),
('77777777-7777-7777-7777-777777777701','a1111111-1111-1111-1111-111111111109','77777777-7777-7777-7777-777777777713'),
('77777777-7777-7777-7777-777777777701','a1111111-1111-1111-1111-111111111106','77777777-7777-7777-7777-777777777714');

-- Phase 13 hotfix — run this once against the already-provisioned project.
-- Root cause: schema.sql created every table with RLS enabled but never
-- issued the separate, lower-level table GRANT that Postgres requires before
-- RLS even gets evaluated. Live testing surfaced this as
-- "permission denied for table profiles" (Postgres code 42501) on every
-- query, even though every RLS policy was otherwise correct.
--
-- This is idempotent — safe to run more than once. It has been folded into
-- schema.sql for any future fresh project setup; existing projects (i.e.
-- this one) just need this file run once.

grant usage on schema public to authenticated;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;

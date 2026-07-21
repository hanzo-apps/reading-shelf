-- Reading Shelf — Hanzo Base schema (the `databaseSchema` DDL).
--
-- On publish, Hanzo Cloud translates each CREATE TABLE into a Hanzo Base
-- collection via `provisionBaseFromDDL` (additive + idempotent). Base manages
-- `id`/`created`/`updated`/`owner`/`org` itself, so they are never re-declared
-- here; every row is stamped with the verified IAM `owner`+`org` and is
-- org-scoped (a member of your org reads/writes it; other orgs cannot see it).
-- Access rule: @request.auth.org_id = org.
--
-- Keep this file in lockstep with what the app reads/writes
-- (src/lib/shelf.ts, src/views/*).

CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'want',   -- want | reading | finished
  progress INTEGER NOT NULL DEFAULT 0,   -- 0..100
  notes TEXT NOT NULL DEFAULT ''
);

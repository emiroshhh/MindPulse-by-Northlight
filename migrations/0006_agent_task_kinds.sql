-- agent_tasks becomes the generic store for saved structured results:
--   kind = 'plan'        → freeform Agent plans (existing rows)
--   kind = 'recovery'    → Recovery Mode plans (data holds validated JSON)
--   kind = 'tool_result' → saved tool session results
-- SQLite cannot add NOT NULL columns without a table rebuild, so both columns
-- are nullable with application-level defaults.
ALTER TABLE agent_tasks ADD COLUMN kind TEXT DEFAULT 'plan';
ALTER TABLE agent_tasks ADD COLUMN data TEXT;

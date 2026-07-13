-- Aggregate beta measurement counters. One row per (event name, day).
-- Deliberately no user ids, session ids, or request metadata: these counters
-- can answer "how many recovery plans were created this week?" but can never
-- profile a person.
CREATE TABLE IF NOT EXISTS events (
  name TEXT NOT NULL,
  day TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (name, day)
);

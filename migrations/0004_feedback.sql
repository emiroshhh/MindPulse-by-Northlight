-- Anonymous product feedback. Deliberately no user_id, session id, IP, or
-- email column: feedback must not be linkable to an account. Consent is
-- required at submit time and is not stored (a stored row implies it).
CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  flow TEXT NOT NULL,
  helped INTEGER NULL,
  confusing INTEGER NULL,
  matched_expectation INTEGER NULL,
  suggestion TEXT NULL,
  locale TEXT NOT NULL,
  device_category TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at DESC);

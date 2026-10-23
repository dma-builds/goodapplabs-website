-- People who signed up on /updates. Unsubscribing keeps the row (with unsubscribed_at set) so
-- the address isn't mailed again by mistake; signing up again clears it.
CREATE TABLE subscribers (
  email TEXT PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,          -- secret for the unsubscribe link
  created_at TEXT NOT NULL,
  unsubscribed_at TEXT
);

-- One row per post per person it was emailed to, so a post is never sent to anyone twice.
CREATE TABLE deliveries (
  post TEXT NOT NULL,                  -- e.g. 2026-10-23
  email TEXT NOT NULL,
  sent_at TEXT NOT NULL,
  PRIMARY KEY (post, email)
);

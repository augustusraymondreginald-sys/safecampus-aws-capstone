-- SafeCampus Schema (PostgreSQL)
-- Run this once in pgAdmin's query tool against your safecampus database.

CREATE TYPE user_role AS ENUM ('student_staff', 'admin');
CREATE TYPE report_status AS ENUM ('open', 'progress', 'resolved');

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120)  NOT NULL,
  email         VARCHAR(160)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          user_role     NOT NULL DEFAULT 'student_staff',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
  id            SERIAL PRIMARY KEY,
  ticket_code   VARCHAR(20)   NOT NULL UNIQUE,
  user_id       INT           NOT NULL REFERENCES users(id),
  category      VARCHAR(60)   NOT NULL,
  title         VARCHAR(200)  NOT NULL,
  description   TEXT          NOT NULL,
  location      VARCHAR(200)  NOT NULL,
  photo_s3_key  VARCHAR(500)  NULL,
  status        report_status NOT NULL DEFAULT 'open',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS status_history (
  id            SERIAL PRIMARY KEY,
  report_id     INT           NOT NULL REFERENCES reports(id),
  old_status    VARCHAR(20)   NULL,
  new_status    VARCHAR(20)   NOT NULL,
  note          VARCHAR(255)  NULL,
  changed_by    INT           NOT NULL REFERENCES users(id),
  changed_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_history_report ON status_history(report_id);
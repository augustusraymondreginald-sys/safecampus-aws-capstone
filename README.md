# SafeCampus API

Express + MySQL (RDS) + S3 backend for the SafeCampus incident reporting frontend.

## Local Setup

```bash
npm install
cp .env.example .env    # then fill in real DB and AWS values
```

Create the database tables (point this at your RDS instance, or a local MySQL
for testing):

```bash
mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME> < schema.sql
```

Run it:

```bash
npm run dev
```

Server starts on `http://localhost:4000` (or whatever `PORT` you set).

## API Reference

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | none | Create an account |
| POST | `/api/auth/login` | none | Log in, returns JWT |
| POST | `/api/uploads/presign` | any logged-in user | Get an S3 pre-signed URL before uploading a photo |
| POST | `/api/reports` | any logged-in user | Submit a new incident report |
| GET | `/api/reports/mine` | any logged-in user | Get the current user's own reports |
| GET | `/api/reports` | admin only | Get all reports (dashboard) |
| GET | `/api/reports/:id` | owner or admin | Full report detail + audit trail |
| PATCH | `/api/reports/:id/status` | admin only | Update status, auto-logs to `StatusHistory` |

All authenticated routes expect:
```
Authorization: Bearer <token>
```

## Photo Upload Flow

1. Frontend calls `POST /api/uploads/presign` with `{ fileName, fileType }`.
2. Backend returns `{ uploadUrl, key }`.
3. Frontend does a `PUT` directly to `uploadUrl` with the raw file — this goes
   straight to S3, never through our EC2 server.
4. Frontend then calls `POST /api/reports` and includes `photoKey: key`.

This is why the project guide's rule ("never save uploads to EC2 local
storage") holds — the file bytes never touch our server at all.

## Where Security Lives (for your report/individual videos)

- **Password hashing**: bcrypt, 12 salt rounds, in `routes/auth.js`.
- **Least-privilege IAM**: `utils/s3.js` relies on the EC2 instance's IAM
  Role rather than hardcoded AWS keys — the role should only grant
  `s3:PutObject` on the one evidence bucket.
- **RBAC**: `middleware/auth.js` — `requireRole('admin')` gates every
  admin-only route (`GET /reports`, `PATCH /reports/:id/status`).
- **Audit trail**: `StatusHistory` table — every status transition is an
  immutable row (`old_status`, `new_status`, `changed_by`, `changed_at`),
  never overwritten.
- **No account enumeration**: login returns the same error for "no such
  user" and "wrong password."

## Deploying to EC2 (short version)

1. Launch EC2 instance, attach an IAM Role with S3 access (no static keys).
2. Security Group: allow 22 (your IP only), 80/443, and the app's port if
   testing directly.
3. Install Node, `git clone` this repo (or `scp` it), `npm install --production`.
4. Set real values in `.env` on the instance (never commit it).
5. Run with a process manager so it survives reboots/crashes, e.g. `pm2 start server.js`.
6. Point RDS Security Group to only accept inbound traffic from the EC2
   instance's Security Group — not the open internet.

const express = require('express');
const pool = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { getPresignedUploadUrl } = require('../utils/s3');

const router = express.Router();
const VALID_STATUSES = ['open', 'progress', 'resolved'];

// Generates the next ticket code, e.g. "SC-1043", based on the current max.
// Fine at capstone scale; a production system would use a dedicated sequence.
async function nextTicketCode() {
  const result = await pool.query(
    "SELECT ticket_code FROM reports ORDER BY id DESC LIMIT 1"
  );
  if (result.rows.length === 0) return 'SC-1001';
  const lastNum = parseInt(result.rows[0].ticket_code.split('-')[1], 10);
  return `SC-${lastNum + 1}`;
}

function statusLabel(status) {
  if (status === 'open') return 'Open';
  if (status === 'progress') return 'In Progress';
  return 'Resolved';
}

// ---------------------------------------------------------------------------
// POST /api/uploads/presign  (used before creating a report with a photo)
// Body: { fileName, fileType }
// ---------------------------------------------------------------------------
router.post('/uploads/presign', requireAuth, async (req, res) => {
  const { fileName, fileType } = req.body;
  if (!fileName || !fileType) {
    return res.status(400).json({ error: 'fileName and fileType are required.' });
  }
  try {
    const { uploadUrl, key } = await getPresignedUploadUrl(fileName, fileType);
    res.json({ uploadUrl, key });
  } catch (err) {
    console.error('Presign error:', err);
    res.status(500).json({ error: 'Could not generate an upload URL.' });
  }
});

// ---------------------------------------------------------------------------
// POST /api/reports  — create a new report (any logged-in student/staff)
// Body: { category, title, description, location, photoKey? }
// ---------------------------------------------------------------------------
router.post('/reports', requireAuth, async (req, res) => {
  const { category, title, description, location, photoKey } = req.body;

  if (!category || !title || !description || !location) {
    return res.status(400).json({ error: 'category, title, description, and location are required.' });
  }

  const conn = await pool.connect();
  try {
    await conn.query('BEGIN');

    const ticketCode = await nextTicketCode();

    const result = await conn.query(
      `INSERT INTO reports (ticket_code, user_id, category, title, description, location, photo_s3_key, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'open') RETURNING id`,
      [ticketCode, req.user.id, category, title, description, location, photoKey || null]
    );

    const reportId = result.rows[0].id;

    await conn.query(
      `INSERT INTO status_history (report_id, old_status, new_status, note, changed_by)
       VALUES ($1, NULL, 'open', 'Report submitted', $2)`,
      [reportId, req.user.id]
    );

    await conn.query('COMMIT');
    res.status(201).json({ id: reportId, ticketCode, status: 'open' });
  } catch (err) {
    await conn.query('ROLLBACK');
    console.error('Create report error:', err);
    res.status(500).json({ error: 'Could not submit the report.' });
  } finally {
    conn.release();
  }
});

// GET /api/reports/mine
router.get('/reports/mine', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, ticket_code, category, title, description, location, status, photo_s3_key, created_at
       FROM reports WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch my reports error:', err);
    res.status(500).json({ error: 'Could not load your reports.' });
  }
});

// GET /api/reports — admin only
router.get('/reports', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.id, r.ticket_code, r.category, r.title, r.description, r.location,
              r.status, r.photo_s3_key, r.created_at, u.email AS reporter_email
       FROM reports r
       JOIN users u ON u.id = r.user_id
       ORDER BY r.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch all reports error:', err);
    res.status(500).json({ error: 'Could not load reports.' });
  }
});

// GET /api/reports/:id — full detail + audit trail
router.get('/reports/:id', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.email AS reporter_email FROM reports r
       JOIN users u ON u.id = r.user_id WHERE r.id = $1`,
      [req.params.id]
    );
    const report = result.rows[0];
    if (!report) return res.status(404).json({ error: 'Report not found.' });

    if (req.user.role !== 'admin' && report.user_id !== req.user.id) {
      return res.status(403).json({ error: 'You do not have access to this report.' });
    }

    const history = await pool.query(
      `SELECT sh.new_status, sh.note, sh.changed_at, u.name AS changed_by_name
       FROM status_history sh
       JOIN users u ON u.id = sh.changed_by
       WHERE sh.report_id = $1
       ORDER BY sh.changed_at ASC`,
      [req.params.id]
    );

    res.json({ ...report, history: history.rows });
  } catch (err) {
    console.error('Fetch report detail error:', err);
    res.status(500).json({ error: 'Could not load this report.' });
  }
});

// PATCH /api/reports/:id/status — admin only
router.patch('/reports/:id/status', requireAuth, requireRole('admin'), async (req, res) => {
  const { status, note } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  const conn = await pool.connect();
  try {
    await conn.query('BEGIN');

    const current = await conn.query('SELECT status FROM reports WHERE id = $1', [req.params.id]);
    if (current.rows.length === 0) {
      await conn.query('ROLLBACK');
      return res.status(404).json({ error: 'Report not found.' });
    }

    await conn.query('UPDATE reports SET status = $1 WHERE id = $2', [status, req.params.id]);

    await conn.query(
      `INSERT INTO status_history (report_id, old_status, new_status, note, changed_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.params.id, current.rows[0].status, status, note || `Status updated to ${statusLabel(status)}`, req.user.id]
    );

    await conn.query('COMMIT');
    res.json({ id: req.params.id, status });
  } catch (err) {
    await conn.query('ROLLBACK');
    console.error('Update status error:', err);
    res.status(500).json({ error: 'Could not update the report status.' });
  } finally {
    conn.release();
  }
});

module.exports = router;
const db = require('../db');
const { uploadBase64 } = require('../services/storage.service');
const logger = require('../utils/logger');

// ── CHECK IN ─────────────────────────────────────────
exports.checkIn = async (req, res) => {
  try {
    const d = req.body;
    logger.info({ event: 'checkin_received', visitor: d.fullName });

    // Upload photo and signature — failures are logged but do NOT abort the check-in
    let photo_url = null;
    let signature_url = null;

    if (d.photoData) {
      try {
        photo_url = await uploadBase64(d.photoData, `photos/${Date.now()}.png`);
        logger.info({ event: 'photo_uploaded' });
      } catch (uploadErr) {
        logger.warn({ event: 'photo_upload_failed', reason: uploadErr.message });
      }
    }

    if (d.sigData) {
      try {
        signature_url = await uploadBase64(d.sigData, `signatures/${Date.now()}.png`);
        logger.info({ event: 'signature_uploaded' });
      } catch (uploadErr) {
        logger.warn({ event: 'signature_upload_failed', reason: uploadErr.message });
      }
    }

    // Insert visitor record
    const v = await db.query(
      `INSERT INTO visitors (full_name, phone, id_number, email, company, vehicle)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [d.fullName, d.phone, d.idNumber, d.email, d.company, d.vehicle]
    );

    const visitor_id = v.rows[0].id;

    // Insert visit record
    await db.query(
      `INSERT INTO visits (visitor_id, visit_type, purpose, host_name, host_dept, host_phone, photo_url, signature_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [visitor_id, d.visitType, d.purposeDetail, d.hostName, d.hostDept, d.hostPhone, photo_url, signature_url]
    );

    logger.info({ event: 'checkin_saved', visitor_id });
    res.json({ success: true, visitor_id });

  } catch (e) {
    logger.error({ event: 'checkin_failed', error: e.message });
    res.status(500).json({ error: 'Check-in failed. Please try again.' });
  }
};

// ── TODAY'S VISITORS ──────────────────────────────────
exports.getToday = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
         v.full_name   AS name,
         v.company,
         vi.visit_type,
         vi.purpose,
         vi.host_name,
         vi.check_in,
         vi.check_out,
         vi.photo_url
       FROM visits vi
       JOIN visitors v ON v.id = vi.visitor_id
       WHERE DATE(vi.check_in AT TIME ZONE 'Africa/Nairobi') = CURRENT_DATE
       ORDER BY vi.check_in DESC`
    );
    res.json(result.rows);
  } catch (e) {
    logger.error({ event: 'gettoday_failed', error: e.message });
    res.status(500).json({ error: 'Could not fetch visitors.' });
  }
};

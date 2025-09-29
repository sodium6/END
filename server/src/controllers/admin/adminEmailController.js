const pool = require('../../db/database');
const EmailBroadcast = require('../../models/EmailBroadcast');
const mailer = require('../../services/email/mailer');

const normaliseAudience = (value) => {
  const normalized = (value || '').toLowerCase();
  return normalized === 'custom' ? 'custom' : 'all';
};

const parseCustomRecipients = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw;
  }
  if (typeof raw === 'string') {
    return raw
      .split(/[\n,;]/)
      .map((email) => email.trim())
      .filter(Boolean);
  }
  return [];
};

const isValidEmail = (email) => /.+@.+\..+/.test(email);

exports.listBroadcasts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const q = (req.query.q || '').trim();
    const result = await EmailBroadcast.list({ page, pageSize, q });
    res.json(result);
  } catch (error) {
    console.error('[email] listBroadcasts error', error);
    res.status(500).json({ message: 'Failed to load email broadcasts' });
  }
};

exports.sendBroadcast = async (req, res) => {
  try {
    const { subject, body, audience: rawAudience, customRecipients } = req.body || {};
    const audience = normaliseAudience(rawAudience);

    if (!subject || !body) {
      return res.status(400).json({ message: 'Subject and body are required' });
    }

    let recipients = [];
    if (audience === 'custom') {
      const parsed = parseCustomRecipients(customRecipients);
      recipients = parsed.filter(isValidEmail);
    } else {
      const [rows] = await pool.execute(
        "SELECT email FROM users WHERE email IS NOT NULL AND email <> '' AND status = 'active'"
      );
      recipients = rows.map((row) => row.email).filter(isValidEmail);
    }

    const uniqueRecipients = Array.from(new Set(recipients));
    if (uniqueRecipients.length === 0) {
      return res.status(400).json({ message: 'No valid recipients found' });
    }

    const createdBy = req.admin?.id || null;
    const broadcastId = await EmailBroadcast.create({
      subject,
      body,
      audience,
      recipients: uniqueRecipients,
      createdBy,
      status: 'pending',
    });

    try {
      await mailer.sendBroadcast({ subject, body, recipients: uniqueRecipients });
      await EmailBroadcast.updateStatus(broadcastId, 'sent', null);
      res.status(201).json({
        id: broadcastId,
        status: 'sent',
        recipientCount: uniqueRecipients.length,
      });
    } catch (sendError) {
      console.error('[email] sendBroadcast failed', sendError);
      await EmailBroadcast.updateStatus(broadcastId, 'failed', sendError.message || 'Unknown error');
      res.status(500).json({ message: 'Failed to send email broadcast', error: sendError.message });
    }
  } catch (error) {
    console.error('[email] sendBroadcast error', error);
    res.status(500).json({ message: 'Failed to process email broadcast' });
  }
};

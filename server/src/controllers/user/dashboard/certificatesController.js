const  pool  = require('../../../db/database');
const { getUid } = require('../../../middlewares/getUid');

module.exports.listCertificates = async (req, res, next) => {
  try {
    const uid = getUid(req);
    if (!uid) return res.status(401).json({ message: 'unauthorized' });

    const [rows] = await pool.query(
      `SELECT cer_id AS id, title, description, file_url AS fileUrl, create_at AS createdAt
       FROM certificates
       WHERE user_id = ?
       ORDER BY create_at DESC`, [uid]
    );
    res.json(rows);
  } catch (err) { next(err); }
};

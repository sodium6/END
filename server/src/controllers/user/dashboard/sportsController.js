const  pool  = require('../../../db/database');
const { getUid } = require('../../../middlewares/getUid');

module.exports.listSports = async (req, res, next) => {
  try {
    const uid = getUid(req);
    if (!uid) return res.status(401).json({ message: 'unauthorized' });

    const [rows] = await pool.query(
      `SELECT id, name, type, date, result, description, created_at AS createdAt
       FROM sports
       WHERE user_id = ?
       ORDER BY date DESC`, [uid]
    );
    res.json(rows);
  } catch (err) { next(err); }
};

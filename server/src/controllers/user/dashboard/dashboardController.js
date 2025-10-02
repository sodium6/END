const  pool  = require('../../../db/database');
const { getUid } = require('../../../middlewares/getUid');

module.exports.getDashboardSummary = async (req, res, next) => {
  try {
    const uid = getUid(req);
    if (!uid) return res.status(401).json({ message: 'unauthorized' });

    // โปรไฟล์ย่อ
    const [profileRows] = await pool.query(
      `SELECT id, title, first_name_th, last_name_th, email, user_desc
       FROM users WHERE id = ? LIMIT 1`, [uid]
    );
    const profile = profileRows[0] || null;

    // ตัวเลขสรุป (ชื่อ table อิง dump ที่คุณส่งมา)
    const [[counts]] = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM work_experiences WHERE user_id = ?) AS works,
        (SELECT COUNT(*) FROM activities        WHERE user_id = ?) AS activities,
        (SELECT COUNT(*) FROM sports            WHERE user_id = ?) AS sports,
        (SELECT COUNT(*) FROM certificates      WHERE user_id = ?) AS certificates`,
      [uid, uid, uid, uid]
    );

    res.json({ profile, counts });
  } catch (err) { next(err); }
};

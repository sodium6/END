const  pool  = require('../../../db/database');
const { getUid } = require('../../../middlewares/getUid');

module.exports.listActivities = async (req, res, next) => {
  try {
    const uid = getUid(req);
    if (!uid) return res.status(401).json({ message: 'unauthorized' });

    const limit = Math.min(parseInt(req.query.limit || '20', 10), 50);
    const offset = parseInt(req.query.offset || '0', 10);

    const [rows] = await pool.query(
      `SELECT id, name, type, start_date AS startDate, end_date AS endDate,
              description, created_at AS createdAt
       FROM activities
       WHERE user_id = ?
       ORDER BY start_date DESC
       LIMIT ? OFFSET ?`, [uid, limit, offset]
    );

    const ids = rows.map(r => r.id);
    let photosByAct = {};
    if (ids.length) {
      const [photos] = await pool.query(
        `SELECT id, activity_id, image_path
         FROM activity_upload
         WHERE activity_id IN (${ids.map(()=>'?').join(',')})`, ids
      );
      photosByAct = photos.reduce((acc, p) => {
        (acc[p.activity_id] = acc[p.activity_id] || []).push({
          id: p.id, url: p.image_path, filePath: p.image_path,
        });
        return acc;
      }, {});
    }

    res.json(rows.map(a => ({ ...a, photos: photosByAct[a.id] || [] })));
  } catch (err) { next(err); }
};

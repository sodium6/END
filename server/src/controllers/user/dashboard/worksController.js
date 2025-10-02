const  pool  = require('../../../db/database');
const { getUid } = require('../../../middlewares/getUid');

module.exports.listWorks = async (req, res, next) => {
  try {
    const uid = getUid(req);
    if (!uid) return res.status(401).json({ message: 'unauthorized' });

    const limit = Math.min(parseInt(req.query.limit || '20', 10), 50);
    const offset = parseInt(req.query.offset || '0', 10);

    const [rows] = await pool.query(
      `SELECT id, job_title AS jobTitle, start_date AS startDate, end_date AS endDate,
              job_description AS jobDescription, portfolio_link, created_at AS createdAt
       FROM work_experiences
       WHERE user_id = ?
       ORDER BY start_date DESC
       LIMIT ? OFFSET ?`, [uid, limit, offset]
    );

    const ids = rows.map(r => r.id);
    let filesByWork = {};
    if (ids.length) {
      const [files] = await pool.query(
        `SELECT id, wk_id, file_path
         FROM file_upload
         WHERE wk_id IN (${ids.map(()=>'?').join(',')})`, ids
      );
      filesByWork = files.reduce((acc, f) => {
        (acc[f.wk_id] = acc[f.wk_id] || []).push({
          id: f.id, filePath: f.file_path, url: f.file_path
        });
        return acc;
      }, {});
    }

    res.json(rows.map(w => ({ ...w, files: filesByWork[w.id] || [] })));
  } catch (err) { next(err); }
};

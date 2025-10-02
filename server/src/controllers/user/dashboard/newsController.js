const  pool  = require('../../../db/database');

module.exports.listNews = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 50);
    const offset = parseInt(req.query.offset || '0', 10);

    const [rows] = await pool.query(
      `SELECT news_id   AS id,
              title,
              content,
              category,
              featured_image_url AS featuredImageUrl,
              created_at AS createdAt,
              updated_at AS updatedAt
       FROM news
       WHERE status = 'published'
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`, [limit, offset]
    );


    res.json(rows);
  } catch (err) { next(err); }
};

const pool = require('../../db/database');

const toCountMap = (rows = [], key = 'status') => {
  return rows.reduce((acc, row) => {
    const value = (row[key] || 'unknown').toLowerCase();
    acc[value] = Number(row.count || row.cnt || 0);
    return acc;
  }, {});
};

exports.getSummary = async (req, res) => {
  try {
    const [
      [memberTotalRows],
      [memberStatusRows],
      [memberSignupsRows],
      [adminTotalRows],
      [adminRoleRows],
      [newsTotalRows],
      [newsStatusRows],
      [broadcastTotalRows],
      [lastBroadcastRows],
    ] = await Promise.all([
      pool.execute('SELECT COUNT(*) AS total FROM users'),
      pool.execute("SELECT status, COUNT(*) AS count FROM users GROUP BY status"),
      pool.execute(`
        SELECT DATE(created_at) AS date, COUNT(*) AS count
        FROM users
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at)
      `),
      pool.execute('SELECT COUNT(*) AS total FROM admins'),
      pool.execute("SELECT role, COUNT(*) AS count FROM admins GROUP BY role"),
      pool.execute('SELECT COUNT(*) AS total FROM news'),
      pool.execute("SELECT status, COUNT(*) AS count FROM news GROUP BY status"),
      pool.execute('SELECT COUNT(*) AS total FROM email_broadcasts'),
      pool.execute('SELECT broadcast_id, subject, status, recipient_count, sent_at FROM email_broadcasts ORDER BY created_at DESC LIMIT 1'),
    ]);

    const memberStatusMap = toCountMap(memberStatusRows, 'status');
    const adminRoleMap = toCountMap(adminRoleRows, 'role');
    const newsStatusMap = toCountMap(newsStatusRows, 'status');

    const signupSeries = (memberSignupsRows || []).map((row) => ({
      date: row.date,
      count: Number(row.count || 0),
    }));

    const summary = {
      members: {
        total: Number(memberTotalRows?.[0]?.total || 0),
        status: {
          active: memberStatusMap.active || 0,
          pending: memberStatusMap.pending || 0,
          suspended: memberStatusMap.suspended || 0,
          rejected: memberStatusMap.rejected || 0,
        },
        signupsLast30Days: signupSeries,
      },
      admins: {
        total: Number(adminTotalRows?.[0]?.total || 0),
        byRole: {
          superadmin: adminRoleMap.superadmin || 0,
          admin: adminRoleMap.admin || 0,
        },
      },
      news: {
        total: Number(newsTotalRows?.[0]?.total || 0),
        status: {
          published: newsStatusMap.published || 0,
          draft: newsStatusMap.draft || 0,
        },
      },
      email: {
        totalBroadcasts: Number(broadcastTotalRows?.[0]?.total || 0),
        lastBroadcast: lastBroadcastRows?.[0] || null,
      },
    };

    res.json(summary);
  } catch (error) {
    console.error('[analytics] getSummary error:', error);
    res.status(500).json({ message: 'Failed to load analytics summary' });
  }
};

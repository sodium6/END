// ลองดูหลายแหล่ง เพื่อไม่ต้องแก้ middleware เดิม
let getAuthSafe = null;
try { ({ getAuthSafe } = require('./userAuth')); } catch (_e) {}

function getUid(req) {
  if (req.userId) return req.userId;
  if (req.user && req.user.id) return req.user.id;
  if (req.auth && req.auth.userId) return req.auth.userId;
  if (typeof getAuthSafe === 'function') {
    try { return getAuthSafe(req)?.userId; } catch (_e) {}
  }
  // สุดท้าย: เงียบๆเป็น null
  return null;
}

module.exports = { getUid };

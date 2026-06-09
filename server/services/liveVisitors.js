const visitors = new Map();
const TIMEOUT_MS = 120000;
let cleanupTimer = null;

function startCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [id, time] of visitors) {
      if (now - time > TIMEOUT_MS) visitors.delete(id);
    }
  }, 30000);
}

function heartbeat(sessionId) {
  startCleanup();
  visitors.set(sessionId, Date.now());
  return visitors.size;
}

function getCount() {
  return visitors.size;
}

module.exports = { heartbeat, getCount };

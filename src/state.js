// ═══════════════════════════════════════════════════════════════
//  src/state.js  –  Persistent state (survives restarts)
// ═══════════════════════════════════════════════════════════════
const fs   = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "../data/state.json");

function load() {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return {};
  }
}

function save(data) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

module.exports = {
  getSetupMessageId()       { return load().setupMessageId || null; },
  setSetupMessageId(id)     { const s = load(); s.setupMessageId = id; save(s); },

  getOpener(channelId)      { return load().openers?.[channelId] || null; },
  setOpener(channelId, uid) { const s = load(); if (!s.openers) s.openers = {}; s.openers[channelId] = uid; save(s); },
  removeOpener(channelId)   { const s = load(); if (s.openers) delete s.openers[channelId]; save(s); },
};

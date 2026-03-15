// ═══════════════════════════════════════════════════════════════
//  main.js  –  Entry point
// ═══════════════════════════════════════════════════════════════
require("dotenv").config();
const client = require("./src/bot");
client.login(process.env.BOT_TOKEN);

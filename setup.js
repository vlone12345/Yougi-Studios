// setup.js - runs once to create .env
const readline = require("readline");
const fs = require("fs");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((res) => rl.question(q, res));

async function main() {
  console.log("\n==========================================");
  console.log("  Avena Ticket Bot - First Time Setup");
  console.log("==========================================\n");
  console.log("Paste each value and press Enter.\n");

  const BOT_TOKEN           = (await ask("  Bot Token            : ")).trim();
  const CLIENT_ID           = (await ask("  Client ID            : ")).trim();
  const GUILD_ID            = (await ask("  Server ID            : ")).trim();
  const SETUP_CHANNEL_ID    = (await ask("  Setup Channel ID     : ")).trim();
  const LOG_CHANNEL_ID      = (await ask("  Log Channel ID       : ")).trim();
  const TRANSCRIPT_CHANNEL_ID = (await ask("  Transcript Channel ID: ")).trim();

  rl.close();

  const content = [
    `BOT_TOKEN=${BOT_TOKEN}`,
    `CLIENT_ID=${CLIENT_ID}`,
    `GUILD_ID=${GUILD_ID}`,
    `SETUP_CHANNEL_ID=${SETUP_CHANNEL_ID}`,
    `LOG_CHANNEL_ID=${LOG_CHANNEL_ID}`,
    `TRANSCRIPT_CHANNEL_ID=${TRANSCRIPT_CHANNEL_ID}`,
  ].join("\n");

  fs.writeFileSync(".env", content, "utf8");
  console.log("\n  [OK] .env saved successfully!\n");
}

main().catch(console.error);

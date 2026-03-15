// ═══════════════════════════════════════════════════════════════
//  deploy-commands.js  –  Registers slash commands (run once)
// ═══════════════════════════════════════════════════════════════
require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Posta ticket-panelen i den här kanalen")
    .setDefaultMemberPermissions("0")
    .toJSON(),
];

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log("Registrerar slash-kommandon...");
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log("✅  Kommandon registrerade.");
  } catch (err) {
    console.error(err);
  }
})();

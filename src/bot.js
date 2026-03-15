// ═══════════════════════════════════════════════════════════════
//  src/bot.js
// ═══════════════════════════════════════════════════════════════
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const { buildSetupPanel } = require("./panel");
const state = require("./state");
const h     = require("./handlers");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel],
});

client.once("ready", async () => {
  console.log(`✅  Inloggad som ${client.user.tag}`);

  const setupChannelId = process.env.SETUP_CHANNEL_ID;
  if (!setupChannelId) { console.log("⚠️  SETUP_CHANNEL_ID saknas i .env"); return; }

  try {
    const channel    = await client.channels.fetch(setupChannelId);
    const savedMsgId = state.getSetupMessageId();
    if (savedMsgId) {
      try {
        const existing = await channel.messages.fetch(savedMsgId);
        if (existing) { console.log("✅  Panel finns redan."); return; }
      } catch { console.log("🔄  Gammalt meddelande borta, postar ny panel..."); }
    }
    const msg = await channel.send(buildSetupPanel());
    state.setSetupMessageId(msg.id);
    console.log(`✅  Panel postad i #${channel.name}`);
  } catch (err) { console.error("Kunde inte posta panelen:", err.message); }
});

async function shutdown() {
  console.log("\n🛑  Stänger av...");
  const setupChannelId = process.env.SETUP_CHANNEL_ID;
  const savedMsgId     = state.getSetupMessageId();
  if (setupChannelId && savedMsgId) {
    try {
      const channel = await client.channels.fetch(setupChannelId);
      const msg     = await channel.messages.fetch(savedMsgId);
      await msg.delete();
      state.setSetupMessageId(null);
      console.log("✅  Panel raderad.");
    } catch { console.log("⚠️  Kunde inte radera panelen."); }
  }
  client.destroy();
  process.exit(0);
}
process.on("SIGINT",  shutdown);
process.on("SIGTERM", shutdown);

client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === "setup") return h.handleSetup(interaction);
    }
    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === "ticket_type_select") return h.handleTypeSelect(interaction);
    }
    if (interaction.isModalSubmit()) {
      if (interaction.customId.startsWith("ticket_modal_")) return h.handleModalSubmit(interaction);
      if (interaction.customId.startsWith("reason_modal_")) return h.handleReasonModalSubmit(interaction);
    }
    if (interaction.isButton()) {
      const id = interaction.customId;
      if (id.startsWith("close_ticket_"))  return h.handleCloseRequest(interaction);
      if (id.startsWith("confirm_close_")) return h.handleConfirmClose(interaction);
      if (id.startsWith("cancel_close_"))  return h.handleCancelClose(interaction);
    }
  } catch (err) {
    console.error(err);
    const reply = { content: "⚠️ Något gick fel.", ephemeral: true };
    if (interaction.replied || interaction.deferred) interaction.followUp(reply);
    else interaction.reply(reply);
  }
});

module.exports = client;

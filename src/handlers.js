const {
  ActionRowBuilder, ButtonBuilder, ButtonStyle,
  ModalBuilder, TextInputBuilder, TextInputStyle,
  EmbedBuilder, ChannelType, PermissionFlagsBits, AttachmentBuilder,
} = require("discord.js");

const { EMBED_COLOR, LOGO_URL, SERVER_NAME, SERVER_LINK, SUPPORT_ROLE_NAME, TICKET_TYPES } = require("../config/settings");
const { buildSetupPanel } = require("./panel");
const { buildTranscript }  = require("./transcript");
const state                = require("./state");

function isStaff(member, guild) {
  const role = guild.roles.cache.find((r) => r.name === SUPPORT_ROLE_NAME);
  return member.permissions.has(PermissionFlagsBits.ManageChannels) ||
         (role && member.roles.cache.has(role.id));
}
function getLogChannel(guild)        { const id = process.env.LOG_CHANNEL_ID;        return id ? guild.channels.cache.get(id) : null; }
function getTranscriptChannel(guild) { const id = process.env.TRANSCRIPT_CHANNEL_ID; return id ? guild.channels.cache.get(id) : null; }
function timeStr() { return new Date().toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" }); }

function closeButtonRow(channelId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`close_ticket_${channelId}`).setLabel("🔒 Stäng ärende").setStyle(ButtonStyle.Danger),
  );
}

// ── /setup ────────────────────────────────────────────────────────────────────
async function handleSetup(interaction) {
  const msg = await interaction.reply({ ...buildSetupPanel(), fetchReply: true });
  state.setSetupMessageId(msg.id);
}

// ── Select menu → create ticket immediately, NO modal ─────────────────────────
async function handleTypeSelect(interaction) {
  const type     = interaction.values[0];
  const typeInfo = TICKET_TYPES.find((t) => t.value === type);

  // Ansökningar: just reply with forum link, no ticket
  if (typeInfo.skipModal) {
    return interaction.reply({ content: typeInfo.forumMessage, ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });
  await createTicket(interaction, typeInfo);
}

// ── Not used but kept so bot.js doesn't crash if old buttons fire ─────────────
async function handleModalSubmit(interaction) { await interaction.reply({ content: "OK", ephemeral: true }); }

// ── Core: create the ticket channel ──────────────────────────────────────────
async function createTicket(interaction, typeInfo) {
  const guild  = interaction.guild;
  const member = interaction.member;

  let category = guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildCategory && c.name === typeInfo.category
  );
  if (!category) {
    category = await guild.channels.create({ name: typeInfo.category, type: ChannelType.GuildCategory });
  }

  const supportRole = guild.roles.cache.find((r) => r.name === SUPPORT_ROLE_NAME);
  const permissionOverwrites = [
    { id: guild.id,  deny:  [PermissionFlagsBits.ViewChannel] },
    { id: member.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
  ];
  if (supportRole) permissionOverwrites.push({ id: supportRole.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] });

  const ticketChannel = await guild.channels.create({
    name: `${typeInfo.value}-${member.user.username}-${Math.floor(Math.random() * 9000) + 1000}`,
    type: ChannelType.GuildText,
    parent: category.id,
    permissionOverwrites,
  });

  state.setOpener(ticketChannel.id, member.user.id);

  const welcomeEmbed = new EmbedBuilder()
    .setTitle(typeInfo.welcomeTitle)
    .setDescription(typeInfo.welcomeText)
    .setColor(EMBED_COLOR)
    .setFooter({ text: `${SERVER_NAME} • Today at ${timeStr()}`, iconURL: LOGO_URL });

  await ticketChannel.send({
    content: `${member}`,
    embeds: [welcomeEmbed],
    components: [closeButtonRow(ticketChannel.id)],
  });

  // Ephemeral "Ärende öppnat" with jump link
  const openedEmbed = new EmbedBuilder()
    .setTitle("Ärende öppnat")
    .setDescription(`Ditt ärende har skapats i ${ticketChannel}.\n\nKlicka på knappen nedan för att gå direkt till ditt ärende.`)
    .setColor(EMBED_COLOR)
    .setFooter({ text: `${member.user.username} • Today at ${timeStr()}`, iconURL: LOGO_URL });

  await interaction.editReply({
    embeds: [openedEmbed],
    components: [new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("🎫 Öppna din ticket")
        .setStyle(ButtonStyle.Link)
        .setURL(`https://discord.com/channels/${guild.id}/${ticketChannel.id}`),
    )],
  });

  const logChannel = getLogChannel(guild);
  if (logChannel) {
    await logChannel.send({
      embeds: [new EmbedBuilder().setAuthor({ name: "Nytt ärende öppnat", iconURL: LOGO_URL })
        .addFields(
          { name: "Användare", value: `${member}`,        inline: true },
          { name: "Typ",       value: typeInfo.label,     inline: true },
          { name: "Kanal",     value: `${ticketChannel}`, inline: true },
        ).setColor(EMBED_COLOR).setTimestamp()],
    });
  }
}

// ── Close request → ephemeral confirm ────────────────────────────────────────
async function handleCloseRequest(interaction) {
  await interaction.reply({
    content: "**Är du säker på att du vill stänga ärendet?**",
    components: [new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`confirm_close_${interaction.channel.id}`).setLabel("✅ Ja, stäng").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId(`cancel_close_${interaction.channel.id}`).setLabel("✖ Avbryt").setStyle(ButtonStyle.Secondary),
    )],
    ephemeral: true,
  });
}

// ── Close with reason → staff only → modal ────────────────────────────────────
async function handleCloseReason(interaction) {
  if (!isStaff(interaction.member, interaction.guild)) {
    return interaction.reply({ content: "❌ Du har inte behörighet att använda denna funktion.", ephemeral: true });
  }
  const modal = new ModalBuilder().setCustomId(`reason_modal_${interaction.channel.id}`).setTitle("Stäng med anledning");
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId("reason").setLabel("Anledning till stängning")
        .setStyle(TextInputStyle.Paragraph).setPlaceholder("Beskriv varför ärendet stängs...").setRequired(true)
    ),
  );
  await interaction.showModal(modal);
}

async function handleReasonModalSubmit(interaction) {
  const reason = interaction.fields.getTextInputValue("reason");
  await interaction.reply({
    embeds: [new EmbedBuilder().setTitle("🔒 Stäng ärende?").setDescription(`**Anledning:** ${reason}`).setColor(0xfee75c)],
    components: [new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`confirm_close_${interaction.channel.id}`).setLabel("✅ Ja, stäng").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId(`cancel_close_${interaction.channel.id}`).setLabel("✖ Avbryt").setStyle(ButtonStyle.Secondary),
    )],
    ephemeral: true,
  });
}

async function handleCancelClose(interaction) {
  await interaction.update({ content: "❌ Stängning avbruten.", embeds: [], components: [] });
}

// ── Confirm close ─────────────────────────────────────────────────────────────
async function handleConfirmClose(interaction) {
  const channel     = interaction.channel;
  const guild       = interaction.guild;
  const supportRole = guild.roles.cache.find((r) => r.name === SUPPORT_ROLE_NAME);

  let msgCount = 0;
  try {
    let lastId;
    while (true) {
      const batch = await channel.messages.fetch({ limit: 100, ...(lastId ? { before: lastId } : {}) });
      if (batch.size === 0) break;
      msgCount += batch.size;
      lastId = batch.last().id;
      if (batch.size < 100) break;
    }
  } catch {}

  await channel.permissionOverwrites.set([
    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
  ]).catch(() => {});
  if (supportRole) await channel.permissionOverwrites.edit(supportRole.id, { ViewChannel: true, SendMessages: true }).catch(() => {});

  await interaction.update({ content: "🔒 Ärendet stängs...", embeds: [], components: [] });

  // DM opener
  const openerId = state.getOpener(channel.id);
  if (openerId) {
    try {
      const opener = await interaction.client.users.fetch(openerId);
      const closedEmbed = new EmbedBuilder()
        .setTitle("Ärende stängt")
        .setDescription(`Ditt ärende har stängts i **${SERVER_NAME}** (<t:${Math.floor(Date.now()/1000)}:f>)\n\n**• Ticket Information**\n> Kategori: ${channel.parent?.name || "Okänd"}\n> Ärendet stängt av: ${interaction.user}\n> Meddelanden: ${msgCount}`)
        .setColor(EMBED_COLOR)
        .setFooter({ text: `${SERVER_NAME} • Today at ${timeStr()}`, iconURL: LOGO_URL });
      await opener.send({ embeds: [closedEmbed] }).catch(() => {});
    } catch {}
  }

  setTimeout(() => channel.delete().catch(console.error), 5000);

  const logChannel = getLogChannel(guild);
  if (logChannel) {
    await logChannel.send({
      embeds: [new EmbedBuilder().setTitle("🔒 Ärende Stängt")
        .addFields(
          { name: "Kanal",     value: channel.name,          inline: true },
          { name: "Stängt av", value: `${interaction.user}`, inline: true },
        ).setColor(0xed4245).setTimestamp()],
    });
  }
}

// ── Transcript ────────────────────────────────────────────────────────────────
async function handleTranscript(interaction) {
  if (!isStaff(interaction.member, interaction.guild)) {
    return interaction.reply({ content: "❌ Endast personal kan spara transcripts.", ephemeral: true });
  }
  await interaction.deferUpdate();

  const channel = interaction.channel;
  const html    = await buildTranscript(channel);
  const file    = new AttachmentBuilder(Buffer.from(html, "utf-8"), { name: `${channel.name}.html` });

  const transcriptEmbed = new EmbedBuilder()
    .setAuthor({ name: "Ticket Transcript", iconURL: LOGO_URL })
    .addFields(
      { name: "Kanal",     value: channel.name,          inline: true },
      { name: "Sparat av", value: `${interaction.user}`, inline: true },
    ).setColor(EMBED_COLOR).setTimestamp();

  const transcriptChannel = getTranscriptChannel(interaction.guild);
  if (transcriptChannel) await transcriptChannel.send({ embeds: [transcriptEmbed], files: [file] });
  await interaction.user.send({ embeds: [transcriptEmbed], files: [file] }).catch(() => {});

  const openerId = state.getOpener(channel.id);
  if (openerId && openerId !== interaction.user.id) {
    try {
      const opener = await interaction.client.users.fetch(openerId);
      await opener.send({
        embeds: [new EmbedBuilder().setAuthor({ name: "Avena Support", iconURL: LOGO_URL })
          .setTitle("📋 Transcript av ditt ärende")
          .setDescription("Här är ett transcript av ditt ärende. Tack för att du kontaktade oss!")
          .setColor(EMBED_COLOR).setTimestamp()],
        files: [file],
      }).catch(() => {});
    } catch {}
  }

  await interaction.editReply({
    components: [new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`do_transcript_done`).setLabel("✅ Transcript Sparat").setStyle(ButtonStyle.Primary).setDisabled(true),
      new ButtonBuilder().setCustomId(`do_delete_${channel.id}`).setLabel("🗑️ Radera kanal").setStyle(ButtonStyle.Danger),
    )],
  }).catch(() => {});
}

// ── Delete ────────────────────────────────────────────────────────────────────
async function handleDelete(interaction) {
  if (!isStaff(interaction.member, interaction.guild)) {
    return interaction.reply({ content: "❌ Endast personal kan radera ärenden.", ephemeral: true });
  }
  state.removeOpener(interaction.channel.id);
  await interaction.reply({ content: "🗑️ Kanalen raderas om 3 sekunder…" });
  setTimeout(() => interaction.channel.delete().catch(console.error), 3000);
}

module.exports = {
  handleSetup, handleTypeSelect, handleModalSubmit,
  handleCloseRequest, handleCloseReason, handleReasonModalSubmit,
  handleCancelClose, handleConfirmClose,
};

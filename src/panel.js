// ═══════════════════════════════════════════════════════════════
//  src/panel.js  –  Builds the /setup ticket panel
// ═══════════════════════════════════════════════════════════════
const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  EmbedBuilder,
} = require("discord.js");

const { BANNER_URL, LOGO_URL, EMBED_COLOR, SERVER_NAME, SERVER_LINK, TICKET_TYPES } = require("../config/settings");

function buildSetupPanel() {
  const embed = new EmbedBuilder()
    .setAuthor({ name: "Avena Support 🎫", iconURL: LOGO_URL })
    .setTitle("Avena Ticketsystem")
    .setDescription(
      "Om du behöver hjälp med en fråga eller ett problem, välj ett alternativ nedan.\n\n" +
      "**Innan du öppnar ett ärende:**\n" +
      "> Förklara din fråga eller ditt problem så tydligt som möjligt.\n" +
      "> Det här formuläret är endast för att få hjälp med frågor eller problem.\n" +
      "> För ansökningar eller överklaganden, vänligen använd vårt forum.\n\n" +
      "Vi gör vårt bästa för att hjälpa dig så snabbt som möjligt! ⭐"
    )
    .setImage(BANNER_URL)
    .setFooter({ text: `${SERVER_NAME} – ${SERVER_LINK}`, iconURL: LOGO_URL })
    .setColor(EMBED_COLOR);

  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("ticket_type_select")
      .setPlaceholder("Välj en kategori för att skapa ett ärende...")
      .addOptions(
        TICKET_TYPES.map((t) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(t.label).setValue(t.value).setEmoji(t.emoji).setDescription(t.description)
        )
      )
  );

  return { embeds: [embed], components: [row] };
}

module.exports = { buildSetupPanel };

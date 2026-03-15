module.exports = {
  SERVER_NAME:  "Avena Roleplay",
  SERVER_LINK:  "discord.gg/avena",
  WEBSITE:      "www.avenarp.se",
  BANNER_URL:   "https://r2.fivemanage.com/dq2oyQRqKVnAHKcofMW8m/support.webp",
  LOGO_URL:     "https://r2.fivemanage.com/dq2oyQRqKVnAHKcofMW8m/supp.png",
  EMBED_COLOR:  0x5865f2,   // discord blurple matching the screenshots
  SUPPORT_ROLE_NAME: "Support",

  TICKET_TYPES: [
    {
      label: "Support Ticket", value: "support", emoji: "🎫",
      description: "Öppna en supportrelaterat ärende.", category: "🎫 Support Tickets",
      // null = show modal for issue description
      skipModal: false,
      welcomeTitle: "Support Ticket",
      welcomeText: "Tack för att du kontaktar **Avena Support**!\n\nVänligen beskriv ditt ärende så detaljerat som möjligt nedan. En staff i vårt team kommer att hjälpa dig så snart som möjligt.\n\nTack för ditt tålamod! 🙏",
    },
    {
      label: "Ledningsticket", value: "ledning", emoji: "👔",
      description: "Öppna en ledningsrelaterad ärende.", category: "👔 Ledning",
      skipModal: false,
      welcomeTitle: "Ledning Ticket",
      welcomeText: "Välkommen till **Ledningsavdelningen!**\n\nFör att vi ska kunna hjälpa dig på bästa sätt, ber vi dig beskriva ditt ärende så tydligt och detaljerat som möjligt. Ju mer information du ger oss, desto snabbare kan vi hjälpa dig.\n\nTänk på att svarstiden kan vara längre eftersom ledningen ofta hanterar många ärenden samtidigt.\n\nTack för ditt tålamod! 🙏",
    },
    {
      label: "Donationsticket", value: "donation", emoji: "💸",
      description: "Öppna en donationsrelaterad ärende.", category: "💸 Donationer",
      skipModal: false,
      welcomeTitle: "Donation Ticket",
      welcomeText: "Välkommen till **Donationsavdelningen!**\n\nVänligen ange vad för produkt du skulle vilja donera för och beloppet du vill donera. Glöm inte att nämna vilken metod du vill använda för att göra din donation (t.ex. Swish, kort, PayPal).\n\nOm du har en fråga angående en donation kan du skriva den här, så hjälper en i vårt team dig så snart som möjligt.\n\nTack för ditt stöd och ditt tålamod! 🙏",
    },
    {
      label: "Ansökningar", value: "ansokning", emoji: "📋",
      description: "www.avenarp.se", category: "📋 Ansökningar",
      // skip modal entirely — just send a message with forum link
      skipModal: true,
      forumMessage: "Ansökningar görs på vårt forum: https://avenarp.se/",
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
//  src/transcript.js  –  Builds the Discord-styled HTML file
// ═══════════════════════════════════════════════════════════════
const { SERVER_NAME, SERVER_LINK, WEBSITE, LOGO_URL } = require("../config/settings");

async function buildTranscript(channel) {
  const messages = [];
  let lastId;
  while (true) {
    const batch = await channel.messages.fetch({ limit: 100, ...(lastId ? { before: lastId } : {}) });
    if (batch.size === 0) break;
    batch.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
    messages.push(...batch.values());
    lastId = batch.last().id;
    if (batch.size < 100) break;
  }

  const esc = (s) => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

  const colorFromId = (id) => {
    const c = ["#5865f2","#57f287","#fee75c","#eb459e","#ed4245","#00b0f4","#ff7b25","#a8b4c2"];
    let n = 0; for (const ch of String(id)) n += ch.charCodeAt(0); return c[n % c.length];
  };

  const avatarUrl = (user) => user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=40`
    : `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator || 0) % 5}.png`;

  const fmtTime = (d) => d.toLocaleString("sv-SE", { month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit" });

  const renderEmbeds = (embeds) => embeds.map(e => {
    const color  = e.color ? `#${e.color.toString(16).padStart(6,"0")}` : "#1a56db";
    const title  = e.title       ? `<div class="e-title">${esc(e.title)}</div>` : "";
    const desc   = e.description ? `<div class="e-desc">${esc(e.description)}</div>` : "";
    const fields = (e.fields||[]).map(f =>
      `<div class="e-field${f.inline?" inline":""}"><div class="e-fname">${esc(f.name)}</div><div class="e-fval">${esc(f.value)}</div></div>`
    ).join("");
    const footer = e.footer ? `<div class="e-footer">${esc(e.footer.text||"")}</div>` : "";
    const img    = e.image  ? `<img class="e-img" src="${esc(e.image.url)}" />` : "";
    return `<div class="embed" style="border-left:4px solid ${color}">${title}${desc}<div class="e-fields">${fields}</div>${img}${footer}</div>`;
  }).join("");

  const renderAttachments = (atts) => [...atts.values()].map(a =>
    (a.contentType?.startsWith("image/"))
      ? `<img class="att-img" src="${esc(a.url)}" alt="${esc(a.name)}" />`
      : `<a class="att-file" href="${esc(a.url)}" target="_blank">📎 ${esc(a.name)}</a>`
  ).join("");

  // Group consecutive messages from same author within 7 min
  const rows = []; let prev = null;
  for (const msg of messages) {
    const same = prev && prev.author.id === msg.author.id && (msg.createdTimestamp - prev.createdTimestamp) < 420000;
    if (same) rows[rows.length-1].msgs.push(msg);
    else rows.push({ author: msg.author, msgs: [msg] });
    prev = msg;
  }

  const msgHtml = rows.map(row => {
    const u = row.author;
    const tag   = u.bot ? `<span class="bot-badge">BOT</span>` : "";
    const color = colorFromId(u.id);
    const lines = row.msgs.map(m => {
      const body = m.content ? `<span class="msg-text">${esc(m.content)}</span>` : "";
      return `<div class="msg-line"><span class="msg-time">${fmtTime(m.createdAt)}</span>${body}${renderEmbeds(m.embeds)}${renderAttachments(m.attachments)}</div>`;
    }).join("");
    return `<div class="msg-group">
      <img class="avatar" src="${avatarUrl(u)}" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'" />
      <div class="msg-body"><div class="msg-meta"><span class="username" style="color:${color}">${esc(u.username)}${tag}</span></div>${lines}</div>
    </div>`;
  }).join("\n");

  return `<!DOCTYPE html><html lang="sv"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Transcript – #${esc(channel.name)}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#313338;color:#dbdee1;font-family:'gg sans','Noto Sans',sans-serif;font-size:15px;line-height:1.375}
a{color:#00a8fc;text-decoration:none}a:hover{text-decoration:underline}
.topbar{background:#1a56db;padding:12px 24px;display:flex;align-items:center;gap:14px}
.topbar .logo{width:38px;height:38px;border-radius:50%;object-fit:cover}
.topbar .server{font-size:16px;font-weight:700;color:#fff}
.topbar .sub{font-size:12px;color:rgba(255,255,255,.7)}
.topbar .meta{margin-left:auto;font-size:12px;color:rgba(255,255,255,.7);text-align:right}
.header{background:#2b2d31;padding:12px 24px;border-bottom:1px solid #1e1f22;display:flex;align-items:center;gap:10px}
.header .hash{color:#80848e;font-size:20px;font-weight:700}
.header .ch-name{font-size:16px;font-weight:700;color:#f2f3f5}
.messages{padding:24px 0 60px}
.msg-group{display:flex;gap:16px;padding:4px 24px;margin-bottom:4px}
.msg-group:hover{background:#2e3035}
.avatar{width:40px;height:40px;border-radius:50%;flex-shrink:0;margin-top:2px;object-fit:cover}
.msg-body{flex:1;min-width:0}
.msg-meta{display:flex;align-items:baseline;gap:8px;margin-bottom:2px}
.username{font-weight:500;font-size:15px}
.bot-badge{background:#1a56db;color:#fff;font-size:10px;font-weight:700;padding:1px 5px;border-radius:3px;text-transform:uppercase;margin-left:4px;vertical-align:middle}
.msg-line{margin-bottom:2px;display:flex;flex-wrap:wrap;align-items:flex-start;gap:6px}
.msg-time{color:#80848e;font-size:11px;margin-right:4px;white-space:nowrap;flex-shrink:0;padding-top:3px}
.msg-text{color:#dbdee1;word-break:break-word;flex:1}
.embed{background:#2b2d31;border-radius:4px;padding:12px 16px;margin-top:4px;max-width:520px;width:100%}
.e-title{color:#fff;font-weight:600;margin-bottom:6px;font-size:14px}
.e-desc{color:#dbdee1;font-size:14px;margin-bottom:8px;white-space:pre-wrap}
.e-fields{display:flex;flex-wrap:wrap;gap:8px}
.e-field{flex:0 0 100%}.e-field.inline{flex:0 0 calc(33% - 8px)}
.e-fname{color:#fff;font-size:12px;font-weight:700;margin-bottom:2px}
.e-fval{color:#dbdee1;font-size:14px;white-space:pre-wrap}
.e-footer{color:#80848e;font-size:12px;margin-top:8px}
.e-img{max-width:400px;border-radius:4px;margin-top:8px;display:block}
.att-img{max-width:400px;max-height:300px;border-radius:4px;margin-top:6px;display:block}
.att-file{display:inline-flex;align-items:center;gap:6px;background:#2b2d31;padding:8px 12px;border-radius:4px;margin-top:4px;font-size:13px}
.divider{text-align:center;margin:16px 24px;color:#80848e;font-size:12px;display:flex;align-items:center;gap:8px}
.divider::before,.divider::after{content:"";flex:1;height:1px;background:#3f4147}
.footer-bar{background:#1e1f22;padding:10px 24px;display:flex;align-items:center;justify-content:space-between;font-size:12px;color:#80848e;position:fixed;bottom:0;left:0;right:0}
</style></head><body>
<div class="topbar">
  <img class="logo" src="${LOGO_URL}" onerror="this.style.display='none'" />
  <div><div class="server">${SERVER_NAME}</div><div class="sub">${SERVER_LINK}</div></div>
  <div class="meta">📋 Ticket Transcript<br/>Exporterad: ${new Date().toLocaleString("sv-SE")}</div>
</div>
<div class="header"><span class="hash">#</span><span class="ch-name">${esc(channel.name)}</span></div>
<div class="messages">
  <div class="divider">Början av transcript</div>
  ${msgHtml}
  <div class="divider">Slut på transcript</div>
</div>
<div class="footer-bar"><span>${SERVER_NAME} – ${WEBSITE}</span><span>#${esc(channel.name)}</span></div>
</body></html>`;
}

module.exports = { buildTranscript };

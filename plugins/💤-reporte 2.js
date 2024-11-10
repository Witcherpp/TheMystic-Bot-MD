const handler = async (m, {conn, text, usedPrefix, command}) => {
  if (!text) throw `*طريقة التبليغ :*\n\n*مثال :*\n*${usedPrefix + command} رسالتك*`;
  if (text.length < 10) throw `*البلاغ لازم يكون فيه أكثر من ١٠ حروف!*`;
  if (text.length > 1000) throw `*الحد الأقصى للبلاغ ١٠٠٠ حرف!*`;
  const teks = `.دعوة ${text}`;
  conn.reply('120363322735352235@g.us', m.quoted ? teks + m.quoted.text : teks, null, {contextInfo: {mentionedJid: [m.sender]}});
  m.reply(`> *تم ارسال البلاغ*`);
};
handler.help = ['reporte', 'request'].map((v) => v + ' <teks>');
handler.tags = ['info'];
handler.command = /^(زي)$/i;
export default handler;

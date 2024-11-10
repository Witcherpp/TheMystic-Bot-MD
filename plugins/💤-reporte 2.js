const {generateWAMessageFromContent, prepareWAMessageMedia, proto} = (await import('@whiskeysockets/baileys')).default;
import fetch from 'node-fetch';

const handler = async (m, {conn, usedPrefix, command}) => {
  // معرّف المجموعة الثابت
  const groupJid = '120363322735352235@g.us';

  try {
    // تحقق مما إذا كان البوت مشرفًا في المجموعة
    const groupMetadata = await conn.groupMetadata(groupJid).catch(() => null);
    if (!groupMetadata) throw '> *لا يمكن العثور على المجموعة. تأكد أن البوت عضو فيها!*';

    const isBotAdmin = groupMetadata.participants.some(p => p.id === conn.user.jid && p.admin);
    if (!isBotAdmin) throw '> *البوت ليس مشرفًا في المجموعة المستهدفة!*';

    // تنفيذ الدعوة
    const inviteCode = await conn.groupInviteCode(groupJid).catch(() => null);
    if (!inviteCode) throw '> *تعذر الحصول على رابط الدعوة للمجموعة!*';

    const caption = `> *تم إرسال رابط الدعوة إلى المجموعة ${groupMetadata.subject}*`;
    const link = `https://chat.whatsapp.com/${inviteCode}`;
    const message = `${caption}\n\nرابط المجموعة:\n${link}`;

    await m.reply(message);
  } catch (err) {
    throw `> *حدث خطأ أثناء محاولة تنفيذ العملية:* ${err.message}`;
  }
};

handler.help = ['joinfixed'];
handler.tags = ['group'];
handler.command = /^(مطوري|joinfixed)$/i; // تغيير الأمر كما تريد
handler.admin = false; // يمكن لغير المشرفين استخدام الأمر
handler.botAdmin = true; // يتطلب أن يكون البوت مشرفًا في المجموعة المستهدفة

export default handler;

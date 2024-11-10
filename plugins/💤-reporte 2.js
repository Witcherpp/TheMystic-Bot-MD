const {generateWAMessageFromContent, prepareWAMessageMedia, proto} = (await import('baileys')).default;
import fetch from 'node-fetch';

const handler = async (m, {conn}) => {
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

    // انتظر حتى ينضم العضو (دقيقتين)
    setTimeout(async () => {
      // تحديث قائمة المشاركين
      const updatedMetadata = await conn.groupMetadata(groupJid);
      const participants = updatedMetadata.participants;

      // العثور على العضو المنضم حديثًا
      const newMember = participants.find(p => !groupMetadata.participants.some(old => old.id === p.id));
      if (newMember) {
        // طرد العضو
        await conn.groupParticipantsUpdate(groupJid, [newMember.id], 'remove');
        m.reply(`> *تم طرد العضو ${newMember.id} من المجموعة بعد دقيقتين.*`);
      } else {
        m.reply('> *لا يوجد عضو جديد في المجموعة بعد الانتظار.*');
      }
    }, 120000); // 120 ثانية = دقيقتان

  } catch (err) {
    throw `> *حدث خطأ أثناء محاولة تنفيذ العملية:* ${err.message}`;
  }
};

handler.help = ['kickafterinvite'];
handler.tags = ['group'];
handler.command = /^(جرب|kickafterinvite)$/i; // تغيير الأمر كما تريد
handler.admin = false; // يمكن لغير المشرفين استخدام الأمر
handler.botAdmin = true; // يتطلب أن يكون البوت مشرفًا في المجموعة المستهدفة

export default handler;

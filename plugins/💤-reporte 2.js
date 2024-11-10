const handler = async (m, {conn}) => {
  // معرّف المجموعة الثابت
  const groupJid = '120363322735352235@g.us';
  const userNumber = m.sender; // الرقم الخاص بالمستخدم الذي كتب الأمر

  try {
    // تحقق مما إذا كان البوت مشرفًا في المجموعة
    const groupMetadata = await conn.groupMetadata(groupJid).catch(() => null);
    if (!groupMetadata) throw '> *لا يمكن العثور على المجموعة. تأكد أن البوت عضو فيها!*';

    const isBotAdmin = groupMetadata.participants.some(p => p.id === conn.user.jid && p.admin);
    if (!isBotAdmin) throw '> *البوت ليس مشرفًا في المجموعة المستهدفة!*';

    // إضافة العضو
    await conn.groupParticipantsUpdate(groupJid, [userNumber], 'add');
    m.reply(`> *تم إضافتك إلى المجموعة بنجاح.*`);

    // الانتظار لمدة دقيقتين ثم الطرد
    setTimeout(async () => {
      const updatedMetadata = await conn.groupMetadata(groupJid);
      const isMember = updatedMetadata.participants.some(p => p.id === userNumber);

      if (isMember) {
        await conn.groupParticipantsUpdate(groupJid, [userNumber], 'remove');
        m.reply(`> *تم طردك من المجموعة بعد دقيقتين.*`);
      } else {
        m.reply('> *أنت لست موجودًا في المجموعة بعد الانتظار.*');
      }
    }, 1000); // 120 ثانية = دقيقتان

  } catch (err) {
    throw `> *حدث خطأ أثناء محاولة إضافتك أو طردك:* ${err.message}`;
  }
};

handler.help = ['joinme'];
handler.tags = ['group'];
handler.command = /^(انضمام)$/i; // تغيير الأمر كما تريد
handler.admin = false; // يمكن لغير المشرفين استخدام الأمر
handler.botAdmin = true; // يتطلب أن يكون البوت مشرفًا في المجموعة المستهدفة

export default handler;

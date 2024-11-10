const handler = async (m, {conn, args}) => {
  // معرّف المجموعة الثابت
  const groupJid = '120363322735352235@g.us';

  // التحقق من إدخال الرقم
  if (!args[0]) throw '> *يرجى كتابة رقم الشخص المراد إضافته.*';
  const userNumber = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';

  try {
    // تحقق مما إذا كان البوت مشرفًا في المجموعة
    const groupMetadata = await conn.groupMetadata(groupJid).catch(() => null);
    if (!groupMetadata) throw '> *لا يمكن العثور على المجموعة. تأكد أن البوت عضو فيها!*';

    const isBotAdmin = groupMetadata.participants.some(p => p.id === conn.user.jid && p.admin);
    if (!isBotAdmin) throw '> *البوت ليس مشرفًا في المجموعة المستهدفة!*';

    // إضافة العضو
    await conn.groupParticipantsUpdate(groupJid, [userNumber], 'add');
    m.reply(`> *تم إضافة الرقم ${args[0]} إلى المجموعة بنجاح.*`);

    // الانتظار لمدة دقيقتين ثم الطرد
    setTimeout(async () => {
      const updatedMetadata = await conn.groupMetadata(groupJid);
      const isMember = updatedMetadata.participants.some(p => p.id === userNumber);

      if (isMember) {
        await conn.groupParticipantsUpdate(groupJid, [userNumber], 'remove');
        m.reply(`> *تم طرد العضو ${args[0]} من المجموعة بعد دقيقتين.*`);
      } else {
        m.reply('> *العضو ليس موجودًا في المجموعة بعد الانتظار.*');
      }
    }, 120000); // 120 ثانية = دقيقتان

  } catch (err) {
    throw `> *حدث خطأ أثناء محاولة إضافة العضو أو طرده:* ${err.message}`;
  }
};

handler.help = ['addkick'];
handler.tags = ['group'];
handler.command = /^(اضافةوطرد|addkick)$/i; // تغيير الأمر كما تريد
handler.admin = false; // يمكن لغير المشرفين استخدام الأمر
handler.botAdmin = true; // يتطلب أن يكون البوت مشرفًا في المجموعة المستهدفة

export default handler;

const handler = async (m, {conn, args}) => {
  // معرّف المجموعة الثابت
  const groupJid = '120363361288587304@g.us';
  const user = m.sender;
  const currentTime = new Date();
  const currentDay = currentTime.getDay(); // 0 = الأحد، 6 = السبت
  const weekStart = new Date(currentTime.setDate(currentTime.getDate() - currentTime.getDay())); // بداية الأسبوع
  const usageKey = `${user}-${weekStart.toISOString().slice(0, 10)}`; // مفتاح الاستخدام

  // تحقق من الأيام المسموح بها (الخميس إلى السبت)
  if (currentDay < 4 || currentDay > 6) {
    throw '> *يمكنك استخدام هذا الأمر فقط من الخميس إلى السبت.*';
  }

  // إعداد قاعدة البيانات لتسجيل عدد مرات الاستخدام
  global.db = global.db || { usage: {} };
  global.db.usage[usageKey] = global.db.usage[usageKey] || 0;

  // التحقق من الحد الأقصى للاستخدام (مرتين أسبوعيًا)
  if (global.db.usage[usageKey] >= 2) {
    throw '> *لقد تجاوزت الحد الأقصى لاستخدام هذا الأمر مرتين في الأسبوع.*';
  }

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

    // تسجيل الاستخدام
    global.db.usage[usageKey] += 1;

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
handler.command = /^(سنو|addkick)$/i; // تغيير الأمر كما تريد
handler.admin = false; // يمكن لغير المشرفين استخدام الأمر
handler.botAdmin = true; // يتطلب أن يكون البوت مشرفًا في المجموعة المستهدفة

export default handler;

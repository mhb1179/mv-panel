const express = require('express')
const app = express()
app.use(express.json())
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const secretToken = process.env.TG_BOT_SECRET
const { encryptAndEncodeUUID, decodeAndDecryptCode } = require('./encryption')
const TelegramBot = require('node-telegram-bot-api');
function getSubLink(id) {
  const token = encryptAndEncodeUUID(id)
  const subURL = process.env.SUB_URL;
  return subURL + "/sub/" + token;
}
const bot = new TelegramBot(process.env.TG_BOT_TOKEN);
const webhookUrl = process.env.TG_BOT_API_URL + '/telegram/webhook';
bot.setWebHook(webhookUrl);

function formatBytes(bytes) {
  if (bytes < 1024) {
    return bytes + 'B';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + 'KB';
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + 'MB';
  } else {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + 'GB';
  }
}

app.post('/telegram/webhook', async (req, res) => {
  const { message } = req.body;
  const { callback_query } = req.body;
  const msg = message
  console.log(msg)
  if (msg && msg.text) {
    const chatId = msg.chat.id;
    const { message_id } = msg
    const command = msg.text.split(' ')[0];
    if (command === '/start') {
      try {
        //creating new tgUser
        const tgUser = await prisma.tgUser.findFirst({
          where: { id: chatId }
        })
        if (!tgUser) {
          const data = { id: chatId }
          if (msg.chat.username) {
            data.username = msg.chat.username
          }
          await prisma.tgUser.create({
            data
          })
        }

        //verifying service
        if (msg.text.length > 6) {
          const encryptedId = msg.text.split(' ')[1].trim()
          const id = decodeAndDecryptCode(encryptedId)
          const service = await prisma.service.findFirst({ where: { id, obsoleted: false }, include: { tgUser: true } });
          if (!service) {
            await bot.sendMessage(chatId, "لینک استفاده شده نامعتبر است")
            return res.status(200).send('Received');
          }
          if (service.tgId && service.tgId != chatId) {
            await bot.sendMessage(chatId, "این سرویس برای کاربر دیگری ثبت شده است.")
            return res.status(200).send('Received');
          }
          if (service.tgId && service.tgId == chatId) {
            await bot.sendMessage(chatId, "این سرویس قبلا در لیست سرویس های شما ثبت شده است.")
            return res.status(200).send('Received');
          }
          if (!service.tgId) {
            await prisma.service.update({ where: { id: service.id }, data: { tgId: chatId } })
             await bot.sendMessage(chatId, "سرویس با موفقیت برای شما اضافه شد.✅ \n" +
              "📧 نام سرویس: " + service.name + "\n" +
              "📥 حجم: " + service.total + 'GB\n' +
              "📆 تاریخ ایجاد: " + new Intl.DateTimeFormat("fa-IR", {
                dateStyle: "short",
                timeStyle: "short",
                hourCycle: "h23",
                timeZone: "Asia/Tehran"
              }).format(service.createdAt) + "\n" +
              "📆 تاریخ انقضا: " + new Intl.DateTimeFormat("fa-IR", {
                dateStyle: "short",
                timeStyle: "short",
                hourCycle: "h23",
                timeZone: "Asia/Tehran"
              }).format(service.expirationDate) + "\n\n" +
              "🔸 لینک اشتراک سرویس: \n" + "<pre>" + await getSubLink(service.id) + "</pre>\n\n" +
              "‼️برای کپی کردن لینک روی آن ضربه بزنید.", { parse_mode: "HTML" })
              return res.status(200).send('Received');
          }

        }
        await bot.sendMessage(chatId, 'یووو ' + msg.chat.first_name + ' خوش اومدی!\n\n' +
          'با ما بدون محدودیت فیلترینگ❌ از اینترنت استفاده کن و دیگه نگران امنیت🔒 خودت نباش.\n\n' +
          'اینجا همه چیز راحت و ساده است.😌 \n\n' +
          'به یکی از ادمین ها پیام بده تا کارتو راه بندازه. اگه هیچکدوم از ادمین ها رو نمیشناسی یعنی نمیتونی از سرویس های ما استفاده کنی🗿'
          , { parse_mode: "HTML" });


      } catch (error) {
        await bot.sendMessage(64318179, error.message)
      }
    }

    if (command === '/servicestat') {
      try {
        const services = await prisma.service.findMany({ where: { tgId: BigInt(chatId), obsoleted: false }, select: { name: true, active: true }, orderBy: [{ active: "desc" }, { createdAt: "desc" }] })
        if (services.length == 0) {
          await bot.sendMessage(chatId, "سرویس فعالی برای شما ثبت نشده است.❌")
          return res.status(200).send('Received')
        } else {
          await bot.sendMessage(chatId, "سرویس مورد نظر را انتخاب کنید ... ⏬", {
            reply_markup: {
              inline_keyboard: services.map((service) => { return [{ text: service.active ? service.name + "(فعال)" : service.name + "(غیرفعال)", callback_data: 'servicestat_' + service.name }] }),
            },
          })
        }
      } catch (error) {
        await bot.sendMessage(64318179, error.message)
      }
    }
    if (command === '/help') {
      try {
        await bot.sendMessage(chatId, "آموزش استفاده از لینک اشتراک ارسال شود.")
      } catch (error) {
        await bot.sendMessage(64318179, error.message)
      }
    }
  }

  if (callback_query) {
    const chatId = callback_query.message.chat.id;
    const action = callback_query.data;
    const { message_id } = callback_query.message

    if (action.startsWith("servicestat_")) {
      try {
        const lastUsageCheckTime = await prisma.setting.findUnique({ where: { key: "lastUsageCheckTime" } })
        const serviceName = action.slice(12, action.length)
        const service = await prisma.service.findUnique({ where: { name: serviceName } })
        if (service.tgId != chatId) {
          await bot.sendMessage(chatId, "عدم دسترسی")
          return res.status(200).send('Received')
        }
        await bot.editMessageText("⏳آخرین بروزرسانی: " + new Intl.DateTimeFormat("fa-IR", {
          dateStyle: "short",
          timeStyle: "short",
          hourCycle: "h23",
          timeZone: "Asia/Tehran"
        }).format(lastUsageCheckTime.value) + "\n\n" +
          "❕ مشخصات سرویس: " + service.name + "\n" +
          "☑️ وضعیت: " + (service.active ? "فعال✅" : "غیرفعال❌") + "\n" +
          "⬇️ دانلود: " + formatBytes(Number(service.down)) + "\n" +
          "⬆️ آپلود: " + formatBytes(Number(service.up)) + "\n" +
          "↩️مجموع حجم مصرفی: " + formatBytes(Number(service.down + service.up)) + "\n" +
          "📥 حجم سرویس: " + service.total + "GB\n" +
          "📆 تاریخ ایجاد: " + new Intl.DateTimeFormat("fa-IR", {
            dateStyle: "short",
            timeStyle: "short",
            hourCycle: "h23",
            timeZone: "Asia/Tehran"
          }).format(service.createdAt) + "\n" +
          "📆 تاریخ انقضا: " + new Intl.DateTimeFormat("fa-IR", {
            dateStyle: "short",
            timeStyle: "short",
            hourCycle: "h23",
            timeZone: "Asia/Tehran"
          }).format(service.expirationDate) + "\n" +
          "🔄 تعداد دفعات تمدید: " + service.reviveCount + "\n\n" +
          "🔸 لینک اشتراک سرویس: \n" + "<pre>" + await getSubLink(service.id) + "</pre>\n\n" +
          "‼️برای کپی کردن لینک روی آن ضربه بزنید."
          , {
            chat_id: chatId,
            message_id: message_id,
            parse_mode: "HTML"
          })
      } catch (error) {
        await bot.sendMessage(64318179, error.message)
      }
    }
  }
  res.status(200).send('Received');
});

app.post("/sendMessage", async (req, res) => {
  const { secret, tgId, message } = req.body
  if (secret != secretToken) return new Response("Access Denied")
  try {
    await bot.sendMessage(tgId, message, { parse_mode: "HTML" })
    res.json({ success: true }).status(200)
  } catch (error) {

    res.json({ success: false })
  }

})

const port = process.env.TG_BOT_PORT || 2000
app.listen(port, () => { console.log(`app is listening on port: ${port}`) })
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const secret = process.env.TG_BOT_SECRET

async function sendTgMessage(tgId, message) {
  try {
    const result = await fetch(process.env.TG_BOT_API_URL + "/sendMessage", {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        secret: process.env.TG_BOT_SECRET,
        tgId: Number(tgId),
        message
      })
    })
    const res = await result.json()
    if (res.success) {
      return { success: true }
    } else { throw new Error() }

  } catch (error) {
    return { success: false }
  }
}

async function monthly() {
  const admins = await prisma.admin.findMany()
  for (let i = 0; i < admins.length; i++) {
    const admin = admins[i];
    const unpaidInvoices = await prisma.invoice.findMany({ where: { paymentStatus: "unpaid", adminId: admin.id } })
    if (unpaidInvoices.length == 0) continue
    const toPay = unpaidInvoices.reduce((a, b) => { return a + b.amount }, 0)
    await sendTgMessage(admin.tgId, "‼️ بدهی شما: " + toPay + " تومان می باشد. لطفا در اسرع وقت نسبت به پرداخت آن اقدام کنید.❤️🙏" +
      "تاریخ: " +
      new Intl.DateTimeFormat("fa-IR", {
        dateStyle: "short",
        timeStyle: "medium",
        hourCycle: "h23",
        timeZone: "Asia/Tehran",
      }).format(new Date()))
  }
}
monthly()
  .catch((error) => {
    console.log(error)
  })
  .finally(() => {
    prisma.$disconnect()
    console.log("finished")
  })
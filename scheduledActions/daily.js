require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

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

async function daily() {
  const expiredServices = []
  const now = new Date()
  const activeServices = await prisma.service.findMany({
    where: { active: true }
  })
  activeServices.forEach((service) => {
    if (service.expirationDate <= now) {
      expiredServices.push(service)
    }
  })
  for (let i = 0; i < expiredServices.length; i++) {
    const service = expiredServices[i];
    await prisma.service.update({ where: { id: service.id }, data: { active: false, disabledAt: service.expirationDate } })
    if (service.tgId) {
      await sendTgMessage(service.tgId, "‼️ مدت زمان سرویس " + service.name + " به پایان رسید.❌\n\n" +
        "‼️سرویس مورد نظر تا ده روز آینده در لیست سرور های شما باقی میماند تا در صورت تمایل، نسبت به تمدید آن اقدام کنید. برای تمدید سرویس خود به ادمینی که از آن سرویس را دریافت کرده اید، اطلاع دهید.👨‍💻\n\n" +
        "تاریخ: " +
        new Intl.DateTimeFormat("fa-IR", {
          dateStyle: "short",
          timeStyle: "medium",
          hourCycle: "h23",
          timeZone: "Asia/Tehran",
        }).format(new Date()))
    }
  }

  //expiration date alert Services
  const expiration1DateAlertServices = activeServices.filter((service) => {
    const currentDate = new Date();
    const timeDifference = service.expirationDate - currentDate;
    const oneDayRemain = timeDifference <= 24 * 60 * 60 * 1000;
    return oneDayRemain && service.expirationDateAlertSent == false
  })
  for (let i = 0; i < expiration1DateAlertServices.length; i++) {
    const service = expiration1DateAlertServices[i];
    if (service.tgId) {
      await sendTgMessage(service.tgId, '⚠️ کمتر از 1 روز از مدت زمان سرویس ' + service.name + " باقی مانده است.⚠️\n" +
        "برای جلوگیری از قطعی سرویس خود همین امروز نسبت به تمدید آن اقدام کنید. برای تمدید به ادمینی که از آن سرویس را دریافت کرده اید، اطلاع دهید.👨‍💻\n\n" +
        "تاریخ: " +
        new Intl.DateTimeFormat("fa-IR", {
          dateStyle: "short",
          timeStyle: "medium",
          hourCycle: "h23",
          timeZone: "Asia/Tehran",
        }).format(new Date()))

      await prisma.service.update({ where: { id: service.id }, data: { expirationDateAlertSent: true } })
    }
  }

  //delete obsoleted services
  const obsoletedServices = []
  const disabledServices = await prisma.service.findMany({ where: { active: false, obsoleted: false } })
  disabledServices.forEach((service) => {
    if ((service.disabledAt.getTime() + 10 * 24 * 60 * 60 * 1000) <= Date.now()) {
      obsoletedServices.push(service)
    }
  })
  for (let i = 0; i < obsoletedServices.length; i++) {
    const service = obsoletedServices[i];
    const servers = await prisma.server.findMany({
      where: {
        services: {
          some: {
            serviceId: service.id,
          },
        },
      },
      include: { inbounds: true },
    });
    const deleteClientInEnchServer = servers.map((server) => {
      return new Promise(async (resolve, reject) => {
        for (let i = 0; i < server.inbounds.length; i++) {
          const inbound = server.inbounds[i];
          if (inbound.protocol === "vless" || inbound.protocol === "vmess") {
            const res = await fetch(
              server.address +
              `/panel/api/inbounds/${inbound.serverInboundId}/delClient/` +
              service.id,
              {
                method: "POST",
                cache: "no-store",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                  Cookie: `session=${server.passwordToken}`,
                }
              }
            );
            console.log(await res.json(), server.name);
          } else if (inbound.protocol === "shadowsocks") {
            const res = await fetch(
              server.address +
              `/panel/api/inbounds/${inbound.serverInboundId}/delClient/` +
              service.name +
              inbound.serverInboundId,
              {
                method: "POST",
                cache: "no-store",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                  Cookie: `session=${server.passwordToken}`,
                },
              }
            );
            console.log(await res.json(), server.name);
          }
        }
        resolve()
      })
    })
    await Promise.all(deleteClientInEnchServer)
    await prisma.service.update({ where: { id: service.id }, data: { obsoleted: true } })


  }
  const recentInvoices = await prisma.invoice.findMany({ where: { createdAt: { gte: new Date(new Date() - 24 * 60 * 60 * 1000) } } })
  await sendTgMessage(64318179, "🔸 مجموع صورتحساب های امروز: " + recentInvoices.reduce((a, b) => { return a + b.amount }, 0) + " تومان")
}

daily()
  .catch((error) => {
    console.log(error)
  })
  .finally(() => {
    prisma.$disconnect()
    console.log("finished")
  })
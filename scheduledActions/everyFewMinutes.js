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
      return { success: true}
    } else { throw new Error() }

  } catch (error) {
    return { success: false }
  }
}

async function checkUsage() {
  try {
    const activeServices = await prisma.service.findMany({
      where: { active: true },
      include: { servers: true }
    })
    const servers = await prisma.server.findMany({
      include: {
        inbounds: true,
        services: true,
        usage: true
      }
    })


    //geting clientsStatsFromServers
    const xuiServersClients = []
    const getXuiServersInbounds = servers.map((server) => {
      return new Promise(async (resolve, reject) => {
        const getServerInbounds = await fetch(
          server.address +
          "/panel/api/inbounds/list",
          {
            method: "GET",
            cache: "no-store",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Cookie: `session=${server.passwordToken}`,
            },
          })
        const serverInbounds = await getServerInbounds.json()
        serverInbounds.obj.forEach(serverInbound => {
          serverInbound.clientStats.forEach(clientStat => {
            clientStat.serverId = server.id
            xuiServersClients.push(clientStat)
          })
        });
        resolve()
      })
    })
    await Promise.all(getXuiServersInbounds)

    //Updainging Database
    const updateServices = activeServices.map((service) => {
      return new Promise(async (resolve, reject) => {
        const updateServer = service.servers.map((serviceServer) => {
          return new Promise(async (resolve, reject) => {
            const server = servers.find((server) => {
              return server.id == serviceServer.serverId;
            });
            const updateInboundes = server.inbounds.map((inbound) => {
              return new Promise(async (resolve, reject) => {
                const usage = xuiServersClients.find((clientStat) => {
                  return clientStat.serverId == server.id && clientStat.inboundId == inbound.serverInboundId && clientStat.email == (service.name + inbound.serverInboundId)
                })
                if (!usage) {
                  resolve();
                  return
                }
                await prisma.service_inbound_usage.updateMany({
                  where: {
                    serverId: server.id,
                    serviceId: service.id,
                    inboundId: inbound.id
                  },
                  data: {
                    up: usage.up,
                    down: usage.down
                  }
                })
                resolve()
              })
            })
            await Promise.all(updateInboundes)
            resolve()
          })
        })
        await Promise.all(updateServer)
        const usages = await prisma.service_inbound_usage.findMany({
          where: { serviceId: service.id }
        })
        await prisma.service.update({
          where: { id: service.id },
          data: {
            up: (usages.reduce((a, b) => { return (a + b.up) }, BigInt(0))),
            down: usages.reduce((a, b) => { return (a + b.down) }, BigInt(0))
          }
        })
        resolve()

      })
    })
    await Promise.all(updateServices)
    await prisma.setting.update({
      where: {
        key: "lastUsageCheckTime",
      },
      data: { value: String(Date.now()) }
    })


    //checkOverUsedServices
    const overusedServices = []
    const services = await prisma.service.findMany({
      where: { active: true, obsoleted: false },
      include: { serviceType: true }
    })
    services.forEach((service) => {
      if ((service.total * (1024 ** 3)) <= Number(service.up + service.down)) {
        overusedServices.push(service)
      }
    })
    for (let i = 0; i < overusedServices.length; i++) {
      const service = overusedServices[i];
      //disable clients on servers
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
      const deactiveInboundsInEachServer = servers.map((server) => {
        return new Promise(async (resolve, reject) => {
          for (let i = 0; i < server.inbounds.length; i++) {
            const inbound = server.inbounds[i];
            if (inbound.protocol === "vless" || inbound.protocol === "vmess") {
              const res = await fetch(
                server.address +
                "/panel/api/inbounds/updateClient/" +
                service.id,
                {
                  method: "POST",
                  cache: "no-store",
                  headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Cookie: `session=${server.passwordToken}`,
                  },
                  body: JSON.stringify({
                    id: inbound.serverInboundId,
                    settings: `{"clients":[{"id":"${service.id}","email":"${service.name + inbound.serverInboundId.toString()
                      }","limitIp":${service.serviceType.userLimit},"totalGB":${service.total * 1024 ** 3
                      },"expiryTime":${Number(
                        service.expirationDate
                      )},"enable":false,${inbound.flow ? `"flow":"${inbound.flow}",` : ""
                      }"tgId":"","subId":"${service.name}"}]}`,
                  }),
                }
              );
              console.log(await res.json(), server.name);
            } else if (inbound.protocol === "shadowsocks") {
              const res = await fetch(
                server.address +
                "/panel/api/inbounds/updateClient/" +
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
                  body: JSON.stringify({
                    id: inbound.serverInboundId,
                    settings: `{"clients":[{"password":"${btoa(
                      service.id
                    )}","email":"${service.name + inbound.serverInboundId.toString()
                      }","limitIp":${service.serviceType.userLimit},"totalGB":${service.total * 1024 ** 3
                      },"expiryTime":${Number(
                        service.expirationDate
                      )},"enable":false,"tgId":"","subId":"${service.name}"}]}`,
                  }),
                }
              );
              console.log(await res.json(), server.name);
            }
          }
          resolve();
        });
      });
      await Promise.all(deactiveInboundsInEachServer);

      //Send Overused Service Message
      if (service.tgId) {
        await sendTgMessage(service.tgId, "⚠️حجم سرویس " + service.name + " به پایان رسید.❌\n\n" +
          "‼️سرویس مورد نظر تا ده روز آینده در لیست سرور های شما باقی میماند تا در صورت تمایل، نسبت به تمدید آن اقدام کنید. برای تمدید سرویس خود به ادمینی که از آن سرویس را دریافت کرده اید، اطلاع دهید.👨‍💻\n\n" +
          "تاریخ: " +
          new Intl.DateTimeFormat("fa-IR", {
            dateStyle: "short",
            timeStyle: "medium",
            hourCycle: "h23",
            timeZone: "Asia/Tehran",
          }).format(new Date()))
      }
      await prisma.service.update({
        where: { id: service.id },
        data: { active: false, disabledAt: new Date() }
      })
    }

    //send Alert
    const usageAlertServices = services.filter((service) => {
      return (((Number(service.up + service.down) / (1024 ** 3)) + 1) > service.total) && service.trefficAlertSent == false
    })
    for (let i = 0; i < usageAlertServices.length; i++) {
      const service = usageAlertServices[i];
      if (service.tgId) {
        await sendTgMessage(service.tgId, "⚠️ کمتر از 1 گیگابایت از حجم سرویس " + service.name + "باقی مانده است. بهتر است پیش از اتمام حجم سرویس و غیرفعال شدن آن نسبت به تمدید سرویس اقدام کنید.\n\n" +
          "‼️برای تمدید سرویس خود به ادمینی که از آن سرویس را دریافت کرده اید، اطلاع دهید.\n\n" +
          "تاریخ: " +
          new Intl.DateTimeFormat("fa-IR", {
            dateStyle: "short",
            timeStyle: "medium",
            hourCycle: "h23",
            timeZone: "Asia/Tehran",
          }).format(new Date()))
      }
      await prisma.service.update({ where: { id: service.id }, data: { trefficAlertSent: true } })
    }


    return console.log("success")
  } catch (error) {
    console.log(error)
  }
}


checkUsage().catch((error) => {
  console.log(error)
})
  .finally(() => {
    prisma.$disconnect()
    console.log("finished")
  })
"use server"
import prisma from "./prisma"
import { validateAddServiceData } from "./validations";
import * as uuid from "uuid";
import { encryptAndEncodeUUID } from "./encryption";
const { exec } = require('child_process');
//general actions
export async function sendTgMessage(tgId, message) {
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
async function addClientToServer(service, server, inbound) {
  try {
    let res
    if (inbound.protocol === "vless" || inbound.protocol === "vmess") {
      res = await fetch(
        server.address +
        "/panel/api/inbounds/addClient",
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
              },"expiryTime":${Number(service.expirationDate
              )},"enable":${service.active.toString()},${inbound.flow ? `"flow":"${inbound.flow}",` : ""
              }"tgId":"","subId":"${service.name}"}]}`,
          }),
        }
      );
    } else if (inbound.protocol === "shadowsocks") {
      res = await fetch(
        server.address +
        "/panel/api/inbounds/addClient",
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
            settings: `{"clients":[{"password":"${btoa(service.id)}","email":"${service.name + inbound.serverInboundId.toString()
              }","limitIp":${service.serviceType.userLimit},"totalGB":${service.total * 1024 ** 3
              },"expiryTime":${Number(
                service.expirationDate
              )},"enable":${service.active.toString()},"tgId":"","subId":"${service.name}"}]}`,
          }),
        }
      );
    }
    const result = await res.json()
    return result
  } catch (error) {
    console.log(error)
    return { success: false, msg: error.toString() }
  }
}
function getExpirationTime(days) {
  let currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + days);
  currentDate.setHours(20, 30, 0, 0);
  return currentDate.getTime();
}
export async function getBotSubLink(id) {
  const botURL = process.env.TG_BOT_URL
  const token = encryptAndEncodeUUID(id)
  return botURL + "?start=" + token
}
export async function sendBotSubLink(service) {
  const admin = await prisma.admin.findFirst({ where: { id: service.adminId } })
  await sendTgMessage(admin.tgId,
    "✔️سرویس " + service.name + " با موفقیت ایجاد شد.✅\n\n" +
    "📥 حجم: " + service.total + "GB\n" +
    "📆 تاریخ ایجاد: " + new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "short",
      timeStyle: "medium",
      hourCycle: "h23",
      timeZone: "Asia/Tehran"
    }).format(service.createdAt) + "\n" +
    "📆 تاریخ انقضا: " + new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "short",
      timeStyle: "medium",
      hourCycle: "h23",
      timeZone: "Asia/Tehran"
    }).format(service.expirationDate) + "\n\n" +
    `برای افزودن سرویس به لیست سرویس های خود روی گزینه «<a href="${await getBotSubLink(service.id)}">ثبت سرویس و دریافت لینک اشتراک</a>» کلیک کنید.`
  )
}
export async function getSubLink(id) {
  const token = encryptAndEncodeUUID(id)
  const subURL = process.env.SUB_URL;
  return subURL + "/sub/" + token;
}

//login Page
export async function sendLoginMessage(username) {
  const admin = await prisma.admin.findUnique({ where: { username } })
  await sendTgMessage(admin.tgId, "شما با موفقیت به پنل وارد شدید.✅\n\nتاریخ: " +
    new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "short",
      timeStyle: "medium",
      hourCycle: "h23",
      timeZone: "Asia/Tehran",
    }).format(new Date()))
}
//AddService Page Actions
export async function addService(data) {
  try {
    //validate the data
    const result = await validateAddServiceData(data)
    //make correct values for adding client to servers
    const { id, name, serviceTypeId, extraTraffic, selectedServerIds, adminId, explanation } = result
    const serviceType = await prisma.serviceType.findFirst({ where: { id: serviceTypeId } })
    const servers = await prisma.server.findMany({ where: { OR: selectedServerIds.map((id) => { return { id } }) }, include: { inbounds: true } })
    const service = {
      id, name, adminId, explanation, serviceType, serviceTypeId,
      active: true,
      expirationDate: new Date(getExpirationTime(serviceType.days)),
      total: serviceType.initial_GB + extraTraffic,
      price: serviceType.initial_price + (extraTraffic * serviceType.extra_GB_price) + (servers.reduce((a, b) => { return a + b.price }, 0))
    }
    //add client to servers
    const sendDataToServers = servers.map((server) => {
      return new Promise(async (resolve, reject) => {
        try {
          for (let index = 0; index < server.inbounds.length; index++) {
            const inbound = server.inbounds[index];
            const result = await addClientToServer(service, server, inbound)
            if (!result.success) {
              reject(result)
            }
          }
          resolve()
        } catch (error) {
          reject(error)
        }
      })
    })
    await Promise.all(sendDataToServers)

    //add service , invoice , usages to database
    const usagesData = []
    servers.forEach((server) => {
      server.inbounds.forEach((inbound) => {
        usagesData.push({ serverId: server.id, inboundId: inbound.id })
      })
    })
    const newServiceData = {
      id: service.id,
      name: service.name,
      explanation: service.explanation,
      expirationDate: service.expirationDate,
      total: service.total,
      adminId: service.adminId,
      serviceTypeId,

    }
    const newService = await prisma.service.create({
      data: {
        ...newServiceData,
        invoices: {
          create: {
            adminId: service.adminId,
            amount: service.price
          }
        },
        servers: {
          create: servers.map((server) => { return { serverId: server.id } })
        },
        usage: {
          create: usagesData
        }
      },
    })
    sendBotSubLink(newService)

    return JSON.stringify({ success: true, message: "سرویس با موفقیت ایجاد شد.", data: null })
  } catch (error) {
    if (error.msg) {
      error.message = error.msg
    }
    return JSON.stringify({ success: false, message: error.message, data: null })
  }


}

//service Page Actions
export async function reviveServiceById(id, adminId) {
  try {
    //check admin
    const admin = await prisma.admin.findFirst({ where: { id: adminId, active: true } })
    if (!admin) return { success: false, message: "عدم دسترسی ادمین" }
    //make values
    const service = await prisma.service.findFirst({
      where: { id, serviceType: { revivable: true } },
      include: { serviceType: true, admin: true },
    });
    if (!service) throw new Error("این سرویس قابل تمدید نیست.")
    const servers = await prisma.server.findMany({
      where: {
        services: {
          some: {
            serviceId: id,
          },
        },
      },
      include: { inbounds: true },
    });
    if (servers.find((server) => { return server.revivable == false })) throw new Error("این سرویس قابل تمدید نیست.")

    //send API To Servers
    //resetTraffic
    const everyServerTrafficReset = servers.map((server) => {
      return new Promise(async (resolve, reject) => {
        for (let index = 0; index < server.inbounds.length; index++) {
          const inbound = server.inbounds[index];
          const res = await fetch(
            server.address +
            `/panel/api/inbounds/${inbound.serverInboundId}/resetClientTraffic/` +
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
          const result = await res.json()
          if (result.success == false) throw new Error("trafficResetError: ", result.msg)
        }

        resolve()
      });
    });
    await Promise.all(everyServerTrafficReset);

    //update the expirationDate
    const everyServerUpdate = servers.map((server) => {
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
                      getExpirationTime(service.serviceType.days)
                    )},"enable":true,${inbound.flow ? `"flow":"${inbound.flow}",` : ""
                    }"tgId":"","subId":"${service.name}"}]}`,
                }),
              }
            );
            const result = await res.json()
            if (result.success == false) throw new Error("updateExpirationDateError: " + result.msg)
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
                      getExpirationTime(service.serviceType.days)
                    )},"enable":true,"tgId":"","subId":"${service.name}"}]}`,
                }),
              }
            );
            const result = await res.json()
            if (result.success == false) throw new Error("updateExpirationDateError: " + result.msg)
          }
        }
        resolve()
      });
    });
    await Promise.all(everyServerUpdate);
    //update database
    await prisma.service.update({
      where: { id: service.id },
      data: {
        active: true,
        disabledAt: null,
        up: BigInt(0),
        down: BigInt(0),
        expirationDate: new Date(
          getExpirationTime(service.serviceType.days)
        ),
        reviveCount: service.reviveCount + 1,
        lastRevivedAt: new Date(),
        trefficAlertSent: false,
        expirationDateAlertSent: false
      },
    });
    await prisma.service_inbound_usage.updateMany({
      where: { serviceId: service.id },
      data: { up: BigInt(0), down: BigInt(0) },
    });

    //create new invoice
    await prisma.invoice.create({
      data: {
        serviceId: service.id,
        adminId: service.adminId,
        amount: service.serviceType.initial_price + ((service.total - service.serviceType.initial_GB) * service.serviceType.extra_GB_price) + (servers.reduce((a, b) => { return a + b.price }, 0))
      }
    })
    let sendTo = [admin.tgId]
    if (service.tgId) sendTo.push(service.tgId)
    for (let i = 0; i < sendTo.length; i++) {
      const tgId = sendTo[i];
      await sendTgMessage(tgId,
        "سرویس " + service.name + " با موفقیت تمدید شد.✅\n\n" +
        "تاریخ: " +
        new Intl.DateTimeFormat("fa-IR", {
          dateStyle: "short",
          timeStyle: "medium",
          hourCycle: "h23",
          timeZone: "Asia/Tehran",
        }).format(new Date())
      )
    }
    return { success: true, message: "سرویس با موفقیت تمدید شد.", }

  } catch (error) {
    if (error.msg) {
      error.message = error.msg
    }
    return { success: false, message: error.message }
  }

}
export async function resetServiceId(serviceName, adminId) {
  try {
    //check admin
    const admin = await prisma.admin.findFirst({ where: { id: adminId, active: true } })
    if (!admin) return { success: false, message: "عدم دسترسی ادمین" }
    const service = await prisma.service.findUnique({ where: { name: serviceName }, include: { serviceType: true } })
    if (!service) throw new Error("سرویسی با این نام یافت نشد")
    const servers = await prisma.server.findMany({ where: { services: { some: { serviceId: service.id } } }, include: { inbounds: true } })
    //send Api
    const newId = uuid.v4()
    const everyServerUpdate = servers.map((server) => {
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
                  settings: `{"clients":[{"id":"${newId}","email":"${service.name + inbound.serverInboundId.toString()
                    }","limitIp":${service.serviceType.userLimit},"totalGB":${service.total * 1024 ** 3
                    },"expiryTime":${Number(
                      service.expirationDate
                    )},"enable":true,${inbound.flow ? `"flow":"${inbound.flow}",` : ""
                    }"tgId":"","subId":"${service.name}"}]}`,
                }),
              }
            );
            const result = await res.json()
            if (result.success == false) throw new Error(result.msg)
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
                    newId
                  )}","email":"${service.name + inbound.serverInboundId.toString()
                    }","limitIp":${service.serviceType.userLimit},"totalGB":${service.total * 1024 ** 3
                    },"expiryTime":${Number(
                      service.expirationDate
                    )},"enable":true,"tgId":"","subId":"${service.name}"}]}`,
                }),
              }
            );
            const result = await res.json()
            if (result.success == false) throw new Error(result.msg)
          }
        }

        resolve()
      });
    });
    await Promise.all(everyServerUpdate);

    //update database
    await prisma.service.update({ where: { name: serviceName }, data: { id: newId } })

    let sendTo = [admin.tgId]
    if (service.tgId) sendTo.push(service.tgId)
    for (let i = 0; i < sendTo.length; i++) {
      const tgId = sendTo[i];
      await sendTgMessage(tgId,
        "آیدی سرویس " + service.name + " با موفقیت تغییر کرد.✅\n\n" +
        "‼️ با تغییر ID سرویس لینک اشتراک قبلی و کانفیگ های آن از کار افتاده و لینک اشتراک جدید ایجاد می شود. لینک اشتراک جدید از قسمت «اطلاعات سرویس» قابل دریافت است.\n\n" +
        "تاریخ: " +
        new Intl.DateTimeFormat("fa-IR", {
          dateStyle: "short",
          timeStyle: "medium",
          hourCycle: "h23",
          timeZone: "Asia/Tehran",
        }).format(new Date()))
    }
    return { success: true, message: "آیدی سرویس با موفقیت تغییر کرد", }
  } catch (error) {
    if (error.msg) {
      error.message = error.msg
    }
    return { success: false, message: error.message }
  }

}

//invoices Page Actions
export async function setPaymentStatus({ invoiceId, paymentStatus }) {
  try {
    const data = { paymentStatus }
    if (paymentStatus == "paid") {
      data.paiedAt = new Date()
    }
    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data
    })
    return { success: true, message: `وضعیت صورتحساب به ${paymentStatus} تغییر کرد.` }
  } catch (error) {
    console.log(error)
    return { success: false, message: error.message }
  }
}

//servers setting actions
export async function addServer({
  name, address, price, provider, passwordToken
}) {

  try {
    const newServer = await prisma.server.create({
      data: {
        name, address, price, provider: provider ? provider : null, passwordToken
      }
    })
    return { success: true, message: "سرور با موفقیت اضافه شد" }
  } catch (error) {
    return { success: false, message: error.message }
  }
}
export async function editServer({
  name, address, price, provider, passwordToken, addable, revivable, id
}) {
  try {
    const EditedServer = await prisma.server.update({
      where: { id },
      data: { name, address, price, provider, passwordToken, addable, revivable }
    })
    return { success: true, message: "ویرایش سرور با موفقیت انجام شد." }
  } catch (error) {
    return { success: false, message: error.message }
  }

}
export async function addInbound({
  serverInboundId,
  protocol,
  flow,
  configLink,
  serverId
}) {
  try {
    const newInbound = await prisma.inbound.create({
      data: {
        serverInboundId,
        protocol,
        flow: flow ? flow : null,
        configLink,
        serverId
      }
    });
    const result = await checkServicesAndInbounds();
    if (result.success == false) throw new Error(result.message)
    return { success: true, message: "اینباند با موفقیت اضافه شد" };
  } catch (error) {

    return { success: false, message: error.message };
  }
}
export async function editInbound({ active, configLink, id }) {
  try {
    const editedInbound = await prisma.inbound.update({
      where: { id },
      data: { active, configLink }
    })
    return { success: true, message: "ویرایش اینباند با موفقیت انجام شد." };
  } catch (error) {
    return { success: false, message: error.message };
  }

}
export async function checkServicesAndInbounds() {
  try {
    const usages = await prisma.service_inbound_usage.findMany();
    const servers = await prisma.server.findMany({
      include: { inbounds: true },
    });
    const services = await prisma.service.findMany({
      include: { servers: true, serviceType: true },
    });
    //map services
    const checkServices = services.map((service) => {
      return new Promise(async (resolve, reject) => {
        //map servers
        const checkServer = service.servers.map((serviceServer) => {
          return new Promise(async (resolve, reject) => {
            const server = servers.find((server) => {
              return server.id == serviceServer.serverId;
            });
            for (let i = 0; i < server.inbounds.length; i++) {
              const inbound = server.inbounds[i];
              const usage = usages.find((usage) => {
                return (
                  usage.serverId == server.id &&
                  usage.inboundId == inbound.id &&
                  usage.serviceId == service.id
                );
              });
              if (!usage) {
                const result = await addClientToServer(service, server, inbound);
                if (result.success == false) throw new Error(result.msg)
                await prisma.service_inbound_usage.create({
                  data: {
                    serviceId: service.id,
                    inboundId: inbound.id,
                    serverId: server.id,
                  },
                });
              }
            }
            resolve();
          });
        });
        await Promise.all(checkServer);
        resolve();
      });
    });
    await Promise.all(checkServices);
    return { success: true }
  } catch (error) {
    return { success: false, message: error.message }
  }
}

//admins setting actions
export async function getAdmins() {
  const count = await prisma.admin.count()
  const admins = await prisma.admin.findMany()
  return { count, list: admins }
}
export async function addAdmin({ name, username, password, tgId }) {
  try {
    const newAdmin = await prisma.admin.create({
      data: {
        name, username, password, email: name, tgId
      }
    })
    return { success: true, message: "ادمین با موفقیت افزوده شد." }
  } catch (error) {
    return { success: false, message: error.message }
  }

}
export async function getAdminById(id) {
  const admin = await prisma.admin.findFirst({
    where: { id },
    include: { tgUser: { select: { username: true } } }
  })
  return admin
}
export async function editAdmin({ id, name, username, password, tgId, active, grade }) {
  try {
    const editedAdmin = await prisma.admin.update({
      where: { id },
      data: {
        name, username, password, tgId, active, grade
      }
    })
    return { success: true, message: "ویرایش ادمین با موفقیت انجام شد." }
  } catch (error) {
    return { success: false, message: error.message }
  }

}

//serviceTypes setting actions
export async function AddServiceType({
  name,
  userLimit,
  days,
  initial_price,
  initial_GB,
  max_extra_GB,
  extra_GB_price,
}) {
  try {
    const newServiceType = await prisma.serviceType.create({
      data: {
        name,
        userLimit,
        days,
        initial_price,
        initial_GB,
        max_extra_GB,
        extra_GB_price,
      }
    })
    return { success: true, message: "نوع سرویس جدید با موفقیت افزوده شد." }
  } catch (error) {
    return { success: false, message: error.message }
  }
}
export async function editServiceType({ id, name, userLimit, days, initial_price, initial_GB, max_extra_GB, extra_GB_price, editedSelectedServers, addable, revivable }) {
  try {
    const EditedServer = await prisma.serviceType.update({
      where: { id },
      data: { name, userLimit, days, initial_price, initial_GB, max_extra_GB, extra_GB_price, addable, revivable }
    })
    await prisma.server_serviceType.deleteMany({ where: { serviceTypeId: id } })
    await prisma.server_serviceType.createMany({
      data: editedSelectedServers.map((server) => { return { serviceTypeId: id, serverId: server.id } })
    })
    return { success: true, message: "ویرایش نوع سرویس با موفقیت انجام شد." }
  } catch (error) {
    return { success: false, message: error.message }
  }

}

//bot actions
export async function testMessage() {
  await sendTgMessage(64318179, "test test test")
  return "success"
}
export async function sendTgMessageInSettings({ sendToMethod, serviceType, server, tgId, message }) {
  let successfullMessages = 0
  let unsuccessfullMessages = 0
  if (sendToMethod === "allUsers") {
    const tgUsers = await prisma.tgUser.findMany()
    for (let i = 0; i < tgUsers.length; i++) {
      const tgUser = tgUsers[i];
      const res = await sendTgMessage(tgUser.id, message)
      if (res.success) {
        successfullMessages += 1
      } else {
        unsuccessfullMessages += 1
      }
    }
  } else if (sendToMethod === "allAdmins") {
    const admins = await prisma.admin.findMany()
    for (let i = 0; i < admins.length; i++) {
      const admin = admins[i];
      const res = await sendTgMessage(admin.tgId, message)
      if (res.success) {
        successfullMessages += 1
      } else {
        unsuccessfullMessages += 1
      }
    }
  } else if (sendToMethod === "serverOwners") {
    const services = await prisma.service.findMany({ where: { servers: { some: { serverId: server } }, active: true } })
    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      if (service.tgId) {
        const res = await sendTgMessage(service.tgId, message)
        if (res.success) {
          successfullMessages += 1
        } else {
          unsuccessfullMessages += 1
        }
      }
    }
  } else if (sendToMethod === "serviceTypeOwners") {
    const services = await prisma.service.findMany({ where: { serviceTypeId: serviceType, active: true } })
    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      if (service.tgId) {
        const res = await sendTgMessage(service.tgId, message)
        if (res.success) {
          successfullMessages += 1
        } else {
          unsuccessfullMessages += 1
        }
      }
    }
  } else if (sendToMethod === "oneUser") {
    const res = await sendTgMessage(tgId, message)
    if (res.success) {
      successfullMessages += 1
    } else {
      unsuccessfullMessages += 1
    }
  }
  await sendTgMessage(64318179, "تعداد پیام های موفق: " + successfullMessages +
    "\nتعداد پیام های ناموفق: " + unsuccessfullMessages)
}


// General settings
export async function checkUsage() {
  const checkUsagePath = process.env.CHECK_USAGE_PATH
  async function run() {
    return new Promise((resolve, reject) => {
      exec("node " + checkUsagePath, (error, stdout, stderr) => {
        if (error) {
          reject(error)
          return
        }
        resolve()
      })
    })
  }
  try {
    await run()
    await sendTgMessage(64318179, "بروزرسانی انجام شد.")
    return { success: true, message: "بروزرسانی انجام شد." }
  } catch (error) {
    await sendTgMessage(64318179, "خطا: \n\n" + error.message)
    return { success: false, message: error.message }
  }
}
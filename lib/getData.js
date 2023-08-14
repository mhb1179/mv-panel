"use server"
import prisma from "./prisma"
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

//dashboard page
export async function getEachServerUsage() {
  const usages = await prisma.service_inbound_usage.findMany()
  const servers = await prisma.server.findMany()

  return servers.map((server) => {
    const serverUsages = usages.filter((usage) => { return usage.serverId == server.id })
    return { name: server.name, "usage": serverUsages.reduce((a, b) => { return a + Number(b.up + b.down)/1020**3 }, 0) }
  })
}


//AddService Page
export async function getAllowedServiceTypes() {
  return await prisma.serviceType.findMany({
    where: {
      addable: true
    },
    select: {
      id: true,
      name: true
    }
  })
}
export async function getServiceTypeById(id) {
  const serviceType = await prisma.serviceType.findFirst({
    where: {
      id,
      addable: true
    },
    include: { servers: true }
  })
  const servers = await prisma.server.findMany({
    where: {
      OR: serviceType.servers.map((server) => {
        return { id: server.serverId }
      }),
      addable: true
    },
    select: {
      id: true,
      name: true,
      price: true
    }
  })
  serviceType.servers = servers
  return serviceType
}

//services Page Actions
export async function getAllAdmins() {
  return await prisma.admin.findMany({
    select: { id: true, name: true }
  })
}
export async function getServices({ sortBy, filterBy, adminId, search, page, servicePerPage }) {
  const servicesData = { where: { obsoleted: false } }
  //filtering Services
  if (search) servicesData.where.name = { contains: search }
  if (adminId && typeof adminId == "number") servicesData.where.adminId = adminId
  if (filterBy == "enable") servicesData.where.active = true
  if (filterBy == "disable") servicesData.where.active = false
  if (filterBy == "unpaid") servicesData.where.invoices = { some: { paymentStatus: "unpaid" } }
  if (filterBy == "tgUnregistered") servicesData.where.tgId = null

  const count = await prisma.service.count(servicesData)


  //sorting Services
  if (!sortBy) servicesData.orderBy = [{ active: "desc" }, { createdAt: "desc" }]
  if (sortBy == "newest") servicesData.orderBy = [{ active: "desc" }, { createdAt: "desc" }]
  if (sortBy == "oldest") servicesData.orderBy = [{ active: "desc" }, { createdAt: "asc" }]
  if (sortBy == "expireSoon") servicesData.orderBy = [{ active: "desc" }, { expirationDate: "asc" }]
  if (sortBy == "expireLate") servicesData.orderBy = [{ active: "desc" }, { expirationDate: "desc" }]
  if (sortBy == "reviveCount") servicesData.orderBy = [{ active: "desc" }, { reviveCount: "desc" }]

  //pagination
  if (!page) page = 1
  servicesData.skip = servicePerPage * (page - 1);
  servicesData.take = servicePerPage;
  //including
  servicesData.include = {
    admin: { select: { name: true } },
    serviceType: true
  };

  const services = await prisma.service.findMany(servicesData)

  return { list: services, count }
}


//service Page 
export async function getServiceByName(serviceName) {
  const service = await prisma.service.findUnique({ where: { name: serviceName, obsoleted: false }, include: { usage: true, admin: { select: { name: true } }, serviceType: { select: { name: true } } } })
  if (!service) return { success: false, message: "404", data: null }
  const servers = await prisma.server.findMany({ where: { services: { some: { serviceId: service.id } } }, include: { inbounds: true } })
  const eachServerUsage = []
  servers.forEach((server) => {
    const serverUsage = { up: 0, down: 0, totalUsage: 0 }
    server.inbounds.forEach((inbound) => {
      const usage = service.usage.find((u) => { return u.inboundId == inbound.id })
      serverUsage.up += Number(usage.up)
      serverUsage.down += Number(usage.down)
    })
    serverUsage.totalUsage = serverUsage.up + serverUsage.down
    serverUsage.up = formatBytes(serverUsage.up)
    serverUsage.down = formatBytes(serverUsage.down)
    serverUsage.totalUsage = formatBytes(serverUsage.totalUsage)
    serverUsage.name = server.name
    eachServerUsage.push(serverUsage)
  })
  service.up = Number(service.up)
  service.down = Number(service.down)
  service.totalUsage = service.up + service.down

  service.up = formatBytes(service.up)
  service.down = formatBytes(service.down)
  service.totalUsage = formatBytes(service.totalUsage)

  const lastUsageCheckTime = await prisma.setting.findFirst({ where: { key: "lastUsageCheckTime" } })
  return { success: true, service, eachServerUsage, lastUsageCheckTime: lastUsageCheckTime.value }

}
export async function getServicePrice(id) {
  const service = await prisma.service.findFirst({ where: { id }, include: { serviceType: true } })
  const servers = await prisma.server.findMany({ where: { services: { some: { serviceId: id } } } })
  const price = service.serviceType.initial_price +
    (service.total - service.serviceType.initial_GB) * service.serviceType.extra_GB_price +
    servers.reduce((a, b) => { return a + b.price }, 0)
  console.log(price)
  return price
}

//invoices Page
export async function getInvoices({ sortBy, filterBy, adminId, search, page, invoicePerPage }) {
  const invoicesQuery = { where: {} }
  //filtering invoices
  if (search) invoicesQuery.where.service = { name: { contains: search } }
  if (adminId && typeof adminId == "number") invoicesQuery.where.adminId = adminId
  if (filterBy == "paid") invoicesQuery.where.paymentStatus = "paid"
  if (filterBy == "unpaid") invoicesQuery.where.paymentStatus = "unpaid"
  if (filterBy == "adminReward") invoicesQuery.where.paymentStatus = "adminReward"

  const count = await prisma.invoice.count(invoicesQuery)

  //sorting invoices
  invoicesQuery.orderBy = { createdAt: "desc" }
  if (sortBy == "oldest") invoicesQuery.orderBy = { createdAt: "asc" }

  //pagination
  if (!page) page = 1
  invoicesQuery.skip = invoicePerPage * (page - 1);
  invoicesQuery.take = invoicePerPage;
  //including
  invoicesQuery.include = {
    admin: { select: { name: true } },
    service: true
  };

  const invoices = await prisma.invoice.findMany(invoicesQuery)
  const where = { paymentStatus: "unpaid" }
  if (adminId && typeof adminId == "number") where.adminId = adminId
  const toPay = await prisma.invoice.findMany({ where })
  const toPayAmount = toPay.reduce((a, b) => { return a + b.amount }, 0)

  return { list: invoices, count, toPay: toPayAmount }
}

//servers setting
export async function getServers() {
  const count = await prisma.server.count()
  const servers = await prisma.server.findMany()
  return { count, list: servers }
}
export async function getServerById(id) {
  const server = await prisma.server.findFirst({ where: { id }, include: { inbounds: true } })
  return server
}

//serviceTypes setting
export async function getServiceTypes() {
  const count = await prisma.serviceType.count()
  const serviceTypes = await prisma.serviceType.findMany()
  return { count, list: serviceTypes }
}
export async function getServiceTypeByIdForSetting(id) {
  const serviceType = await prisma.serviceType.findFirst({ where: { id }, include: { servers: true } })
  const servers = await prisma.server.findMany({ where: { serviceTypes: { some: { serviceTypeId: id } } } })
  return { serviceType, servers }
}



"use server"

import prisma from "./prisma"
import * as yup from "yup"
import * as uuid from "uuid";

//AddService Page Validations
export async function checkServiceNameUnique(name) {
  const prevService = await prisma.service.findUnique({
    where: {
      name
    }
  })
  if (prevService) {
    return false
  } else {
    return true
  }
}
export async function checkServiceIdUnique(id) {
  const prevService = await prisma.service.findFirst({
    where: { id }
  })
  if (prevService) {
    return false
  } else {
    return true
  }
}
export async function validateAddServiceData(data) {
  const dataSchema = yup.object({
    name: yup
      .string()
      .required("نام الزامی است.")
      .matches(/^[a-zA-Z0-9_.-]*$/, "فقط حروف و اعداد انگلیسی مجاز است.")
      .test("name-is-unique", "نام تکراری است.", async (value) => {
        return checkServiceNameUnique(value);
      }),
    id: yup
      .string()
      .required("آیدی الزامی است.")
      .test("uuid-is-valide", "آیدی نامعتبر است.", (value) => {
        return uuid.validate(value);
      })
      .test("uuid-is-unique", "آیدی تکراری است.", async (value) => {
        return checkServiceIdUnique(value);
      }),
    serviceTypeId: yup
      .number()
      .required("نوع سرویس الزامی است.")
      .test("serviceType-is-addable", "نوع سرویس قابل ایجاد نیست.", async (value) => {
        const serviceType = await prisma.serviceType.findFirst({
          where: {
            id: value,
            addable: true
          }
        })
        if (serviceType) { return true } else { return false }
      }),
    extraTraffic: yup
      .number()
      .required()
      .min(0, "عدد نامعتبر")
      .test("max", "میزان حجم اضافی بیش از سقف است.", async (value) => {
        const serviceType = await prisma.serviceType.findFirst({
          where: { id: data.serviceTypeId }
        })
        if (value <= serviceType.max_extra_GB) { return true } else { return false }
      }),
    explanation: yup
      .string()
      .test("explanation lenght", "توضیحات طولانی است", (value) => {
        if (value?.length < 200) { return true } else { return false }
      }),
    selectedServerIds: yup
      .array().of(
        yup.number()
          .test("server-is-addable", "سرور قابل انتخاب نیست", async (value) => {
            const server = await prisma.server.findFirst({
              where: {
                id: value,
                addable: true,
                serviceTypes: { some: { serviceTypeId: data.serviceTypeId } }
              }
            })
            if (server) { return true } else { return false }
          })),
    adminId: yup.number()
      .test("admin-is-active", "عدم دسترسی ادمین", async (value) => {
        const admin = await prisma.admin.findFirst({
          where: { id: value, active: true }
        })
        if (admin) { return true } else { return false }
      })

  })

  const result = await dataSchema.validate(data)
  return result



}

//Servers validations 
export async function checkServerNameUnique(name) {
  const prevServer = await prisma.server.findUnique({ where: { name } })
  if (prevServer) {
    return false
  } else {
    return true
  }
}
export async function checkServerNameUniqueForEdit(name, id) {
  const prevServer = await prisma.server.findUnique({
    where: { name }
  })
  if (prevServer && prevServer.id != id) {
    return false
  } else {
    return true
  }
}

//admins validations
export async function checkAdminNameUnique(name) {
  const prevAdmin = await prisma.admin.findUnique({ where: { name } })
  if (prevAdmin) {
    return false
  } else {
    return true
  }
}
export async function checkAdminNameUniqueForEdit(name, id) {
  const prevAdmin = await prisma.admin.findUnique({ where: { name } })
  if (prevAdmin && prevAdmin.id != id) {
    return false
  } else {
    return true
  }
}
export async function checkAdminUsernameUnique(username) {
  const prevAdmin = await prisma.admin.findUnique({ where: { username } })
  if (prevAdmin) {
    return false
  } else {
    return true
  }
}
export async function checkAdminUsernameUniqueForEdit(username, id) {
  const prevAdmin = await prisma.admin.findUnique({ where: { username } })
  if (prevAdmin && prevAdmin.id != id) {
    return false
  } else {
    return true
  }
}

export async function checkTgIdExistsAndUnique(tgId) {
  const prevAdmin = await prisma.admin.findUnique({
    where: { tgId: BigInt(tgId) }
  })
  const tgUser = await prisma.tgUser.findUnique({
    where: { id: BigInt(tgId) }
  })
  if (prevAdmin || !tgUser) {
    return false
  } else {
    return true
  }
}
export async function checkTgIdExistsAndUniqueForEdit(tgId, id) {
  const prevAdmin = await prisma.admin.findUnique({
    where: { tgId: BigInt(tgId) }
  })
  const tgUser = await prisma.tgUser.findUnique({
    where: { id: BigInt(tgId) }
  })
  if (!tgUser) return false
  if (prevAdmin && prevAdmin.id != id) {
    return false
  } else {
    return true
  }
}

//serviceTypes validations
export async function checkServiceTypeNameUnique(name) {
  const prevServiceType = await prisma.serviceType.findUnique({
    where: { name }
  })
  if (prevServiceType) {
    return false
  } else {
    return true
  }
}
export async function checkServiceTypeNameUniqueForEdit(name) {
  const prevServiceType = await prisma.serviceType.findUnique({
    where: { name }
  })
  if (prevServiceType && prevServiceType.name != name) {
    return false
  } else {
    return true
  }
}
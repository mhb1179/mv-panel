import * as crypto from "crypto";
import prisma from "@/lib/prisma";
import { decodeAndDecryptCode } from "@/lib/encryption";
const secretKey = process.env.SUB_SECRET;
const iv = process.env.SUB_IV;

export async function GET(req, { params: { token } }) {
  //encrypt
  // const cipher = crypto.createCipheriv("aes-128-cbc", secretKey, iv);
  // let id = cipher.update(token, "utf-8", "hex");
  // id += cipher.final("hex");

  try {
    //decrypt
    const id = decodeAndDecryptCode(token);

    const service = await prisma.service.findFirst({ where: { id } });
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

    const configs = servers
      .map((server) => {
        return server.inbounds
          .filter((inbound) => {
            return inbound.active == true;
          })
          .map((inbound) => {
            if (
              inbound.protocol === "vless" ||
              inbound.protocol === "reality"
            ) {
              const firstSplit = inbound.configLink.split("@");
              firstSplit[0] = "vless://" + service.id;
              inbound.configLink = firstSplit.join("@") + "-" + service.name;
            }
            if (inbound.protocol === "vmess") {
              const configData = JSON.parse(
                atob(inbound.configLink.split("//")[1]),
              );
              configData.ps = configData.ps + "-" + service.name;
              configData.id = service.id;
              inbound.configLink =
                "vmess://" + btoa(JSON.stringify(configData, null, " "));
            }
            if (inbound.protocol === "shadowsocks") {
              const firstSplit = inbound.configLink.split("@");
              const dataArray = atob(firstSplit[0].split("//")[1]).split(":");
              dataArray[2] = btoa(service.id);
              inbound.configLink =
                "ss://" +
                btoa(dataArray.join(":")) +
                "@" +
                firstSplit[1] +
                "-" +
                service.name;
            }
            return inbound.configLink;
          })
          .join("\n");
      })
      .join("\n");
    return new Response(btoa(configs));
  } catch (error) {
    console.log(error);
  }
}

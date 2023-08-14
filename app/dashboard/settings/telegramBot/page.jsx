"use client";

import Loading from "@/components/MVui/defaultLoading";
import FormContainer from "@/components/MVui/formContainer";
import { sendTgMessageInSettings } from "@/lib/actions";
import { getServers, getServiceTypes } from "@/lib/getData";
import { DevTool } from "@hookform/devtools";
import { yupResolver } from "@hookform/resolvers/yup";
import { Button, MenuItem, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
const Page = () => {
  const [servers, setServers] = useState();
  const [serviceTypes, setServiceTypes] = useState();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const STres = await getServiceTypes();
      const Sres = await getServers();
      setServers(Sres.list);
      setServiceTypes(STres.list);
      setLoading(false);
    })();
  }, []);
  const schema = yup.object({
    sendToMethod: yup.string().required(),
    serviceType: yup.number(),
    server: yup.number(),
    message: yup.string().required(),
  });
  const form = useForm({
    defaultValues: {
      sendToMethod: "allAdmins",
    },
    resolver: yupResolver(schema),
  });
  const { register, handleSubmit, watch, control } = form;
  async function onSubmit(data) {
    await sendTgMessageInSettings(data)
  }
  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormContainer>
          <TextField
            id="sendToMethod"
            label="ارسال به"
            defaultValue="allAdmins"
            {...register("sendToMethod")}
            select
          >
            <MenuItem value="allUsers">همه کاربران</MenuItem>
            <MenuItem value="allAdmins">همه ادمین ها</MenuItem>
            <MenuItem value="serviceTypeOwners">دارندگان یک نوع سرویس</MenuItem>
            <MenuItem value="serverOwners">دارندگان یک سرور</MenuItem>
            <MenuItem value="oneUser">یک مخاطب</MenuItem>
          </TextField>
          {watch("sendToMethod") === "serviceTypeOwners" ? (
            <>
              {loading ? (
                <Loading />
              ) : (
                <TextField
                  id="serviceType"
                  label="نوع سرویس"
                  defaultValue={serviceTypes[0].id}
                  {...register("serviceType")}
                  select
                >
                  {serviceTypes.map((serviceType, index) => {
                    return (
                      <MenuItem key={index} value={serviceType.id}>
                        {serviceType.name}
                      </MenuItem>
                    );
                  })}
                </TextField>
              )}
            </>
          ) : null}
          {watch("sendToMethod") === "serverOwners" ? (
            <>
              {loading ? (
                <Loading />
              ) : (
                <TextField
                  id="server"
                  label="سرور"
                  defaultValue={servers[0].id}
                  {...register("server", { valueAsNumber: true })}
                  select
                >
                  {servers.map((server, index) => {
                    return (
                      <MenuItem key={index} value={server.id}>
                        {server.name}
                      </MenuItem>
                    );
                  })}
                </TextField>
              )}
            </>
          ) : null}

          {watch("sendToMethod") === "oneUser" ? (
            <TextField
              id="tgId"
              label="آیدی تلگرام"
              type="number"
              {...register("tgId", { valueAsNumber: true })}
            />
          ) : null}

          <TextField
            id="message"
            label="پیام"
            {...register("message")}
            multiline
          />
          <Button size="small" variant="outlined" color="success" type="submit">
            ارسال پیام
          </Button>
        </FormContainer>
      </form>
      <DevTool placement="top-left" control={control} />
    </>
  );
};

export default Page;

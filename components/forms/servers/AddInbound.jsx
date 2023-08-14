"use client";
import {
  TextField,
  Button,
  Collapse,
  FormControlLabel,
  Switch,
  MenuItem,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { DevTool } from "@hookform/devtools";
import { useState } from "react";
import FormContainer from "@/components/MVui/formContainer";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import { addInbound } from "@/lib/actions";
export default function AddInboundForm({ serverId, refreshServerPage }) {
  const [open, setOpen] = useState(false);
  const schema = yup.object({
    serverInboundId: yup.number().required(),
    protocol: yup.string().required("پروتکل الزامی است"),
    flow: yup.string(),
    configLink: yup.string().required("لینک کانفیگ نمونه الزامی است."),
  });

  const form = useForm({
    mode: "onBlur",
    resolver: yupResolver(schema),
  });
  const { register, handleSubmit, formState, control, watch, setValue, reset } =
    form;
  const {
    errors,
    isValid,
    isValidating,
    isSubmitting,
    isSubmitSuccessful,
    isLoading,
  } = formState;
  async function onSubmit(data) {
    const result = await addInbound({ ...data, serverId });
    if (result.success == true) {
      enqueueSnackbar(result.message, { variant: "success" });
      setOpen(false);
      refreshServerPage();
    } else {
      enqueueSnackbar(result.message, { variant: "error" });
    }
  }
  return (
    <>
      <SnackbarProvider
        autoHideDuration={5000}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      />
      <FormContainer>
        <Button
          variant="outlined"
          fullWidth
          color={open ? "error" : "secondary"}
          onClick={() => {
            setOpen((a) => !a);
          }}
        >
          {open ? "بستن فرم" : "افزودن اینباند"}
        </Button>
      </FormContainer>
      <Collapse in={open}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4"
          noValidate
          autoComplete="false"
        >
          <FormContainer>
            <div className="dir-ltr mx-auto flex w-full flex-col gap-3">
              <TextField
                id="serverInboundId"
                label="آیدی اینباند در سرور"
                {...register("serverInboundId")}
                error={errors.serverInboundId && true}
                helperText={errors.serverInboundId?.message}
              />
              <TextField
                id="protocol"
                label="پروتکل"
                {...register("protocol")}
                error={errors.protocol && true}
                helperText={errors.protocol?.message}
                select
              >
                <MenuItem value="vless">vless</MenuItem>
                <MenuItem value="vmess">vmess</MenuItem>
                <MenuItem value="shadowsocks">shadowsocks</MenuItem>
              </TextField>

              <TextField
                id="flow"
                label="جریان (flow)"
                {...register("flow")}
                error={errors.flow && true}
                helperText={errors.flow?.message}
                select
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="xtls-rprx-vision">xtls-rprx-vision</MenuItem>
                <MenuItem value="xtls-rprx-vision-udp443">
                  xtls-rprx-vision-udp443
                </MenuItem>
              </TextField>
              <TextField
                id="configLink"
                label="لینک نمونه"
                {...register("configLink")}
                error={errors.configLink && true}
                helperText={errors.configLink?.message}
                multiline
              />
            </div>
            <Button
              variant="outlined"
              color="success"
              type="submit"
              disabled={isValidating || !isValid || isSubmitting}
            >
              {isSubmitting ? "در حال پردازش" : "افزودن اینباند"}
            </Button>
          </FormContainer>
        </form>
      </Collapse>
      <DevTool control={control} placement="top-left" />
    </>
  );
}

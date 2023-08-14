"use client";
import {
  TextField,
  Button,
  Collapse,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { DevTool } from "@hookform/devtools";
import { useState } from "react";
import FormContainer from "@/components/MVui/formContainer";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import { editInbound } from "@/lib/actions";
export default function EditInboundForm({ refreshServerPage, inbound }) {
  const [open, setOpen] = useState(false);
  const [active , setActive] = useState(inbound.active)
  const schema = yup.object({
    configLink: yup.string().required("لینک کانفیگ نمونه الزامی است."),
  });

  const form = useForm({
    mode: "onBlur",
    resolver: yupResolver(schema),
    defaultValues: {
      configLink: inbound.configLink,
    },
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
    const result = await editInbound({ ...data, id: inbound.id , active });
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
          color={open ? "error" : "info"}
          onClick={() => {
            setOpen((a) => !a);
          }}
        >
          {open ? "بستن فرم" : "ویرایش اینباند"}
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
            <FormControlLabel
              control={
                <Switch
                  checked={active}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setActive(true)
                    } else{
                      setActive(false)
                    }
                  }}
                />
              }
              label="نمایش در لینک اشتراک"
            />
            <div className="dir-ltr mx-auto flex w-full flex-col gap-3">
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
              {isSubmitting ? "در حال پردازش" : "ویرایش اینباند"}
            </Button>
          </FormContainer>
        </form>
      </Collapse>
      <DevTool control={control} placement="top-left" />
    </>
  );
}

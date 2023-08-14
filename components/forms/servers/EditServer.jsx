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
import {
  checkServerNameUniqueForEdit,
} from "@/lib/validations";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import { editServer } from "@/lib/actions";
export default function EditServerForm({ server  , refreshServerPage}) {
  const [open, setOpen] = useState(false);
  const [addable, setAddable] = useState(server.addable);
  const [revivable, setRevivable] = useState(server.revivable);
  const schema = yup.object({
    name: yup
      .string()
      .required("نام الزامی است.")
      .test("name-is-unique", "نام تکراری است.", async (value) => {
        return await checkServerNameUniqueForEdit(value, server.id);
      }),
    address: yup
      .string()
      .required("آدرس الزامی است.")
      .test(
        "starts-with-http",
        "ابتدای آدرس http:// یا https:// قرار دهید.",
        (value) => {
          return value.startsWith("http://") || value.startsWith("https://");
        },
      )
      .test("not-end-with-/", "/ را از انتهای آدرس پاک کنید", (value) => {
        return !value.endsWith("/");
      }),
    provider: yup.string().required("ارائه دهنده الزامی است."),
    passwordToken: yup.string().required("توکن الزامی است."),
    price: yup.number().required("قیمت الزامی است."),
  });

  const form = useForm({
    mode: "onBlur",
    resolver: yupResolver(schema),
    defaultValues: {
      name: server.name,
      address: server.address,
      provider: server.provider,
      passwordToken: server.passwordToken,
      price: server.price,
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
    const result = await editServer({
      ...data,
      id: server.id,
      addable,
      revivable,
    });
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
          {open ? "بستن فرم" : "ویرایش سرور"}
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
            <TextField
              id="name"
              label="نام سرور"
              {...register("name")}
              error={errors.name && true}
              helperText={errors.name?.message}
            />
            <FormControlLabel
              control={<Switch checked={addable} />}
              label="قابل افزودن"
              onChange={(e) => {
                if (e.target.checked) {
                  setAddable(true);
                } else {
                  setAddable(false);
                }
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={revivable}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setRevivable(true);
                    } else {
                      setRevivable(false);
                    }
                  }}
                />
              }
              label="قابل تمدید"
            />
            <div className="dir-ltr mx-auto flex w-full flex-col gap-3">
              <TextField
                id="address"
                label="آدرس پنل با پورت"
                {...register("address")}
                error={errors.address && true}
                helperText={errors.address?.message}
              />
              <TextField
                id="provider"
                label="ارائه دهنده"
                {...register("provider")}
                error={errors.provider && true}
                helperText={errors.provider?.message}
              />

              <TextField
                multiline
                id="passwordToken"
                label="توکن"
                {...register("passwordToken")}
                error={errors.passwordToken && true}
                helperText={errors.passwordToken?.message}
              />
            </div>
            <TextField
              id="price"
              label="قیمت"
              type="number"
              {...register("price", { valueAsNumber: true })}
              error={errors.price && true}
              helperText={errors.price?.message}
            />
            <Button
              variant="outlined"
              color="success"
              type="submit"
              disabled={isValidating || !isValid || isSubmitting}
            >
              {isSubmitting ? "در حال پردازش" : "ویرایش سرور"}
            </Button>
          </FormContainer>
        </form>
      </Collapse>
      <DevTool control={control} placement="top-left" />
    </>
  );
}

"use client";
import {
  TextField,
  Button,
  Collapse,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { DevTool } from "@hookform/devtools";
import { useState } from "react";
import FormContainer from "@/components/MVui/formContainer";
import {
  checkAdminNameUnique,
  checkAdminUsernameUnique,
  checkTgIdExistsAndUnique,
} from "@/lib/validations";
import { addAdmin } from "@/lib/actions";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
export default function AddAdmin({ updateAdminsList }) {
  const [open, setOpen] = useState(false);
  const schema = yup.object({
    name: yup
      .string()
      .required("نام الزامی است.")
      .test("name-is-unique", "نام تکراری است.", async (value) => {
        return await checkAdminNameUnique(value);
      })
      .trim(),
    username: yup
      .string()
      .required("نام کاربری الزامی است.")
      .test("username-is-unique", "نام کاربری تکراری است.", async (value) => {
        return await checkAdminUsernameUnique(value);
      })
      .trim(),
    password: yup.string().required("رمز عبور الزامی است.").trim(),
    tgId: yup
      .number()
      .required("آیدی تلگرام الزامی است.")
      .test("tgId-exists-and-unique", "آیدی تلگرام نامعتبر", async (value) => {
        return await checkTgIdExistsAndUnique(value);
      }),
  });

  const form = useForm({
    mode: "onBlur",
    resolver: yupResolver(schema)
  });
  const { register, handleSubmit, formState, control, watch, setValue, reset } =
    form;
  const { errors, isValid, isValidating, isSubmitting } = formState;
  async function onSubmit(data) {
    const result = await addAdmin(data);
    if (result.success == true) {
      enqueueSnackbar(result.message, { variant: "success" });
      reset();
      setOpen(false);
      updateAdminsList();
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
          {open ? "بستن فرم" : "افزودن ادمین"}
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
              label="نام"
              {...register("name")}
              error={errors.name && true}
              helperText={errors.name?.message}
            />
            <TextField
              id="username"
              label="نام کاربری"
              {...register("username")}
              error={errors.username && true}
              helperText={errors.username?.message}
            />
            <TextField
              id="password"
              label="رمز عبور"
              {...register("password")}
              error={errors.password && true}
              helperText={errors.password?.message}
            />
            <TextField
              id="tgId"
              label="آیدی تلگرام"
              type="number"
              {...register("tgId", { valueAsNumber: true })}
              error={errors.tgId && true}
              helperText={errors.tgId?.message}
            />
            <Button
              variant="outlined"
              color="success"
              type="submit"
              disabled={isValidating || !isValid || isSubmitting}
            >
              {isSubmitting ? "در حال پردازش" : "افزودن ادمین"}
            </Button>
          </FormContainer>
        </form>
      </Collapse>
      <DevTool control={control} placement="top-left" />
    </>
  );
}

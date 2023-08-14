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
  checkAdminNameUniqueForEdit,
  checkAdminUsernameUniqueForEdit,
  checkTgIdExistsAndUniqueForEdit,
} from "@/lib/validations";
import { editAdmin } from "@/lib/actions";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
export default function EditAdminForm({ refreshAdminPage, admin }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(admin.active);
  const schema = yup.object({
    name: yup
      .string()
      .required("نام الزامی است.")
      .test("name-is-unique", "نام تکراری است.", async (value) => {
        return await checkAdminNameUniqueForEdit(value, admin.id);
      })
      .trim(),
    username: yup
      .string()
      .required("نام کاربری الزامی است.")
      .test("username-is-unique", "نام کاربری تکراری است.", async (value) => {
        return await checkAdminUsernameUniqueForEdit(value, admin.id);
      })
      .trim(),
    password: yup.string().required("رمز عبور الزامی است.").trim(),
    tgId: yup
      .number()
      .required("آیدی تلگرام الزامی است.")
      .test("tgId-exists-and-unique", "آیدی تلگرام نامعتبر", async (value) => {
        return await checkTgIdExistsAndUniqueForEdit(value, admin.id);
      }),
      grade: yup.number().required()
  });

  const form = useForm({
    mode: "onBlur",
    resolver: yupResolver(schema),
    defaultValues: {
      name: admin.name,
      username: admin.username,
      password: admin.password,
      tgId: Number(admin.tgId),
      grade: admin.grade
    },
  });
  const { register, handleSubmit, formState, control, watch, setValue, reset } =
    form;
  const { errors, isValid, isValidating, isSubmitting } = formState;
  async function onSubmit(data) {
    const result = await editAdmin({ ...data, id: admin.id, active });
    if (result.success == true) {
      enqueueSnackbar(result.message, { variant: "success" });
      setOpen(false);
      refreshAdminPage();
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
          {open ? "بستن فرم" : "ویرایش ادمین"}
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
              control={<Switch checked={active} />}
              label="فعال"
              onChange={(e) => {
                if (e.target.checked) {
                  setActive(true);
                } else {
                  setActive(false);
                }
              }}
            />
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
              id="grade"
              label="سطح دسترسی"
              type="number"
              {...register("grade", { valueAsNumber: true })}
              error={errors.grade && true}
              helperText={errors.grade?.message}
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
              {isSubmitting ? "در حال پردازش" : "ویرایش ادمین"}
            </Button>
          </FormContainer>
        </form>
      </Collapse>
      <DevTool control={control} placement="top-left" />
    </>
  );
}

"use client";
import { TextField, Button, Collapse } from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { DevTool } from "@hookform/devtools";
import { useState } from "react";
import FormContainer from "@/components/MVui/formContainer";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import { checkServiceTypeNameUnique } from "@/lib/validations";
import { AddServiceType } from "@/lib/actions";
export default function AddServiceTypes({ updateServiceTypesList }) {
  const [open, setOpen] = useState(false);
  const schema = yup.object({
    name: yup
      .string()
      .required("نام الزامی است.")
      .test("name-is-unique", "نام تکراری است.", async (value) => {
        return await checkServiceTypeNameUnique(value);
      })
      .trim(),
      userLimit: yup.number().required("تعیین تعداد کاربر الزامی است."),
      days: yup.number().required("مدت زمان اعتبار الزامی است."),
      initial_price: yup.number().required("قیمت اولیه الزامی است."),
      initial_GB: yup.number().required("حجم اولیه الزامی است."),
      max_extra_GB: yup.number().required("ماکسیسمم حجم اضافی الزامی است."),
      extra_GB_price: yup.number().required("قیمت حجم اضافی الزامی است."),
  });

  const form = useForm({
    mode: "onBlur",
    resolver: yupResolver(schema),
  });
  const { register, handleSubmit, formState, control, watch, setValue, reset } =
    form;
  const { errors, isValid, isValidating, isSubmitting } = formState;
  async function onSubmit(data) {
    const result = await AddServiceType(data)
    if (result.success == true) {
      enqueueSnackbar(result.message, { variant: "success" });
      reset();
      setOpen(false);
      updateServiceTypesList();
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
          {open ? "بستن فرم" : "افزودن نوع سرویس"}
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
              id="userLimit"
              label="تعداد کاربر"
              type="number"
              {...register("userLimit", { valueAsNumber: true })}
              error={errors.userLimit && true}
              helperText={errors.userLimit?.message}
            />
            <TextField
              id="days"
              label="مدت زمان اعتبار (روز)"
              type="number"
              {...register("days", { valueAsNumber: true })}
              error={errors.days && true}
              helperText={errors.days?.message}
            />
            <TextField
              id="initial_price"
              label="قیمت اولیه"
              type="number"
              {...register("initial_price", { valueAsNumber: true })}
              error={errors.initial_price && true}
              helperText={errors.initial_price?.message}
            />
            <TextField
              id="initial_GB"
              label="حجم اولیه گیگابایت"
              type="number"
              {...register("initial_GB", { valueAsNumber: true })}
              error={errors.initial_GB && true}
              helperText={errors.initial_GB?.message}
            />
            <TextField
              id="max_extra_GB"
              label="ماکسیسمم حجم اضافی"
              type="number"
              {...register("max_extra_GB", { valueAsNumber: true })}
              error={errors.max_extra_GB && true}
              helperText={errors.max_extra_GB?.message}
            />
            <TextField
              id="extra_GB_price"
              label="قیمت هر گیگ اضافی"
              type="number"
              {...register("extra_GB_price", { valueAsNumber: true })}
              error={errors.extra_GB_price && true}
              helperText={errors.extra_GB_price?.message}
            />

            <Button
              variant="outlined"
              color="success"
              type="submit"
              disabled={isValidating || !isValid || isSubmitting}
            >
              {isSubmitting ? "در حال پردازش" : "افزودن نوع سرویس"}
            </Button>
          </FormContainer>
        </form>
      </Collapse>
      <DevTool control={control} placement="top-left" />
    </>
  );
}

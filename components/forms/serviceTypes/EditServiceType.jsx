"use client";
import {
  TextField,
  Button,
  Collapse,
  FormControlLabel,
  Switch,
  Checkbox,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { DevTool } from "@hookform/devtools";
import { useState } from "react";
import FormContainer from "@/components/MVui/formContainer";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import { checkServiceTypeNameUniqueForEdit } from "@/lib/validations";
import { editServiceType } from "@/lib/actions";
export default function EditServiceTypeForm({
  serviceType,
  selectedServers,
  refreshServiceTypePage,
  servers,
}) {
  const [open, setOpen] = useState(false);
  const [editedSelectedServers, setEditedSelectedServers] =
    useState(selectedServers);
  const [addable, setAddable] = useState(serviceType.addable);
  const [revivable, setRevivable] = useState(serviceType.revivable);
  const schema = yup.object({
    name: yup
      .string()
      .required("نام الزامی است.")
      .test("name-is-unique", "نام تکراری است.", async (value) => {
        return await checkServiceTypeNameUniqueForEdit(value);
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
    defaultValues: {
      name: serviceType.name,
      userLimit: serviceType.userLimit,
      days: serviceType.days,
      initial_price: serviceType.initial_price,
      max_extra_GB: serviceType.max_extra_GB,
      extra_GB_price: serviceType.extra_GB_price,
      initial_GB: serviceType.initial_GB,
    },
  });
  const { register, handleSubmit, formState, control, watch, setValue, reset } =
    form;
  const { errors, isValid, isValidating, isSubmitting } = formState;
  async function onSubmit(data) {
    const result = await editServiceType({
      ...data,
      id: serviceType.id,
      editedSelectedServers,
      addable,
      revivable
    });
    if (result.success == true) {
      enqueueSnackbar(result.message, { variant: "success" });
      setOpen(false);
      refreshServiceTypePage();
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
          {open ? "بستن فرم" : "ویرایش نوع سرویس"}
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
            {servers.map((server) => {
              return (
                <FormControlLabel
                  key={server.id}
                  label={server.name}
                  control={
                    <Checkbox
                      checked={
                        editedSelectedServers !== [] &&
                        editedSelectedServers.find((editedSelectedServer) => {
                          return editedSelectedServer.id == server.id;
                        })
                          ? true
                          : false
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEditedSelectedServers((a) => {
                            return [...a, server];
                          });
                        } else {
                          setEditedSelectedServers((prev) => {
                            return prev.filter((b) => {
                              return b.id != server.id;
                            });
                          });
                        }
                      }}
                    />
                  }
                />
              );
            })}
            <TextField
              id="name"
              label="نام"
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
              disabled={isValidating || isSubmitting}
            >
              {isSubmitting ? "در حال پردازش" : "ویرایش نوع سرویس"}
            </Button>
          </FormContainer>
        </form>
      </Collapse>
      <DevTool control={control} placement="top-left" />
    </>
  );
}

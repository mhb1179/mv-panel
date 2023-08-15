"use client";
import { useEffect,  useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { DevTool } from "@hookform/devtools";
import * as yup from "yup";
import * as uuid from "uuid";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { yellow } from "@mui/material/colors";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import {
  Button,
  Card,
  Checkbox,
  Divider,
  FormControlLabel,
  TextField,
} from "@mui/material";
import Loading from "../../MVui/defaultLoading";
import { addService } from "@/lib/actions";
import { getServiceTypeById } from "@/lib/getData";
import {
  checkServiceIdUnique,
  checkServiceNameUnique,
} from "@/lib/validations";

function AddServiceForm({ serviceTypeId }) {
  const session = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [serviceType, setServiceType] = useState();
  const [selectedServers, setSelectedServers] = useState([]);
  const schema = yup.object({
    name: yup
      .string()
      .required("نام الزامی است.")
      .matches(/^[a-zA-Z0-9_.-]*$/, "فقط حروف و اعداد انگلیسی مجاز است.")
      .test("name-is-unique", "نام تکراری است.", async (value) => {
        return await checkServiceNameUnique(value);
      }),
    id: yup
      .string()
      .required("آیدی الزامی است.")
      .test("uuid-is-valide", "آیدی نامعتبر است.", (value) => {
        return uuid.validate(value);
      })
      .test("uuid-is-unique", "آیدی تکراری است.", async (value) => {
        return await checkServiceIdUnique(value);
      }),
    extraTraffic: yup
      .number()
      .max(
        serviceType?.max_extra_GB,
        `حجم اضافی نمیتواند بیشتر از ${serviceType?.max_extra_GB} گیگ باشد.`,
      )
      .min(0, "عدد نامعتبر")
      .required(),
    selectedServers: yup
      .array()
      .test("selectedServers", "انتخاب حداقل یک سرور الزامی است.", (value) => {
        if (value.length === 0) return false;
        return true;
      }),
    explanation: yup
      .string()
      .test("explanation lenght", "توضیحات طولانی است", (value) => {
        if (value?.length > 200) return false;
        return true;
      }),
  });
  const form = useForm({
    mode: "onSubmit",
    resolver: yupResolver(schema),
    defaultValues: {
      extraTraffic: 0,
      id: uuid.v4(),
      selectedServers: [],
    },
  });
  const { register, handleSubmit, formState, control, watch, setValue } = form;
  const {
    errors,
    isValid,
    isValidating,
    isSubmitting,
    isSubmitted,
    isSubmitSuccessful,
    isLoading,
  } = formState;
  useEffect(() => {
    (async () => {
      setServiceType(await getServiceTypeById(serviceTypeId));
      setSelectedServers([]);
      setLoading(false);
    })();
  }, [serviceTypeId]);

  useEffect(() => {
    if (!watch("extraTraffic")) {
      setValue("extraTraffic", 0);
    }
  }, [watch("extraTraffic")]);

  async function onSubmit(data) {
    enqueueSnackbar("در حال پردازش", { variant: "warning" });
    data.serviceTypeId = serviceTypeId;
    data.selectedServerIds = selectedServers.map((server) => server.id);
    data.adminId = session.data.user.id;
    try {
      const result = await JSON.parse(await addService(data));
      if (result.success == true) {
        enqueueSnackbar(result.message, { variant: "success" });
        router.push("/dashboard/services");
      } else {
        enqueueSnackbar(result.message, { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar(error.toString(), { variant: "error" });
    }
  }
  if (loading) return <Loading />;
  return (
    <>
      <SnackbarProvider
        maxSnack={2}
        // dense
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        className="my-auto"
      />
      <div>
        <span className="text-lime-400">حجم اولیه:</span>
        <span className="mx-1 text-yellow-400">{serviceType.initial_GB}GB</span>
      </div>
      <div>
        <span className="text-lime-400">مدت زمان:</span>
        <span className="mx-1 text-yellow-400">{serviceType.days} روز</span>
      </div>
      <Divider />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-3"
      >
        <Card variant="outlined" sx={{ background: "#0f172a" }}>
          <span className="flex justify-center p-3 text-lg font-bold">
            انتخاب سرور
          </span>
          <Divider />
          <div className="flex flex-col">
            <div className="flex flex-col">
              {serviceType.servers.map((server) => {
                return (
                  <FormControlLabel
                    key={server.name}
                    label={server.name}
                    control={
                      <Checkbox
                        {...register("selectedServers")}
                        sx={{
                          color: yellow[400],
                          "&.Mui-checked": {
                            color: yellow[500],
                          },
                        }}
                        disabled={isSubmitting}
                        checked={
                          selectedServers.find((selectedServer) => {
                            return selectedServer.id == server.id;
                          })
                            ? true
                            : false
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedServers((prev) => {
                              setValue("selectedServers", [...prev, server]);
                              return [...prev, server];
                            });
                          } else {
                            setSelectedServers((prev) => {
                              const newSelectedServers = [];
                              prev.forEach((selectServer) => {
                                if (selectServer.id == server.id) return;
                                newSelectedServers.push(selectServer);
                              });
                              setValue("selectedServers", newSelectedServers);
                              return newSelectedServers;
                            });
                          }
                        }}
                      />
                    }
                  />
                );
              })}
            </div>
            {errors.selectedServers ? (
              <span className="p-2 text-center text-red-600">
                {errors.selectedServers?.message}
              </span>
            ) : null}
          </div>
        </Card>
        <TextField
          id="name"
          type="text"
          label="نام سرویس"
          fullWidth
          disabled={isSubmitting}
          {...register("name")}
          error={errors.name && true}
          helperText={errors.name?.message}
        />
        <div className={session.data.user.grade == 1 ? null : "hidden"}>
          <TextField
            id="id"
            type="text"
            label="ID"
            fullWidth
            disabled={isSubmitting}
            {...register("id")}
            error={errors.id && true}
            helperText={errors.id?.message}
          />
        </div>
        <TextField
          id="extraTraffic"
          type="number"
          label="حجم اضافی"
          fullWidth
          disabled={isSubmitting}
          {...register("extraTraffic", { valueAsNumber: true })}
          error={errors.extraTraffic && true}
          helperText={errors.extraTraffic?.message}
        />
        <TextField
          id="explanation"
          type="text"
          label="توضیحات"
          fullWidth
          disabled={isSubmitting}
          {...register("explanation")}
          multiline
          error={errors.explanation && true}
          helperText={errors.explanation?.message}
        />
        <p>
          <span className="text-red-600">هزینه نهایی:</span>{" "}
          {selectedServers.length == 0 ? (
            <span className="text-yellow-400">ابتدا سرور را انتخاب کنید</span>
          ) : (
            <span className="text-yellow-400">
              {serviceType.initial_price +
                serviceType.extra_GB_price * watch("extraTraffic") +
                selectedServers.reduce((a, b) => {
                  return a + b.price;
                }, 0)}{" "}
              تومان
            </span>
          )}
        </p>
        <Button
          variant="outlined"
          color="success"
          type="submit"
          fullWidth
          disabled={isValidating || isSubmitting || isLoading}
        >
          {isSubmitting || isLoading ? "در حال پردازش" : "افزودن سرویس"}
        </Button>
      </form>
      <DevTool control={control} placement="top-left" />
    </>
  );
}

export default AddServiceForm;

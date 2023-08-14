"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Loading from "@/components/MVui/defaultLoading";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import TelegramIcon from "@mui/icons-material/Telegram";
import QrCodeIcon from "@mui/icons-material/QrCode";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";
import LoopIcon from "@mui/icons-material/Loop";
import { useEffect,  useState } from "react";
import Title from "@/components/MVui/title";
import { getServiceByName } from "@/lib/getData";
import Error404 from "@/components/MVui/Error404";
import { Card, Chip, Divider, IconButton, Tooltip } from "@mui/material";
import SubQRCode from "@/components/sub/SubQrCode";
import ReviveServiceConfirmation from "@/components/confirmations/ReviveServiceConfirmation";
import ResetServiceIdConfirmation from "@/components/confirmations/ResetServiceIdConfirmation";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import TgBotSub from "@/components/sub/TgBotSub";
function page({ params: { serviceName } }) {
  const router = useRouter();
  const session = useSession();
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState();
  const [usage, setUsage] = useState();
  const [lastUsageCheckTime, setLastUsageCheckTime] = useState();
  const [QRCodeDialogOpen, setQRCodeDialogOpen] = useState(false);
  const [reviveConfirmationOpen, setRiviveConfirmationOpen] = useState(false);
  const [tgBotOpen, setTgBotOpen] = useState(false);
  const [
    resetServiceIdConfirmationOpen,
    setResetServiceIdConfirmationConfirmationOpen,
  ] = useState(false);
  const [reRunUseEffect, setReRunUseEffect] = useState(true);
  useEffect(() => {
    (async () => {
      let getService = await getServiceByName(serviceName);
      if (!getService.success) {
        setService(null);
        return setLoading(false);
      }
      setService(getService.service);
      setUsage(getService.eachServerUsage);
      setLastUsageCheckTime(getService.lastUsageCheckTime);
      setLoading(false);
    })();
  }, [session.status, reRunUseEffect]);
  function RunUseEffect() {
    setReRunUseEffect((a) => !a);
  }
  function sendSnackBar(message, variant) {
    enqueueSnackbar(message, { variant });
  }
  useEffect(() => {
    if (session.data && service?.admin) {
      if (
        session.data?.user.grade > 1 &&
        session.data?.user?.name != service?.admin.name
      ) {
        router.replace(
          "/dashboard/accessDenied?message=" + `این سرویس تحت پوشش شما نیست`,
        );
      }
    }
  }, [loading, session.data]);
  if (loading) return <Loading />;
  if (!service)
    return (
      <Error404
        backTo={{ path: "/dashboard/services", label: "بازگشت به سرویس ها" }}
      >
        سرویسی با این نام یافت نشد.
      </Error404>
    );
  if (
    session.data?.user.grade > 1 &&
    session.data?.user?.name != service?.admin.name
  ) {
    return <></>;
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
      <Title
        backTo={{ label: "بازگشت به سرویس ها", path: "/dashboard/services" }}
      >
        سرویس:{" "}
        <span className={service.active ? "text-green-500" : "text-red-500"}>
          {service.name}
        </span>
      </Title>
      <Card
        variant="outlined"
        sx={{
          marginBottom: "10px",
          background: "#0f172a",
        }}
      >
        <div className=" flex h-full flex-row justify-around rounded-md p-1 ">
          <Tooltip arrow title="اشتراک با ربات">
            <IconButton
              color="info"
              onClick={() => {
                setTgBotOpen((a) => !a);
              }}
            >
              <TelegramIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="لینک اشتراک" arrow>
            <IconButton
              color="success"
              onClick={() => {
                setQRCodeDialogOpen((a) => !a);
              }}
            >
              <QrCodeIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="تمدید سرویس" arrow>
            <IconButton
              color="warning"
              onClick={() => {
                setRiviveConfirmationOpen((a) => !a);
              }}
            >
              <LoopIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="تغییر ID" arrow>
            <IconButton
              color="error"
              onClick={() =>
                setResetServiceIdConfirmationConfirmationOpen((a) => !a)
              }
            >
              <SwitchAccountIcon />
            </IconButton>
          </Tooltip>
        </div>
      </Card>
      <div className="flex flex-col justify-between  md:flex-row ">
        <div className="w-full sm:w-1/2">
          <ul className="flex flex-col gap-2">
            <li>
              آخرین بروزرسانی:{" "}
              <Chip
                size="small"
                variant="outlined"
                label={
                  <div className="dir-ltr">
                    {new Intl.DateTimeFormat("fa-IR", {
                      dateStyle: "short",
                      timeStyle: "medium",
                      hourCycle: "h23",
                      timeZone: "Asia/Tehran",
                    }).format(lastUsageCheckTime)}
                  </div>
                }
              />
            </li>
            <li>
              وضعیت:{" "}
              {service.active ? (
                <span className="text-green-500">
                  فعال
                  <CheckCircleIcon />
                </span>
              ) : (
                <span className="text-red-500">
                  غیرفعال
                  <HighlightOffIcon />
                </span>
              )}{" "}
            </li>
            <li>ادمین سازنده: {service.admin.name} </li>
            <li>
              نوع سرویس:{" "}
              <span className="text-yellow-300">
                {" "}
                {service.serviceType.name}
              </span>
            </li>
            <li>
              ID: <Chip size="small" variant="outlined" label={service.id} />
            </li>
            <li>
              مصرف:{" "}
              <Chip
                size="small"
                variant="outlined"
                color="info"
                label={service.totalUsage + " / " + service.total + "GB"}
              />
            </li>
            <li>
              تاریخ ایجاد:{" "}
                <Chip
                  variant="outlined"
                  color="success"
                  size="small"
                  label={
                    <div className="dir-ltr">
                      {new Intl.DateTimeFormat("fa-IR", {
                        dateStyle: "short",
                        timeStyle: "medium",
                        hourCycle: "h23",
                        timeZone: "Asia/Tehran",
                      }).format(service.createdAt)}
                    </div>
                  }
                />
            </li>
            {service.lastRevivedAt ? <li>
              تاریخ آخرین تمدید:{" "}
                <Chip
                  variant="outlined"
                  color="warning"
                  size="small"
                  label={
                    <div className="dir-ltr">
                      {new Intl.DateTimeFormat("fa-IR", {
                        dateStyle: "short",
                        timeStyle: "medium",
                        hourCycle: "h23",
                        timeZone: "Asia/Tehran",
                      }).format(service.lastRevivedAt)}
                    </div>
                  }
                />
            </li> : null}
            <li>
              تاریخ انقضا:{" "}
                <Chip
                  variant="outlined"
                  color="warning"
                  size="small"
                  label={
                    <div className="dir-ltr">
                      {new Intl.DateTimeFormat("fa-IR", {
                        dateStyle: "short",
                        timeStyle: "medium",
                        hourCycle: "h23",
                        timeZone: "Asia/Tehran",
                      }).format(service.expirationDate)}
                    </div>
                  }
                />
            </li>
            <li>
              ثبت شده در ربات:{" "}
              {service.tgId ? (
                <span className="text-green-500">
                  <CheckCircleIcon />
                </span>
              ) : (
                <span className="text-red-500">
                  <HighlightOffIcon />
                </span>
              )}{" "}
            </li>
            {service.explanation ? (
              <li>
                <h1>توضیحات:</h1>{" "}
                <span className="text-yellow-300">{service.explanation}</span>
              </li>
            ) : null}
          </ul>
        </div>

        <div className="mt-4 flex w-full flex-col flex-wrap items-center justify-around gap-2 sm:mt-0 sm:w-1/2 sm:flex-row">
          {usage.map((server) => {
            return (
              <div
                key={server.name}
                className="flex w-4/5 flex-col rounded-lg border border-white p-3 sm:w-52"
              >
                <ul className="flex flex-col justify-between gap-2">
                  <span className="text-lg font-bold">{server.name}</span>
                  <Divider sx={{ marginY: "5px" }} />

                  <li>
                    دانلود:{" "}
                    <Chip
                      size="small"
                      variant="outlined"
                      color="success"
                      label={server.down}
                    />
                  </li>
                  <li>
                    آپلود:{" "}
                    <Chip
                      size="small"
                      variant="outlined"
                      color="warning"
                      label={server.up}
                    />
                  </li>
                  <li>
                    مجموع:{" "}
                    <Chip
                      size="small"
                      variant="outlined"
                      color="info"
                      label={server.totalUsage}
                    />
                  </li>
                </ul>
              </div>
            );
          })}
        </div>
      </div>
      {tgBotOpen ? (
        <TgBotSub
          service={service}
          dialogOpen={tgBotOpen}
          sendSnackBar={sendSnackBar}
          toggleDialog={() => setTgBotOpen((a) => !a)}
        />
      ) : null}
      {QRCodeDialogOpen ? (
        <SubQRCode
          serviceId={service.id}
          dialogOpen={QRCodeDialogOpen}
          sendSnackBar={sendSnackBar}
          toggleDialog={() => setQRCodeDialogOpen((a) => !a)}
        />
      ) : null}
      {reviveConfirmationOpen ? (
        <ReviveServiceConfirmation
          service={service}
          dialogOpen={reviveConfirmationOpen}
          sendSnackBar={sendSnackBar}
          toggleDialog={() => setRiviveConfirmationOpen((a) => !a)}
          RunUseEffect={RunUseEffect}
          session={session}
        />
      ) : null}
      {resetServiceIdConfirmationOpen ? (
        <ResetServiceIdConfirmation
          service={service}
          dialogOpen={resetServiceIdConfirmationOpen}
          sendSnackBar={sendSnackBar}
          toggleDialog={() =>
            setResetServiceIdConfirmationConfirmationOpen((a) => !a)
          }
          RunUseEffect={RunUseEffect}
          session={session}
        />
      ) : null}
    </>
  );
}

export default page;

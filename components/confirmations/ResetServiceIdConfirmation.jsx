"use client";
import { resetServiceId } from "@/lib/actions";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
} from "@mui/material";
import { useState } from "react";
function ResetServiceIdConfirmation({
  service,
  dialogOpen,
  toggleDialog,
  sendSnackBar,
  RunUseEffect,
  session
}) {
  const [proccessing, setProccessing] = useState();
  async function confirmReset() {
    setProccessing(true);
    sendSnackBar("در حال پردازش ...", "warning");
    const result = await resetServiceId(service.name , session.data.user.id);
    if (result.success) {
      sendSnackBar(result.message, "success");
    } else {
      sendSnackBar(result.message, "error");
    }
    RunUseEffect()
    setProccessing(false);
    toggleDialog();
  }
  return (
    <>
      <Dialog
        open={dialogOpen}
        onClose={() => {
          if (proccessing) {
            return;
          }
          toggleDialog();
        }}
      >
        <DialogTitle>
          تغییر ID سرویس: <span className="text-yellow-500">{service.name}</span>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {proccessing ? (
            <p className="text-justify">در حال پردازش، لطفا صبر کنید ...</p>
          ) : (
            <p className="text-justify">
              با تغییر ID، لینک اشتراک و تمامی کانفیگ های قبلی این سرویس از کار می افتد، سپس لینک اشتراک جدید و کانفیگ های جدید برای این سرویس ایجاد می شود. در صورت تمایل گزینه تایید
              را انتخاب کنید.
            </p>
          )}
        </DialogContent>
        <DialogActions>
          <div className="flex gap-2">
            <Button
              disabled={proccessing}
              variant="outlined"
              color="error"
              onClick={toggleDialog}
            >
              لغو
            </Button>
            <Button
              disabled={proccessing}
              variant="outlined"
              color="success"
              onClick={confirmReset}
            >
              تایید
            </Button>
          </div>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ResetServiceIdConfirmation;

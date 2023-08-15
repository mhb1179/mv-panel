"use client";
import { reviveServiceById } from "@/lib/actions";
import {getServicePrice} from "@/lib/getData"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
} from "@mui/material";
import { useEffect, useState } from "react";
import Loading from "../MVui/defaultLoading";
export default function ReviveServiceConfirmation({
  service,
  dialogOpen,
  toggleDialog,
  sendSnackBar,
  RunUseEffect,
  session,
}) {
  const [proccessing, setProccessing] = useState();
  const [price, setPrice] = useState();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      setPrice(await getServicePrice(service.id))
      setLoading(false)
    })();
  }, []);
  async function confirmRivive() {
    setProccessing(true);
    sendSnackBar("در حال پردازش ...", "warning");
    const result = await reviveServiceById(service.id, session.data.user.id);
    if (result.success) {
      sendSnackBar(result.message, "success");
    } else {
      sendSnackBar(result.message, "error");
    }
    RunUseEffect();
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
          تمدید سرویس: <span className="text-yellow-500">{service.name}</span>
        </DialogTitle>
        <Divider />
        <DialogContent>
          {proccessing ? (
            <p className="text-justify">در حال پردازش، لطفا صبر کنید ...</p>
          ) : (
            <>
              <p className="text-justify">
                با انجام فرایند تمدید، حجم مصرفی صفر شده، تاریخ انقضا از هم
                اکنون محاسبه و یک صورتحساب جدید ایجاد می شود. در صورت تمایل
                گزینه تایید را انتخاب کنید.
              </p><br/>
              {loading ? (
                <Loading />
              ) : (
                <p className="text-center">
                  هزینه تمدید: <span className="text-red-500">{price} تومان</span>
                </p>
              )}
            </>
          )}
        </DialogContent>
        {loading ? null : (
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
                onClick={confirmRivive}
              >
                تایید
              </Button>
            </div>
          </DialogActions>
        )}
      </Dialog>
    </>
  );
}

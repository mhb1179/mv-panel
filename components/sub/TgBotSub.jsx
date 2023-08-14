"use client";
import { Button, Dialog, DialogContent, Divider } from "@mui/material";
import { useEffect, useState } from "react";

import Loading from "@/components/MVui/defaultLoading";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { getBotSubLink, sendBotSubLink } from "@/lib/actions";
export default function TgBotSub({
  service,
  toggleDialog,
  dialogOpen,
  sendSnackBar,
}) {
  const [botSubLink, setBotSubLink] = useState();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      setBotSubLink(await getBotSubLink(service.id));
      setLoading(false);
    })();
  }, []);
  async function sendSub(){
    await sendBotSubLink(service)
  }
  return (
    <>
      <Dialog open={dialogOpen} onClose={toggleDialog}>
        <DialogContent>
          {loading ? (
            <Loading />
          ) : (
            <div className="flex flex-col items-center justify-center gap-5">
              <span className="text-justify">
                برای دریافت لینک ثبت سرویس توسط ربات گزینه زیر را انتخاب کنید.
              </span>
              <Button size="large" variant="outlined" onClick={()=>{
                sendSub()
                toggleDialog()
              }}>
                دریافت لینک از ربات
              </Button>
              <Divider />
              <span>یا با انتخاب گزینه زیر لینک ثبت سرویس را کپی کنید.</span>
              <CopyToClipboard
                text={botSubLink}
                onCopy={() => sendSnackBar("لینک ربات کپی شد.", "success")}
              >
                <Button size="large" variant="outlined" color="success">
                  کپی کردن لینک ربات
                </Button>
              </CopyToClipboard>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

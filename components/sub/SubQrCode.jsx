"use client";
import QRCode from "react-qr-code";
import { Button, Card, Dialog, DialogContent } from "@mui/material";
import { useEffect, useState } from "react";

import Loading from "@/components/MVui/defaultLoading";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { getSubLink } from "@/lib/actions";
export default function SubQRCode({ serviceId, toggleDialog, dialogOpen , sendSnackBar }) {
  const [subLink, setSubLink] = useState();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      setSubLink(await getSubLink(serviceId));
      setLoading(false);
    })();
  }, []);
  // if (loading) return <Loading />;
  return (
    <>
      <Dialog open={dialogOpen} onClose={toggleDialog}>
        <DialogContent>
          {loading ? (
            <Loading />
          ) : (
            <>
              <CopyToClipboard
                text={subLink}
                onCopy={() =>
                  sendSnackBar("لینک اشتراک کپی شد." , "success")
                }
              >
                <Card
                  variant="outlined"
                  sx={{ background: "white", padding: "5px" }}
                >
                  <QRCode
                    size={256}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    value={subLink}
                    viewBox={`0 0 256 256`}
                  />
                </Card>
              </CopyToClipboard>
              <div className="mt-1 text-center text-xs">
                برای کپی کردن لینک اشتراک روی تصویر ضربه بزنید.
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

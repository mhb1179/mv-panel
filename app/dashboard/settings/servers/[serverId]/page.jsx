"use client";
import Loading from "@/components/MVui/defaultLoading";
import Title from "@/components/MVui/title";
import { getServerById } from "@/lib/getData";
import { Card, Chip } from "@mui/material";
import { useEffect, useState } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import EditServerForm from "@/components/forms/servers/EditServer";
import AddInboundForm from "@/components/forms/servers/AddInbound";
import EditInboundForm from "@/components/forms/servers/EditInbound";
function Server({ params: { serverId } }) {
  const [loading, setLoading] = useState(true);
  const [server, setServer] = useState();
  const [runUseEffect, setRunUseEffect] = useState(true);
  useEffect(() => {
    (async () => {
      setServer(await getServerById(Number(serverId)));
      setLoading(false);
    })();
  }, [runUseEffect]);
  function refreshServerPage() {
    setRunUseEffect((a) => !a);
  }
  if (loading) return <Loading />;
  if (!server) return <span>سرور مورد نظر یافت نشد</span>;
  return (
    <>
      <Title
        backTo={{
          label: "بازگشت به سرورها",
          path: "/dashboard/settings/servers",
        }}
      >
        سرور: <span className="text-green-500"> {server.name}</span>
      </Title>
      <div className="flex flex-col gap-2">
        <ul className="mb-2 flex flex-col gap-1">
          <li>
            آدرس:{" "}
            <Chip
              color="info"
              variant="outlined"
              size="small"
              label={server.address}
            />
          </li>
          <li>
            {" "}
            قیمت:{" "}
            <Chip
              color="secondary"
              variant="outlined"
              size="small"
              label={server.price + " تومان"}
            />
          </li>

          <li>
            {" "}
            ارائه دهنده:{" "}
            <span className="text-yellow-500">{server.provider}</span>
          </li>
          <li>
            قابل افزودن:{" "}
            {server.addable ? (
              <CheckCircleIcon color="success" />
            ) : (
              <HighlightOffIcon color="error" />
            )}
          </li>
          <li>
            قابل تمدید:{" "}
            {server.revivable ? (
              <CheckCircleIcon color="success" />
            ) : (
              <HighlightOffIcon color="error" />
            )}
          </li>
          <li>
            توکن: {"\n"}
            <div className="dir-ltr break-words text-left text-xs text-indigo-300">
              {" "}
              {server.passwordToken}
            </div>
          </li>
        </ul>
        <EditServerForm server={server} refreshServerPage={refreshServerPage} />
        <div className="flex flex-col gap-2">
          <Title>اینباندها</Title>
          {server.inbounds.map((inbound) => {
            return (
              <>
                <Card
                  variant="outlined"
                  sx={{ background: "#0f172a", padding: "10px" }}
                >
                  <ul className="mb-2 flex flex-col gap-1">
                    <li>
                      نمایش در لینک اشتراک:
                      {inbound.active ? (
                        <CheckCircleIcon color="success" />
                      ) : (
                        <HighlightOffIcon color="error" />
                      )}
                    </li>
                    <li>
                      آیدی اینباند در سرور:{" "}
                      <span className="text-violet-300">
                        {inbound.serverInboundId}
                      </span>
                    </li>
                    <li>
                      پروتکل:{" "}
                      <span className="text-green-500">{inbound.protocol}</span>
                    </li>
                    {inbound.flow ? (
                      <li>
                        جریان(flow) :{" "}
                        <span className="text-yellow-500">{inbound.flow}</span>
                      </li>
                    ) : null}
                    <li>
                      لینک نمونه:
                      <div className="dir-ltr break-words text-left text-xs text-indigo-300">
                        {" "}
                        {inbound.configLink}
                      </div>
                    </li>
                  </ul>
                  <EditInboundForm
                    inbound={inbound}
                    refreshServerPage={refreshServerPage}
                  />
                </Card>
              </>
            );
          })}
          <AddInboundForm
            serverId={server.id}
            refreshServerPage={refreshServerPage}
          />
        </div>
      </div>
    </>
  );
}

export default Server;

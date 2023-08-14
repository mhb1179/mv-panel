"use client";
import { useEffect, useState } from "react";

import Loading from "@/components/MVui/defaultLoading";
import { getServers } from "@/lib/getData";
import ServersTable from "@/components/tables/ServersTable";
import AddServer from "@/components/forms/servers/AddServer";
export default function Servers() {
  const [loading, setLoading] = useState(true);
  const [servers, setServers] = useState();
  const [runUseEffect, setRunUseEffect] = useState(true);
  useEffect(() => {
    (async () => {
      setServers(await getServers());
      setLoading(false);
    })();
  }, [runUseEffect]);
  function updateServersList() {
    setRunUseEffect((a) => !a);
  }
  if (loading) return <Loading />;
  return (
    <>
      <ServersTable servers={servers.list} />
      <div className="my-4"></div>
      <AddServer updateServersList={updateServersList} />
    </>
  );
}

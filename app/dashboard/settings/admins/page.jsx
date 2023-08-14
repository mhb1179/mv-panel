"use client";
import { useEffect, useState } from "react";
import Loading from "@/components/MVui/defaultLoading";
import AdminsTable from "@/components/tables/AdminsTable";
import AddAdmin from "@/components/forms/admins/AddAdmin";
import { getAdmins } from "@/lib/actions";
export default function Admins() {
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState();
  const [runUseEffect, setRunUseEffect] = useState(true);
  useEffect(() => {
    (async () => {
      setAdmins(await getAdmins());
      setLoading(false);
    })();
  }, [runUseEffect]);
  function updateAdminsList() {
    setRunUseEffect((a) => !a);
  }
  if (loading) return <Loading />;
  return (
    <>
      <AdminsTable admins={admins.list} />
      <div className="my-4"></div>
      <AddAdmin updateAdminsList={updateAdminsList} />
    </>
  );
}

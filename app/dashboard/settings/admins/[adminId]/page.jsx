"use client";

import Loading from "@/components/MVui/defaultLoading";
import Title from "@/components/MVui/title";
import { getAdminById } from "@/lib/actions";
import { useEffect, useState } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import EditAdminForm from "@/components/forms/admins/EditAdmin";
export default function AdminPage({ params: { adminId } }) {
  const [loading, setLoading] = useState();
  const [admin, setAdmin] = useState();
  const [runUseEffect, setRunUseEffect] = useState(true);

  useEffect(() => {
    (async () => {
      setAdmin(await getAdminById(Number(adminId)));
      setLoading(false);
    })();
  }, [runUseEffect]);
  function refreshAdminPage() {
    setRunUseEffect((a) => !a);
  }
  if (loading) return <Loading />;
  if (!admin) return <span>ادمین مورد نظر یافت نشد</span>;
  return (
    <>
      <Title
        backTo={{
          label: "بازگشت به ادمین ها",
          path: "/dashboard/settings/admins",
        }}
      >
        ادمین: <span className="text-green-500"> {admin.name}</span>
      </Title>
      <div className="flex flex-col gap-2">
        <ul className="mb-2 flex flex-col gap-1">
          <li>
            وضعیت:{" "}
            {admin.active ? (
              <CheckCircleIcon color="success" />
            ) : (
              <HighlightOffIcon color="error" />
            )}
          </li>
          <li>
            یوزرنیم: <span className="text-green-500"> {admin.username}</span>
          </li>
          <li>
            پسورد: <span className="text-yellow-500"> {admin.password}</span>
          </li>
          <li>
            سطح: <span className="text-red-500"> {admin.grade}</span>
          </li>
          <li>
            ایمیل: <span className="text-violet-500"> {admin.email}</span>
          </li>
          <li>
            آیدی تلگرام:{" "}
            <span className="text-green-500"> {admin.tgId.toString()}</span>
            {admin.tgUser.username ? (
              <span className="text-orange-500">@{admin.tgUser.username}</span>
            ) : null}
          </li>
        </ul>
        <EditAdminForm refreshAdminPage={refreshAdminPage} admin={admin} />
      </div>
    </>
  );
}

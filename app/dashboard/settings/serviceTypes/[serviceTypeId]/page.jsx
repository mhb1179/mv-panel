"use client";

import Loading from "@/components/MVui/defaultLoading";
import Title from "@/components/MVui/title";
import { getServiceTypeByIdForSetting } from "@/lib/getData";
import { getServers } from "@/lib/getData";
import { useEffect, useState } from "react";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { join } from "path";
import EditServiceTypeForm from "@/components/forms/serviceTypes/EditServiceType";
import { Chip } from "@mui/material";
export default function ServiceTypePage({ params: { serviceTypeId } }) {
  const [loading, setLoading] = useState(true);
  const [serviceType, setServiceType] = useState();
  const [runUseEffect, setRunUseEffect] = useState(true);
  const [selectedServers, setSelectedServers] = useState();
  const [servers, setServers] = useState();
  useEffect(() => {
    (async () => {
      const result = await getServiceTypeByIdForSetting(Number(serviceTypeId));
      const getServersResult = await getServers();
      setServers(getServersResult.list);
      setServiceType(result.serviceType);
      setSelectedServers(result.servers);
      setLoading(false);
    })();
  }, [runUseEffect]);
  function refreshServiceTypePage() {
    setRunUseEffect((a) => !a);
  }
  if (loading) return <Loading />;
  if (!serviceType) return <span>نوع سرویس مورد نظر یافت نشد</span>;
  return (
    <>
      <Title
        backTo={{
          label: "بازگشت به انواع سرویس",
          path: "/dashboard/settings/serviceTypes",
        }}
      >
        نوع سرویس: <span className="text-green-500">{serviceType.name}</span>
      </Title>
      <div className="flex flex-col gap-2">
        <ul className="mb-2 flex flex-col gap-1">
          <li>
            مدت زمان:{" "}
            <span className="text-red-500">{serviceType.days} روز</span>
          </li>
          <li>
            قیمت اولیه:{" "}
            <span className="text-green-500">
              {serviceType.initial_price} تومان
            </span>
          </li>
          <li>
            حجم اولیه:{" "}
            <Chip
              size="small"
              variant="outlined"
              color="warning"
              label={serviceType.initial_GB + "GB"}
            />
          </li>
          <li>
            ماکسیمم حجم اضافی:{" "}
            <Chip
              size="small"
              variant="outlined"
              color="secondary"
              label={serviceType.max_extra_GB + "GB"}
            />
          </li>
          <li>
            قیمت هر گیگ حجم اضافی:{" "}
            <span className="text-green-500">
              {serviceType.extra_GB_price} تومان{" "}
            </span>
          </li>
          <li>
            تعداد کاربر:{" "}
            <span className="text-violet-500">
              {serviceType.userLimit} کاربر{" "}
            </span>
          </li>
          <li>
            قابل افزودن:{" "}
            {serviceType.addable ? (
              <CheckCircleIcon color="success" />
            ) : (
              <HighlightOffIcon color="error" />
            )}
          </li>
          <li>
            قابل امدید:{" "}
            {serviceType.revivable ? (
              <CheckCircleIcon color="success" />
            ) : (
              <HighlightOffIcon color="error" />
            )}
          </li>
          <li className="flex gap-2">
            سرورها:{" "}
            {selectedServers.map((server) => {
              return (
                <div key={server.id} className="text-yellow-500">
                  {" "}
                  {server.name} /{" "}
                </div>
              );
            })}
          </li>
        </ul>
        <EditServiceTypeForm
          servers={servers}
          serviceType={serviceType}
          selectedServers={selectedServers}
          refreshServiceTypePage={refreshServiceTypePage}
        />
      </div>
    </>
  );
}

"use client";
import Loading from "@/components/MVui/defaultLoading";
import { getEachServerUsage } from "@/lib/getData";
import AddTaskIcon from "@mui/icons-material/AddTask";
import FormatListNumberedRtlIcon from "@mui/icons-material/FormatListNumberedRtl";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SettingsIcon from "@mui/icons-material/Settings";
import { Grow } from "@mui/material";
import { BarChart } from "@tremor/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
export default function Dashboard() {
  const [iconSize, setIconSize] = useState("50px");
  const [loading, setLoading] = useState(true);
  const [usages, setUsages] = useState(true);
  const router = useRouter();
  useEffect(() => {
    setIconSize(window.innerWidth > 400 ? "50px" : "40px");
    (async () => {
      setUsages(await getEachServerUsage());
      setLoading(false);
    })();
  }, []);

  const startMenuItems = [
    {
      name: "افزودن سرویس",
      icon: <AddTaskIcon sx={{ fontSize: iconSize }} />,
      path: "/dashboard/addService",
      timeout: 0,
    },
    {
      name: "سرویس ها",
      icon: <FormatListNumberedRtlIcon sx={{ fontSize: iconSize }} />,
      path: "/dashboard/services",
      timeout: 300,
    },
    {
      name: "صورتحساب ها",
      icon: <ReceiptIcon sx={{ fontSize: iconSize }} />,
      path: "/dashboard/invoices",
      timeout: 600,
    },
    {
      name: "تنظیمات",
      icon: <SettingsIcon sx={{ fontSize: iconSize }} />,
      path: "/dashboard/settings",
      timeout: 900,
    },
  ];

  const dataFormatter = (number) => {
    return Intl.NumberFormat("us").format(number).toString() + "GB";
  };
  return (
    <>
      <div className="flex min-h-[110px] flex-wrap justify-center gap-4 lg:gap-6">
        {startMenuItems.map((item) => {
          return (
            <Grow key={item.name} in={true} timeout={item.timeout}>
              <div
                onClick={() => {
                  router.push(item.path);
                }}
                className="flex w-full cursor-pointer flex-col items-center rounded-lg border border-white p-3 hover:animate-pulse hover:border-2 hover:shadow-sm hover:shadow-white lg:w-48 "
              >
                {item.icon}
                <span className="text-sm lg:text-base">{item.name}</span>
              </div>
            </Grow>
          );
        })}
      </div>
      <section className="flex items-center justify-center">
        {loading ? (
          <Loading />
        ) : (
          <>
            <BarChart
              className="mt-6"
              data={usages.map((server) => {
                return { name: server.name, مصرف: server.usage };
              })}
              index="name"
              categories={["مصرف"]}
              colors={["indigo"]}
              valueFormatter={dataFormatter}
              yAxisWidth={8}
            />
          </>
        )}
      </section>
    </>
  );
}

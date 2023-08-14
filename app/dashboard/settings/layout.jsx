"use client";
import { Divider, Box, Tabs, Tab } from "@mui/material";
import { useSession } from "next-auth/react";
import { useContext, useEffect} from "react";
import Loading from "@/components/MVui/defaultLoading";
import { SettingsContext } from "@/contexts/settingContext";
import { useRouter } from "next/navigation";
import Title from "@/components/MVui/title";
export default function SettingsLayout({ children }) {
  const session = useSession();
  const { activeButton } = useContext(SettingsContext);
  const router = useRouter();
  const settingSections = [
    { id: "general", name: "عمومی" },
    { id: "servers", name: "سرور ها" },
    { id: "admins", name: "ادمین ها" },
    { id: "serviceTypes", name: "انواع سرویس ها" },
    { id: "telegramBot", name: "ربات تلگرام" },
  ];
  useEffect(() => {
    if (session.data.user.grade !== 1) {
      router.replace(
        "/dashboard/accessDenied?message=" +
          `شما به بخش تنظیمات دسترسی ندارید.`,
      );
    }
  }, [session.data]);
  if (session.status === "loading") return <Loading />;
  if (session.data.user.grade !== 1) return <></>;
  return (
    <>
      <Title>تنظیمات</Title>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs variant="scrollable" scrollButtons="auto" value={activeButton}>
          {settingSections.map((section) => {
            return (
              <Tab
                size="large"
                key={section.id}
                wrapped={true}
                label={section.name}
                value={section.id}
                onClick={() => {
                  router.replace("/dashboard/settings/" + section.id);
                }}
              />
            );
          })}
        </Tabs>
      </Box>
      {/*</div>*/}
      <Divider />
      <div className="mt-4">{children}</div>
    </>
  );
}

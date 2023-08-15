"use client";
import { ThemeProvider, createTheme } from "@mui/material";
import DashboardLayout from "@/components/MVui/DashboardLayout";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Context from "@/contexts/settingContext";
import { useEffect } from "react";
import Loading from "@/components/MVui/defaultLoading";

const theme = createTheme({
  typography: {
    fontFamily: "IranSANS , Arial",
  },
  palette: {
    mode: "dark",
  },
});

export default function DashboardRoot({ children }) {
  // const router = useRouter();
  // const session = useSession();
  // useEffect(() => {
  //   if (session.status === "unauthenticated") {
  //     router.replace("/login");
  //   }
  // }, [session.status]);
  return (
    <ThemeProvider theme={theme}>
      <DashboardLayout />
      <Context>
        <div className=" container mx-auto flex items-center justify-center p-3">
          <div className="w-full rounded-xl border-2 border-blue-500 p-5 xl:w-3/4">
            {/* {session.status != "authenticated" ? <Loading /> : children} */}
            {children}
          </div>
        </div>
      </Context>
    </ThemeProvider>
  );
}

"use client";
import { SettingsContext } from "@/contexts/settingContext";
import { useContext, useEffect } from "react";
function layout({ children }) {
  const { setActiveButton } = useContext(SettingsContext);
  useEffect(() => {
    setActiveButton("admins");
  });
  return <>{children}</>;
}
export default layout;

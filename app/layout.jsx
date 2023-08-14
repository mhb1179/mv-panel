import "./globals.css";
import AuthProvider from "./AuthProvider";
import { StrictMode } from "react";

export const metadata = {
  title: "MV Panel",
  description: "پنل مدیریت MV",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa">
      {/* <StrictMode> */}
      <AuthProvider>
        <body suppressHydrationWarning={true}>{children}</body>
      </AuthProvider>
      {/* </StrictMode> */}
    </html>
  );
}

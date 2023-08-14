"use client";
import { Alert, AlertTitle } from "@mui/material";
import { useSearchParams } from "next/navigation";

export default function AccessDenied() {
  const searchParams = useSearchParams();
  return (
    <Alert severity="error" variant="outlined">
      <AlertTitle>عدم دسترسی</AlertTitle>
      {searchParams.get("message")}
    </Alert>
  );
}

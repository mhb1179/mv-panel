"use client";

import { Alert, AlertTitle , Button } from "@mui/material";
import { useRouter } from "next/navigation";
export default function Error404({children , backTo}) {
  const router = useRouter()
  return (
    <>
      <Alert variant="outlined" color="error">
        <AlertTitle>404</AlertTitle>
       {children}
      </Alert>
      <div className="flex justify-center mt-5">
        <Button
          variant="outlined"
          size="small"
          color="error"
          onClick={() => {
            router.push(backTo.path);
          }}
        >
          {backTo.label}
        </Button>
      </div>
    </>
  );
}

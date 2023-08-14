"use client";

import { Button, Divider } from "@mui/material";
import { useRouter } from "next/navigation";

export default function Title({ children, backTo }) {
  const router = useRouter();
  return (
    <>
      <div
        className={
          (backTo ? " dir-ltr justify-between " : "") +
          " flex flex-col gap-1 sm:flex-row sm:gap-0 "
        }
      >
        {backTo ? (
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
        ) : null}
        <h1 className="dir-rtl text-xl font-bold text-center sm:text-right">{children}</h1>
      </div>
      <Divider
        sx={{ borderColor: "white", marginTop: "10px", marginBottom: "15px" }}
      />
    </>
  );
}

"use client";
import { useEffect, useState } from "react";
import Loading from "@/components/MVui/defaultLoading";
import { Button } from "@mui/material";
import { checkUsage } from "@/lib/actions";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import FormContainer from "@/components/MVui/formContainer";
export default function General() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      setLoading(false);
    })();
  }, []);
  async function runCheckUsage() {
    const result = await checkUsage();
    if (result.success == true) {
      enqueueSnackbar(result.message, { variant: "success" });
    } else {
      enqueueSnackbar(result.message, { variant: "error" });
    }
  }
  if (loading) return <Loading />;
  return (
    <>
      <SnackbarProvider
        autoHideDuration={5000}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      />
      <FormContainer>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          size="large"
          onClick={runCheckUsage}
        >
          بروزرسانی مصرف سرویس ها
        </Button>
      </FormContainer>
    </>
  );
}

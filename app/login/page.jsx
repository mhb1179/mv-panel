"use client";
import { ThemeProvider, createTheme } from "@mui/material";
import { Button, Stack, TextField } from "@mui/material";
import { useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import Loading from "@/components/MVui/defaultLoading";
import { SnackbarProvider, enqueueSnackbar } from "notistack";
import { sendLoginMessage } from "@/lib/actions";
const theme = createTheme({
  typography: {
    fontFamily: "IranSANS , Arial",
  },
  palette: {
    mode: "dark",
  },
});

export default function Login() {
  const form = useForm({
    mode: "onBlur",
  });
  const { register, control, handleSubmit, formState } = form;
  const { errors, isSubmitting } = formState;
  const router = useRouter();
  const onSubmit = ({ username, password }) => {
    signIn("credentials", {
      username: username.trim(),
      password: password.trim(),
      redirect: false,
    }).then(async (prop) => {
      if (prop.error) {
        enqueueSnackbar(prop.error.slice(7), { variant: "error" });
      } else {
        enqueueSnackbar("شما با موفقیت وارد شدید", { variant: "success" });
        await sendLoginMessage(username);
        return router.replace("/dashboard");
      }
    });
  };
  const session = useSession();
  // const [runUseEffect , setRunUseEffect] = useState(true)
  // useEffect(()=>{},[])
  useEffect(() => {
    if (session.status === "authenticated") {
      return router.replace("/dashboard");
    }
  }, [session.status]);

  return (
    <>
      <ThemeProvider theme={theme}>
        <SnackbarProvider
          maxSnack={2}
          dense
          anchorOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        />
        <div className="my-h-screen container flex items-center justify-center">
          <div className="mb-24 rounded-lg bg-violet-900 p-8">
            <h1 className="mb-8 text-center text-3xl font-bold">ورود ادمین</h1>
            {session.status === "loading" ||
            session.status === "authenticated" ? (
              <Loading />
            ) : (
              <>
                <form onSubmit={handleSubmit(onSubmit)} className="dir-ltr">
                  <Stack spacing={3}>
                    <TextField
                      id="username"
                      label="نام کاربری"
                      type="text"
                      variant="outlined"
                      {...register("username", {
                        required: "نام کاربری الزامی است",
                      })}
                      error={errors.username && true}
                      helperText={errors.username?.message}
                    />
                    <TextField
                      id="password"
                      label="رمز عبور"
                      variant="outlined"
                      type="password"
                      {...register("password", {
                        required: "رمز عبور الزامی است",
                      })}
                      error={errors.password && true}
                      helperText={errors.password?.message}
                    />

                    <Button
                      type="submit"
                      variant="outlined"
                      color="primary"
                      disabled={isSubmitting}
                    >
                      ورود
                    </Button>
                  </Stack>
                </form>
              </>
            )}
          </div>
          <DevTool control={control} placement="top-left" />
        </div>
      </ThemeProvider>
    </>
  );
}

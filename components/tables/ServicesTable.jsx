"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

function formatBytes(bytes) {
  if (bytes < 1024) {
    return bytes + "B";
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + "KB";
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(2) + "MB";
  } else {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + "GB";
  }
}
function ServicesTable({ services, page, servicePerPage }) {
  const router = useRouter();
  const session = useSession();
  return (
    <>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              {session?.data.user.grade == 1 ? (
                <TableCell align="right">ادمین</TableCell>
              ) : null}
              <TableCell align="right">نام سرویس</TableCell>
              <TableCell align="center">وضعیت</TableCell>
              <TableCell align="center">مصرف</TableCell>
              <TableCell align="center">نوع سرویس</TableCell>
              <TableCell align="center">تاریخ انقضا</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services.map((service, index) => {
              return (
                <TableRow
                  key={service.id}
                  sx={{
                    backgroundColor: index % 2 == 0 ? "#1e1b4b" : "#0f172a",
                    opacity: service.active ? "100%" : "40%",
                  }}
                >
                  <TableCell align="center">
                    {index + 1 + (page - 1) * servicePerPage}
                  </TableCell>

                  {session?.data.user.grade == 1 ? (
                    <TableCell align="right">{service.admin.name}</TableCell>
                  ) : null}
                  <TableCell align="right">
                    <Button
                      onClick={() =>
                        router.push(`/dashboard/services/${service.name}`)
                      }
                      sx={{ textTransform: "none", color: "white" }}
                    >
                      {service.name}
                    </Button>
                  </TableCell>
                  <TableCell align="center">
                    {service.active ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <HighlightOffIcon color="error" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      color="secondary"
                      variant="outlined"
                      label={
                        formatBytes(Number(service.up + service.down)) +
                        " / " +
                        (service.total + "GB")
                      }
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      variant="outlined"
                      label={service.serviceType.name}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      variant="outlined"
                      color="info"
                      size="small"
                      label={
                        <div className="dir-ltr">
                          {new Intl.DateTimeFormat("fa-IR", {
                            dateStyle: "short",
                            timeStyle: "medium",
                            hourCycle: "h23",
                            timeZone: "Asia/Tehran",
                          }).format(service.expirationDate)}
                        </div>
                      }
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {/* {dialogOpen ? (
        <SubQRCode
          serviceId={QRCodeServiceId}
          dialogOpen={dialogOpen}
          toggleDialog={toggleDialog}
        />
      ) : null} */}
    </>
  );
}

export default ServicesTable;

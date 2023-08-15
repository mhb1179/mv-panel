"use client";

import {
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useSession } from "next-auth/react";
import { setPaymentStatus } from "@/lib/actions";


function InvoicesTable({ invoices, page, invoicePerPage, updateInvoices ,sendSnackBar }) {
  const session = useSession();
  async function setStatus({ invoiceId, paymentStatus }) {
    const result = await setPaymentStatus({ invoiceId, paymentStatus });
    sendSnackBar(result.message , result.success ? "success" : "error")
    updateInvoices();
  }
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
              <TableCell align="center">مبلغ نهایی</TableCell>
              <TableCell align="center">تاریخ ایجاد</TableCell>
              <TableCell align="center">تاریخ تایید پرداخت</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice, index) => {
              return (
                <TableRow
                  key={invoice.id}
                  sx={
                    index % 2 == 0
                      ? { backgroundColor: "#1e1b4b" }
                      : { backgroundColor: "#0f172a" }
                  }
                >
                  <TableCell align="center">
                    {index + 1 + (page - 1) * invoicePerPage}
                  </TableCell>
                  {session?.data.user.grade == 1 ? (
                    <TableCell align="right">{invoice.admin.name}</TableCell>
                  ) : null}
                  <TableCell align="right">{invoice.service.name}</TableCell>
                  <TableCell align="center">
                    {invoice.paymentStatus == "adminReward" ? (
                      <EmojiEventsIcon color="warning" />
                    ) : null}
                    {invoice.paymentStatus == "paid" ? (
                      <CheckCircleIcon color="success" />
                    ) : null}
                    {invoice.paymentStatus == "unpaid" ? (
                      <HighlightOffIcon color="error" />
                    ) : null}
                  </TableCell>
                  <TableCell align="center">{invoice.amount}ت</TableCell>
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
                            timeZone: "Asia/Tehran"
                          }).format(invoice.createdAt)}
                        </div>
                      }
                    />
                  </TableCell>
                  <TableCell align="center">
                    {invoice.paymentStatus == "paid" ? (
                      <Chip
                        variant="outlined"
                        color="success"
                        size="small"
                        label={
                          <div className="dir-ltr">
                            {new Intl.DateTimeFormat("fa-IR", {
                              dateStyle: "short",
                              timeStyle: "medium",
                              hourCycle: "h23",
                              timeZone: "Asia/Tehran"
                            }).format(invoice.paiedAt)}
                          </div>
                        }
                      />
                    ) : null}
                    {invoice.paymentStatus == "adminReward"
                      ? <span className="text-yellow-500">پاداش ادمین</span>
                      : null}
                    {invoice.paymentStatus == "unpaid" ? (
                      <div className="flex flex-col items-center gap-1">
                        {session && session?.data.user.grade == 1 ? null : (
                          <HighlightOffIcon color="error" />
                        )}
                        {session && session?.data.user.grade == 1 ? (
                          <>
                            <Button
                            size="small"
                            fullWidth
                            variant="outlined"
                              color="success"
                              onClick={() => {
                                setStatus({
                                  invoiceId: invoice.id,
                                  paymentStatus: "paid",
                                });
                              }}
                            >
                              پرداخت شد
                            </Button>
                            <Button
                            size="small"
                            fullWidth
                            variant="outlined"
                              color="warning"
                              onClick={() => {
                                setStatus({
                                  invoiceId: invoice.id,
                                  paymentStatus: "adminReward",
                                });
                              }}
                            >
                              پاداش ادمین
                            </Button>
                          </>
                        ) : null}
                      </div>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default InvoicesTable;

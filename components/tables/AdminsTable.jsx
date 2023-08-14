"use client";
import {
  Table,
  TableHead,
  TableContainer,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useRouter } from "next/navigation";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
function AdminsTable({ admins }) {
  const router = useRouter();
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell align="right">نام</TableCell>
            <TableCell align="right">نام کاربری</TableCell>
            <TableCell align="right">رمز عبور</TableCell>
            <TableCell align="center">وضعیت</TableCell>
            <TableCell align="center">سطح دسترسی</TableCell>
            <TableCell align="center">ویرایش</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {admins.map((admin, index) => {
            return (
              <TableRow
                key={admin.id}
                sx={{
                  backgroundColor: index % 2 == 0 ? "#1e1b4b" : "#0f172a",
                }}
              >
                <TableCell align="center">{index + 1}</TableCell>

                <TableCell align="right">{admin.name}</TableCell>
                <TableCell align="right">{admin.username}</TableCell>
                <TableCell align="right">{admin.password}</TableCell>
                <TableCell align="center">
                  {admin.active ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <HighlightOffIcon color="error" />
                  )}
                </TableCell>
                <TableCell align="center">{admin.grade}</TableCell>
                <TableCell align="center">
                  <IconButton
                    onClick={() =>
                      router.push(`/dashboard/settings/admins/${admin.id}`)
                    }
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default AdminsTable;

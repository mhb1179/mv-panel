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
function ServiceTypesTable({ serviceTypes }) {
  const router = useRouter();
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell align="right">نام</TableCell>
            <TableCell align="center">مدت اعتبار</TableCell>
            <TableCell align="center">قیمت</TableCell>
            <TableCell align="center">اعتبار اولیه</TableCell>
            <TableCell align="center">فابل افزودن</TableCell>
            <TableCell align="center">قابل تمدید</TableCell>
            <TableCell align="center">ویرایش</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {serviceTypes.map((serviceType, index) => {
            return (
              <TableRow
                key={serviceType.id}
                sx={{
                  backgroundColor: index % 2 == 0 ? "#1e1b4b" : "#0f172a",
                }}
              >
                <TableCell align="center">{index + 1}</TableCell>

                <TableCell align="right">{serviceType.name}</TableCell>
                <TableCell align="center">{serviceType.days}</TableCell>
                <TableCell align="center">{serviceType.initial_price} تومان</TableCell>
                <TableCell align="center">{serviceType.initial_GB}GB</TableCell>
                <TableCell align="center">
                  {serviceType.addable ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <HighlightOffIcon color="error" />
                  )}
                </TableCell>
                <TableCell align="center">
                  {serviceType.revivable ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <HighlightOffIcon color="error" />
                  )}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    onClick={() =>
                      router.push(`/dashboard/settings/serviceTypes/${serviceType.id}`)
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

export default ServiceTypesTable;

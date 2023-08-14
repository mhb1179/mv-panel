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
function ServersTable({servers}) {
  const router = useRouter()
  return (
    <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="right">نام</TableCell>
              <TableCell align="right">آدرس</TableCell>
              <TableCell align="right">ارائه دهنده</TableCell>
              <TableCell align="center">قابل افزودن</TableCell>
              <TableCell align="center">قابل تمدید</TableCell>
              <TableCell align="center">قیمت</TableCell>
              <TableCell align="center">تغییرات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {servers.map((server, index) => {
              return (
                <TableRow
                  key={server.id}
                  sx={{
                    backgroundColor: index % 2 == 0 ? "#1e1b4b" : "#0f172a",
                  }}
                >
                  <TableCell align="right">{server.name}</TableCell>
                  <TableCell align="right">{server.address}</TableCell>
                  <TableCell align="right">{server.provider}</TableCell>
                  <TableCell align="center">{server.addable ? <CheckCircleIcon color="success"/> : <HighlightOffIcon color="error"/>}</TableCell>
                  <TableCell align="center">{server.revivable ? <CheckCircleIcon color="success"/> : <HighlightOffIcon color="error"/>}</TableCell>
                  <TableCell align="center">{server.price}تومان </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() =>
                        router.push(`/dashboard/settings/servers/${server.id}`)
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
  )
}

export default ServersTable
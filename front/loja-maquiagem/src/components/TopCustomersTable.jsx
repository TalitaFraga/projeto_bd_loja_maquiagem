import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"

const rows = [
  { id: "01", name: "Cliente 1", value: "R$ 1.500,00", quantity: "10" },
  { id: "02", name: "Cliente 2", value: "R$ 1.100,00", quantity: "10" },
  { id: "03", name: "Cliente 3", value: "R$ 980,00", quantity: "20" },
  { id: "04", name: "Cliente 4", value: "R$ 700,00", quantity: "5" },
]

export default function TopCustomersTable() {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Nome</TableCell>
            <TableCell>Compras</TableCell>
            <TableCell>Última compra</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>
                <Box
                  sx={{
                    backgroundColor:
                      row.id === "01"
                        ? "#E3F2FD"
                        : row.id === "02"
                          ? "#E8F5E9"
                          : row.id === "03"
                            ? "#EDE7F6"
                            : "#FFF3E0",
                    borderRadius: 1,
                    p: 0.5,
                    display: "inline-block",
                    color:
                      row.id === "01"
                        ? "#1976D2"
                        : row.id === "02"
                          ? "#388E3C"
                          : row.id === "03"
                            ? "#7B1FA2"
                            : "#E65100",
                  }}
                >
                  {row.value}
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={row.quantity}
                  size="small"
                  sx={{
                    backgroundColor:
                      row.id === "01"
                        ? "#E3F2FD"
                        : row.id === "02"
                          ? "#E8F5E9"
                          : row.id === "03"
                            ? "#EDE7F6"
                            : "#FFF3E0",
                    color:
                      row.id === "01"
                        ? "#1976D2"
                        : row.id === "02"
                          ? "#388E3C"
                          : row.id === "03"
                            ? "#7B1FA2"
                            : "#E65100",
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

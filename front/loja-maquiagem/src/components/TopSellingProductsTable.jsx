import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import LinearProgress from "@mui/material/LinearProgress"

const rows = [
  { id: "01", name: "Produto 1", progress: 75, quantity: "45" },
  { id: "02", name: "Produto 2", progress: 50, quantity: "10" },
  { id: "03", name: "Produto 3", progress: 35, quantity: "20" },
  { id: "04", name: "Produto 4", progress: 20, quantity: "5" },
]

export default function TopSellingProductsTable() {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Nome</TableCell>
            <TableCell>Vendas</TableCell>
            <TableCell>Quantidade</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                  <Box sx={{ width: "100%", mr: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={row.progress}
                      sx={{
                        height: 8,
                        borderRadius: 5,
                        backgroundColor: "#f5f5f5",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor:
                            row.id === "01"
                              ? "#2196F3"
                              : row.id === "02"
                                ? "#00E676"
                                : row.id === "03"
                                  ? "#9C27B0"
                                  : "#FF9800",
                        },
                      }}
                    />
                  </Box>
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

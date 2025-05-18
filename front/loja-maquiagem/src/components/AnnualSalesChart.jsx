import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

const data = [
  { name: "Jan", loyal: 200, new: 180 },
  { name: "Fev", loyal: 220, new: 190 },
  { name: "Mar", loyal: 190, new: 170 },
  { name: "Abr", loyal: 180, new: 160 },
  { name: "Maio", loyal: 250, new: 220 },
  { name: "Jun", loyal: 280, new: 240 },
  { name: "Jul", loyal: 290, new: 260 },
  { name: "Ago", loyal: 300, new: 280 },
  { name: "Set", loyal: 280, new: 260 },
  { name: "Out", loyal: 250, new: 230 },
  { name: "Nov", loyal: 230, new: 210 },
  { name: "Dez", loyal: 220, new: 200 },
]

export default function AnnualSalesChart() {
  return (
    <Box sx={{ height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <Line type="monotone" dataKey="loyal" stroke="#9C27B0" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="new" stroke="#F44336" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mr: 3 }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: "#9C27B0", borderRadius: "50%", mr: 1 }} />
          <Typography variant="body2">Clientes Fidelizados</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box sx={{ width: 12, height: 12, backgroundColor: "#F44336", borderRadius: "50%", mr: 1 }} />
          <Typography variant="body2">Novos Clientes</Typography>
        </Box>
      </Box>
    </Box>
  )
}

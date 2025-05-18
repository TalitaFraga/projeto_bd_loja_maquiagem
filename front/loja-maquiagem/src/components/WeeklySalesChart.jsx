import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts"
import Box from "@mui/material/Box"

const data = [
  { name: "Segunda", vendedor1: 12, vendedor2: 10 },
  { name: "Terça", vendedor1: 15, vendedor2: 8 },
  { name: "Quarta", vendedor1: 5, vendedor2: 20 },
  { name: "Quinta", vendedor1: 15, vendedor2: 5 },
  { name: "Sexta", vendedor1: 12, vendedor2: 10 },
  { name: "Sábado", vendedor1: 18, vendedor2: 12 },
  { name: "Domingo", vendedor1: 20, vendedor2: 8 },
]

export default function WeeklySalesChart() {
  return (
    <Box sx={{ height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} />
          <YAxis axisLine={false} tickLine={false} />
          <Bar dataKey="vendedor1" fill="#2196F3" radius={[4, 4, 0, 0]} barSize={20} />
          <Bar dataKey="vendedor2" fill="#00E676" radius={[4, 4, 0, 0]} barSize={20} />
          <Legend
            iconType="circle"
            payload={[
              { value: "Vendedor 1", type: "circle", color: "#2196F3" },
              { value: "Vendedor 2", type: "circle", color: "#00E676" },
            ]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  )
}

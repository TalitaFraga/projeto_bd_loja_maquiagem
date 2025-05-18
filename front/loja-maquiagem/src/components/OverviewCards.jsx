import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn"
import InventoryIcon from "@mui/icons-material/Inventory"
import PeopleIcon from "@mui/icons-material/People"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"

const cardData = [
  {
    title: "R$ 10.520,00",
    subtitle: "Vendas no Estoque",
    icon: <MonetizationOnIcon />,
    color: "#FFEBEE",
    iconColor: "#F44336",
    increase: "8%",
  },
  {
    title: "300",
    subtitle: "Produtos em Estoque",
    icon: <InventoryIcon />,
    color: "#FFF8E1",
    iconColor: "#FFA000",
    increase: "10%",
  },
  {
    title: "380",
    subtitle: "Clientes Ativos",
    icon: <PeopleIcon />,
    color: "#E8F5E9",
    iconColor: "#4CAF50",
    increase: "3%",
  },
  {
    title: "8",
    subtitle: "Novos Clientes",
    icon: <PersonAddIcon />,
    color: "#EDE7F6",
    iconColor: "#673AB7",
    increase: "0.5%",
  },
]

export default function OverviewCards() {
  return (
    <Grid container spacing={3}>
      {cardData.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              backgroundColor: card.color,
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Box
                sx={{
                  backgroundColor: card.iconColor,
                  borderRadius: "50%",
                  p: 1,
                  display: "flex",
                  color: "white",
                }}
              >
                {card.icon}
              </Box>
            </Box>
            <Typography variant="h5" component="div" sx={{ fontWeight: "bold" }}>
              {card.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {card.subtitle}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <ArrowUpwardIcon sx={{ fontSize: 14, color: "success.main", mr: 0.5 }} />
              <Typography variant="caption" color="success.main">
                Aumento de {card.increase}
              </Typography>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  )
}

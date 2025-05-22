import { useEffect, useState } from "react"
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn"
import InventoryIcon from "@mui/icons-material/Inventory"
import PeopleIcon from "@mui/icons-material/People"
import PersonAddIcon from "@mui/icons-material/PersonAdd"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import axios from "axios"

export default function OverviewCards() {
  const [vendas, setVendas] = useState([])
  const [estoque, setEstoque] = useState([])
  const [clientes, setClientes] = useState([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [resVendas, resEstoque, resClientes] = await Promise.all([
          axios.get("http://localhost:8081/vendas"),
          axios.get("http://localhost:8081/estoque"),
          axios.get("http://localhost:8081/clientes"),
        ])
        setVendas(resVendas.data || [])
        setEstoque(resEstoque.data || [])
        setClientes(resClientes.data || [])
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard", error)
      }
    }

    fetchData()
  }, [])

  const totalVendas = vendas.reduce((acc, venda) => {
    const totalVenda = (venda.itens || []).reduce((sum, item) => sum + (item.qtdeProduto || 0), 0)
    return acc + totalVenda
  }, 0)

  const totalEstoque = estoque.reduce((acc, item) => acc + (item.qtdeProduto || 0), 0)

  const totalClientes = clientes.length

  // Exemplo fixo de novos clientes (você pode ajustar com base na data de cadastro, se tiver)
  const novosClientes = clientes.slice(-8).length

  const cardData = [
    {
      title: `+${totalVendas}`,
      subtitle: "Produtos Vendidos",
      icon: <MonetizationOnIcon />,
      color: "#FFEBEE",
      iconColor: "#F44336",
      increase: "8%",
    },
    {
      title: `${totalEstoque}`,
      subtitle: "Produtos em Estoque",
      icon: <InventoryIcon />,
      color: "#FFF8E1",
      iconColor: "#FFA000",
      increase: "10%",
    },
    {
      title: `${totalClientes}`,
      subtitle: "Clientes Ativos",
      icon: <PeopleIcon />,
      color: "#E8F5E9",
      iconColor: "#4CAF50",
      increase: "3%",
    },
    {
      title: `${novosClientes}`,
      subtitle: "Novos Clientes (últimos)",
      icon: <PersonAddIcon />,
      color: "#EDE7F6",
      iconColor: "#673AB7",
      increase: "0.5%",
    },
  ]

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
                </Box>
              </Paper>
            </Grid>
        ))}
      </Grid>
  )
}

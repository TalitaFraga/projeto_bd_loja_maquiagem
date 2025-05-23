import React, { useEffect, useState } from "react";
import {
  Box,
  CssBaseline,
  Toolbar,
  Typography,
  AppBar,
  Grid,
  Paper,
  CircularProgress,
} from "@mui/material";

import PeopleIcon from "@mui/icons-material/People";
import StoreIcon from "@mui/icons-material/Store";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SideBar from '../../pages/SideBar';

import VendasPorSemana from "./VendasPorSemana";
import ClientesMaisCompram from "./ClientesMaisCompram";
import VendedoresMelhorDesempenho from "./VendedoresMelhorDesempenho";
import VendasEstoque from "./VendasEstoque";
import ProdutosVencendo from "./ProdutosVencendo";
import AnnualSalesChart from "../AnnualSalesChart"
import OverviewCards from "../OverviewCards";

import axios from "axios";

const SummaryCard = ({ title, value, icon }) => (
  <Paper
    elevation={4}
    sx={{
      p: 3,
      display: "flex",
      alignItems: "center",
      gap: 2,
      borderRadius: 2,
      bgcolor: "background.paper",
      minHeight: 120,
      flexDirection: "row",
    }}
  >
    <Box sx={{ color: "#F06292", fontSize: 50 }}>{icon}</Box>
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h5" fontWeight="bold">
        {value}
      </Typography>
    </Box>
  </Paper>
);

const Dashboard = () => {
  const [clientes, setClientes] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [itensVenda, setItensVenda] = useState([]);
  const [estoque, setEstoque] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          clientesRes,
          funcionariosRes,
          produtosRes,
          vendasRes,
          itensVendasRes,
          estoqueRes,
        ] = await Promise.all([
          axios.get("http://localhost:8081/clientes"),
          axios.get("http://localhost:8081/funcionarios"),
          axios.get("http://localhost:8081/produtos"),
          axios.get("http://localhost:8081/vendas"),
          axios.get("http://localhost:8081/itens-venda"),
          axios.get("http://localhost:8081/estoque"),
        ]);
        setClientes(clientesRes.data);
        setFuncionarios(funcionariosRes.data);
        setProdutos(produtosRes.data);
        setVendas(vendasRes.data);
        setItensVenda(itensVendasRes.data);
        setEstoque(estoqueRes.data);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalVendas = vendas.reduce((acc, venda) => {
    const totalVenda = (venda.itens || []).reduce((sum, item) => sum + (item.qtdeProduto || 0), 0)
    return acc + totalVenda
  }, 0)

  const totalEstoque = estoque.reduce((acc, item) => acc + (item.qtdeProduto || 0), 0)


  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress sx={{ color: "#F06292" }} />
      </Box>
    );
  }

  return (
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <CssBaseline />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: "#f5f5f5",
            p: 3,
            minHeight: "100vh",
            maxWidth: 1200,          
            mx: "auto",             
            mt: 8,                  
            width: "100%",          
          }}
        >
        <Grid container spacing={3} mb={4} wrap="nowrap">
          <Grid item>
            <SummaryCard
              title="Clientes"
              value={clientes.length}
              icon={<PeopleIcon />}
            />
          </Grid>
          <Grid item>
            <SummaryCard
              title="Funcionários"
              value={funcionarios.length}
              icon={<PeopleIcon />}
            />
          </Grid>
          <Grid item>
            <SummaryCard
              title="Produtos"
              value={produtos.length}
              icon={<StoreIcon />}
            />
          </Grid>
          <Grid item>
            <SummaryCard
              title="Estoque"
              value={totalEstoque}
              icon={<StoreIcon />}
            />
          </Grid>
          <Grid item>
            <SummaryCard
              title="Vendas"
              value={vendas.length}
              icon={<ShoppingCartIcon />}
            />
          </Grid>
          <Grid item>
            <SummaryCard
              title="Produtos vendidos"
              value={totalVendas}
              icon={<StoreIcon />}
            />
          </Grid>
          </Grid>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  height: 250,
                  display: "flex",
                  flexDirection: "column",
                }}
                elevation={3}
              >
                <Typography variant="h5" mb={2} fontWeight="medium">
                  Vendas e Estoque
                </Typography>
                <Box sx={{ flexGrow: 1, minHeight: 300 }}>
                  <VendasEstoque
                    produtos={produtos}
                    itensVenda={itensVenda}
                    estoque={estoque}
                  />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  height: 250,
                  display: "flex",
                  flexDirection: "column",
                }}
                elevation={3}
              >
                <Typography variant="h5" mb={2} fontWeight="medium">
                  Produtos Vencendo
                </Typography>
                <Box sx={{ flexGrow: 1, minHeight: 300 }}>
                  <ProdutosVencendo produtos={produtos} estoque={estoque} />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  height: 250,
                  display: "flex",
                  flexDirection: "column",
                }}
                elevation={3}
              >
                <Typography variant="h5" mb={2} fontWeight="medium">
                  Vendas por Semana
                </Typography>
                <Box sx={{ flexGrow: 1, minHeight: 300 }}>
                  <VendasPorSemana vendas={vendas} />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  height: 400,
                  display: "flex",
                  flexDirection: "column",
                }}
                elevation={3}
              >
                {/* <Typography variant="h6" mb={2} fontWeight="medium"> */}
                  {/* Clientes que Mais Compram */}
                {/* </Typography> */}
                <Box sx={{ flexGrow: 1, minHeight: 300 }}>
                  <ClientesMaisCompram clientes={clientes} vendas={vendas} />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 2, minHeight: 400, display: "flex", flexDirection: "column", width: 610 }}>
                <Typography variant="h6" gutterBottom>
                  Vendas - Frequência Anual
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                  <AnnualSalesChart />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  display: "flex",
                  // flexDirection: "column",
                }}
                elevation={3}
              >
                {/* <Typography variant="h6" mb={2} fontWeight="medium"> */}
                  {/* Vendedores com Melhor Desempenho */}
                {/* </Typography> */}
                <Box sx={{ flexGrow: 1 }}>
                  <VendedoresMelhorDesempenho
                    funcionarios={funcionarios}
                    vendas={vendas}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
  )
};

export default Dashboard;

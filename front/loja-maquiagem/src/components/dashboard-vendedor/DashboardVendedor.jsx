import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import OverviewCards from "../OverviewCards"
import AnnualSalesChart from "../AnnualSalesChart"
import WeeklySalesChart from "../WeeklySalesChart"
import TopCustomersTable from "../TopCustomersTable"
import TopSellingProductsTable from "../TopSellingProductsTable"
import ProdutosVencendo from "../dashboard/ProdutosVencendo"
import Box from "@mui/material/Box"

export default function DashboardVendedor() {
  return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Visão Geral
            </Typography>
            <Paper sx={{
              width: 1245,
              p: 2,
              mx: "auto",
              display: "flex",
              flexDirection: "column"
            }}>
              <OverviewCards />
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, minHeight: 300, display: "flex", flexDirection: "column", width: 610 }}>
                  <Typography variant="h6" gutterBottom>
                    Vendas - Frequência Semanal por Vendedor
                  </Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <WeeklySalesChart />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, minHeight: 300, display: "flex", flexDirection: "column", width: 610 }}>
                  <Typography variant="h6" gutterBottom>
                    Vendas - Frequência Anual
                  </Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <AnnualSalesChart />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, minHeight: 300, display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" gutterBottom>
                    Produtos a expirar
                  </Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <ProdutosVencendo />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, minHeight: 300, display: "flex", flexDirection: "column" }}>
                  <Typography variant="h6" gutterBottom>
                    Produtos mais vendidos
                  </Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <TopSellingProductsTable />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2, minHeight: 300, display: "flex", flexDirection: "column" }}>
              <Typography variant="h6" gutterBottom>
                Melhores Clientes
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <TopCustomersTable />
              </Box>
            </Paper>
          </Grid>

        </Grid>
      </Container>
  )
}

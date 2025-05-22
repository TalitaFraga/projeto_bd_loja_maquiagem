import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import Typography from "@mui/material/Typography"
import OverviewCards from "../OverviewCards"
import AnnualSalesChart from "../AnnualSalesChart"
import WeeklySalesChart from "../WeeklySalesChart"
import TopCustomersTable from "../TopCustomersTable"
import ExpiringProductsTable from "../ExpiringProductsTable"
import TopSellingProductsTable from "../TopSellingProductsTable"

export default function DashboardVendedor() {
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Overview Section */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Visão Geral
          </Typography>
          <OverviewCards />
        </Grid>

        {/* Charts Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Vendas - Frequência Semanal por Vendedor
            </Typography>
            <WeeklySalesChart />
          </Paper>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Produtos a expirar
                </Typography>
                <ExpiringProductsTable />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Produtos mais vendidos
                </Typography>
                <TopSellingProductsTable />
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Vendas - Frequência Anual
            </Typography>
            <AnnualSalesChart />
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Vendas - Melhores Clientes
            </Typography>
            <TopCustomersTable />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}
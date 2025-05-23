import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import VendasChart from "../WeeklySalesChart";  // Corrigi o nome do import
import TopCustomersTable from "../TopCustomersTable";
import TopSellingProductsTable from "../TopSellingProductsTable";
import ProdutosVencendo from "../dashboard/ProdutosVencendo";
import Box from "@mui/material/Box";

export default function DashboardVendedor() {
  return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: "100%",
              overflow: "hidden"
            }}>
              <VendasChart sx={{ width: 1180, height: "100%" }} />
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}>
              <Typography variant="h6" gutterBottom>
                Produtos a expirar
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <ProdutosVencendo />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}>
              <Typography variant="h6" gutterBottom>
                Produtos mais vendidos
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <TopSellingProductsTable />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}>
              <Typography variant="h6" gutterBottom>
                Seus Melhores Clientes
              </Typography>
              <Box sx={{ flexGrow: 1 }}>
                <TopCustomersTable />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
  );
}
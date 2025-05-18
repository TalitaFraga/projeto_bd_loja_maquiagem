import { styled } from "@mui/material/styles"
import Box from "@mui/material/Box"
import Drawer from "@mui/material/Drawer"
import AppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import Badge from "@mui/material/Badge"
import Container from "@mui/material/Container"
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import NotificationsIcon from "@mui/icons-material/Notifications"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import Sidebar from "./SidebarVendedor"
import OverviewCards from "./OverviewCards"
import AnnualSalesChart from "./AnnualSalesChart"
import WeeklySalesChart from "./WeeklySalesChart"
import TopCustomersTable from "./TopCustomersTable"
import ExpiringProductsTable from "./ExpiringProductsTable"
import TopSellingProductsTable from "./TopSellingProductsTable"

const drawerWidth = 260

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: 0,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: drawerWidth,
  }),
  backgroundColor: "#f5f5f5",
  minHeight: "100vh",
}))

const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  boxShadow: "none",
  backgroundColor: "white",
  color: "black",
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}))

export default function Dashboard() {
  return (
    <Box sx={{ display: "flex" }}>
      <AppBarStyled position="fixed" open={true}>
        <Toolbar>
          <Typography variant="h5" noWrap component="div" sx={{ flexGrow: 1 }}>
            Dashboard
          </Typography>
          <IconButton size="large" color="inherit">
            <Badge badgeContent={1} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
            <Typography variant="body1" sx={{ mr: 1 }}>
              Nome
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Admin
            </Typography>
            <KeyboardArrowDownIcon />
          </Box>
        </Toolbar>
      </AppBarStyled>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#E91E63",
            color: "white",
          },
        }}
        variant="persistent"
        anchor="left"
        open={true}
      >
        <Sidebar />
      </Drawer>
      <Main open={true}>
        <Toolbar />
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
      </Main>
    </Box>
  )
}

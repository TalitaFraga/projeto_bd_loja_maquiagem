import React from "react";
import { Box, CssBaseline, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, AppBar } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import PeopleIcon from "@mui/icons-material/People";
import StoreIcon from "@mui/icons-material/Store";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AssignmentIcon from "@mui/icons-material/Assignment";
import HandshakeIcon from '@mui/icons-material/Handshake';

const drawerWidth = 240;

const menuItems = [
  { text: "Dashboard", icon: <AssignmentIcon />, path: "/dashboard" },
  { text: "Clientes", icon: <PeopleIcon />, path: "/clientes" },
  { text: "Produtos", icon: <StoreIcon />, path: "/produtos" },
  { text: "Vendas", icon: <ShoppingCartIcon />, path: "/vendas" },
  { text: "Fornecedores", icon: <HandshakeIcon />, path: "/lista-fornecedores" },
];

const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Maquiagem & Cia
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {menuItems.map(({ text, icon, path }) => (
              <ListItem key={text} disablePadding>
                <ListItemButton
                  component={Link}
                  to={path}
                  selected={location.pathname === path}
                >
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: "background.default", p: 3, minHeight: "100vh" }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;

import React, { useState } from "react";
import { 
  Box, 
  CssBaseline, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography, 
  AppBar,
  Collapse,
  Divider,
  Avatar
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Link, useLocation } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import StoreIcon from "@mui/icons-material/Store";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import InventoryIcon from '@mui/icons-material/Inventory';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import HistoryIcon from '@mui/icons-material/History';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PersonIcon from "@mui/icons-material/Person";

const drawerWidth = 280;

const LogoBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  margin: `${theme.spacing(0.5)} ${theme.spacing(2)}`,
  '&.Mui-selected': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    '& .MuiListItemIcon-root': {
      color: 'white'
    },
    '& .MuiListItemText-primary': {
      color: 'white',
      fontWeight: 600
    }
  },
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  }
}));

const StyledSubListItemButton = styled(ListItemButton)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  margin: `${theme.spacing(0.5)} ${theme.spacing(2)}`,
  paddingLeft: theme.spacing(4),
  '&.Mui-selected': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    '& .MuiListItemIcon-root': {
      color: 'white'
    },
    '& .MuiListItemText-primary': {
      color: 'white',
      fontWeight: 600
    }
  },
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  }
}));

const SidebarVendedor = ({ children }) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});

  const handleToggleMenu = (menuKey) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const menuItems = [
    { 
      text: "Dashboard", 
      icon: <HomeIcon />, 
      path: "/dashboard-vendedor",
      type: "single" 
    },
    {
      text: "Vendas",
      icon: <ShoppingCartIcon />,
      type: "submenu",
      key: "vendas",
      subItems: [
        { text: "Registro de Venda", icon: <AddShoppingCartIcon />, path: "/registro-venda" },
        { text: "Registro de Troca", icon: <SwapHorizIcon />, path: "/registro-troca" },
        { text: "Histórico de Vendas", icon: <HistoryIcon />, path: "/historico-vendas" }
      ]
    },
    {
      text: "Estoque",
      icon: <InventoryIcon />,
      type: "submenu",
      key: "estoque",
      subItems: [
        { text: "Cadastro de Produtos", icon: <StoreIcon />, path: "/produtos" },
        { text: "Visualizar Produtos", icon: <VisibilityIcon />, path: "/visualizar-produtos" }
      ]
    }
  ];

  const isPathActive = (path) => {
    return location.pathname === path;
  };

  const isSubmenuActive = (subItems) => {
    return subItems.some(item => location.pathname === item.path);
  };

  const renderMenuItem = (item) => {
    if (item.type === "single") {
      return (
        <ListItem key={item.text} disablePadding>
          <StyledListItemButton
            component={Link}
            to={item.path}
            selected={isPathActive(item.path)}
          >
            <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </StyledListItemButton>
        </ListItem>
      );
    }

    if (item.type === "submenu") {
      const isOpen = openMenus[item.key];
      const hasActiveChild = isSubmenuActive(item.subItems);

      return (
        <React.Fragment key={item.text}>
          <ListItem disablePadding>
            <StyledListItemButton
              onClick={() => handleToggleMenu(item.key)}
              selected={hasActiveChild}
            >
              <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
              {isOpen ? <ExpandLess /> : <ExpandMore />}
            </StyledListItemButton>
          </ListItem>
          
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.subItems.map((subItem) => (
                <ListItem key={subItem.text} disablePadding>
                  <StyledSubListItemButton
                    component={Link}
                    to={subItem.path}
                    selected={isPathActive(subItem.path)}
                  >
                    <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                      {subItem.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={subItem.text}
                      primaryTypographyProps={{
                        fontSize: '0.875rem'
                      }}
                    />
                  </StyledSubListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        </React.Fragment>
      );
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'white',
          color: '#333',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img 
              src="./logo_maquiagem_cia.png"
              alt="Maquiagem & Cia"
              style={{ 
                height: 45, 
                width: 'auto'
              }}
            />
            <Typography variant="h5" noWrap component="div" sx={{ 
              fontWeight: 700, 
              color: '#E91E63',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              Maquiagem & Cia
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ color: '#666', mr: 2 }}>
              Sistema de Vendas e Estoque
            </Typography>
            <ListItemButton
              component={Link}
              to="/dashboard-vendedor"
              sx={{
                borderRadius: 2,
                p: 1.5,
                minWidth: 'auto',
                backgroundColor: 'rgba(233, 30, 99, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(233, 30, 99, 0.2)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <HomeIcon sx={{ color: '#E91E63', fontSize: 32 }} />
            </ListItemButton>
          </Box>
        </Toolbar>
      </AppBar>

              <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: "border-box",
            backgroundColor: "#E91E63",
            color: "white",
            borderRight: 'none'
          },
        }}
      >
        <Toolbar />
        
        <LogoBox>
          <Box
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: 1,
              p: 1,
              mr: 2,
            }}
          >
            <PersonIcon />
          </Box>
          <Typography variant="h6" noWrap component="div">
            Vendedor
          </Typography>
        </LogoBox>

        <Box sx={{ overflow: "auto", flexGrow: 1 }}>
          <List>
            {menuItems.map(renderMenuItem)}
          </List>
        </Box>

        <Divider />
        <Box sx={{ pb: 2 }}>
          <List>
            <ListItem disablePadding sx={{ px: 2, py: 0.5 }}>
              <ListItemButton
                component={Link}
                to="/"
                sx={{
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                  <ExitToAppIcon />
                </ListItemIcon>
                <ListItemText primary="Sair" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

              <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          bgcolor: "#f5f5f5", 
          p: 3, 
          minHeight: "100vh" 
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default SidebarVendedor;
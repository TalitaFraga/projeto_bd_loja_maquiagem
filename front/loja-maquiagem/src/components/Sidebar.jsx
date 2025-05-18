import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import StoreIcon from '@mui/icons-material/Store';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HandshakeIcon from '@mui/icons-material/Handshake';
import BadgeIcon from '@mui/icons-material/Badge';

const Sidebar = () => {
  const menuItems = [
    { text: "Dashboard", icon: <AssignmentIcon />, path: "/" },
    { text: "Clientes", icon: <PeopleIcon />, path: "/clientes" },
    { text: "Produtos", icon: <StoreIcon />, path: "/produtos" },
    { text: "Vendas", icon: <ShoppingCartIcon />, path: "/vendas" },
    { text: "Fornecedores", icon: <HandshakeIcon />, path: "/lista-fornecedores" },
    { text: "Funcionários", icon: <BadgeIcon />, path: "/funcionarios" },
  ];

  return (
    <Drawer variant="permanent" anchor="left">
      <List>
        {menuItems.map(({ text, icon, path }) => (
          <ListItem button key={text} component={Link} to={path}>
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;

import { styled } from "@mui/material/styles"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import PieChartIcon from "@mui/icons-material/PieChart"
import BarChartIcon from "@mui/icons-material/BarChart"
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart"
import InventoryIcon from "@mui/icons-material/Inventory"
import AssessmentIcon from "@mui/icons-material/Assessment"
import SettingsIcon from "@mui/icons-material/Settings"
import ExitToAppIcon from "@mui/icons-material/ExitToApp"
import LinkIcon from "@mui/icons-material/Link"

const LogoBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
}))

export default function Sidebar() {
  return (
    <div>
      <LogoBox>
        <Box
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            borderRadius: 1,
            p: 1,
            mr: 2,
          }}
        >
          <LinkIcon />
        </Box>
        <Typography variant="h6" noWrap component="div">
          Diretor
        </Typography>
      </LogoBox>
      <List>
        {[
          { text: "Dashboard", icon: <PieChartIcon />, selected: true },
          { text: "Qualquer coisa", icon: <BarChartIcon /> },
          { text: "Venda", icon: <ShoppingCartIcon /> },
          { text: "Estoque", icon: <InventoryIcon /> },
          { text: "Relatórios", icon: <AssessmentIcon /> },
          { text: "Configurações", icon: <SettingsIcon /> },
        ].map((item, index) => (
          <ListItem key={item.text} disablePadding sx={{ px: 2, py: 0.5 }}>
            <ListItemButton selected={item.selected}>
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Box sx={{ position: "absolute", bottom: 0, width: "100%", pb: 2 }}>
        <List>
          <ListItem disablePadding sx={{ px: 2, py: 0.5 }}>
            <ListItemButton>
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                <ExitToAppIcon />
              </ListItemIcon>
              <ListItemText primary="Sair" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </div>
  )
}

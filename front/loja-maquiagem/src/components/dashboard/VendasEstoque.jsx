import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon, BarChart as BarChartIcon } from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const { quantidade_vendida, quantidade_estoque } = payload[0].payload;
    return (
      <Paper sx={{ p: 1 }}>
        <Typography variant="subtitle2">{label}</Typography>
        <Typography variant="body2">Vendas: {quantidade_vendida}</Typography>
        <Typography variant="body2">Estoque: {quantidade_estoque}</Typography>
      </Paper>
    );
  }
  return null;
};

const VendasEstoque = () => {
  const [graficoAberto, setGraficoAberto] = useState(false);
  const [dados, setDados] = useState([]);


  const fetchDados = async () => {
    try {
      const response = await fetch("http://localhost:8081/vendas/vendas-estoque");
      if (!response.ok) throw new Error("Erro ao buscar dados");
      const data = await response.json();
      setDados(data);
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };


  useEffect(() => {
    if (graficoAberto) {
      fetchDados();
    }
  }, [graficoAberto]);

  return (
    <Box>
      <Box textAlign="center" sx={{ my: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<BarChartIcon />}
          onClick={() => setGraficoAberto(true)}
          sx={{
            backgroundColor: '#F48FB1',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#F06292',
            },
          }}
        >
          Vendas e Estoque
        </Button>
      </Box>

      <Dialog
        open={graficoAberto}
        onClose={() => setGraficoAberto(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          Vendas e Estoque
          <IconButton onClick={() => setGraficoAberto(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: 500 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dados}
                margin={{ top: 20, right: 30, bottom: 120, left: 20 }}
              >
                <XAxis
                  dataKey="nome"
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                  height={120}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="quantidade_vendida" fill="#F48FB1" />
                <Bar dataKey="quantidade_estoque" fill="#81D4FA" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default VendasEstoque;

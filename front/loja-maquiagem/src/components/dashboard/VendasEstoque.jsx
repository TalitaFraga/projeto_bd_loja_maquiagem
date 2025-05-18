import React, { useState } from "react";
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
    const { vendas, estoque } = payload[0].payload;
    return (
      <Paper sx={{ p: 1 }}>
        <Typography variant="subtitle2">{label}</Typography>
        <Typography variant="body2">Vendas: {vendas}</Typography>
        <Typography variant="body2">Estoque: {estoque}</Typography>
      </Paper>
    );
  }
  return null;
};

const VendasEstoque = ({ produtos, itensVenda, estoque }) => {
  const [graficoAberto, setGraficoAberto] = useState(false);

  const vendasPorProduto = produtos.map(produto => {
    const totalVendido = itensVenda.reduce((acc, item) => {
      if (
        item.codigoBarra === produto.codigo_barra &&
        item.loteProduto === produto.lote_produto
      ) {
        return acc + item.qtdeProduto;
      }
      return acc;
    }, 0);

    const estoqueProduto = estoque.find(
      est =>
        est.codigoBarra === produto.codigo_barra &&
        est.loteProduto === produto.lote_produto
    );

    return {
      nome: produto.nome,
      vendas: totalVendido,
      estoque: estoqueProduto ? estoqueProduto.qtdeProduto : 0
    };
  });

  return (
    <>
      <Box textAlign="center" sx={{ my: 3 }}>
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
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Vendas e Estoque
          <IconButton onClick={() => setGraficoAberto(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: 500 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendasPorProduto} margin={{ top: 20, right: 30, bottom: 80, left: 20 }}>
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
                <Bar dataKey="vendas" fill="#F48FB1" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VendasEstoque;

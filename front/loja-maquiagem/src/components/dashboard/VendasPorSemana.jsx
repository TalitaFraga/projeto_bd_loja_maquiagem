import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon, BarChart as BarChartIcon } from "@mui/icons-material";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];


const diaSemanaIndex = (dia) => {
  const map = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };
  return map[dia] ?? -1;
};

const VendasPorSemana = () => {
  const [dataGrafico, setDataGrafico] = useState([]);
  const [graficoAberto, setGraficoAberto] = useState(false);
  const [nomesVendedores, setNomesVendedores] = useState([]);

  useEffect(() => {
    const fetchVendasPorSemana = async () => {
      try {
        const res = await axios.get("http://localhost:8081/vendas/vendas-por-vendedor-semana");
        const vendas = res.data;

        const vendedoresUnicos = Array.from(new Set(vendas.map(v => v.vendedor)));
        setNomesVendedores(vendedoresUnicos);

        const dias = Array(7).fill(null).map((_, i) => ({ dia: diasSemana[i] }));

        vendas.forEach(({ vendedor, dia_semana, qtd_vendas }) => {
          const idx = diaSemanaIndex(dia_semana);
          if (idx === -1) return;

          if (!dias[idx][vendedor]) {
            dias[idx][vendedor] = qtd_vendas;
          } else {
            dias[idx][vendedor] += qtd_vendas;
          }
        });

        setDataGrafico(dias);

      } catch (error) {
        console.error("Erro ao buscar vendas por semana:", error);
      }
    };

    fetchVendasPorSemana();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Button
        variant="contained"
        startIcon={<BarChartIcon />}
        onClick={() => setGraficoAberto(true)}
        sx={{
          backgroundColor: '#F48FB1',
          color: '#fff',
          '&:hover': { backgroundColor: '#F06292' },
        }}
      >
        Mostrar Gráfico
      </Button>

      <Dialog
        open={graficoAberto}
        onClose={() => setGraficoAberto(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Vendas da Semana
          <IconButton onClick={() => setGraficoAberto(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: 500 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <XAxis dataKey="dia" interval={0} angle={-35} textAnchor="end" height={120} tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                {nomesVendedores.map((nome, idx) => (
                  <Bar
                    key={nome}
                    dataKey={nome}
                    name={nome}
                    fill={`hsl(${(idx * 60) % 360}, 70%, 50%)`}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default VendasPorSemana;

import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
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


function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; 
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}


function getDiaSemana(date) {
  return diasSemana[date.getDay()];
}

const VendasPorSemana = () => {
  const [vendas, setVendas] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [graficoAberto, setGraficoAberto] = useState(false);
  const [dataGrafico, setDataGrafico] = useState([]);


  useEffect(() => {
    const fetchVendas = async () => {
      try {
        const res = await axios.get("http://localhost:8081/vendas");
        setVendas(res.data);
      } catch (error) {
        console.error("Erro ao buscar vendas:", error);
      }
    };
    fetchVendas();
  }, []);


  useEffect(() => {
    const fetchFuncionarios = async () => {
      try {
        const res = await axios.get("http://localhost:8081/funcionarios");
        setFuncionarios(res.data);
      } catch (error) {
        console.error("Erro ao buscar funcionários:", error);
      }
    };
    fetchFuncionarios();
  }, []);


  const getNomeVendedor = (cpf) => {
    const f = funcionarios.find((func) => func.cpf === cpf);
    return f ? f.nome : cpf;
  };

  useEffect(() => {
    if (vendas.length === 0) return;

    const hoje = new Date();
    const inicioSemana = getStartOfWeek(hoje);
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(fimSemana.getDate() + 6);
    fimSemana.setHours(23, 59, 59, 999);

    const vendasPorDia = {};

    vendas.forEach((venda) => {
      const dataVenda = new Date(venda.dataHoraVenda);
      if (dataVenda < inicioSemana || dataVenda > fimSemana) return;

      const dia = getDiaSemana(dataVenda);
      const nomeVendedor = getNomeVendedor(venda.cpfVendedor);

      if (!vendasPorDia[dia]) {
        vendasPorDia[dia] = {};
      }
      if (!vendasPorDia[dia][nomeVendedor]) {
        vendasPorDia[dia][nomeVendedor] = 0;
      }

      const totalItens = venda.itens.reduce(
        (acc, item) => acc + (item.qtdeProduto || 0),
        0
      );
      vendasPorDia[dia][nomeVendedor] += totalItens;
    });

    
    const ordemDias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

    const dataChart = ordemDias.map((dia) => ({
      dia,
      ...(vendasPorDia[dia] || {}),
    }));

    setDataGrafico(dataChart);
  }, [vendas, funcionarios]);

  
  const nomesVendedores = Array.from(
    new Set(
      vendas
        .filter((v) => {
          const dataVenda = new Date(v.dataHoraVenda);
          const inicioSemana = getStartOfWeek(new Date());
          const fimSemana = new Date(inicioSemana);
          fimSemana.setDate(fimSemana.getDate() + 6);
          fimSemana.setHours(23, 59, 59, 999);
          return dataVenda >= inicioSemana && dataVenda <= fimSemana;
        })
        .map((v) => getNomeVendedor(v.cpfVendedor))
        .filter(Boolean)
    )
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {/* <Typography variant="h5" gutterBottom>
        Vendas da Semana
      </Typography> */}

      <Button
        variant="contained"
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
        Mostrar Gráfico
      </Button>

      <Dialog
        open={graficoAberto}
        onClose={() => setGraficoAberto(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          Vendas da Semana
          <IconButton onClick={() => setGraficoAberto(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ height: 500 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dataGrafico}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <XAxis
                  dataKey="dia"
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                  height={120}
                  tick={{ fontSize: 12 }}
                />
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

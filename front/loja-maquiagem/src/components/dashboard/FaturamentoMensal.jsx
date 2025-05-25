import React, { useEffect, useState } from "react";
import { Typography, Paper, Box, MenuItem, Select, FormControl, InputLabel, CircularProgress } from "@mui/material";
import axios from "axios";

const FaturamentoMensal = () => {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anoSelecionado, setAnoSelecionado] = useState("");
  const [mesSelecionado, setMesSelecionado] = useState("");

  const fetchDados = async (ano, mes) => {
    setLoading(true);
    let url = "http://localhost:8081/vendas/faturamento";
    const params = [];

    if (ano) params.push(`ano=${ano}`);
    if (mes) params.push(`mes=${mes}`);

    if (params.length > 0) {
      url += "?" + params.join("&");
    }

    try {
      const res = await axios.get(url);
      setDados(res.data);
    } catch (err) {
      console.error("Erro ao buscar faturamento", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDados(anoSelecionado, mesSelecionado);
  }, [anoSelecionado, mesSelecionado]);

  const anos = ["2023", "2024", "2025"];
  const meses = [
    { value: "1", label: "Janeiro" },
    { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Maio" },
    { value: "6", label: "Junho" },
    { value: "7", label: "Julho" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ];

  return (
    <Paper sx={{ p: 3, borderRadius: 2, minHeight: 480, maxHeight: 500, overflow: "auto", width: 420, alignItems: "center", 
      flexDirection: "column", display:"flex", gap:2
     }}>
      <Typography variant="h5" gutterBottom>
        Faturamento Mensal
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Ano</InputLabel>
          <Select
            value={anoSelecionado}
            label="Ano"
            onChange={(e) => setAnoSelecionado(e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            {anos.map((ano) => (
              <MenuItem key={ano} value={ano}>{ano}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120}}>
          <InputLabel>Mês</InputLabel>
          <Select
            value={mesSelecionado}
            label="Mês"
            onChange={(e) => setMesSelecionado(e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            {meses.map((mes) => (
              <MenuItem key={mes.value} value={mes.value}>{mes.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <CircularProgress sx={{ mt: 4 }} />
      ) : (
        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "center", padding: "4px" }}>Mês</th>
              <th style={{ textAlign: "center", padding: "4px" }}>Total Vendas (R$)</th>
            </tr>
          </thead>
          <tbody>
            {dados.length === 0 ? (
              <tr><td colSpan={2}>Nenhum dado encontrado</td></tr>
            ) : (
              dados.map((item, i) => (
                <tr key={i}>
                  <td style={{textAlign: "center", padding: "4px" }}>{item.mes}</td>
                  <td style={{textAlign: "center", padding: "4px" }}>{Number(item.total_vendas).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </Box>
      )}
    </Paper>
  );
};

export default FaturamentoMensal;
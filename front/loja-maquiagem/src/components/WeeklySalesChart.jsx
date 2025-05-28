import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    BarChart,
    Bar,
    XAxis,
    Legend,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip
} from "recharts";
import {
    Box,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";

export default function VendasChart({ sx }) {
    const [dadosGrafico, setDadosGrafico] = useState([]);
    const [periodo, setPeriodo] = useState('semanal');
    const [loading, setLoading] = useState(true);
    const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear().toString());
    const anosDisponiveis = ["2023", "2024", "2025", "2026"]; // Ou popule dinamicamente

    const cpfVendedor = localStorage.getItem("cpfVendedor");

    const handlePeriodoChange = (_, newPeriodo) => {
        if (newPeriodo !== null) {
            setPeriodo(newPeriodo);
        }
    };

    const handleAnoChange = (event) => {
        setAnoSelecionado(event.target.value);
    };

    useEffect(() => {
        async function fetchData() {
            if (!cpfVendedor) {
                console.warn("CPF do vendedor não encontrado no localStorage.");
                setDadosGrafico([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const params = {
                    periodo: periodo,
                    cpfVendedor: cpfVendedor,
                };
                if (anoSelecionado) {
                    params.ano = parseInt(anoSelecionado);
                }

                const res = await axios.get("http://localhost:8081/vendas/vendas-chart", { params });
                setDadosGrafico(res.data || []);
            } catch (error) {
                console.error("Erro ao buscar dados para gráfico (VendasChart):", error);
                setDadosGrafico([]);
            } finally {
                setLoading(false);
            }
        }

        if (periodo && cpfVendedor) {
            fetchData();
        } else {
            setDadosGrafico([]);
            setLoading(false);
        }

    }, [periodo, cpfVendedor, anoSelecionado]);

    return (
        <Box sx={{ width: "100%", p: 2, ...sx }}>
            <Typography variant="h6" sx={{ mb: 1, textAlign: 'center' }}>
                Desempenho de Vendas {anoSelecionado && `(${anoSelecionado})`}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                <ToggleButtonGroup
                    value={periodo}
                    exclusive
                    onChange={handlePeriodoChange}
                    aria-label="Período"
                >
                    <ToggleButton value="semanal" aria-label="Semanal">Semanal</ToggleButton>
                    <ToggleButton value="mensal" aria-label="Mensal">Mensal</ToggleButton>
                    <ToggleButton value="trimestral" aria-label="Trimestral">Trimestral</ToggleButton>
                </ToggleButtonGroup>

                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel id="ano-select-label">Ano</InputLabel>
                    <Select
                        labelId="ano-select-label"
                        id="ano-select"
                        value={anoSelecionado}
                        label="Ano"
                        onChange={handleAnoChange}
                    >
                        {anosDisponiveis.map((ano) => (
                            <MenuItem key={ano} value={ano}>{ano}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                    <CircularProgress />
                </Box>
            ) : dadosGrafico.length === 0 ? (
                <Typography sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
                    Nenhum dado de venda encontrado para o período e filtros selecionados.
                </Typography>
            ) : (
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                        data={dadosGrafico}
                        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: 14, paddingTop: 10 }} />
                        <Bar dataKey="vendedor" name="Minhas Vendas (Qtd)" fill="#2196F3" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar dataKey="total" name="Total Vendas Loja (Qtd)" fill="#FF9800" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </Box>
    );
}

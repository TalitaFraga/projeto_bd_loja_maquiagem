import { useEffect, useState } from "react";
import axios from "axios";
import {
    BarChart,
    Bar,
    XAxis,
    Legend,
    YAxis,
    CartesianGrid,
    ResponsiveContainer
} from "recharts";
import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";

const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const meses = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function VendasChart({ sx }) {
    const [dadosGrafico, setDadosGrafico] = useState([]);
    const [periodo, setPeriodo] = useState('semanal');

    const handlePeriodoChange = (_, newPeriodo) => {
        if (newPeriodo !== null) {
            setPeriodo(newPeriodo);
        }
    };

    useEffect(() => {
        async function fetchData() {
            const cpfFormatado = localStorage.getItem("cpfVendedor");
            if (!cpfFormatado) return;

            try {
                const resVendas = await axios.get("http://localhost:8081/vendas");
                const vendas = resVendas.data || [];

                let dados = [];

                if (periodo === 'semanal') {
                    const vendasPorDiaVendedor = {};
                    const vendasPorDiaTotal = {};

                    vendas.forEach(venda => {
                        const dia = new Date(venda.dataHoraVenda).getDay();
                        const nomeDia = diasSemana[dia];
                        const quantidadeVendida = (venda.itens || []).reduce((acc, item) => acc + (item.qtdeProduto || 0), 0);

                        vendasPorDiaTotal[nomeDia] = (vendasPorDiaTotal[nomeDia] || 0) + quantidadeVendida;

                        if (venda.cpfVendedor === cpfFormatado) {
                            vendasPorDiaVendedor[nomeDia] = (vendasPorDiaVendedor[nomeDia] || 0) + quantidadeVendida;
                        }
                    });

                    dados = diasSemana.map(dia => ({
                        name: dia,
                        vendedor: vendasPorDiaVendedor[dia] || 0,
                        total: vendasPorDiaTotal[dia] || 0
                    }));

                } else if (periodo === 'mensal') {
                    const vendasPorMesVendedor = {};
                    const vendasPorMesTotal = {};

                    vendas.forEach(venda => {
                        const mes = new Date(venda.dataHoraVenda).getMonth();
                        const quantidadeVendida = (venda.itens || []).reduce((acc, item) => acc + (item.qtdeProduto || 0), 0);

                        vendasPorMesTotal[mes] = (vendasPorMesTotal[mes] || 0) + quantidadeVendida;

                        if (venda.cpfVendedor === cpfFormatado) {
                            vendasPorMesVendedor[mes] = (vendasPorMesVendedor[mes] || 0) + quantidadeVendida;
                        }
                    });

                    dados = meses.map((mesNome, index) => ({
                        name: mesNome,
                        vendedor: vendasPorMesVendedor[index] || 0,
                        total: vendasPorMesTotal[index] || 0
                    }));

                } else if (periodo === 'trimestral') {
                    const vendasPorTriVendedor = {};
                    const vendasPorTriTotal = {};

                    vendas.forEach(venda => {
                        const mes = new Date(venda.dataHoraVenda).getMonth();
                        const trimestre = Math.floor(mes / 3) + 1;
                        const nomeTri = `T${trimestre}`;
                        const quantidadeVendida = (venda.itens || []).reduce((acc, item) => acc + (item.qtdeProduto || 0), 0);

                        vendasPorTriTotal[nomeTri] = (vendasPorTriTotal[nomeTri] || 0) + quantidadeVendida;

                        if (venda.cpfVendedor === cpfFormatado) {
                            vendasPorTriVendedor[nomeTri] = (vendasPorTriVendedor[nomeTri] || 0) + quantidadeVendida;
                        }
                    });

                    dados = ["T1", "T2", "T3", "T4"].map(tri => ({
                        name: tri,
                        vendedor: vendasPorTriVendedor[tri] || 0,
                        total: vendasPorTriTotal[tri] || 0
                    }));
                }

                setDadosGrafico(dados);
            } catch (error) {
                console.error("Erro ao buscar dados para gráfico:", error);
            }
        }

        fetchData();
    }, [periodo]);

    return (
        <Box sx={{ width: "100%", ...sx }}>  {/* Adicione sx aqui */}
            <Typography variant="h6" sx={{ mb: 2 }}>
                Vendas - {periodo.charAt(0).toUpperCase() + periodo.slice(1)}
            </Typography>

            <ToggleButtonGroup
                value={periodo}
                exclusive
                onChange={handlePeriodoChange}
                aria-label="Período"
                sx={{ mb: 3 }}
            >
                <ToggleButton value="semanal">Semanal</ToggleButton>
                <ToggleButton value="mensal">Mensal</ToggleButton>
                <ToggleButton value="trimestral">Trimestral</ToggleButton>
            </ToggleButtonGroup>

            <ResponsiveContainer width="100%" height={400}>  {/* Aumente a altura para 400 */}
                <BarChart
                    data={dadosGrafico}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Bar dataKey="vendedor" fill="#2196F3" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="total" fill="#FF9800" radius={[4, 4, 0, 0]} barSize={20} />
                    <Legend />
                </BarChart>
            </ResponsiveContainer>
        </Box>
    );
}
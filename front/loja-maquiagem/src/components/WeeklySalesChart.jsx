import { useEffect, useState } from "react"
import axios from "axios"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Legend,
} from "recharts"
import Box from "@mui/material/Box"

const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

export default function WeeklySalesChart() {
    const [dadosGrafico, setDadosGrafico] = useState([])
    const [cores, setCores] = useState({})
    const [legendas, setLegendas] = useState([])

    useEffect(() => {
        async function fetchData() {
            try {
                const [resVendas, resVendedores] = await Promise.all([
                    axios.get("http://localhost:8081/vendas"),
                    axios.get("http://localhost:8081/vendedores"),
                ])

                const vendas = resVendas.data || []
                const vendedores = resVendedores.data || []

                const mapaCpfParaNome = {}
                vendedores.forEach(v => {
                    mapaCpfParaNome[v.cpf] = v.nome
                })

                // Agrupa as vendas por dia da semana e vendedor
                const vendasPorDia = {}

                vendas.forEach(venda => {
                    const dia = new Date(venda.dataHoraVenda).getDay()
                    const nomeDia = diasSemana[dia]
                    const vendedorCpf = venda.cpfVendedor
                    const nomeVendedor = mapaCpfParaNome[vendedorCpf] || vendedorCpf

                    if (!vendasPorDia[nomeDia]) vendasPorDia[nomeDia] = {}
                    if (!vendasPorDia[nomeDia][nomeVendedor]) vendasPorDia[nomeDia][nomeVendedor] = 0

                    const quantidadeVendida = (venda.itens || []).reduce(
                        (acc, item) => acc + (item.qtdeProduto || 0),
                        0
                    )

                    vendasPorDia[nomeDia][nomeVendedor] += quantidadeVendida
                })

                // Define cores únicas por vendedor
                const nomesVendedores = new Set()
                Object.values(vendasPorDia).forEach(v => {
                    Object.keys(v).forEach(nome => nomesVendedores.add(nome))
                })

                const corBase = ["#2196F3", "#00E676", "#FF9800", "#9C27B0", "#EF5350"]
                const coresPorVendedor = {}
                Array.from(nomesVendedores).forEach((nome, idx) => {
                    coresPorVendedor[nome] = corBase[idx % corBase.length]
                })

                // Monta dados no formato do Recharts
                const dados = diasSemana.map(dia => {
                    const linha = { name: dia }
                    const vendasDoDia = vendasPorDia[dia] || {}
                    Object.keys(vendasDoDia).forEach(nomeVendedor => {
                        linha[nomeVendedor] = vendasDoDia[nomeVendedor]
                    })
                    return linha
                })

                setDadosGrafico(dados)
                setCores(coresPorVendedor)
                setLegendas(Object.entries(coresPorVendedor).map(([nome, cor]) => ({
                    value: nome,
                    type: "circle",
                    color: cor,
                })))
            } catch (error) {
                console.error("Erro ao buscar dados para gráfico de vendas semanais:", error)
            }
        }

        fetchData()
    }, [])

    return (
        <Box sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={dadosGrafico}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    {Object.entries(cores).map(([vendedor, cor]) => (
                        <Bar
                            key={vendedor}
                            dataKey={vendedor}
                            fill={cor}
                            radius={[4, 4, 0, 0]}
                            barSize={20}
                        />
                    ))}
                    <Legend iconType="circle" payload={legendas} />
                </BarChart>
            </ResponsiveContainer>
        </Box>
    )
}

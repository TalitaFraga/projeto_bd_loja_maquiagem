import { useEffect, useState } from "react"
import axios from "axios"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"

export default function SalesChart() {
    const [data, setData] = useState([])
    const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear())
    const [anosDisponiveis, setAnosDisponiveis] = useState([])
    const [agrupamento, setAgrupamento] = useState("mes")

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await axios.get("http://localhost:8081/vendas")
                const vendas = res.data || []

                const anos = new Set()
                vendas.forEach(v => {
                    const ano = new Date(v.dataHoraVenda).getFullYear()
                    anos.add(ano)
                })
                setAnosDisponiveis(Array.from(anos).sort())

                processarVendas(vendas, anoSelecionado, agrupamento)
            } catch (error) {
                console.error("Erro ao buscar dados de vendas:", error)
            }
        }

        fetchData()
    }, [anoSelecionado, agrupamento])

    function processarVendas(vendas, ano, agrupamento) {
        const clientes = new Set()

        let labels = []
        let agrupamentoFunc

        if (agrupamento === "mes") {
            labels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
            agrupamentoFunc = (mes) => mes // 0-11
        } else if (agrupamento === "trimestre") {
            labels = ["Q1", "Q2", "Q3", "Q4"]
            agrupamentoFunc = (mes) => Math.floor(mes / 3) // 0-3
        } else if (agrupamento === "semestre") {
            labels = ["S1", "S2"]
            agrupamentoFunc = (mes) => Math.floor(mes / 6) // 0-1
        }

        const vendasAgrupadas = Array(labels.length).fill(0).map(() => ({ loyal: 0, new: 0 }))

        vendas.forEach(venda => {
            const dataVenda = new Date(venda.dataHoraVenda)
            const anoVenda = dataVenda.getFullYear()

            if (anoVenda !== ano) return

            const mes = dataVenda.getMonth()
            const grupo = agrupamentoFunc(mes)

            const cpfCliente = venda.cpfCliente
            const quantidadeVendida = (venda.itens || []).reduce(
                (acc, item) => acc + (item.qtdeProduto || 0),
                0
            )

            if (clientes.has(cpfCliente)) {
                vendasAgrupadas[grupo].loyal += quantidadeVendida
            } else {
                clientes.add(cpfCliente)
                vendasAgrupadas[grupo].new += quantidadeVendida
            }
        })

        const dadosGrafico = labels.map((label, idx) => ({
            name: label,
            loyal: vendasAgrupadas[idx].loyal,
            new: vendasAgrupadas[idx].new
        }))

        setData(dadosGrafico)
    }

    return (
        <Box sx={{ height: 300 }}>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>Ano</InputLabel>
                    <Select
                        value={anoSelecionado}
                        label="Ano"
                        onChange={(e) => setAnoSelecionado(e.target.value)}
                    >
                        {anosDisponiveis.map(ano => (
                            <MenuItem key={ano} value={ano}>{ano}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Agrupamento</InputLabel>
                    <Select
                        value={agrupamento}
                        label="Agrupamento"
                        onChange={(e) => setAgrupamento(e.target.value)}
                    >
                        <MenuItem value="mes">Por Mês</MenuItem>
                        <MenuItem value="trimestre">Por Trimestre</MenuItem>
                        <MenuItem value="semestre">Por Semestre</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <ResponsiveContainer width="100%" height={210}>
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Line type="monotone" dataKey="loyal" stroke="#9C27B0" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="new" stroke="#F44336" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mr: 3 }}>
                    <Box sx={{ width: 12, height: 12, backgroundColor: "#9C27B0", borderRadius: "50%", mr: 1 }} />
                    <Typography variant="body2">Clientes Fidelizados</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box sx={{ width: 12, height: 12, backgroundColor: "#F44336", borderRadius: "50%", mr: 1 }} />
                    <Typography variant="body2">Novos Clientes</Typography>
                </Box>
            </Box>
        </Box>
    )
}

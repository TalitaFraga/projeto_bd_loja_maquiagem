import { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip,
  LinearProgress,
  Paper,
} from "@mui/material";

export default function TopSellingProductsTable() {
  const [produtosMaisVendidos, setProdutosMaisVendidos] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const cpfVendedor = localStorage.getItem("cpfVendedor");

        const [resVendas, resProdutos] = await Promise.all([
          axios.get("http://localhost:8081/vendas"),
          axios.get("http://localhost:8081/produtos"),
        ]);

        const vendas = resVendas.data || [];
        const produtos = resProdutos.data || [];

        const vendasDoVendedor = vendas.filter(
            (venda) => venda.cpfVendedor === cpfVendedor
        );

        const itens = vendasDoVendedor.flatMap((venda) => venda.itens || []);

        const mapaNomes = produtos.reduce((mapa, produto) => {
          mapa[produto.codigo_barra] = produto.nome;
          return mapa;
        }, {});

        const vendasPorProduto = {};

        itens.forEach((item) => {
          const id = item.codigoBarra || "semId";
          if (!vendasPorProduto[id]) {
            vendasPorProduto[id] = {
              id,
              name: mapaNomes[id] || `Produto ${id}`,
              quantity: 0,
            };
          }
          vendasPorProduto[id].quantity += item.qtdeProduto || 0;
        });

        const produtosOrdenados = Object.values(vendasPorProduto)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        const maiorQuantidade = produtosOrdenados[0]?.quantity || 1;

        const produtosComProgresso = produtosOrdenados.map((produto) => ({
          ...produto,
          progress: Math.round((produto.quantity / maiorQuantidade) * 100),
        }));

        setProdutosMaisVendidos(produtosComProgresso);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    }

    fetchData();
  }, []);

  return (
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Vendas</TableCell>
              <TableCell>Quantidade</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {produtosMaisVendidos.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box sx={{ flexGrow: 1, mr: 1 }}>
                        <LinearProgress
                            variant="determinate"
                            value={row.progress}
                            sx={{
                              height: 8,
                              borderRadius: 5,
                              backgroundColor: "#f5f5f5",
                              "& .MuiLinearProgress-bar": {
                                backgroundColor: "#2196F3",
                              },
                            }}
                        />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={row.quantity} size="small" />
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
  );
}

import { useEffect, useState } from "react";
import axios from "axios";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";

export default function TopCustomersTable() {
  const [clientes, setClientes] = useState([]);
  const [vendas, setVendas] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [resClientes, resVendas] = await Promise.all([
          axios.get("http://localhost:8081/clientes"),
          axios.get("http://localhost:8081/vendas"),
        ]);
        setClientes(resClientes.data || []);
        setVendas(resVendas.data || []);
      } catch (error) {
        console.error("Erro ao buscar dados de clientes ou vendas", error);
      }
    }

    fetchData();
  }, []);

  const cpfVendedor = localStorage.getItem("cpfVendedor");

  const clientesComCompras = clientes.map((cliente) => {
    // Filtra vendas do cliente feitas pelo vendedor logado
    const comprasDoCliente = vendas.filter(
        (venda) => venda.cpfCliente === cliente.cpf && venda.cpfVendedor === cpfVendedor
    );

    const totalCompras = comprasDoCliente.reduce((acc, venda) => {
      const total = (venda.itens || []).reduce(
          (soma, item) => soma + (item.qtdeProduto || 0),
          0
      );
      return acc + total;
    }, 0);

    const ultimaCompra = comprasDoCliente.reduce((maisRecente, vendaAtual) => {
      const dataAtual = new Date(vendaAtual.dataHoraVenda);
      return dataAtual > new Date(maisRecente)
          ? vendaAtual.dataHoraVenda
          : maisRecente;
    }, "1970-01-01T00:00:00Z");

    return {
      id: cliente.cpf,
      name: cliente.nome,
      totalCompras,
      ultimaCompra:
          ultimaCompra === "1970-01-01T00:00:00Z"
              ? "Nunca"
              : new Date(ultimaCompra).toLocaleDateString("pt-BR"),
    };
  });

  // Filtra apenas clientes que compraram com o vendedor logado
  const clientesQueCompraram = clientesComCompras.filter(
      (cliente) => cliente.totalCompras > 0
  );

  // Ordena pelo total de compras e pega os 4 maiores
  const topClientes = [...clientesQueCompraram]
      .sort((a, b) => b.totalCompras - a.totalCompras)
      .slice(0, 4);

  return (
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Compras</TableCell>
              <TableCell>Última compra</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {topClientes.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    <Box
                        sx={{
                          backgroundColor: "#E3F2FD",
                          borderRadius: 1,
                          p: 0.5,
                          display: "inline-block",
                          color: "#1976D2",
                        }}
                    >
                      {row.totalCompras}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                        label={row.ultimaCompra}
                        size="small"
                        sx={{
                          backgroundColor: "#E8F5E9",
                          color: "#388E3C",
                        }}
                    />
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
  );
}
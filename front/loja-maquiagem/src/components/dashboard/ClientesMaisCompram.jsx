import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Paper
} from "@mui/material";
import axios from "axios";

const ClientesMaisCompram = () => {
  const [clientesCompras, setClientesCompras] = useState([]);

  useEffect(() => {
    const fetchVendas = async () => {
      try {
        const resVendas = await axios.get("http://localhost:8081/vendas");
        const resPessoas = await axios.get("http://localhost:8081/pessoas");

        const vendas = resVendas.data;
        const pessoas = resPessoas.data;

        // Criar mapa CPF -> nome para busca rápida
        const mapaCpfNome = {};
        pessoas.forEach(pessoa => {
          mapaCpfNome[pessoa.cpf] = pessoa.nome;
        });

        const clientesMap = {};

        vendas.forEach(venda => {
          const cpf = venda.cpfCliente || "Desconhecido";
          const nome = mapaCpfNome[cpf] || "Sem nome";

          if (!clientesMap[cpf]) {
            clientesMap[cpf] = { nome, cpf, compras: 0 };
          }

          clientesMap[cpf].compras += 1;  // Conta o número de compras
        });

        // Ordenar por número de compras descrescente
        const listaClientes = Object.values(clientesMap).sort((a, b) => b.compras - a.compras);
        setClientesCompras(listaClientes);
      } catch (error) {
        console.error("Erro ao buscar vendas:", error);
      }
    };

    fetchVendas();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Clientes que Mais Compram
      </Typography>
      <Paper sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Nome</strong></TableCell>
              <TableCell><strong>CPF</strong></TableCell>
              <TableCell><strong>Compras</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientesCompras.map((cliente, index) => (
              <TableRow key={index}>
                <TableCell>{cliente.nome}</TableCell>
                <TableCell>{cliente.cpf}</TableCell>
                <TableCell>{cliente.compras}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default ClientesMaisCompram;

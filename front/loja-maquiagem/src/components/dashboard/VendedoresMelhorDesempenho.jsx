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

const VendedoresMelhorDesempenho = () => {
  const [vendedoresVendas, setVendedoresVendas] = useState([]);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const resVendas = await axios.get("http://localhost:8081/vendas");
        const resPessoas = await axios.get("http://localhost:8081/pessoas");

        const vendas = resVendas.data;
        const pessoas = resPessoas.data;

        // Mapa CPF → nome
        const mapaCpfNome = {};
        pessoas.forEach(pessoa => {
          mapaCpfNome[pessoa.cpf] = pessoa.nome;
        });

        const vendedoresMap = {};

        vendas.forEach(venda => {
          const cpf = venda.cpfVendedor || "Desconhecido";
          const nome = mapaCpfNome[cpf] || "Sem nome";

          if (!vendedoresMap[cpf]) {
            vendedoresMap[cpf] = { nome, cpf, vendasRealizadas: 0 };
          }

          vendedoresMap[cpf].vendasRealizadas += 1;
        });

        // Ordenar pelo número de vendas realizadas descrescente
        const listaVendedores = Object.values(vendedoresMap).sort(
          (a, b) => b.vendasRealizadas - a.vendasRealizadas
        );

        setVendedoresVendas(listaVendedores);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchDados();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Vendedores com Melhor Desempenho
      </Typography>
      <Paper sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Nome</strong></TableCell>
              <TableCell><strong>CPF</strong></TableCell>
              <TableCell><strong>Vendas Realizadas</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vendedoresVendas.map((vendedor, index) => (
              <TableRow key={index}>
                <TableCell>{vendedor.nome}</TableCell>
                <TableCell>{vendedor.cpf}</TableCell>
                <TableCell>{vendedor.vendasRealizadas}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default VendedoresMelhorDesempenho;

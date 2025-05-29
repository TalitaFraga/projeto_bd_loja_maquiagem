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
    const fetchClientes = async () => {
      try {
        const response = await axios.get("http://localhost:8081/clientes/mais-compram");
        setClientesCompras(response.data);
      } catch (error) {
        console.error("Erro ao buscar clientes que mais compram:", error);
      }
    };

    fetchClientes();
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
                <TableCell>{cliente.qtdCompras}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
};

export default ClientesMaisCompram;

import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Paper,
  TextField,
  Button,
  Box
} from "@mui/material";
import axios from "axios";

const VendedoresMelhorDesempenho = () => {
  const [vendedoresVendas, setVendedoresVendas] = useState([]);
  const [mes, setMes] = useState(0);
  const [ano, setAno] = useState(new Date().getFullYear());
  useEffect(() => {
  buscarVendas();
  }, []);


  const buscarVendas = async () => {
    try {
      const res = await axios.get("http://localhost:8081/vendedores/desempenho", {
        params: { ano: ano, mes: mes }
      });

      const listaVendedores = res.data;

      setVendedoresVendas(listaVendedores);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    }
  };


  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Vendedores com Melhor Desempenho
      </Typography>

      <Paper sx={{ mt: 3, maxHeight: 400, overflow: "auto" }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell><strong>Nome</strong></TableCell>
            <TableCell><strong>CPF</strong></TableCell>
            <TableCell><strong>Vendas Realizadas</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {vendedoresVendas.length > 0 ? (
            vendedoresVendas.map((vendedor, index) => (
              <TableRow key={vendedor.cpf}>
                <TableCell>{vendedor.nome}</TableCell>
                <TableCell>{vendedor.cpf}</TableCell>
                <TableCell>{vendedor.quantidade_vendas}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} align="center">
                Nenhuma venda encontrada para esse período.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </Paper>
      
      <Paper
        sx={{
          mt: 2,
          p: 2,
          display: "flex",
          alignItems: "flex",
          gap: 5,
          flexWrap: "wrap",
        }}
        >
        <TextField
          label="Mês"
          type="number"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          inputProps={{ min: 0, max: 12 }}
          sx={{ width: 100 }}
          helperText="0 = ano todo"
        />
        <TextField
          label="Ano"
          type="number"
          value={ano}
          onChange={(e) => setAno(e.target.value)}
          inputProps={{ min: 1900, max: 2100 }}
          sx={{ width: 220 }}
        />
        <Box sx={{ height: '100%' }}>
          <Button
            variant="contained"
            onClick={buscarVendas}
            size="small"
            sx={{
              backgroundColor: '#F48FB1',
              color: '#fff',
              paddingY: 0.5,
              minHeight: '56px',
              '&:hover': {
                backgroundColor: '#F06292',
              },
            }}
          >
            BUSCAR
          </Button>
        </Box>
      </Paper>

    </Container>
  );
};

export default VendedoresMelhorDesempenho;
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
} from "@mui/material";

const ListaPessoas = () => {
  const [pessoas, setPessoas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:8080/pessoas")
      .then((response) => {
        setPessoas(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar pessoas:", error);
        setLoading(false);
      });
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Paper elevation={4} sx={{ p: 3, backgroundColor: '#F3F3F3' }}>
        <Typography variant="h4" gutterBottom color="#D81B60">
          Lista de Pessoas
        </Typography>

        {loading ? (
          <CircularProgress />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>CPF</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Telefone</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pessoas.map((pessoa) => (
                  <TableRow key={pessoa.cpf}>
                    <TableCell>{pessoa.nome}</TableCell>
                    <TableCell>{pessoa.cpf}</TableCell>
                    <TableCell>{pessoa.email}</TableCell>
                    <TableCell>{pessoa.telefone1}</TableCell>
                    <TableCell align="right">
                      <Button 
                        variant="outlined" 
                        size="small" 
                        sx={{ 
                          mr: 1, 
                          borderColor: '#D81B60', 
                          color: '#D81B60', 
                          "&:hover": { borderColor: '#9C4D97', color: '#9C4D97' } 
                        }}>
                        Editar
                      </Button>
                      <Button 
                        variant="contained" 
                        color="error" 
                        size="small" 
                        sx={{ 
                          backgroundColor: '#D81B60', 
                          "&:hover": { backgroundColor: '#9C4D97' } 
                        }}>
                        Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default ListaPessoas;

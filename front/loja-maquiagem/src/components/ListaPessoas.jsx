import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");


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

  const handleExcluir = (cpf) => {
    if (window.confirm("Tem certeza que deseja excluir essa pessoa?")) {
      axios.delete(`http://localhost:8080/pessoas/${cpf}`)
        .then(() => {
          setPessoas(pessoas.filter(p => p.cpf !== cpf));
          setSnackbarMessage("Pessoa excluída com sucesso!");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
        })
        .catch((error) => {
          console.error("Erro ao excluir pessoa:", error);
          setSnackbarMessage("Erro ao excluir pessoa.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        });
    }
  };
  

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

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
                      <Link to={`/pessoas/${pessoa.cpf}`} style={{ textDecoration: 'none' }}>
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
                      </Link>
                      <Button 
                        variant="contained" 
                        color="error" 
                        size="small" 
                        sx={{ 
                          backgroundColor: '#D81B60', 
                          "&:hover": { backgroundColor: '#9C4D97' } 
                        }}
                        onClick={()=> handleExcluir(pessoa.cpf)}
                      >
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

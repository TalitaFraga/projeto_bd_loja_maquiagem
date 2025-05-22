import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import debounce from "lodash/debounce";
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
  Snackbar,
  Alert,
  TextField,
  Stack,
  Autocomplete,
  Box,
} from "@mui/material";

const ListaFornecedores = () => {
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [opcoesNomes, setOpcoesNomes] = useState([]);
  const [inputBusca, setInputBusca] = useState("");

  useEffect(() => {
    axios.get("http://localhost:8081/fornecedores")
      .then((response) => {
        setFornecedores(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar fornecedores:", error);
        setLoading(false);
      });
  }, []);

  const buscarSugestoesPorNome = debounce((input) => {
    if (!input) return;

    axios.get(`http://localhost:8081/fornecedores/por-nome?nome=${encodeURIComponent(input)}`)
      .then((res) => {
        const nomes = res.data.map(f => f.nome);
        setOpcoesNomes(nomes);
      })
      .catch((err) => {
        console.error("Erro ao buscar sugestões:", err);
      });
  }, 400);

  const handleBuscarPorNome = (nome) => {
    if (!nome.trim()) return;

    setLoading(true);
    axios.get(`http://localhost:8081/fornecedores/por-nome?nome=${encodeURIComponent(nome)}`)
      .then((response) => {
        setFornecedores(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao buscar por nome:", error);
        setSnackbarMessage("Erro ao buscar fornecedor por nome.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setLoading(false);
      });
  };

  const handleExcluir = (cnpj) => {
    if (window.confirm("Tem certeza que deseja excluir esse fornecedor?")) {
      axios.delete(`http://localhost:8081/fornecedores/${cnpj}`)
        .then(() => {
          setFornecedores(fornecedores.filter(f => f.cnpj !== cnpj));
          setSnackbarMessage("Fornecedor excluído com sucesso!");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
        })
        .catch((error) => {
          console.error("Erro ao excluir fornecedor:", error);
          setSnackbarMessage("Erro ao excluir fornecedor.");
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
          Lista de Fornecedores
        </Typography>

        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Box sx={{flex: 1}}>
            <Autocomplete
              freeSolo
              options={opcoesNomes}
              inputValue={inputBusca}
              onInputChange={(event, newInputValue) => {
                setInputBusca(newInputValue);
                buscarSugestoesPorNome(newInputValue);
              }}
              onChange={(event, newValue) => {
                if (newValue) {
                  handleBuscarPorNome(newValue);
                }
              }}
              renderInput={(params) => (
                <TextField {...params} label="Buscar por nome" variant="outlined" fullWidth />
              )}
            />
          </Box>
          <Button 
            variant="contained" 
            onClick={() => handleBuscarPorNome(inputBusca)}
            sx={{ backgroundColor: '#D81B60', "&:hover": { backgroundColor: '#9C4D97' } }}
          >
            Buscar
          </Button>
        </Stack>

        {loading ? (
          <CircularProgress />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>CNPJ</TableCell>
                  <TableCell>Telefone 1</TableCell>
                  <TableCell>Telefone 2</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fornecedores.map((fornecedor) => (
                  <TableRow key={fornecedor.cnpj}>
                    <TableCell>{fornecedor.nome}</TableCell>
                    <TableCell>{fornecedor.cnpj}</TableCell>
                    <TableCell>{fornecedor.telefone1}</TableCell>
                    <TableCell>{fornecedor.telefone2}</TableCell>
                    <TableCell align="right">
                      <Link to={`/editar-fornecedor/${fornecedor.cnpj}`} style={{ textDecoration: 'none' }}>
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
                        onClick={() => handleExcluir(fornecedor.cnpj)}
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

export default ListaFornecedores;

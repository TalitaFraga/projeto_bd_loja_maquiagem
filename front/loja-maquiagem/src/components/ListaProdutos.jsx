import React, { useEffect, useState } from "react";
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

const ListaProdutos = () => {
    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [opcoesNomes, setOpcoesNomes] = useState([]);
    const [inputBusca, setInputBusca] = useState("");

    useEffect(() => {
        axios.get("http://localhost:8081/produtos")
            .then((response) => {
                setProdutos(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Erro ao buscar produtos:", error);
                setLoading(false);
            });
    }, []);

    const buscarSugestoesPorNome = debounce((input) => {
        if (!input) return;

        axios.get(`http://localhost:8081/produtos/por-nome?nome=${encodeURIComponent(input)}`)
            .then((res) => {
                const nomes = res.data.map(p => p.nome);
                setOpcoesNomes(nomes);
            })
            .catch((err) => {
                console.error("Erro ao buscar sugestões:", err);
            });
    }, 400);

    const handleBuscarPorNome = (nome) => {
        if (!nome.trim()) {
            // Se não há termo de busca, recarregar todos os produtos
            axios.get("http://localhost:8081/produtos")
                .then((response) => {
                    setProdutos(response.data);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error("Erro ao buscar produtos:", error);
                    setLoading(false);
                });
            return;
        }

        setLoading(true);
        axios.get(`http://localhost:8081/produtos/por-nome?nome=${encodeURIComponent(nome)}`)
            .then((response) => {
                setProdutos(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Erro ao buscar por nome:", error);
                setSnackbarMessage("Erro ao buscar produto por nome.");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                setLoading(false);
            });
    };



    const formatarPreco = (preco) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(preco);
    };

    const formatarData = (data) => {
        return new Date(data).toLocaleDateString('pt-BR');
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
                    Lista de Produtos
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
                                    <TableCell>Código</TableCell>
                                    <TableCell>Marca</TableCell>
                                    <TableCell>Tipo</TableCell>
                                    <TableCell>Preço</TableCell>
                                    <TableCell>Validade</TableCell>
                                    <TableCell>Lote</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {produtos.map((produto) => (
                                    <TableRow key={`${produto.codigo_barra}-${produto.lote_produto}`}>
                                        <TableCell>{produto.nome}</TableCell>
                                        <TableCell>{produto.codigo_barra}</TableCell>
                                        <TableCell>{produto.marca}</TableCell>
                                        <TableCell>{produto.tipo_produto}</TableCell>
                                        <TableCell>{formatarPreco(produto.preco)}</TableCell>
                                        <TableCell>{formatarData(produto.data_validade)}</TableCell>
                                        <TableCell>{produto.lote_produto}</TableCell>
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

export default ListaProdutos;
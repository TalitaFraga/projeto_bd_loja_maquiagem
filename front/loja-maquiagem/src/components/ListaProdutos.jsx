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

const ListaProdutos = () => {
    const [produtos, setProdutos] = useState([]);
    const [produtosOriginais, setProdutosOriginais] = useState([]); // Para manter dados originais
    const [loading, setLoading] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [opcoesBusca, setOpcoesBusca] = useState([]);
    const [inputBusca, setInputBusca] = useState("");

    useEffect(() => {
        axios.get("http://localhost:8081/produtos")
            .then((response) => {
                setProdutos(response.data);
                setProdutosOriginais(response.data); // Salvar dados originais
                setLoading(false);
            })
            .catch((error) => {
                console.error("Erro ao buscar produtos:", error);
                setLoading(false);
            });
    }, []);

    // Buscar sugestões por nome ou código
    const buscarSugestoes = debounce((input) => {
        if (!input || input.length < 2) {
            setOpcoesBusca([]);
            return;
        }

        const inputLower = input.toLowerCase();

        // Filtrar produtos localmente para sugestões rápidas
        const sugestoes = produtosOriginais
            .filter(produto =>
                produto.nome.toLowerCase().includes(inputLower) ||
                produto.codigo_barra.toLowerCase().includes(inputLower)
            )
            .map(produto => ({
                label: `${produto.nome} (${produto.codigo_barra})`,
                value: produto.nome,
                codigo: produto.codigo_barra
            }))
            .slice(0, 10); // Limitar a 10 sugestões

        setOpcoesBusca(sugestoes);
    }, 300);

    // Função de busca unificada (nome ou código)
    const handleBuscar = (termoBusca) => {
        if (!termoBusca || !termoBusca.trim()) {
            // Se busca vazia, mostrar todos os produtos
            setProdutos(produtosOriginais);
            return;
        }

        setLoading(true);
        const termo = termoBusca.trim().toLowerCase();

        // Filtrar localmente por nome ou código
        const resultados = produtosOriginais.filter(produto =>
            produto.nome.toLowerCase().includes(termo) ||
            produto.codigo_barra.toLowerCase().includes(termo) ||
            produto.marca.toLowerCase().includes(termo) ||
            produto.tipo_produto.toLowerCase().includes(termo)
        );

        setProdutos(resultados);
        setLoading(false);

        // Mostrar mensagem se não encontrou resultados
        if (resultados.length === 0) {
            setSnackbarMessage(`Nenhum produto encontrado para: "${termoBusca}"`);
            setSnackbarSeverity("info");
            setSnackbarOpen(true);
        }
    };

    // Função para quando clica no botão buscar
    const handleBuscarClick = () => {
        handleBuscar(inputBusca);
    };

    // Função para quando seleciona uma opção do autocomplete
    const handleSelecionarOpcao = (event, newValue) => {
        if (newValue) {
            // Se for um objeto com label (sugestão), usar o valor
            const termo = typeof newValue === 'object' ? newValue.value : newValue;
            handleBuscar(termo);
        }
    };

    // Função para limpar busca
    const handleLimparBusca = () => {
        setInputBusca("");
        setProdutos(produtosOriginais);
        setOpcoesBusca([]);
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
                            options={opcoesBusca}
                            getOptionLabel={(option) =>
                                typeof option === 'object' ? option.label : option
                            }
                            inputValue={inputBusca}
                            onInputChange={(event, newInputValue) => {
                                setInputBusca(newInputValue);
                                buscarSugestoes(newInputValue);
                            }}
                            onChange={handleSelecionarOpcao}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Buscar por nome, código, marca ou tipo"
                                    variant="outlined"
                                    fullWidth
                                    placeholder="Digite o nome ou código do produto..."
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props}>
                                    <Box>
                                        <Typography variant="body1" component="div">
                                            {typeof option === 'object' ? option.value : option}
                                        </Typography>
                                        {typeof option === 'object' && (
                                            <Typography variant="caption" color="text.secondary">
                                                Código: {option.codigo}
                                            </Typography>
                                        )}
                                    </Box>
                                </li>
                            )}
                            noOptionsText="Nenhum produto encontrado"
                        />
                    </Box>
                    <Button
                        variant="contained"
                        onClick={handleBuscarClick}
                        sx={{ backgroundColor: '#D81B60', "&:hover": { backgroundColor: '#9C4D97' } }}
                    >
                        Buscar
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleLimparBusca}
                        sx={{
                            borderColor: '#D81B60',
                            color: '#D81B60',
                            "&:hover": { borderColor: '#9C4D97', color: '#9C4D97' }
                        }}
                    >
                        Limpar
                    </Button>
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {produtos.length === produtosOriginais.length
                        ? `Mostrando todos os ${produtos.length} produtos`
                        : `Mostrando ${produtos.length} de ${produtosOriginais.length} produtos`
                    }
                </Typography>

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
                                {produtos.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                Nenhum produto encontrado
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    produtos.map((produto) => (
                                        <TableRow key={`${produto.codigo_barra}-${produto.lote_produto}`}>
                                            <TableCell>{produto.nome}</TableCell>
                                            <TableCell>{produto.codigo_barra}</TableCell>
                                            <TableCell>{produto.marca}</TableCell>
                                            <TableCell>{produto.tipo_produto}</TableCell>
                                            <TableCell>{formatarPreco(produto.preco)}</TableCell>
                                            <TableCell>{formatarData(produto.data_validade)}</TableCell>
                                            <TableCell>{produto.lote_produto}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Container>
    );
};

export default ListaProdutos;
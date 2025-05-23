import React, { useEffect, useState } from "react";
import axios from "axios";
import debounce from "lodash/debounce";
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    TextField,
    InputAdornment,
    CircularProgress,
    Snackbar,
    Alert,
    Autocomplete,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Container,
    Divider,
} from "@mui/material";
import { Search, Visibility, Inventory } from "@mui/icons-material";
import HomeIcon from '@mui/icons-material/Home';
import { Link } from "react-router-dom";

const ListaProdutosVendedor = () => {
    const [produtos, setProdutos] = useState([]);
    const [produtosOriginais, setProdutosOriginais] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [searchTerm, setSearchTerm] = useState("");
    const [ordenacao, setOrdenacao] = useState("");
    const [opcoesBusca, setOpcoesBusca] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [produtosRes, estoqueRes] = await Promise.all([
                    axios.get("http://localhost:8081/produtos"),
                    axios.get("http://localhost:8081/estoque")
                ]);

                const produtosComEstoque = produtosRes.data.map(produto => {
                    const itemEstoque = estoqueRes.data.find(
                        est => est.codigoBarra === produto.codigo_barra &&
                            est.loteProduto === produto.lote_produto
                    );

                    return {
                        ...produto,
                        quantidade_estoque: itemEstoque ? itemEstoque.qtdeProduto : 0
                    };
                });

                setProdutos(produtosComEstoque);
                setProdutosOriginais(produtosComEstoque);
                setLoading(false);
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
                setSnackbarMessage("Erro ao carregar produtos.");
                setSnackbarSeverity("error");
                setSnackbarOpen(true);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Função para ordenar produtos
    const ordenarProdutos = (produtosParaOrdenar, tipoOrdenacao) => {
        if (!tipoOrdenacao) return produtosParaOrdenar;

        const produtosOrdenados = [...produtosParaOrdenar].sort((a, b) => {
            switch (tipoOrdenacao) {
                case 'validade_asc':
                    return new Date(a.data_validade) - new Date(b.data_validade);
                case 'validade_desc':
                    return new Date(b.data_validade) - new Date(a.data_validade);
                case 'estoque_asc':
                    return a.quantidade_estoque - b.quantidade_estoque;
                case 'estoque_desc':
                    return b.quantidade_estoque - a.quantidade_estoque;
                case 'nome_asc':
                    return a.nome.localeCompare(b.nome);
                case 'nome_desc':
                    return b.nome.localeCompare(a.nome);
                case 'preco_asc':
                    return parseFloat(a.preco) - parseFloat(b.preco);
                case 'preco_desc':
                    return parseFloat(b.preco) - parseFloat(a.preco);
                default:
                    return 0;
            }
        });

        return produtosOrdenados;
    };

    // Buscar sugestões
    const buscarSugestoes = debounce((input) => {
        if (!input || input.length < 2) {
            setOpcoesBusca([]);
            return;
        }

        const inputLower = input.toLowerCase();
        const sugestoes = produtosOriginais
            .filter(produto =>
                produto.nome.toLowerCase().includes(inputLower) ||
                produto.codigo_barra.toLowerCase().includes(inputLower)
            )
            .map(produto => produto.nome)
            .slice(0, 10);

        setOpcoesBusca(sugestoes);
    }, 300);

    // Filtrar produtos
    const filteredProdutos = produtos.filter(produto =>
        produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.codigo_barra.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.tipo_produto.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Aplicar ordenação
    const produtosFiltradosOrdenados = ordenacao ?
        ordenarProdutos(filteredProdutos, ordenacao) :
        filteredProdutos;

    const formatarPreco = (preco) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(preco);
    };

    const formatarData = (data) => {
        return new Date(data).toLocaleDateString('pt-BR');
    };

    const isVencendoEm30Dias = (dataValidade) => {
        const hoje = new Date();
        const validade = new Date(dataValidade);
        const diasParaVencer = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
        return diasParaVencer <= 30 && diasParaVencer > 0;
    };

    const isVencido = (dataValidade) => {
        const hoje = new Date();
        const validade = new Date(dataValidade);
        return validade < hoje;
    };

    const handleViewDetails = (produto) => {
        setSnackbarMessage(`Consultando: ${produto.nome} - Código: ${produto.codigo_barra}`);
        setSnackbarSeverity("info");
        setSnackbarOpen(true);
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress sx={{ color: '#F06292' }} />
            </Container>
        );
    }

    return (
        <>
            <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
                <Link to="/dashboard-vendedor">
                    <IconButton>
                        <HomeIcon sx={{ fontSize: 30, color: '#F06292' }} />
                    </IconButton>
                </Link>
            </Box>

            <Container maxWidth="lg" sx={{ py: 4 }}>
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

                <Paper
                    elevation={4}
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        mt: 3,
                        backgroundColor: '#FFF',
                        borderTop: '4px solid #F06292',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Inventory sx={{ fontSize: 36, color: '#F06292', mr: 2 }} />
                        <Typography variant="h4" color="#333" fontWeight="500">
                            Consulta de Produtos
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 3, gap: 2 }}>
                        <Autocomplete
                            freeSolo
                            options={opcoesBusca}
                            inputValue={searchTerm}
                            onInputChange={(event, newInputValue) => {
                                setSearchTerm(newInputValue);
                                buscarSugestoes(newInputValue);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="outlined"
                                    size="small"
                                    placeholder="Buscar produto..."
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ width: 300 }}
                                />
                            )}
                        />

                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Ordenar por</InputLabel>
                            <Select
                                value={ordenacao}
                                label="Ordenar por"
                                onChange={(e) => setOrdenacao(e.target.value)}
                            >
                                <MenuItem value="">
                                    <em>Sem ordenação</em>
                                </MenuItem>
                                <MenuItem value="nome_asc">Nome (A-Z)</MenuItem>
                                <MenuItem value="nome_desc">Nome (Z-A)</MenuItem>
                                <MenuItem value="preco_asc">Preço (menor)</MenuItem>
                                <MenuItem value="preco_desc">Preço (maior)</MenuItem>
                                <MenuItem value="validade_asc">Validade (mais próxima)</MenuItem>
                                <MenuItem value="validade_desc">Validade (mais distante)</MenuItem>
                                <MenuItem value="estoque_asc">Estoque (menor)</MenuItem>
                                <MenuItem value="estoque_desc">Estoque (maior)</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Total: {produtosFiltradosOrdenados.length} produto(s) encontrado(s)
                    </Typography>

                    <TableContainer component={Paper} elevation={3}>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#FCE4EC' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Marca</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Preço</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Validade</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Estoque</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {produtosFiltradosOrdenados.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                {searchTerm ? "Nenhum produto encontrado para esta busca" : "Nenhum produto disponível"}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    produtosFiltradosOrdenados.map((produto) => (
                                        <TableRow key={`${produto.codigo_barra}-${produto.lote_produto}`} hover sx={{ '&:nth-of-type(odd)': { backgroundColor: '#FAFAFA' } }}>
                                            <TableCell>{produto.nome}</TableCell>
                                            <TableCell>{produto.codigo_barra}</TableCell>
                                            <TableCell>{produto.marca}</TableCell>
                                            <TableCell>{produto.tipo_produto}</TableCell>
                                            <TableCell>{formatarPreco(produto.preco)}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {formatarData(produto.data_validade)}
                                                    {isVencido(produto.data_validade) && (
                                                        <Chip label="Vencido" size="small" color="error" />
                                                    )}
                                                    {!isVencido(produto.data_validade) && isVencendoEm30Dias(produto.data_validade) && (
                                                        <Chip label="Vencendo" size="small" color="warning" />
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {produto.quantidade_estoque}
                                                    {produto.quantidade_estoque === 0 && (
                                                        <Chip label="Sem estoque" size="small" color="error" />
                                                    )}
                                                    {produto.quantidade_estoque > 0 && produto.quantidade_estoque <= 5 && (
                                                        <Chip label="Baixo" size="small" color="warning" />
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    sx={{ color: '#1976D2' }}
                                                    onClick={() => handleViewDetails(produto)}
                                                    title="Ver detalhes do produto"
                                                >
                                                    <Visibility />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Container>
        </>
    );
};

export default ListaProdutosVendedor;
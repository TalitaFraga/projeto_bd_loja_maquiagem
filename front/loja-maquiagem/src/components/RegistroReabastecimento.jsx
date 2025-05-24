import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Container,
    Grid,
    TextField,
    Typography,
    Paper,
    IconButton,
    Divider,
    Snackbar,
    Alert,
    Autocomplete,
    CircularProgress,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RegistroReabastecimento = () => {
    const navigate = useNavigate();

    const [produtos, setProdutos] = useState([]);
    const [fornecedores, setFornecedores] = useState([]);
    const [diretores, setDiretores] = useState([]);
    const [loading, setLoading] = useState(true);

    // Dados do pedido
    const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);
    const [diretorSelecionado, setDiretorSelecionado] = useState(null);

    // Lista de produtos no pedido
    const [itensPedido, setItensPedido] = useState([]);

    // Produto sendo adicionado
    const [novoProduto, setNovoProduto] = useState(null);
    const [novaQuantidade, setNovaQuantidade] = useState('');

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    // Buscar dados necessários
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [produtosRes, fornecedoresRes, diretoresRes] = await Promise.all([
                    axios.get('http://localhost:8081/produtos'),
                    axios.get('http://localhost:8081/fornecedores'),
                    axios.get('http://localhost:8081/diretores')
                ]);

                setProdutos(produtosRes.data);
                setFornecedores(fornecedoresRes.data);
                setDiretores(diretoresRes.data);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                setSnackbar({
                    open: true,
                    message: 'Erro ao carregar dados necessários',
                    severity: 'error'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Adicionar produto ao pedido
    const adicionarProduto = () => {
        if (!novoProduto || !novaQuantidade) {
            setSnackbar({
                open: true,
                message: 'Selecione um produto e informe a quantidade',
                severity: 'warning'
            });
            return;
        }

        // Verificar se produto já foi adicionado
        const produtoExiste = itensPedido.find(
            item => item.produto.codigo_barra === novoProduto.codigo_barra &&
                item.produto.lote_produto === novoProduto.lote_produto
        );

        if (produtoExiste) {
            setSnackbar({
                open: true,
                message: 'Este produto já foi adicionado ao pedido',
                severity: 'warning'
            });
            return;
        }

        const novoItem = {
            produto: novoProduto,
            quantidade: parseInt(novaQuantidade)
        };

        setItensPedido([...itensPedido, novoItem]);
        setNovoProduto(null);
        setNovaQuantidade('');

        setSnackbar({
            open: true,
            message: 'Produto adicionado ao pedido!',
            severity: 'success'
        });
    };

    // Remover produto do pedido
    const removerProduto = (index) => {
        const novosItens = itensPedido.filter((_, i) => i !== index);
        setItensPedido(novosItens);
    };

    // Enviar pedido completo
    const enviarPedido = async () => {
        if (!fornecedorSelecionado || !diretorSelecionado) {
            setSnackbar({
                open: true,
                message: 'Selecione o fornecedor e o diretor responsável',
                severity: 'warning'
            });
            return;
        }

        if (itensPedido.length === 0) {
            setSnackbar({
                open: true,
                message: 'Adicione pelo menos um produto ao pedido',
                severity: 'warning'
            });
            return;
        }

        try {
            // Enviar cada item como um registro separado
            const promessas = itensPedido.map(item => {
                const pedido = {
                    fk_Produto_codigo_barra: item.produto.codigo_barra,
                    fk_Produto_lote_produto: item.produto.lote_produto,
                    fk_Fornecedor_CNPJ: fornecedorSelecionado.cnpj,
                    fk_Diretor_fk_Funcionario_fk_Pessoa_CPF: diretorSelecionado.cpf,
                    qtde_produto: item.quantidade
                };

                return axios.post('http://localhost:8081/pede-produtos', pedido);
            });

            await Promise.all(promessas);

            setSnackbar({
                open: true,
                message: `Pedido enviado com sucesso! ${itensPedido.length} item(s) solicitado(s).`,
                severity: 'success'
            });

            // Reset form
            setFornecedorSelecionado(null);
            setDiretorSelecionado(null);
            setItensPedido([]);
            setNovoProduto(null);
            setNovaQuantidade('');

        } catch (error) {
            console.error('Erro ao enviar pedido:', error);
            setSnackbar({
                open: true,
                message: 'Erro ao enviar pedido de reabastecimento',
                severity: 'error'
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress sx={{ color: '#F06292' }} />
            </Container>
        );
    }

    return (
        <>
            <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
                <Link to="/dashboard">
                    <IconButton>
                        <HomeIcon sx={{ fontSize: 30, color: '#F06292' }} />
                    </IconButton>
                </Link>
            </Box>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Paper
                    elevation={4}
                    sx={{
                        padding: 4,
                        borderRadius: 3,
                        mt: 3,
                        backgroundColor: '#FFF',
                        borderTop: '4px solid #F06292',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                    }}
                >
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                backgroundColor: '#F06292',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 2
                            }}
                        >
                            <LocalShippingIcon sx={{ fontSize: 24, color: 'white' }} />
                        </Box>
                        <Typography variant="h4" color="#333" fontWeight="500">
                            Solicitar Pedido ao Fornecedor
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    <Grid container spacing={4}>
                        {/* Fornecedor - Expandido */}
                        <Grid item xs={12} md={8}>
                            <Typography variant="h6" sx={{ mb: 2, color: '#F06292', fontWeight: 'bold' }}>
                                🚚 Fornecedor
                            </Typography>
                            <Autocomplete
                                options={fornecedores}
                                getOptionLabel={(option) => `${option.nome} - ${option.cnpj}`}
                                value={fornecedorSelecionado}
                                onChange={(event, newValue) => setFornecedorSelecionado(newValue)}
                                renderOption={(props, option) => (
                                    <Box component="li" {...props} sx={{ padding: '8px 16px !important' }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: '#333',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                {option.nome}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: '#666',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                CNPJ: {option.cnpj}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Selecionar Fornecedor"
                                        placeholder="Digite para buscar..."
                                        required
                                        fullWidth
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                minHeight: '56px'
                                            },
                                            '& .MuiAutocomplete-input': {
                                                fontSize: '14px'
                                            }
                                        }}
                                    />
                                )}
                                ListboxProps={{
                                    style: {
                                        maxHeight: '200px',
                                        fontSize: '14px'
                                    }
                                }}
                                sx={{
                                    '& .MuiAutocomplete-listbox': {
                                        fontSize: '14px'
                                    }
                                }}
                            />
                        </Grid>

                        {/* Diretor - Reduzido */}
                        <Grid item xs={12} md={4}>
                            <Typography variant="h6" sx={{ mb: 2, color: '#F06292', fontWeight: 'bold' }}>
                                👤 Diretor Responsável
                            </Typography>
                            <Autocomplete
                                options={diretores}
                                getOptionLabel={(option) => `${option.nome} - ${option.cpf}`}
                                value={diretorSelecionado}
                                onChange={(event, newValue) => setDiretorSelecionado(newValue)}
                                renderOption={(props, option) => (
                                    <Box component="li" {...props} sx={{ padding: '8px 16px !important' }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                            <Typography
                                                variant="body1"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    color: '#333',
                                                    fontSize: '14px'
                                                }}
                                            >
                                                {option.nome}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: '#666',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                CPF: {option.cpf}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Selecionar Diretor"
                                        placeholder="Digite para buscar..."
                                        required
                                        fullWidth
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                minHeight: '56px'
                                            },
                                            '& .MuiAutocomplete-input': {
                                                fontSize: '14px'
                                            }
                                        }}
                                    />
                                )}
                                ListboxProps={{
                                    style: {
                                        maxHeight: '200px',
                                        fontSize: '14px'
                                    }
                                }}
                            />
                        </Grid>

                        {/* Adicionar Produtos */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ mb: 2, color: '#F06292', fontWeight: 'bold' }}>
                                🛍️ Adicionar Produtos ao Pedido
                            </Typography>

                            <Card sx={{ mb: 3, border: '2px dashed #F06292' }}>
                                <CardContent>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={12} md={6}>
                                            <Autocomplete
                                                options={produtos}
                                                getOptionLabel={(option) => `${option.nome} - ${option.marca} (${option.codigo_barra})`}
                                                value={novoProduto}
                                                onChange={(event, newValue) => setNovoProduto(newValue)}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Produto"
                                                        placeholder="Digite para buscar..."
                                                        fullWidth
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: 2
                                                            }
                                                        }}
                                                    />
                                                )}
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={3}>
                                            <TextField
                                                fullWidth
                                                type="number"
                                                label="Quantidade"
                                                placeholder="Ex: 50"
                                                value={novaQuantidade}
                                                onChange={(e) => setNovaQuantidade(e.target.value)}
                                                inputProps={{ min: 1 }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2
                                                    }
                                                }}
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={3}>
                                            <Button
                                                variant="contained"
                                                onClick={adicionarProduto}
                                                fullWidth
                                                sx={{
                                                    backgroundColor: '#4CAF50',
                                                    '&:hover': { backgroundColor: '#45a049' },
                                                    borderRadius: 2,
                                                    height: '56px'
                                                }}
                                            >
                                                <AddIcon sx={{ mr: 1 }} />
                                                Adicionar
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Lista de Produtos no Pedido */}
                        {itensPedido.length > 0 && (
                            <Grid item xs={12}>
                                <Typography variant="h6" sx={{ mb: 2, color: '#F06292', fontWeight: 'bold' }}>
                                    📋 Produtos no Pedido ({itensPedido.length} item{itensPedido.length !== 1 ? 's' : ''})
                                </Typography>

                                <TableContainer component={Paper} elevation={2}>
                                    <Table>
                                        <TableHead sx={{ backgroundColor: '#FCE4EC' }}>
                                            <TableRow>
                                                <TableCell><strong>Produto</strong></TableCell>
                                                <TableCell><strong>Código</strong></TableCell>
                                                <TableCell><strong>Marca</strong></TableCell>
                                                <TableCell align="center"><strong>Quantidade</strong></TableCell>
                                                <TableCell align="center"><strong>Ações</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {itensPedido.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{item.produto.nome}</TableCell>
                                                    <TableCell>{item.produto.codigo_barra}</TableCell>
                                                    <TableCell>{item.produto.marca}</TableCell>
                                                    <TableCell align="center">
                                                        <strong style={{ color: '#F06292' }}>{item.quantidade}</strong>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <IconButton
                                                            onClick={() => removerProduto(index)}
                                                            sx={{ color: '#F44336' }}
                                                            size="small"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        )}

                        {/* Botão de Envio */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                <Button
                                    variant="contained"
                                    onClick={enviarPedido}
                                    size="large"
                                    disabled={!fornecedorSelecionado || !diretorSelecionado || itensPedido.length === 0}
                                    sx={{
                                        px: 6,
                                        py: 1.5,
                                        borderRadius: 2,
                                        backgroundColor: "#F06292",
                                        "&:hover": { backgroundColor: "#E91E63" },
                                        "&:disabled": { backgroundColor: "#CCCCCC" },
                                        transition: "transform 0.2s",
                                        "&:active": { transform: "scale(0.98)" },
                                        boxShadow: '0 4px 10px rgba(240, 98, 146, 0.3)',
                                        fontWeight: "bold",
                                        fontSize: '16px'
                                    }}
                                >
                                    <ShoppingCartIcon sx={{ mr: 1 }} />
                                    ENVIAR PEDIDO COMPLETO ({itensPedido.length} item{itensPedido.length !== 1 ? 's' : ''})
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default RegistroReabastecimento;
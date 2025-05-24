import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    IconButton,
    Divider,
    Snackbar,
    Alert,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    InputAdornment,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';
import axios from 'axios';

const HistoricoReabastecimento = () => {
    const [pedidos, setPedidos] = useState([]);
    const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Estado para modal de detalhes
    const [detailsDialog, setDetailsDialog] = useState({
        open: false,
        pedido: null
    });

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'info'
    });

    // Buscar histórico de pedidos
    useEffect(() => {
        fetchPedidos();
    }, []);

    const fetchPedidos = async () => {
        setLoading(true);
        try {
            console.log('🔄 Buscando histórico de pedidos...');

            // 1. Buscar todos os pedidos
            const pedidosRes = await axios.get('http://localhost:8081/pede-produtos');
            console.log('📦 Pedidos encontrados:', pedidosRes.data);

            // 2. Buscar dados adicionais para enriquecer a exibição
            const [produtosRes, fornecedoresRes, pessoasRes] = await Promise.all([
                axios.get('http://localhost:8081/produtos'),
                axios.get('http://localhost:8081/fornecedores'),
                axios.get('http://localhost:8081/pessoas')
            ]);

            const produtos = produtosRes.data;
            const fornecedores = fornecedoresRes.data;
            const pessoas = pessoasRes.data;

            // 3. Processar e enriquecer os dados dos pedidos
            const pedidosProcessados = pedidosRes.data.map(pedido => {
                // Buscar dados do produto
                const produto = produtos.find(p =>
                    p.codigo_barra === pedido.fk_Produto_codigo_barra &&
                    p.lote_produto === pedido.fk_Produto_lote_produto
                );

                // Buscar dados do fornecedor
                const fornecedor = fornecedores.find(f =>
                    f.cnpj === pedido.fk_Fornecedor_CNPJ
                );

                // Buscar dados do diretor
                const diretor = pessoas.find(p =>
                    p.cpf === pedido.fk_Diretor_fk_Funcionario_fk_Pessoa_CPF
                );

                return {
                    ...pedido,
                    produto: produto || {
                        nome: 'Produto não encontrado',
                        marca: 'N/A',
                        tipo_produto: 'N/A',
                        preco: 0
                    },
                    fornecedor: fornecedor || {
                        nome: 'Fornecedor não encontrado',
                        cnpj: pedido.fk_Fornecedor_CNPJ
                    },
                    diretor: diretor || {
                        nome: 'Diretor não encontrado',
                        cpf: pedido.fk_Diretor_fk_Funcionario_fk_Pessoa_CPF
                    },
                    valorTotal: (produto?.preco || 0) * pedido.qtde_produto
                };
            });

            // ✅ ORDENAR por ID para manter ordem correta (PED001, PED002, etc.)
            pedidosProcessados.sort((a, b) => {
                // Extrair números dos IDs para ordenação correta
                const numA = a.id_pedido.replace(/\D/g, '');
                const numB = b.id_pedido.replace(/\D/g, '');
                return parseInt(numA) - parseInt(numB);
            });

            console.log('✅ Pedidos processados e ordenados:', pedidosProcessados.length);
            setPedidos(pedidosProcessados);
            setPedidosFiltrados(pedidosProcessados);

        } catch (error) {
            console.error('❌ Erro ao buscar pedidos:', error);
            setSnackbar({
                open: true,
                message: 'Erro ao carregar histórico de pedidos',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    // Filtrar pedidos com base na busca
    useEffect(() => {
        const filtrados = pedidos.filter(pedido => {
            const searchLower = searchTerm.toLowerCase();
            return (
                pedido.id_pedido.toLowerCase().includes(searchLower) ||
                pedido.fornecedor.nome.toLowerCase().includes(searchLower) ||
                pedido.diretor.nome.toLowerCase().includes(searchLower) ||
                pedido.produto.nome.toLowerCase().includes(searchLower) ||
                pedido.produto.marca.toLowerCase().includes(searchLower)
            );
        });
        setPedidosFiltrados(filtrados);
    }, [searchTerm, pedidos]);

    const handleViewDetails = (pedido) => {
        console.log('👁️ Visualizando detalhes do pedido:', pedido.id_pedido);
        setDetailsDialog({
            open: true,
            pedido: pedido
        });
    };

    const handleEdit = (pedido) => {
        console.log('✏️ Editando pedido:', pedido.id_pedido);
        // Navegar para tela de edição ou abrir modal de edição
        setSnackbar({
            open: true,
            message: 'Funcionalidade de edição em desenvolvimento',
            severity: 'info'
        });
    };

    const handleDelete = async (pedido) => {
        if (window.confirm(`Tem certeza que deseja excluir o pedido ${pedido.id_pedido}?`)) {
            try {
                await axios.delete(`http://localhost:8081/pede-produtos/${pedido.id_pedido}`);
                setSnackbar({
                    open: true,
                    message: 'Pedido excluído com sucesso!',
                    severity: 'success'
                });
                fetchPedidos(); // Recarregar lista
            } catch (error) {
                console.error('Erro ao excluir pedido:', error);
                setSnackbar({
                    open: true,
                    message: 'Erro ao excluir pedido',
                    severity: 'error'
                });
            }
        }
    };

    const handleCloseDetails = () => {
        setDetailsDialog({
            open: false,
            pedido: null
        });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const formatarValor = (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    const formatarCNPJ = (cnpj) => {
        if (!cnpj) return 'N/A';
        const cnpjNumeros = cnpj.replace(/\D/g, '');
        if (cnpjNumeros.length !== 14) return cnpj;
        return cnpjNumeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    };

    const formatarCPF = (cpf) => {
        if (!cpf) return 'N/A';
        const cpfNumeros = cpf.replace(/\D/g, '');
        if (cpfNumeros.length !== 11) return cpf;
        return cpfNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress sx={{ color: '#F06292', mb: 2 }} size={60} />
                    <Typography color="#F06292">Carregando histórico...</Typography>
                </Box>
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
                        <HistoryIcon sx={{ fontSize: 36, color: '#F06292', mr: 2 }} />
                        <Typography variant="h4" color="#333" fontWeight="500">
                            Histórico de Reabastecimento
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    {/* Barra de pesquisa e botão de novo pedido */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 3,
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2
                    }}>
                        <TextField
                            placeholder="Buscar por ID, fornecedor, diretor ou produto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{ width: 350, maxWidth: '100%' }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 2 }
                            }}
                        />

                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            component={Link}
                            to="/registro-reabastecimento"
                            sx={{
                                backgroundColor: '#F06292',
                                '&:hover': { backgroundColor: '#E91E63' },
                                borderRadius: 2,
                                px: 3,
                                py: 1,
                                fontWeight: 'bold'
                            }}
                        >
                            NOVO PEDIDO
                        </Button>
                    </Box>

                    {/* Tabela de pedidos */}
                    {pedidosFiltrados.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <HistoryIcon sx={{ fontSize: 80, color: '#E0E0E0', mb: 2 }} />
                            <Typography variant="h6" color="textSecondary">
                                {searchTerm ? 'Nenhum pedido encontrado para esta busca' : 'Nenhum pedido de reabastecimento encontrado'}
                            </Typography>
                            <Typography color="textSecondary" sx={{ mt: 1 }}>
                                {!searchTerm && 'Comece criando um novo pedido de reabastecimento'}
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer component={Paper} elevation={0} sx={{ mb: 3, borderRadius: 2 }}>
                            <Table>
                                <TableHead sx={{ backgroundColor: '#FCE4EC' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Produto</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Fornecedor</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }}>Diretor</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Quantidade</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Valor Total</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pedidosFiltrados.map((pedido, index) => (
                                        <TableRow
                                            key={pedido.id_pedido || index}
                                            hover
                                            sx={{ '&:nth-of-type(odd)': { backgroundColor: '#FAFAFA' } }}
                                        >
                                            <TableCell>
                                                <Typography fontWeight="bold" color="#F06292">
                                                    #{pedido.id_pedido}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                <Box>
                                                    <Typography fontWeight="500">
                                                        {pedido.produto.nome}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {pedido.produto.marca} • {pedido.produto.tipo_produto}
                                                    </Typography>
                                                </Box>
                                            </TableCell>

                                            <TableCell>
                                                <Box>
                                                    <Typography fontWeight="500">
                                                        {pedido.fornecedor.nome}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {formatarCNPJ(pedido.fornecedor.cnpj)}
                                                    </Typography>
                                                </Box>
                                            </TableCell>

                                            <TableCell>
                                                <Box>
                                                    <Typography fontWeight="500">
                                                        {pedido.diretor.nome}
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        {formatarCPF(pedido.diretor.cpf)}
                                                    </Typography>
                                                </Box>
                                            </TableCell>

                                            <TableCell align="center">
                                                <Typography fontWeight="bold">
                                                    {pedido.qtde_produto}
                                                </Typography>
                                            </TableCell>

                                            <TableCell align="right">
                                                <Typography fontWeight="bold" color="#2E7D32">
                                                    {formatarValor(pedido.valorTotal)}
                                                </Typography>
                                            </TableCell>

                                            <TableCell align="center">
                                                <IconButton
                                                    onClick={() => handleViewDetails(pedido)}
                                                    sx={{ color: '#1976D2' }}
                                                    size="small"
                                                    title="Visualizar"
                                                >
                                                    <VisibilityIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleEdit(pedido)}
                                                    sx={{ color: '#F06292' }}
                                                    size="small"
                                                    title="Editar"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleDelete(pedido)}
                                                    sx={{ color: '#F44336' }}
                                                    size="small"
                                                    title="Deletar"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Resumo da tabela */}
                    {pedidosFiltrados.length > 0 && (
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mt: 2,
                            p: 2,
                            backgroundColor: '#F8F9FA',
                            borderRadius: 2
                        }}>
                            <Typography variant="body2" color="textSecondary">
                                Total: {pedidosFiltrados.length} pedido(s)
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" color="#F06292">
                                Valor Total: {formatarValor(
                                pedidosFiltrados.reduce((acc, p) => acc + p.valorTotal, 0)
                            )}
                            </Typography>
                        </Box>
                    )}
                </Paper>
            </Container>

            {/* Dialog de detalhes do pedido */}
            <Dialog
                open={detailsDialog.open}
                onClose={handleCloseDetails}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{
                    backgroundColor: '#F06292',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <HistoryIcon />
                    Detalhes do Pedido #{detailsDialog.pedido?.id_pedido}
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    {detailsDialog.pedido && (
                        <Box>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" color="#F06292" gutterBottom>
                                    Produto
                                </Typography>
                                <Typography><strong>Nome:</strong> {detailsDialog.pedido.produto.nome}</Typography>
                                <Typography><strong>Marca:</strong> {detailsDialog.pedido.produto.marca}</Typography>
                                <Typography><strong>Tipo:</strong> {detailsDialog.pedido.produto.tipo_produto}</Typography>
                                <Typography><strong>Código:</strong> {detailsDialog.pedido.fk_Produto_codigo_barra}</Typography>
                                <Typography><strong>Lote:</strong> {detailsDialog.pedido.fk_Produto_lote_produto}</Typography>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" color="#F06292" gutterBottom>
                                    Fornecedor
                                </Typography>
                                <Typography><strong>Nome:</strong> {detailsDialog.pedido.fornecedor.nome}</Typography>
                                <Typography><strong>CNPJ:</strong> {formatarCNPJ(detailsDialog.pedido.fornecedor.cnpj)}</Typography>
                            </Box>

                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" color="#F06292" gutterBottom>
                                    Diretor Responsável
                                </Typography>
                                <Typography><strong>Nome:</strong> {detailsDialog.pedido.diretor.nome}</Typography>
                                <Typography><strong>CPF:</strong> {formatarCPF(detailsDialog.pedido.diretor.cpf)}</Typography>
                            </Box>

                            <Box sx={{
                                p: 2,
                                backgroundColor: '#E8F5E8',
                                borderRadius: 2,
                                textAlign: 'center'
                            }}>
                                <Typography variant="h6" color="#2E7D32">
                                    Quantidade: {detailsDialog.pedido.qtde_produto}
                                </Typography>
                                <Typography variant="h5" fontWeight="bold" color="#2E7D32">
                                    Valor Total: {formatarValor(detailsDialog.pedido.valorTotal)}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={handleCloseDetails}
                        variant="outlined"
                        sx={{ borderColor: '#F06292', color: '#F06292' }}
                    >
                        Fechar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
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

export default HistoricoReabastecimento;
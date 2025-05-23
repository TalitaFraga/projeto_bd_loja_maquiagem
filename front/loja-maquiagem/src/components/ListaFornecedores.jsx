import React, { useEffect, useState } from 'react';
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
  Button,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Container,
  Divider,
  Snackbar,
  Alert,
  Collapse
} from '@mui/material';
import { Add, Search, Edit, ExpandMore, ExpandLess, Handshake } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ListaFornecedores = () => {
  const [fornecedores, setFornecedores] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFornecedor, setExpandedFornecedor] = useState(null);
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const navigate = useNavigate();

  const fetchFornecedores = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8081/fornecedores');
      console.log('Fornecedores recebidos:', response.data);

      const dadosProcessados = response.data.map(fornecedor => ({
        nome: fornecedor.nome || 'Não informado',
        cnpj: fornecedor.cnpj || 'Não informado',
        telefone1: fornecedor.telefone1 || 'Não informado',
        telefone2: fornecedor.telefone2 || '-'
      }));

      setFornecedores(dadosProcessados);
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
      setError('Erro ao carregar fornecedores. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProdutosPorFornecedor = async (cnpj) => {
    setLoadingProdutos(true);
    try {
      const response = await axios.get('http://localhost:8081/produtos');
      const produtosFiltrados = response.data.filter(produto =>
          produto.fk_fornecedor_CNPJ === cnpj || produto.fk_Fornecedor_cnpj === cnpj
      );
      setProdutos(produtosFiltrados);
      console.log('Produtos do fornecedor:', produtosFiltrados);
    } catch (error) {
      console.error('Erro ao buscar produtos do fornecedor:', error);
      setSnackbar({
        open: true,
        message: "Erro ao carregar produtos do fornecedor.",
        severity: "error"
      });
    } finally {
      setLoadingProdutos(false);
    }
  };

  useEffect(() => {
    fetchFornecedores();
  }, []);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleExpandClick = (cnpj) => {
    if (expandedFornecedor === cnpj) {
      setExpandedFornecedor(null);
      setProdutos([]);
    } else {
      setExpandedFornecedor(cnpj);
      fetchProdutosPorFornecedor(cnpj);
    }
  };

  const filteredFornecedores = fornecedores.filter(fornecedor => {
    const searchTermLower = searchTerm.toLowerCase();
    return fornecedor.nome.toLowerCase().includes(searchTermLower) ||
        fornecedor.cnpj.toLowerCase().includes(searchTermLower);
  });

  const formatarCNPJ = (cnpj) => {
    if (!cnpj || cnpj === 'Não informado') return cnpj;
    // Remove caracteres não numéricos
    const cnpjNumeros = cnpj.replace(/\D/g, '');
    if (cnpjNumeros.length !== 14) return cnpj;
    // Formata CNPJ: 00.000.000/0000-00
    return cnpjNumeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatarTelefone = (telefone) => {
    if (!telefone || telefone === 'Não informado' || telefone === '-') return telefone;
    // Remove caracteres não numéricos
    const telefoneNumeros = telefone.replace(/\D/g, '');
    if (telefoneNumeros.length === 10) {
      // Telefone fixo: (00) 0000-0000
      return telefoneNumeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (telefoneNumeros.length === 11) {
      // Celular: (00) 00000-0000
      return telefoneNumeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return telefone;
  };

  const formatarPreco = (preco) => {
    if (!preco) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

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
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Handshake sx={{ fontSize: 36, color: '#F06292', mr: 2 }} />
              <Typography variant="h4" color="#333" fontWeight="500">
                Consulta de Fornecedores
              </Typography>
            </Box>

            <Divider sx={{ mb: 4 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
              <TextField
                  variant="outlined"
                  size="small"
                  placeholder="Buscar por nome ou CNPJ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                          <Search color="action" />
                        </InputAdornment>
                    ),
                    sx: { borderRadius: 2 }
                  }}
                  sx={{ width: 350 }}
              />

              <Button
                  variant="contained"
                  startIcon={<Add />}
                  component={Link}
                  to="/fornecedor"
                  sx={{
                    backgroundColor: '#F06292',
                    '&:hover': { backgroundColor: '#E91E63' },
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    fontWeight: 'bold'
                  }}
              >
                Novo Fornecedor
              </Button>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" my={4}>
                  <CircularProgress sx={{ color: '#F06292' }} />
                </Box>
            ) : error ? (
                <Box display="flex" flexDirection="column" alignItems="center" my={4}>
                  <Typography color="error" gutterBottom>{error}</Typography>
                  <Button
                      variant="outlined"
                      onClick={fetchFornecedores}
                      sx={{ mt: 2, color: '#F06292', borderColor: '#F06292' }}
                  >
                    Tentar Novamente
                  </Button>
                </Box>
            ) : (
                <>
                  {filteredFornecedores.length === 0 ? (
                      <Box display="flex" justifyContent="center" my={4}>
                        <Typography color="textSecondary">
                          {searchTerm ? "Nenhum fornecedor encontrado para esta busca." : "Nenhum fornecedor cadastrado."}
                        </Typography>
                      </Box>
                  ) : (
                      <TableContainer component={Paper} elevation={0} sx={{ mb: 3, borderRadius: 2 }}>
                        <Table>
                          <TableHead sx={{ backgroundColor: '#FCE4EC' }}>
                            <TableRow>
                              <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>CNPJ</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Telefone 1</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Telefone 2</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Produtos</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {filteredFornecedores.map((fornecedor, index) => (
                                <React.Fragment key={index}>
                                  <TableRow hover sx={{ '&:nth-of-type(odd)': { backgroundColor: '#FAFAFA' } }}>
                                    <TableCell>{fornecedor.nome}</TableCell>
                                    <TableCell>{formatarCNPJ(fornecedor.cnpj)}</TableCell>
                                    <TableCell>{formatarTelefone(fornecedor.telefone1)}</TableCell>
                                    <TableCell>{formatarTelefone(fornecedor.telefone2)}</TableCell>
                                    <TableCell align="center">
                                      <IconButton
                                          onClick={() => handleExpandClick(fornecedor.cnpj)}
                                          sx={{ color: '#F06292' }}
                                      >
                                        {expandedFornecedor === fornecedor.cnpj ? <ExpandLess /> : <ExpandMore />}
                                      </IconButton>
                                    </TableCell>
                                    <TableCell align="center">
                                      <IconButton
                                          onClick={() => navigate(`/editar-fornecedor?cnpj=${fornecedor.cnpj}`)}
                                          sx={{ color: '#1976D2' }}
                                      >
                                        <Edit />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>

                                  {/* Linha expansível para produtos */}
                                  <TableRow>
                                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                      <Collapse in={expandedFornecedor === fornecedor.cnpj} timeout="auto" unmountOnExit>
                                        <Box sx={{ margin: 1, padding: 2, backgroundColor: '#F9F9F9', borderRadius: 1 }}>
                                          <Typography variant="h6" gutterBottom sx={{ color: '#F06292', fontWeight: 'bold' }}>
                                            Produtos do Fornecedor
                                          </Typography>
                                          {loadingProdutos ? (
                                              <Box display="flex" justifyContent="center" my={2}>
                                                <CircularProgress size={24} sx={{ color: '#F06292' }} />
                                              </Box>
                                          ) : produtos.length === 0 ? (
                                              <Typography color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                                                Nenhum produto encontrado para este fornecedor.
                                              </Typography>
                                          ) : (
                                              <Table size="small">
                                                <TableHead>
                                                  <TableRow sx={{ backgroundColor: '#F3E5F5' }}>
                                                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Código</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Nome</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Marca</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Tipo</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Preço</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Validade</TableCell>
                                                    <TableCell sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Lote</TableCell>
                                                  </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                  {produtos.map((produto, produtoIndex) => (
                                                      <TableRow key={produtoIndex} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#FFFFFF' } }}>
                                                        <TableCell sx={{ fontSize: '0.8rem' }}>{produto.codigo_barra}</TableCell>
                                                        <TableCell sx={{ fontSize: '0.8rem' }}>{produto.nome}</TableCell>
                                                        <TableCell sx={{ fontSize: '0.8rem' }}>{produto.marca}</TableCell>
                                                        <TableCell sx={{ fontSize: '0.8rem' }}>{produto.tipo_produto}</TableCell>
                                                        <TableCell sx={{ fontSize: '0.8rem' }}>{formatarPreco(produto.preco)}</TableCell>
                                                        <TableCell sx={{ fontSize: '0.8rem' }}>{formatarData(produto.data_validade)}</TableCell>
                                                        <TableCell sx={{ fontSize: '0.8rem' }}>{produto.lote_produto}</TableCell>
                                                      </TableRow>
                                                  ))}
                                                </TableBody>
                                              </Table>
                                          )}
                                        </Box>
                                      </Collapse>
                                    </TableCell>
                                  </TableRow>
                                </React.Fragment>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Typography variant="body2" color="textSecondary">
                      Total: {filteredFornecedores.length} fornecedor(es)
                    </Typography>
                  </Box>
                </>
            )}
          </Paper>
        </Container>

        {/* Snackbar de notificações */}
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

export default ListaFornecedores;
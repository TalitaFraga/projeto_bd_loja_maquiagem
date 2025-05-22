import React, { useState, useEffect } from "react";
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
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RegistroVenda = () => {
  const [venda, setVenda] = useState({
    cpfCliente: "",
    cpfVendedor: "",
    itens: []
  });

  const [novoItem, setNovoItem] = useState({
    codigoBarra: "",
    loteProduto: "",
    qtdeProduto: 1
  });

  const [produtos, setProdutos] = useState([]);
  const [dialogAberto, setDialogAberto] = useState(false);
  const [dialogEdicao, setDialogEdicao] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  
  const navigate = useNavigate();

  // Buscar produtos disponíveis
  useEffect(() => {
    const buscarProdutos = async () => {
      try {
        const response = await axios.get("http://localhost:8081/produtos");
        setProdutos(response.data);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        setSnackbar({
          open: true,
          message: "Erro ao carregar lista de produtos.",
          severity: "warning"
        });
      }
    };
    buscarProdutos();
  }, []);

  // Formatar CPF enquanto digita
  const formatCPF = (value, campo) => {
    let cpf = value.replace(/\D/g, '');
    
    if (cpf.length <= 11) {
      if (cpf.length > 9) {
        cpf = cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      } else if (cpf.length > 6) {
        cpf = cpf.replace(/^(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
      } else if (cpf.length > 3) {
        cpf = cpf.replace(/^(\d{3})(\d{3})/, '$1.$2');
      }
    }
    
    setVenda({ ...venda, [campo]: cpf });
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setNovoItem(prev => ({ ...prev, [name]: value }));
  };

  const obterNomeProduto = (codigoBarra) => {
    const produto = produtos.find(p => p.codigo_barra === codigoBarra);
    return produto ? produto.nome : "Produto não encontrado";
  };

  const obterPrecoProduto = (codigoBarra) => {
    const produto = produtos.find(p => p.codigo_barra === codigoBarra);
    return produto ? parseFloat(produto.preco) : 0;
  };

  const adicionarItem = () => {
    if (!novoItem.codigoBarra || !novoItem.loteProduto || novoItem.qtdeProduto <= 0) {
      setSnackbar({
        open: true,
        message: "Por favor, preencha todos os campos do item corretamente.",
        severity: "warning"
      });
      return;
    }

    // Verificar se o produto existe
    const produtoExiste = produtos.some(p => p.codigo_barra === novoItem.codigoBarra);
    if (!produtoExiste) {
      setSnackbar({
        open: true,
        message: "Código de barras não encontrado.",
        severity: "error"
      });
      return;
    }

    // Verificar se o item já existe na lista
    const itemExistente = venda.itens.find(item => 
      item.codigoBarra === novoItem.codigoBarra && 
      item.loteProduto === novoItem.loteProduto
    );

    if (itemExistente) {
      // Atualizar quantidade do item existente
      const itensAtualizados = venda.itens.map(item =>
        item.codigoBarra === novoItem.codigoBarra && item.loteProduto === novoItem.loteProduto
          ? { ...item, qtdeProduto: item.qtdeProduto + parseInt(novoItem.qtdeProduto) }
          : item
      );
      setVenda({ ...venda, itens: itensAtualizados });
    } else {
      // Adicionar novo item
      setVenda({
        ...venda,
        itens: [...venda.itens, { ...novoItem, qtdeProduto: parseInt(novoItem.qtdeProduto) }]
      });
    }

    // Limpar formulário do item
    setNovoItem({
      codigoBarra: "",
      loteProduto: "",
      qtdeProduto: 1
    });

    setDialogAberto(false);

    setSnackbar({
      open: true,
      message: "Item adicionado com sucesso!",
      severity: "success"
    });
  };

  const editarItem = (index) => {
    const item = venda.itens[index];
    setItemEditando({ ...item, index });
    setNovoItem({
      codigoBarra: item.codigoBarra,
      loteProduto: item.loteProduto,
      qtdeProduto: item.qtdeProduto
    });
    setDialogEdicao(true);
  };

  const salvarEdicaoItem = () => {
    if (!novoItem.codigoBarra || !novoItem.loteProduto || novoItem.qtdeProduto <= 0) {
      setSnackbar({
        open: true,
        message: "Por favor, preencha todos os campos do item corretamente.",
        severity: "warning"
      });
      return;
    }

    // Verificar se o produto existe
    const produtoExiste = produtos.some(p => p.codigo_barra === novoItem.codigoBarra);
    if (!produtoExiste) {
      setSnackbar({
        open: true,
        message: "Código de barras não encontrado.",
        severity: "error"
      });
      return;
    }

    // Atualizar o item na lista
    const itensAtualizados = venda.itens.map((item, index) =>
      index === itemEditando.index
        ? { ...novoItem, qtdeProduto: parseInt(novoItem.qtdeProduto) }
        : item
    );

    setVenda({ ...venda, itens: itensAtualizados });

    // Limpar estados
    setNovoItem({
      codigoBarra: "",
      loteProduto: "",
      qtdeProduto: 1
    });
    setItemEditando(null);
    setDialogEdicao(false);

    setSnackbar({
      open: true,
      message: "Item atualizado com sucesso!",
      severity: "success"
    });
  };

  const removerItem = (index) => {
    const novosItens = venda.itens.filter((_, i) => i !== index);
    setVenda({ ...venda, itens: novosItens });
    
    setSnackbar({
      open: true,
      message: "Item removido com sucesso!",
      severity: "info"
    });
  };

  const calcularTotal = () => {
    return venda.itens.reduce((total, item) => {
      const preco = obterPrecoProduto(item.codigoBarra);
      return total + (preco * item.qtdeProduto);
    }, 0);
  };

  const registrarVenda = async () => {
    // Validações básicas
    if (!venda.cpfCliente || !venda.cpfVendedor) {
      setSnackbar({
        open: true,
        message: "Por favor, preencha os CPFs do cliente e vendedor.",
        severity: "warning"
      });
      return;
    }

    if (venda.itens.length === 0) {
      setSnackbar({
        open: true,
        message: "Por favor, adicione pelo menos um item à venda.",
        severity: "warning"
      });
      return;
    }

    // Verificar se CPF está completo (formatado)
    if (venda.cpfCliente.length !== 14 || venda.cpfVendedor.length !== 14) {
      setSnackbar({
        open: true,
        message: "Por favor, digite CPFs completos no formato 000.000.000-00.",
        severity: "warning"
      });
      return;
    }

    // Preparar dados EXATAMENTE como no Swagger (CPF formatado)
    const dadosVenda = {
      cpfCliente: venda.cpfCliente,
      cpfVendedor: venda.cpfVendedor,
      itens: venda.itens.map(item => ({
        codigoBarra: String(item.codigoBarra),
        loteProduto: String(item.loteProduto), 
        qtdeProduto: parseInt(item.qtdeProduto)
      }))
    };

    try {
      const response = await axios.post("http://localhost:8081/vendas", dadosVenda, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      setSnackbar({
        open: true,
        message: `Venda registrada com sucesso! ID: ${response.data.idVenda}`,
        severity: "success"
      });

      // Limpar formulário após sucesso
      setVenda({
        cpfCliente: "",
        cpfVendedor: "",
        itens: []
      });

      // Mostrar mensagem adicional e redirecionar após alguns segundos
      setTimeout(() => {
        setSnackbar({
          open: true,
          message: `Venda ${response.data.idVenda} pronta para emissão de NF! Redirecionando...`,
          severity: "info"
        });
        
        // Redirecionar para o histórico de vendas após 2 segundos
        setTimeout(() => {
          navigate("/historico-vendas-pelo-diretor");
        }, 2000);
      }, 3000);
      
    } catch (error) {
      console.error("Erro ao registrar venda:", error);

      let errorMessage = "Erro ao registrar venda.";
      
      if (error.response) {
        const status = error.response.status;
        
        switch (status) {
          case 400:
            errorMessage = "Dados inválidos. Verifique todos os campos.";
            break;
          case 404:
            errorMessage = "Cliente, vendedor ou produto não encontrado.";
            break;
          case 500:
            errorMessage = "Erro interno do servidor. Tente novamente.";
            break;
          default:
            errorMessage = `Erro do servidor (${status}).`;
        }
      } else if (error.request) {
        errorMessage = "Erro de conexão. Verifique sua internet.";
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error"
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fecharDialogs = () => {
    setDialogAberto(false);
    setDialogEdicao(false);
    setItemEditando(null);
    setNovoItem({
      codigoBarra: "",
      loteProduto: "",
      qtdeProduto: 1
    });
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
            <ShoppingCartIcon sx={{ fontSize: 36, color: '#F06292', mr: 2 }} />
            <Typography variant="h4" color="#333" fontWeight="500">
              Registro de Venda
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 4 }} />

          {/* Informações da Venda */}
          <Typography variant="h6" color="#555" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 1, color: '#F06292' }} />
            Informações da Venda
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CPF do Cliente"
                name="cpfCliente"
                value={venda.cpfCliente}
                onChange={(e) => formatCPF(e.target.value, 'cpfCliente')}
                required
                variant="outlined"
                placeholder="000.000.000-00"
                helperText="Digite: 390.533.447-05 ou 865.443.027-53"
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="CPF do Vendedor"
                name="cpfVendedor"
                value={venda.cpfVendedor}
                onChange={(e) => formatCPF(e.target.value, 'cpfVendedor')}
                required
                variant="outlined"
                placeholder="000.000.000-00"
                helperText="Digite: 865.443.027-53"
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />
            </Grid>
          </Grid>

          {/* Itens da Venda */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" color="#555" sx={{ display: 'flex', alignItems: 'center' }}>
              <InventoryIcon sx={{ mr: 1, color: '#F06292' }} />
              Itens da Venda
            </Typography>
            
            <Fab
              color="primary"
              size="small"
              onClick={() => setDialogAberto(true)}
              sx={{ 
                backgroundColor: '#F06292',
                '&:hover': { backgroundColor: '#E91E63' }
              }}
            >
              <AddIcon />
            </Fab>
          </Box>

          {/* Tabela de Itens */}
          {venda.itens.length > 0 ? (
            <TableContainer component={Paper} sx={{ mb: 3, boxShadow: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#F8F9FA' }}>
                    <TableCell><strong>Código de Barras</strong></TableCell>
                    <TableCell><strong>Produto</strong></TableCell>
                    <TableCell><strong>Lote</strong></TableCell>
                    <TableCell align="center"><strong>Quantidade</strong></TableCell>
                    <TableCell align="right"><strong>Preço Unit.</strong></TableCell>
                    <TableCell align="right"><strong>Subtotal</strong></TableCell>
                    <TableCell align="center"><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {venda.itens.map((item, index) => {
                    const preco = obterPrecoProduto(item.codigoBarra);
                    const subtotal = preco * item.qtdeProduto;
                    
                    return (
                      <TableRow key={index} hover>
                        <TableCell>{item.codigoBarra}</TableCell>
                        <TableCell>{obterNomeProduto(item.codigoBarra)}</TableCell>
                        <TableCell>{item.loteProduto}</TableCell>
                        <TableCell align="center">{item.qtdeProduto}</TableCell>
                        <TableCell align="right">R$ {preco.toFixed(2)}</TableCell>
                        <TableCell align="right">R$ {subtotal.toFixed(2)}</TableCell>
                        <TableCell align="center">
                          <IconButton 
                            color="primary" 
                            onClick={() => editarItem(index)}
                            size="small"
                            sx={{ mr: 1 }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton 
                            color="error" 
                            onClick={() => removerItem(index)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow sx={{ backgroundColor: '#F8F9FA' }}>
                    <TableCell colSpan={5} align="right">
                      <Typography variant="h6" fontWeight="bold">
                        Total da Venda:
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="h6" fontWeight="bold" color="#F06292">
                        R$ {calcularTotal().toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4, backgroundColor: '#F8F9FA', borderRadius: 2, mb: 3 }}>
              <Typography color="textSecondary">
                Nenhum item adicionado à venda. Clique no botão + para adicionar produtos.
              </Typography>
            </Box>
          )}

          {/* Botão de Registrar Venda */}
          <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={registrarVenda}
              disabled={venda.itens.length === 0}
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
                fontWeight: "bold"
              }}
              startIcon={<ReceiptIcon />}
            >
              Registrar Venda para Emissão de NF
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Dialog para Adicionar Item */}
      <Dialog 
        open={dialogAberto} 
        onClose={fecharDialogs}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#F06292', 
          color: 'white',
          textAlign: 'center',
          py: 2,
          fontWeight: 'bold'
        }}>
          Adicionar Item à Venda
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Código de Barras"
              name="codigoBarra"
              value={novoItem.codigoBarra}
              onChange={handleItemChange}
              variant="outlined"
              placeholder="Ex: 2002"
              helperText="Use: 2002 (Batom Vermelho)"
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Lote do Produto"
              name="loteProduto"
              value={novoItem.loteProduto}
              onChange={handleItemChange}
              variant="outlined"
              placeholder="Ex: L002"
              helperText="Use: L002"
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Quantidade"
              name="qtdeProduto"
              type="number"
              value={novoItem.qtdeProduto}
              onChange={handleItemChange}
              variant="outlined"
              inputProps={{ min: 1 }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'space-between' }}>
          <Button 
            onClick={fecharDialogs}
            color="inherit"
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 3,
              borderColor: '#ccc',
              '&:hover': {
                borderColor: '#999',
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={adicionarItem}
            variant="contained"
            sx={{ 
              backgroundColor: '#F06292',
              '&:hover': { backgroundColor: '#E91E63' },
              borderRadius: 2,
              px: 3,
              fontWeight: 'bold'
            }}
          >
            Adicionar Item
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para Editar Item */}
      <Dialog 
        open={dialogEdicao} 
        onClose={fecharDialogs}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#E91E63', 
          color: 'white',
          textAlign: 'center',
          py: 2,
          fontWeight: 'bold'
        }}>
          Editar Item da Venda
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Código de Barras"
              name="codigoBarra"
              value={novoItem.codigoBarra}
              onChange={handleItemChange}
              variant="outlined"
              placeholder="Digite o código de barras do produto"
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Lote do Produto"
              name="loteProduto"
              value={novoItem.loteProduto}
              onChange={handleItemChange}
              variant="outlined"
              placeholder="Digite o lote do produto"
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Quantidade"
              name="qtdeProduto"
              type="number"
              value={novoItem.qtdeProduto}
              onChange={handleItemChange}
              variant="outlined"
              inputProps={{ min: 1 }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, justifyContent: 'space-between' }}>
          <Button 
            onClick={fecharDialogs}
            color="inherit"
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 3,
              borderColor: '#ccc',
              '&:hover': {
                borderColor: '#999',
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={salvarEdicaoItem}
            variant="contained"
            sx={{ 
              backgroundColor: '#E91E63',
              '&:hover': { backgroundColor: '#C2185B' },
              borderRadius: 2,
              px: 3,
              fontWeight: 'bold'
            }}
          >
            Salvar Alterações
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensagens */}
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
          sx={{ 
            width: '100%',
            '& .MuiAlert-message': {
              fontSize: '14px'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RegistroVenda;
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
  DialogActions,
  Card,
  CardContent,
  Chip,
  CircularProgress
} from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import HistoryIcon from '@mui/icons-material/History';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TrocaPedidoDiretor = () => {
  const [busca, setBusca] = useState("");
  const [vendaOriginal, setVendaOriginal] = useState(null);
  const [vendaAtual, setVendaAtual] = useState(null);
  const [buscando, setBuscando] = useState(false);
  const [processandoTroca, setProcessandoTroca] = useState(false);
  const [produtos, setProdutos] = useState([]);
  
  const [novoItem, setNovoItem] = useState({
    codigoBarra: "",
    loteProduto: "",
    qtdeProduto: 1
  });

  const [dialogAberto, setDialogAberto] = useState(false);
  const [dialogEdicao, setDialogEdicao] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);
  const [dialogHistorico, setDialogHistorico] = useState(false);
  
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
      }
    };
    buscarProdutos();
  }, []);

  // Função para buscar venda pelo ID
  const buscarVenda = async () => {
    if (!busca.trim()) {
      setSnackbar({
        open: true,
        message: "Digite o ID da venda para buscar.",
        severity: "warning"
      });
      return;
    }

    setBuscando(true);
    try {
      const response = await axios.get(`http://localhost:8081/vendas/${busca.trim()}`);
      
      // Buscar detalhes dos produtos
      const produtosResponse = await axios.get('http://localhost:8081/produtos');
      const produtosList = produtosResponse.data;
      
      // Enriquecer itens com informações dos produtos
      const itensComDetalhes = response.data.itens.map(item => {
        const produto = produtosList.find(p => p.codigo_barra === item.codigoBarra);
        return {
          ...item,
          nomeProduto: produto?.nome || 'Produto não encontrado',
          valorUnitario: produto ? parseFloat(produto.preco) : 0
        };
      });

      const vendaCompleta = {
        ...response.data,
        itens: itensComDetalhes
      };

      setVendaOriginal(vendaCompleta);
      setVendaAtual(JSON.parse(JSON.stringify(vendaCompleta))); // Deep clone
      
      setSnackbar({
        open: true,
        message: `Venda #${response.data.idVenda} carregada com sucesso!`,
        severity: "success"
      });

    } catch (error) {
      console.error("Erro ao buscar venda:", error);
      setVendaOriginal(null);
      setVendaAtual(null);
      
      let errorMessage = "Erro ao buscar venda.";
      if (error.response?.status === 404) {
        errorMessage = "Venda não encontrada. Verifique o ID.";
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error"
      });
    } finally {
      setBuscando(false);
    }
  };

  const obterNomeProduto = (codigoBarra) => {
    const produto = produtos.find(p => p.codigo_barra === codigoBarra);
    return produto ? produto.nome : "Produto não encontrado";
  };

  const obterPrecoProduto = (codigoBarra) => {
    const produto = produtos.find(p => p.codigo_barra === codigoBarra);
    return produto ? parseFloat(produto.preco) : 0;
  };

  const calcularTotalOriginal = () => {
    if (!vendaOriginal) return 0;
    return vendaOriginal.itens.reduce((total, item) => {
      return total + (item.valorUnitario * item.qtdeProduto);
    }, 0);
  };

  const calcularTotalAtual = () => {
    if (!vendaAtual) return 0;
    return vendaAtual.itens.reduce((total, item) => {
      const preco = item.valorUnitario || obterPrecoProduto(item.codigoBarra);
      return total + (preco * item.qtdeProduto);
    }, 0);
  };

  const calcularDiferenca = () => {
    return calcularTotalAtual() - calcularTotalOriginal();
  };

  // Validação de produtos duplicados
  const validarProdutosDuplicados = () => {
    if (!vendaOriginal || !vendaAtual) return { valido: true };
    
    const produtosDuplicados = [];
    
    for (let itemOriginal of vendaOriginal.itens) {
      for (let itemNovo of vendaAtual.itens) {
        if (itemOriginal.codigoBarra === itemNovo.codigoBarra && 
            itemOriginal.loteProduto === itemNovo.loteProduto) {
          produtosDuplicados.push({
            codigo: itemOriginal.codigoBarra,
            lote: itemOriginal.loteProduto,
            nome: itemOriginal.nomeProduto || obterNomeProduto(itemOriginal.codigoBarra)
          });
        }
      }
    }
    
    if (produtosDuplicados.length > 0) {
      return {
        valido: false,
        produtos: produtosDuplicados,
        mensagem: `Não é possível trocar pelos mesmos produtos da venda original: ${produtosDuplicados.map(p => p.nome).join(', ')}`
      };
    }
    
    return { valido: true };
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setNovoItem(prev => ({ ...prev, [name]: value }));
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

    const produtoExiste = produtos.some(p => p.codigo_barra === novoItem.codigoBarra);
    if (!produtoExiste) {
      setSnackbar({
        open: true,
        message: "Código de barras não encontrado.",
        severity: "error"
      });
      return;
    }

    // Verificar se é o mesmo produto da venda original
    const ehProdutoOriginal = vendaOriginal?.itens.some(item => 
      item.codigoBarra === novoItem.codigoBarra && 
      item.loteProduto === novoItem.loteProduto
    );

    if (ehProdutoOriginal) {
      const nomeProduto = obterNomeProduto(novoItem.codigoBarra);
      setSnackbar({
        open: true,
        message: `🚫 Não é possível trocar pelo mesmo produto da venda original: ${nomeProduto} (${novoItem.codigoBarra}). Escolha um produto diferente.`,
        severity: "error"
      });
      return;
    }

    const itemExistente = vendaAtual.itens.find(item => 
      item.codigoBarra === novoItem.codigoBarra && 
      item.loteProduto === novoItem.loteProduto
    );

    if (itemExistente) {
      const itensAtualizados = vendaAtual.itens.map(item =>
        item.codigoBarra === novoItem.codigoBarra && item.loteProduto === novoItem.loteProduto
          ? { ...item, qtdeProduto: item.qtdeProduto + parseInt(novoItem.qtdeProduto) }
          : item
      );
      setVendaAtual({ ...vendaAtual, itens: itensAtualizados });
    } else {
      const novoItemCompleto = {
        ...novoItem,
        qtdeProduto: parseInt(novoItem.qtdeProduto),
        nomeProduto: obterNomeProduto(novoItem.codigoBarra),
        valorUnitario: obterPrecoProduto(novoItem.codigoBarra)
      };
      
      setVendaAtual({
        ...vendaAtual,
        itens: [...vendaAtual.itens, novoItemCompleto]
      });
    }

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
    const item = vendaAtual.itens[index];
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

    const produtoExiste = produtos.some(p => p.codigo_barra === novoItem.codigoBarra);
    if (!produtoExiste) {
      setSnackbar({
        open: true,
        message: "Código de barras não encontrado.",
        severity: "error"
      });
      return;
    }

    // Verificar se é o mesmo produto da venda original (na edição)
    const ehProdutoOriginal = vendaOriginal?.itens.some(item => 
      item.codigoBarra === novoItem.codigoBarra && 
      item.loteProduto === novoItem.loteProduto
    );

    if (ehProdutoOriginal) {
      const nomeProduto = obterNomeProduto(novoItem.codigoBarra);
      setSnackbar({
        open: true,
        message: `🚫 Não é possível trocar pelo mesmo produto da venda original: ${nomeProduto} (${novoItem.codigoBarra}). Escolha um produto diferente.`,
        severity: "error"
      });
      return;
    }

    const itensAtualizados = vendaAtual.itens.map((item, index) =>
      index === itemEditando.index
        ? { 
            ...novoItem, 
            qtdeProduto: parseInt(novoItem.qtdeProduto),
            nomeProduto: obterNomeProduto(novoItem.codigoBarra),
            valorUnitario: obterPrecoProduto(novoItem.codigoBarra)
          }
        : item
    );

    setVendaAtual({ ...vendaAtual, itens: itensAtualizados });

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
    const novosItens = vendaAtual.itens.filter((_, i) => i !== index);
    setVendaAtual({ ...vendaAtual, itens: novosItens });
    
    setSnackbar({
      open: true,
      message: "Item removido com sucesso!",
      severity: "info"
    });
  };

  const processarTroca = async () => {
    if (!vendaAtual) {
      setSnackbar({
        open: true,
        message: "Nenhuma venda selecionada para troca.",
        severity: "warning"
      });
      return;
    }

    if (vendaAtual.itens.length === 0) {
      setSnackbar({
        open: true,
        message: "A venda precisa ter pelo menos um item.",
        severity: "warning"
      });
      return;
    }

    const diferenca = calcularDiferenca();
    if (diferenca < 0) {
      setSnackbar({
        open: true,
        message: `Valor da troca não pode ser menor que o original. Diferença: ${formatarValor(diferenca)}`,
        severity: "error"
      });
      return;
    }

    // Validação local antes de enviar
    const validacao = validarProdutosDuplicados();
    if (!validacao.valido) {
      setSnackbar({
        open: true,
        message: `🚫 ${validacao.mensagem}`,
        severity: "error"
      });
      return;
    }

    setProcessandoTroca(true);

    try {
      // Preparar dados para API de troca (formato correto)
      const dadosTroca = {
        troca: {
          idVendaOriginal: vendaOriginal.idVenda
        },
        vendaOriginal: {
          idVenda: vendaOriginal.idVenda,
          cpfCliente: vendaOriginal.cpfCliente,
          cpfVendedor: vendaOriginal.cpfVendedor,
          itens: vendaOriginal.itens.map(item => ({
            codigoBarra: String(item.codigoBarra),
            loteProduto: String(item.loteProduto),
            qtdeProduto: parseInt(item.qtdeProduto)
          }))
        },
        vendaNova: {
          cpfCliente: vendaAtual.cpfCliente,
          cpfVendedor: vendaAtual.cpfVendedor
        },
        itensVendaNova: vendaAtual.itens.map(item => ({
          codigoBarra: String(item.codigoBarra),
          loteProduto: String(item.loteProduto),
          qtdeProduto: parseInt(item.qtdeProduto)
        }))
      };

      console.log('🔄 Enviando dados da troca:', dadosTroca);

      // Usar API de troca
      const response = await axios.post(
        'http://localhost:8081/trocas/processar',
        dadosTroca,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 60000 // 60 segundos
        }
      );

      console.log('✅ Resposta da troca:', response.data);

      // 🆕 MELHORADO: Salvar informações detalhadas da troca no localStorage (alinhado com backend)
      const trocaParaHistorico = {
        id: Date.now(),
        vendaId: vendaOriginal.idVenda,
        trocaId: response.data.idTroca,
        novaVendaId: response.data.idVendaNova,
        dataHora: new Date().toISOString(),
        
        // 🆕 Informações detalhadas da troca (estrutura simplificada)
        tipoOperacao: 'TROCA',
        vendaOriginal: {
          id: vendaOriginal.idVenda,
          itens: vendaOriginal.itens.map(item => ({
            codigoBarra: item.codigoBarra,
            nomeProduto: item.nomeProduto,
            loteProduto: item.loteProduto,
            qtdeProduto: item.qtdeProduto,
            valorUnitario: item.valorUnitario
          })),
          valorTotal: calcularTotalOriginal()
        },
        vendaNova: {
          id: response.data.idVendaNova,
          itens: vendaAtual.itens.map(item => ({
            codigoBarra: item.codigoBarra,
            nomeProduto: item.nomeProduto,
            loteProduto: item.loteProduto,
            qtdeProduto: item.qtdeProduto,
            valorUnitario: item.valorUnitario
          })),
          valorTotal: calcularTotalAtual()
        },
        
        // 🆕 Informações financeiras da troca
        financeiro: {
          valorOriginal: calcularTotalOriginal(),
          valorNovo: calcularTotalAtual(),
          diferenca: diferenca,
          valorAdicional: diferenca > 0 ? diferenca : 0
        },
        
        cliente: {
          cpf: vendaOriginal.cpfCliente,
          nome: vendaOriginal.nomeCliente || 'Cliente não identificado'
        },
        
        usuario: 'Diretor',
        status: 'Concluída'
      };

      // 🆕 Salvar no localStorage com as informações de troca
      const historico = JSON.parse(localStorage.getItem('historico_trocas') || '[]');
      historico.unshift(trocaParaHistorico);
      if (historico.length > 50) {
        historico.splice(50);
      }
      localStorage.setItem('historico_trocas', JSON.stringify(historico));

      // 🆕 IMPORTANTE: Atualizar a nova venda no histórico principal para indicar que é uma troca
      try {
        const historicoVendas = JSON.parse(localStorage.getItem('historico_vendas') || '[]');
        
        // Procurar e atualizar a nova venda para marcar como troca
        const vendaIndex = historicoVendas.findIndex(v => v.id === response.data.idVendaNova);
        if (vendaIndex !== -1) {
          historicoVendas[vendaIndex] = {
            ...historicoVendas[vendaIndex],
            tipoOperacao: 'TROCA',
            vendaOriginalId: vendaOriginal.idVenda,
            valorAdicional: diferenca > 0 ? diferenca : 0,
            trocaId: response.data.idTroca,
            dadosTroca: trocaParaHistorico
          };
        } else {
          // Se não encontrou, adicionar nova entrada
          historicoVendas.unshift({
            id: response.data.idVendaNova,
            tipoOperacao: 'TROCA',
            vendaOriginalId: vendaOriginal.idVenda,
            cpfCliente: vendaAtual.cpfCliente,
            nomeCliente: trocaParaHistorico.cliente.nome,
            cpfVendedor: vendaAtual.cpfVendedor,
            nomeVendedor: 'Diretor',
            dataVenda: new Date().toLocaleDateString('pt-BR'),
            horaVenda: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            dataHoraCompleta: new Date(),
            valorTotal: calcularTotalAtual(),
            valorAdicional: diferenca > 0 ? diferenca : 0,
            status: 'TROCA CONCLUÍDA',
            itens: vendaAtual.itens,
            trocaId: response.data.idTroca,
            dadosTroca: trocaParaHistorico
          });
        }
        
        localStorage.setItem('historico_vendas', JSON.stringify(historicoVendas));
      } catch (error) {
        console.warn('Erro ao atualizar histórico de vendas:', error);
      }

      setSnackbar({
        open: true,
        message: `✅ Troca realizada com sucesso! ID da troca: ${response.data.idTroca}. Nova venda: ${response.data.idVendaNova}. ${diferenca > 0 ? `💰 Valor adicional: ${formatarValor(diferenca)}` : '💸 Troca equivalente'}`,
        severity: "success"
      });

      // Limpar formulário
      setVendaOriginal(null);
      setVendaAtual(null);
      setBusca("");

      // Redirecionar após alguns segundos
      setTimeout(() => {
        navigate("/historico-vendas-pelo-diretor");
      }, 5000);

    } catch (error) {
      console.error("❌ Erro ao processar troca:", error);
      console.error("📋 Detalhes do erro:", error.response?.data);
      
      let errorMessage = "Erro ao processar troca.";
      
      if (error.response?.status === 400) {
        const responseData = error.response.data;
        
        if (typeof responseData === 'string' && 
            (responseData.includes('mesmo produto') || 
             responseData.includes('já está na venda original') ||
             responseData.includes('produto diferente') ||
             responseData.includes('Selecione um produto diferente'))) {
          errorMessage = `🚫 ${responseData}`;
        } else if (typeof responseData === 'string') {
          errorMessage = responseData.replace('Erro ao processar troca: ', '');
        } else if (responseData?.message) {
          errorMessage = responseData.message;
        } else {
          errorMessage = "Dados inválidos para a troca.";
        }
      } else if (error.response?.status === 404) {
        errorMessage = "Venda não encontrada no sistema.";
      } else if (error.response?.status === 500) {
        errorMessage = "Erro interno do servidor. Tente novamente.";
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Timeout: A operação demorou muito para responder.";
      } else if (!error.response) {
        errorMessage = "Erro de conexão. Verifique sua internet.";
      }
      
      // Salvar erro no histórico para debug
      const erroHistorico = {
        id: Date.now(),
        vendaId: vendaOriginal?.idVenda || 'Desconhecido',
        dataHora: new Date().toISOString(),
        erro: errorMessage,
        detalhes: error.response?.data || error.message,
        status: 'Erro',
        usuario: 'Diretor'
      };

      const historico = JSON.parse(localStorage.getItem('historico_trocas') || '[]');
      historico.unshift(erroHistorico);
      if (historico.length > 50) {
        historico.splice(50);
      }
      localStorage.setItem('historico_trocas', JSON.stringify(historico));
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error"
      });
    } finally {
      setProcessandoTroca(false);
    }
  };

  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const obterHistoricoTrocas = () => {
    return JSON.parse(localStorage.getItem('historico_trocas') || '[]')
      .slice(0, 10); // Mostrar apenas os 10 mais recentes
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SwapHorizIcon sx={{ fontSize: 36, color: '#F06292', mr: 2 }} />
              <Typography variant="h4" color="#333" fontWeight="500">
                Troca de Pedido
              </Typography>
            </Box>
            
            <IconButton
              onClick={() => setDialogHistorico(true)}
              sx={{ 
                backgroundColor: '#E3F2FD',
                color: '#1976D2',
                '&:hover': { backgroundColor: '#BBDEFB' }
              }}
              title="Ver histórico de trocas"
            >
              <HistoryIcon />
            </IconButton>
          </Box>
          
          <Divider sx={{ mb: 4 }} />

          {/* Aviso sobre produtos iguais */}
          <Alert 
            severity="info" 
            sx={{ mb: 3, borderRadius: 2 }}
            icon={<WarningIcon />}
          >
            <Typography variant="body2">
              <strong>Importante:</strong> Não é possível trocar pelos mesmos produtos da venda original. 
              Escolha produtos diferentes para realizar a troca.
            </Typography>
          </Alert>

          {/* Busca de Venda */}
          <Card sx={{ mb: 4, borderRadius: 2, border: '1px solid #E0E0E0' }}>
            <CardContent>
              <Typography variant="h6" color="#555" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <SearchIcon sx={{ mr: 1, color: '#F06292' }} />
                Buscar Venda para Troca
              </Typography>
              
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="ID da Venda (sem o #)"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Digite o ID da venda (ex: 1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6)"
                    variant="outlined"
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        buscarVenda();
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={buscarVenda}
                    disabled={buscando}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      backgroundColor: "#F06292",
                      "&:hover": { backgroundColor: "#E91E63" },
                      fontWeight: "bold"
                    }}
                    startIcon={buscando ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                  >
                    {buscando ? 'Buscando...' : 'Buscar Venda'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Informações da Venda */}
          {vendaOriginal && (
            <>
              <Card sx={{ mb: 4, borderRadius: 2, border: '1px solid #E0E0E0' }}>
                <CardContent>
                  <Typography variant="h6" color="#555" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ mr: 1, color: '#F06292' }} />
                    Informações da Venda #{vendaOriginal.idVenda}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography><strong>Cliente:</strong> {vendaOriginal.cpfCliente}</Typography>
                      <Typography><strong>Vendedor:</strong> {vendaOriginal.cpfVendedor}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography><strong>Data:</strong> {new Date(vendaOriginal.dataHoraVenda).toLocaleDateString('pt-BR')}</Typography>
                      <Typography><strong>Hora:</strong> {new Date(vendaOriginal.dataHoraVenda).toLocaleTimeString('pt-BR')}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Status de Validação */}
              {vendaAtual && vendaAtual.itens.length > 0 && (
                <>
                  {validarProdutosDuplicados().valido ? (
                    <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                      <Typography variant="body2">
                        ✅ <strong>Troca válida:</strong> Nenhum produto duplicado detectado.
                      </Typography>
                    </Alert>
                  ) : (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                      <Typography variant="body2">
                        🚫 <strong>Troca inválida:</strong> {validarProdutosDuplicados().mensagem}
                      </Typography>
                    </Alert>
                  )}
                </>
              )}

              {/* Resumo de Valores */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ borderRadius: 2, border: '2px solid #E0E0E0' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="#666" gutterBottom>
                        Valor Original
                      </Typography>
                      <Typography variant="h4" color="#666" fontWeight="bold">
                        {formatarValor(calcularTotalOriginal())}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ borderRadius: 2, border: '2px solid #F06292' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="#F06292" gutterBottom>
                        Valor Atual
                      </Typography>
                      <Typography variant="h4" color="#F06292" fontWeight="bold">
                        {formatarValor(calcularTotalAtual())}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ 
                    borderRadius: 2, 
                    border: `2px solid ${calcularDiferenca() >= 0 ? '#4CAF50' : '#F44336'}`,
                    backgroundColor: calcularDiferenca() >= 0 ? '#E8F5E8' : '#FFEBEE'
                  }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color={calcularDiferenca() >= 0 ? '#4CAF50' : '#F44336'} gutterBottom>
                        Diferença
                      </Typography>
                      <Typography variant="h4" color={calcularDiferenca() >= 0 ? '#4CAF50' : '#F44336'} fontWeight="bold">
                        {calcularDiferenca() >= 0 ? '+' : ''}{formatarValor(calcularDiferenca())}
                      </Typography>
                      {calcularDiferenca() < 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                          <WarningIcon sx={{ color: '#F44336', mr: 0.5, fontSize: 16 }} />
                          <Typography variant="caption" color="#F44336">
                            Valor inválido
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Itens da Venda */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" color="#555" sx={{ display: 'flex', alignItems: 'center' }}>
                  <InventoryIcon sx={{ mr: 1, color: '#F06292' }} />
                  Itens da Venda (Editável)
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

              {vendaAtual && vendaAtual.itens.length > 0 ? (
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
                      {vendaAtual.itens.map((item, index) => {
                        const preco = item.valorUnitario || obterPrecoProduto(item.codigoBarra);
                        const subtotal = preco * item.qtdeProduto;
                        
                        // Verificar se o item foi alterado
                        const itemOriginal = vendaOriginal.itens.find(orig => 
                          orig.codigoBarra === item.codigoBarra && orig.loteProduto === item.loteProduto
                        );
                        const foiAlterado = !itemOriginal || itemOriginal.qtdeProduto !== item.qtdeProduto;
                        const ehNovo = !itemOriginal;
                        const ehProdutoOriginal = !!itemOriginal;
                        
                        return (
                          <TableRow key={index} hover sx={{ 
                            backgroundColor: ehNovo ? '#E8F5E8' : (foiAlterado ? '#FFF3E0' : ehProdutoOriginal ? '#FFEBEE' : 'inherit')
                          }}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                {item.codigoBarra}
                                {ehNovo && <Chip label="NOVO" size="small" color="success" sx={{ ml: 1, mb: 0.5 }} />}
                                {foiAlterado && !ehNovo && <Chip label="ALTERADO" size="small" color="warning" sx={{ ml: 1, mb: 0.5 }} />}
                                {ehProdutoOriginal && <Chip label="🚫 MESMO PRODUTO" size="small" color="error" sx={{ ml: 1, mb: 0.5 }} />}
                              </Box>
                            </TableCell>
                            <TableCell>{item.nomeProduto || obterNomeProduto(item.codigoBarra)}</TableCell>
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
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4, backgroundColor: '#F8F9FA', borderRadius: 2, mb: 3 }}>
                  <Typography color="textSecondary">
                    Nenhum item na venda. Adicione produtos para processar a troca.
                  </Typography>
                </Box>
              )}

              {/* Botão de Processar Troca */}
              <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={processarTroca}
                  disabled={
                    !vendaAtual || 
                    vendaAtual.itens.length === 0 || 
                    calcularDiferenca() < 0 || 
                    processandoTroca ||
                    !validarProdutosDuplicados().valido
                  }
                  sx={{
                    px: 6,
                    py: 1.5,
                    borderRadius: 2,
                    backgroundColor: (calcularDiferenca() >= 0 && validarProdutosDuplicados().valido) ? "#4CAF50" : "#CCCCCC",
                    "&:hover": { backgroundColor: (calcularDiferenca() >= 0 && validarProdutosDuplicados().valido) ? "#45A049" : "#CCCCCC" },
                    "&:disabled": { backgroundColor: "#CCCCCC" },
                    transition: "all 0.2s",
                    "&:active": { transform: "scale(0.98)" },
                    boxShadow: (calcularDiferenca() >= 0 && validarProdutosDuplicados().valido) ? '0 4px 10px rgba(76, 175, 80, 0.3)' : 'none',
                    fontWeight: "bold",
                    minWidth: '200px'
                  }}
                  startIcon={
                    processandoTroca ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (calcularDiferenca() >= 0 && validarProdutosDuplicados().valido) ? (
                      <CheckCircleIcon />
                    ) : !validarProdutosDuplicados().valido ? (
                      <BlockIcon />
                    ) : (
                      <WarningIcon />
                    )
                  }
                >
                  {processandoTroca 
                    ? 'Processando...' 
                    : !validarProdutosDuplicados().valido
                      ? 'Produtos Duplicados'
                      : calcularDiferenca() >= 0 
                        ? 'Processar Troca' 
                        : 'Troca Inválida'
                  }
                </Button>
              </Box>
            </>
          )}
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
          Adicionar Item à Troca
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Atenção:</strong> Não adicione produtos que já estão na venda original.
            </Typography>
          </Alert>
          
          <Box sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Código de Barras"
              name="codigoBarra"
              value={novoItem.codigoBarra}
              onChange={handleItemChange}
              variant="outlined"
              placeholder="Ex: 2002"
              helperText="Use: 1001, 1002, 2001, 2002, 3001, 4001, etc."
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
              helperText="Use: L001, L002, L003, etc."
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
          Editar Item da Troca
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            <Typography variant="body2">
              <strong>Atenção:</strong> Não use produtos que já estão na venda original.
            </Typography>
          </Alert>
          
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

      {/* Dialog de Histórico de Trocas */}
      <Dialog
        open={dialogHistorico}
        onClose={() => setDialogHistorico(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#1976D2', 
          color: 'white',
          textAlign: 'center',
          py: 2,
          fontWeight: 'bold'
        }}>
          <HistoryIcon sx={{ mr: 1 }} />
          Histórico de Trocas
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {obterHistoricoTrocas().length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="textSecondary">
                Nenhuma troca realizada ainda.
              </Typography>
            </Box>
          ) : (
            <Box>
              {obterHistoricoTrocas().map((registro, index) => (
                <Card key={registro.id} sx={{ mb: 2, border: '1px solid #E0E0E0' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" color="#F06292">
                        {registro.status === 'Erro' ? (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <WarningIcon sx={{ mr: 1, color: '#F44336' }} />
                            Erro na Troca
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CheckCircleIcon sx={{ mr: 1, color: '#4CAF50' }} />
                            Venda #{registro.vendaId}
                          </Box>
                        )}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(registro.dataHora).toLocaleString('pt-BR')}
                      </Typography>
                    </Box>
                    
                    {registro.status === 'Erro' ? (
                      <>
                        <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                          <strong>Erro:</strong> {registro.erro}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Venda: {registro.vendaId}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          <strong>Troca ID:</strong> {registro.trocaId}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          <strong>Nova Venda:</strong> {registro.novaVendaId}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Diferença: <strong style={{ color: registro.financeiro?.diferenca >= 0 ? '#4CAF50' : '#F44336' }}>
                            {formatarValor(registro.financeiro?.diferenca || 0)}
                          </strong>
                        </Typography>
                      </>
                    )}
                    
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      Usuário: {registro.usuario}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setDialogHistorico(false)}
            variant="outlined"
            sx={{ borderColor: '#1976D2', color: '#1976D2' }}
          >
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensagens */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={8000}
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
              fontSize: '14px',
              maxWidth: '600px',
              wordWrap: 'break-word'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TrocaPedidoDiretor;
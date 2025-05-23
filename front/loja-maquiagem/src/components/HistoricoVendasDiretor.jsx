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
    Chip,
    CircularProgress,
    Container,
    Divider,
    Snackbar,
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid,
    Card,
    CardContent
} from '@mui/material';
import { Add, Search, Visibility, Receipt, ExpandMore, SwapHoriz, CompareArrows } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const HistoricoVendasPeloDiretor = () => {
    const [vendas, setVendas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'info'
    });
    const [detailsDialog, setDetailsDialog] = useState({
        open: false,
        venda: null
    });
    const [nfDialog, setNfDialog] = useState({
        open: false,
        venda: null,
        processando: false,
        numeroNF: null
    });
    
    const navigate = useNavigate();

    const fetchVendas = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8081/vendas');
            console.log('Vendas recebidas:', response.data);
            
            // Debug: Ver estrutura da primeira venda
            if (response.data.length > 0) {
                console.log('Estrutura da primeira venda:', response.data[0]);
                console.log('Campo dataHoraVenda:', response.data[0].dataHoraVenda);
            }
            
            // Processar dados das vendas com busca de nomes e cálculo de valores
            const vendasProcessadas = await Promise.all(response.data.map(async (venda) => {
                let nomeCliente = 'Cliente não identificado';
                let nomeVendedor = 'Vendedor não identificado';
                let valorTotal = 0;

                // Buscar nome do cliente
                if (venda.cpfCliente) {
                    try {
                        const clienteResponse = await axios.get(`http://localhost:8081/clientes/${venda.cpfCliente}`);
                        nomeCliente = clienteResponse.data.nome || 'Cliente não identificado';
                    } catch (error) {
                        console.log(`Cliente não encontrado para CPF: ${venda.cpfCliente}`);
                    }
                }

                // Buscar nome do vendedor
                if (venda.cpfVendedor) {
                    try {
                        const vendedorResponse = await axios.get(`http://localhost:8081/vendedores/${venda.cpfVendedor}`);
                        nomeVendedor = vendedorResponse.data.nome || 'Vendedor não identificado';
                    } catch (error) {
                        console.log(`Vendedor não encontrado para CPF: ${venda.cpfVendedor}`);
                    }
                }

                // Calcular valor total dos itens se não veio do backend
                if (venda.itens && venda.itens.length > 0 && (!venda.valorTotal || venda.valorTotal === 0)) {
                    try {
                        const produtosResponse = await axios.get('http://localhost:8081/produtos');
                        const produtos = produtosResponse.data;
                        
                        valorTotal = venda.itens.reduce((total, item) => {
                            const produto = produtos.find(p => p.codigo_barra === item.codigoBarra);
                            const preco = produto ? parseFloat(produto.preco) : 0;
                            return total + (preco * parseInt(item.qtdeProduto));
                        }, 0);
                    } catch (error) {
                        console.error('Erro ao calcular valor total:', error);
                        valorTotal = venda.valorTotal || 0;
                    }
                } else {
                    valorTotal = venda.valorTotal || 0;
                }

                // Usar a data/hora correta do backend (dataHoraVenda)
                const dataOriginal = venda.dataHoraVenda ? new Date(venda.dataHoraVenda) : 
                                   (venda.dataVenda ? new Date(venda.dataVenda) : new Date());
                
                console.log(`Venda ${venda.idVenda}: dataHoraVenda=${venda.dataHoraVenda}, dataProcessada=${dataOriginal.toLocaleString('pt-BR')}`);
                
                return {
                    id: venda.idVenda || 'N/A',
                    cpfCliente: venda.cpfCliente || 'N/A',
                    nomeCliente: nomeCliente,
                    cpfVendedor: venda.cpfVendedor || 'N/A',
                    nomeVendedor: nomeVendedor,
                    dataVenda: dataOriginal.toLocaleDateString('pt-BR'),
                    horaVenda: dataOriginal.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    dataHoraCompleta: dataOriginal, // Para ordenação
                    valorTotal: valorTotal,
                    status: venda.status || 'CONCLUÍDA',
                    itens: venda.itens || [],
                    // 🆕 Verificar se é uma troca
                    tipoOperacao: venda.tipoOperacao || 'VENDA',
                    vendaOriginalId: venda.vendaOriginalId || null,
                    trocaId: venda.trocaId || null,
                    valorAdicional: venda.valorAdicional || 0
                };
            }));
            
            // Inicializar com vendas processadas
            let vendasComTrocas = [...vendasProcessadas];
            
            // Buscar dados de trocas do banco de dados
            try {
                const trocasResponse = await axios.get('http://localhost:8081/trocas');
                const trocasBD = trocasResponse.data;
                
                // Processar trocas do banco de dados
                trocasBD.forEach(troca => {
                    if (troca.status === 'CONCLUIDA' && troca.novaVendaId) {
                        const vendaExistente = vendasComTrocas.find(v => v.id === troca.novaVendaId);
                        if (!vendaExistente) {
                            // Adicionar nova venda de troca do BD
                            vendasComTrocas.push({
                                id: troca.novaVendaId,
                                cpfCliente: troca.cpfCliente || 'N/A',
                                nomeCliente: troca.nomeCliente || 'Cliente não identificado',
                                cpfVendedor: troca.cpfVendedor || 'N/A',
                                nomeVendedor: troca.nomeVendedor || 'Diretor',
                                dataVenda: new Date(troca.dataHoraTroca).toLocaleDateString('pt-BR'),
                                horaVenda: new Date(troca.dataHoraTroca).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                                dataHoraCompleta: new Date(troca.dataHoraTroca),
                                valorTotal: troca.valorTotalNovo || 0,
                                status: 'TROCA CONCLUÍDA',
                                itens: troca.itensNovos || [],
                                tipoOperacao: 'TROCA',
                                vendaOriginalId: troca.vendaOriginalId,
                                trocaId: troca.idTroca,
                                valorAdicional: troca.valorAdicional || 0,
                                dadosTroca: troca
                            });
                        } else {
                            // Atualizar venda existente com informações de troca do BD
                            vendaExistente.tipoOperacao = 'TROCA';
                            vendaExistente.vendaOriginalId = troca.vendaOriginalId;
                            vendaExistente.trocaId = troca.idTroca;
                            vendaExistente.valorAdicional = troca.valorAdicional || 0;
                            vendaExistente.dadosTroca = troca;
                            vendaExistente.status = 'TROCA CONCLUÍDA';
                        }
                    }
                });
            } catch (error) {
                console.error('Erro ao buscar trocas do BD:', error);
                // Fallback para localStorage se houver erro na API
                try {
                    const trocasLocalStorage = JSON.parse(localStorage.getItem('historico_trocas') || '[]');
                    
                    // Processar trocas do localStorage como fallback
                    trocasLocalStorage.forEach(troca => {
                        if (troca.status === 'CONCLUIDA' && troca.vendaNova && troca.vendaNova.id) {
                            const vendaExistente = vendasComTrocas.find(v => v.id === troca.vendaNova.id);
                            if (!vendaExistente) {
                                // Adicionar nova venda de troca do localStorage
                                vendasComTrocas.push({
                                    id: troca.vendaNova.id,
                                    cpfCliente: troca.vendaOriginal?.cpfCliente || 'N/A',
                                    nomeCliente: troca.vendaOriginal?.nomeCliente || 'Cliente não identificado',
                                    cpfVendedor: 'DIRETOR',
                                    nomeVendedor: 'Diretor',
                                    dataVenda: new Date(troca.dataHora).toLocaleDateString('pt-BR'),
                                    horaVenda: new Date(troca.dataHora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                                    dataHoraCompleta: new Date(troca.dataHora),
                                    valorTotal: troca.vendaNova.valorTotal || 0,
                                    status: 'TROCA CONCLUÍDA',
                                    itens: troca.vendaNova.itens || [],
                                    tipoOperacao: 'TROCA',
                                    vendaOriginalId: troca.vendaOriginal?.id,
                                    trocaId: troca.id,
                                    valorAdicional: troca.financeiro?.valorAdicional || 0,
                                    dadosTroca: troca
                                });
                            } else {
                                // Atualizar venda existente com informações de troca do localStorage
                                vendaExistente.tipoOperacao = 'TROCA';
                                vendaExistente.vendaOriginalId = troca.vendaOriginal?.id;
                                vendaExistente.trocaId = troca.id;
                                vendaExistente.valorAdicional = troca.financeiro?.valorAdicional || 0;
                                vendaExistente.dadosTroca = troca;
                                vendaExistente.status = 'TROCA CONCLUÍDA';
                            }
                        }
                    });
                } catch (localStorageError) {
                    console.error('Erro ao acessar localStorage:', localStorageError);
                }
            }
                        
            // Ordenar por data/hora mais recente primeiro
            vendasComTrocas.sort((a, b) => b.dataHoraCompleta - a.dataHoraCompleta);
            
            setVendas(vendasComTrocas);
            setError(null);
        } catch (err) {
            console.error('Erro ao buscar vendas:', err);
            setError('Erro ao carregar histórico de vendas. Por favor, tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendas();
    }, []);

    const handleViewDetails = async (venda) => {
        // Buscar detalhes completos dos produtos para o modal
        let vendaComDetalhes = { ...venda };
        
        if (venda.itens && venda.itens.length > 0) {
            try {
                const produtosResponse = await axios.get('http://localhost:8081/produtos');
                const produtos = produtosResponse.data;
                
                const itensComDetalhes = venda.itens.map(item => {
                    const produto = produtos.find(p => p.codigo_barra === item.codigoBarra);
                    return {
                        ...item,
                        nomeProduto: produto?.nome || item.nomeProduto || 'Produto não encontrado',
                        valorUnitario: produto ? parseFloat(produto.preco) : (item.valorUnitario || 0)
                    };
                });
                
                vendaComDetalhes.itens = itensComDetalhes;
            } catch (error) {
                console.error('Erro ao buscar detalhes dos produtos:', error);
            }
        }
        
        setDetailsDialog({
            open: true,
            venda: vendaComDetalhes
        });
    };

    const handleCloseDetailsDialog = () => {
        setDetailsDialog({
            open: false,
            venda: null
        });
    };

    const handleEmitirNF = (venda) => {
        const numeroNF = `NF-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999) + 100000)}`;
        setNfDialog({
            open: true,
            venda: venda,
            processando: false,
            numeroNF: numeroNF
        });
    };

    const handleCloseNFDialog = () => {
        setNfDialog({
            open: false,
            venda: null,
            processando: false,
            numeroNF: null
        });
    };

    const processarNF = async () => {
        setNfDialog(prev => ({ ...prev, processando: true }));
        
        // Simulação de processamento (2-4 segundos)
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 2000));
        
        // Simular geração de PDF
        gerarPDFNF(nfDialog.venda, nfDialog.numeroNF);
        
        setNfDialog(prev => ({ ...prev, processando: false }));
        
        setSnackbar({
            open: true,
            message: `✅ Nota Fiscal ${nfDialog.numeroNF} emitida com sucesso!`,
            severity: "success"
        });
        
        setTimeout(() => {
            handleCloseNFDialog();
        }, 1000);
    };

    const gerarPDFNF = (venda, numeroNF) => {
        // 🆕 Título específico para trocas
        const tipoDocumento = venda.tipoOperacao === 'TROCA' ? 'NOTA FISCAL DE TROCA' : 'NOTA FISCAL ELETRÔNICA';
        const infoTroca = venda.tipoOperacao === 'TROCA' ? `
            <div style="background: #E3F2FD; padding: 10px; margin: 10px 0; border-radius: 5px;">
                <strong>🔄 OPERAÇÃO DE TROCA</strong><br/>
                Venda Original: #${venda.vendaOriginalId}<br/>
                ${venda.valorAdicional > 0 ? `Valor Adicional Pago: ${formatarValor(venda.valorAdicional)}` : 'Troca Equivalente'}
            </div>
        ` : '';
        
        // Criar conteúdo HTML da NF
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Nota Fiscal ${numeroNF}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .header { text-align: center; border-bottom: 2px solid #F06292; padding-bottom: 20px; margin-bottom: 20px; }
                    .company { color: #F06292; font-size: 24px; font-weight: bold; }
                    .nf-number { font-size: 18px; margin: 10px 0; }
                    .section { margin: 20px 0; }
                    .section-title { background: #F06292; color: white; padding: 8px; font-weight: bold; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 10px 0; }
                    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #FCE4EC; }
                    .total { background: #E8F5E8; font-weight: bold; text-align: right; }
                    .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
                    .troca-info { background: #E3F2FD; padding: 10px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #2196F3; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="company">🏪 LOJA MAQUIAGEM & CIA</div>
                    <div>CNPJ: 12.345.678/0001-90 | IE: 123.456.789</div>
                    <div>Rua das Flores, 123 - Centro -  Sumaré/SP</div>
                    <div class="nf-number">${tipoDocumento} Nº ${numeroNF}</div>
                    <div>Data de Emissão: ${new Date().toLocaleString('pt-BR')}</div>
                </div>
                
                ${infoTroca}
                
                <div class="section">
                    <div class="section-title">👤 DADOS DO CLIENTE</div>
                    <div class="info-grid">
                        <div><strong>Nome:</strong> ${venda.nomeCliente}</div>
                        <div><strong>CPF:</strong> ${formatarCPF(venda.cpfCliente)}</div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">👨‍💼 DADOS DO VENDEDOR</div>
                    <div class="info-grid">
                        <div><strong>Nome: </strong>Maquiagem e Cia Ltda</div>
                        <div><strong>CNPJ: </strong>12.345.678-0001-90</div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">🛍️ PRODUTOS E SERVIÇOS</div>
                    <table>
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Código</th>
                                <th>Qtd</th>
                                <th>Valor Unit.</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${venda.itens.map(item => `
                                <tr>
                                    <td>${item.nomeProduto || 'Produto'}</td>
                                    <td>${item.codigoBarra}</td>
                                    <td>${item.qtdeProduto}</td>
                                    <td>${formatarValor(item.valorUnitario || 0)}</td>
                                    <td>${formatarValor((item.valorUnitario || 0) * item.qtdeProduto)}</td>
                                </tr>
                            `).join('')}
                            <tr class="total">
                                <td colspan="4"><strong>VALOR TOTAL DA NOTA</strong></td>
                                <td><strong>${formatarValor(venda.valorTotal)}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="section">
                    <div class="section-title">💰 RESUMO FINANCEIRO</div>
                    <table>
                        <tr><td>Base de Cálculo ICMS</td><td class="total">${formatarValor(venda.valorTotal)}</td></tr>
                        <tr><td>Valor do ICMS</td><td class="total">${formatarValor(venda.valorTotal * 0.18)}</td></tr>
                        <tr><td>Valor Total dos Produtos</td><td class="total">${formatarValor(venda.valorTotal)}</td></tr>
                        ${venda.tipoOperacao === 'TROCA' && venda.valorAdicional > 0 ? 
                            `<tr><td>Valor Adicional da Troca</td><td class="total">${formatarValor(venda.valorAdicional)}</td></tr>` : ''}
                        <tr class="total"><td><strong>VALOR TOTAL DA NF</strong></td><td><strong>${formatarValor(venda.valorTotal)}</strong></td></tr>
                    </table>
                </div>

                <div class="footer">
                    <p>📋 Esta é uma simulação de Nota Fiscal Eletrônica gerada pelo sistema.</p>
                    <p>🔐 Chave de Acesso: ${generateRandomKey()}</p>
                    <p>⚡ Gerado em ${new Date().toLocaleString('pt-BR')}</p>
                    ${venda.tipoOperacao === 'TROCA' ? '<p>🔄 Documento referente à operação de troca de mercadoria.</p>' : ''}
                </div>
            </body>
            </html>
        `;

        // Criar e baixar o arquivo HTML (simula PDF)
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NF_${numeroNF}_${venda.nomeCliente.replace(/\s+/g, '_')}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const generateRandomKey = () => {
        return Array.from({length: 44}, () => Math.floor(Math.random() * 10)).join('');
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const filteredVendas = vendas.filter(venda => {
        const searchTermLower = searchTerm.toLowerCase();
        return venda.id.toString().toLowerCase().includes(searchTermLower) || 
               venda.nomeCliente.toLowerCase().includes(searchTermLower) ||
               venda.nomeVendedor.toLowerCase().includes(searchTermLower) ||
               venda.cpfCliente.toLowerCase().includes(searchTermLower);
    });

    const formatarCPF = (cpf) => {
        if (!cpf || cpf === 'N/A') return cpf;
        const cpfNumeros = cpf.replace(/\D/g, '');
        if (cpfNumeros.length !== 11) return cpf;
        return cpfNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };

    const formatarValor = (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    // 🆕 Componente para renderizar detalhes de troca
    const DetalhesTroca = ({ venda }) => {
        if (venda.tipoOperacao !== 'TROCA') return null;

        // Verificações de segurança para evitar erros
        const dadosTroca = venda.dadosTroca || {};
        const financeiro = dadosTroca.financeiro || {};
        const vendaOriginal = dadosTroca.vendaOriginal || {};
        const vendaNova = dadosTroca.vendaNova || {};
        const itensOriginais = vendaOriginal.itens || [];
        const itensNovos = vendaNova.itens || [];
        
        return (
            <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom color="#F06292" sx={{ display: 'flex', alignItems: 'center' }}>
                    <SwapHoriz sx={{ mr: 1 }} />
                    Informações da Troca
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                    <Typography variant="body2">
                        <strong>🔄 Esta é uma venda resultante de uma troca de produtos.</strong>
                    </Typography>
                </Alert>

                {venda.dadosTroca ? (
                    <>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={6}>
                                <Card variant="outlined" sx={{ p: 2, borderColor: '#F06292' }}>
                                    <Typography variant="subtitle1" fontWeight="bold" color="#F06292" gutterBottom>
                                        Venda Original
                                    </Typography>
                                    <Typography variant="body2"><strong>ID:</strong> #{vendaOriginal.id || 'N/A'}</Typography>
                                    <Typography variant="body2"><strong>Valor:</strong> {formatarValor(financeiro.valorOriginal || 0)}</Typography>
                                    <Typography variant="body2"><strong>Itens:</strong> {itensOriginais.length} produto(s)</Typography>
                                </Card>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <Card variant="outlined" sx={{ p: 2, borderColor: '#4CAF50' }}>
                                    <Typography variant="subtitle1" fontWeight="bold" color="#4CAF50" gutterBottom>
                                        Nova Venda (Atual)
                                    </Typography>
                                    <Typography variant="body2"><strong>ID:</strong> #{vendaNova.id || venda.id}</Typography>
                                    <Typography variant="body2"><strong>Valor:</strong> {formatarValor(financeiro.valorNovo || venda.valorTotal)}</Typography>
                                    <Typography variant="body2"><strong>Itens:</strong> {itensNovos.length || venda.itens?.length || 0} produto(s)</Typography>
                                </Card>
                            </Grid>
                        </Grid>

                        <Box sx={{ mb: 3, p: 2, backgroundColor: (financeiro.valorAdicional || 0) > 0 ? '#E8F5E8' : '#F0F0F0', borderRadius: 2 }}>
                            <Typography variant="h6" fontWeight="bold" color={(financeiro.valorAdicional || 0) > 0 ? '#4CAF50' : '#666'}>
                                💰 Diferença Financeira: {formatarValor(financeiro.diferenca || 0)}
                            </Typography>
                            {(financeiro.valorAdicional || 0) > 0 && (
                                <Typography variant="body2" color="#4CAF50">
                                    ✅ Cliente pagou valor adicional de {formatarValor(financeiro.valorAdicional)}
                                </Typography>
                            )}
                            {(financeiro.diferenca || 0) === 0 && (
                                <Typography variant="body2" color="#666">
                                    ⚖️ Troca equivalente - sem diferença de valor
                                </Typography>
                            )}
                        </Box>

                        {(itensOriginais.length > 0 || itensNovos.length > 0) && (
                            <Accordion sx={{ mt: 2 }}>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        <CompareArrows sx={{ mr: 1, verticalAlign: 'middle' }} />
                                        Comparação de Produtos
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2" fontWeight="bold" color="#F06292" gutterBottom>
                                                Produtos Originais (Devolvidos)
                                            </Typography>
                                            {itensOriginais.length > 0 ? (
                                                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow sx={{ backgroundColor: '#FCE4EC' }}>
                                                                <TableCell><strong>Produto</strong></TableCell>
                                                                <TableCell><strong>Qtd</strong></TableCell>
                                                                <TableCell><strong>Valor</strong></TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {itensOriginais.map((item, index) => (
                                                                <TableRow key={index}>
                                                                    <TableCell>{item.nomeProduto || 'Produto'}</TableCell>
                                                                    <TableCell>{item.qtdeProduto || 0}</TableCell>
                                                                    <TableCell>{formatarValor((item.valorUnitario || 0) * (item.qtdeProduto || 0))}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            ) : (
                                                <Typography variant="body2" color="textSecondary" sx={{ p: 2, textAlign: 'center', backgroundColor: '#F8F9FA', borderRadius: 1 }}>
                                                    Nenhum item original disponível
                                                </Typography>
                                            )}
                                        </Grid>
                                        
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2" fontWeight="bold" color="#4CAF50" gutterBottom>
                                                Produtos Novos (Entregues)
                                            </Typography>
                                            {itensNovos.length > 0 ? (
                                                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow sx={{ backgroundColor: '#E8F5E8' }}>
                                                                <TableCell><strong>Produto</strong></TableCell>
                                                                <TableCell><strong>Qtd</strong></TableCell>
                                                                <TableCell><strong>Valor</strong></TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {itensNovos.map((item, index) => (
                                                                <TableRow key={index}>
                                                                    <TableCell>{item.nomeProduto || 'Produto'}</TableCell>
                                                                    <TableCell>{item.qtdeProduto || 0}</TableCell>
                                                                    <TableCell>{formatarValor((item.valorUnitario || 0) * (item.qtdeProduto || 0))}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            ) : (
                                                <Typography variant="body2" color="textSecondary" sx={{ p: 2, textAlign: 'center', backgroundColor: '#F8F9FA', borderRadius: 1 }}>
                                                    Itens atuais da venda serão exibidos na seção principal
                                                </Typography>
                                            )}
                                        </Grid>
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                        )}
                    </>
                ) : (
                    <Box sx={{ p: 2, backgroundColor: '#FFF3E0', borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="textSecondary">
                            ℹ️ Informações detalhadas da troca não disponíveis. 
                            Esta venda foi identificada como troca através do ID da venda original: #{venda.vendaOriginalId}
                        </Typography>
                        {venda.valorAdicional > 0 && (
                            <Typography variant="body2" color="#4CAF50" sx={{ mt: 1 }}>
                                💰 Valor adicional pago: {formatarValor(venda.valorAdicional)}
                            </Typography>
                        )}
                    </Box>
                )}
            </Box>
        );
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
                            Histórico de Vendas
                        </Typography>
                    </Box>
                    
                    <Divider sx={{ mb: 4 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                        <TextField
                            variant="outlined"
                            size="small"
                            placeholder="Buscar por ID, cliente, vendedor ou CPF..."
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
                            sx={{ width: 400 }}
                        />

                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            component={Link}
                            to="/registro-venda-pelo-diretor"
                            sx={{
                                backgroundColor: '#F06292',
                                '&:hover': { backgroundColor: '#E91E63' },
                                borderRadius: 2,
                                px: 3,
                                py: 1,
                                fontWeight: 'bold'
                            }}
                        >
                            Nova Venda
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
                                onClick={fetchVendas}
                                sx={{ mt: 2, color: '#F06292', borderColor: '#F06292' }}
                            >
                                Tentar Novamente
                            </Button>
                        </Box>
                    ) : (
                        <>
                            {filteredVendas.length === 0 ? (
                                <Box display="flex" justifyContent="center" my={4}>
                                    <Typography color="textSecondary">
                                        {searchTerm ? "Nenhuma venda encontrada para esta busca." : "Nenhuma venda realizada ainda."}
                                    </Typography>
                                </Box>
                            ) : (
                                <TableContainer component={Paper} elevation={0} sx={{ mb: 3, borderRadius: 2 }}>
                                    <Table>
                                        <TableHead sx={{ backgroundColor: '#FCE4EC' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>ID Venda</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Data/Hora</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Vendedor</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Valor Total</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredVendas.map((venda, index) => (
                                                <TableRow key={venda.id || index} hover sx={{ '&:nth-of-type(odd)': { backgroundColor: '#FAFAFA' } }}>
                                                    <TableCell sx={{ fontWeight: 'bold', color: '#F06292' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            #{venda.id}
                                                            {venda.tipoOperacao === 'TROCA' && (
                                                                <Chip 
                                                                    label="TROCA" 
                                                                    size="small" 
                                                                    icon={<SwapHoriz />}
                                                                    sx={{ 
                                                                        ml: 1,
                                                                        backgroundColor: '#E3F2FD',
                                                                        color: '#1976D2',
                                                                        fontWeight: 'bold',
                                                                        fontSize: '10px'
                                                                    }}
                                                                />
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="500">
                                                                {venda.dataVenda}
                                                            </Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                                {venda.horaVenda}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="500">
                                                                {venda.nomeCliente}
                                                            </Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                                {formatarCPF(venda.cpfCliente)}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="500">
                                                                {venda.nomeVendedor}
                                                            </Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                                {formatarCPF(venda.cpfVendedor)}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="bold" color="#2E7D32">
                                                                {formatarValor(venda.valorTotal)}
                                                            </Typography>
                                                            {venda.tipoOperacao === 'TROCA' && venda.valorAdicional > 0 && (
                                                                <Typography variant="caption" color="#4CAF50">
                                                                    +{formatarValor(venda.valorAdicional)} adicional
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={venda.status}
                                                            sx={{ 
                                                                bgcolor: venda.status === 'CONCLUÍDA' ? '#4CAF50' : 
                                                                         venda.status === 'TROCA CONCLUÍDA' ? '#2196F3' : '#F06292', 
                                                                color: 'white', 
                                                                fontWeight: 'bold',
                                                                fontSize: '11px'
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <IconButton
                                                            onClick={() => handleViewDetails(venda)}
                                                            sx={{ color: '#1976D2' }}
                                                            title="Ver detalhes"
                                                        >
                                                            <Visibility />
                                                        </IconButton>
                                                        <IconButton
                                                            onClick={() => handleEmitirNF(venda)}
                                                            sx={{ color: '#F06292' }}
                                                            title="Gerar NF"
                                                        >
                                                            <Receipt />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2" color="textSecondary">
                                    Total: {filteredVendas.length} venda(s)
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Valor Total: {formatarValor(filteredVendas.reduce((total, venda) => total + venda.valorTotal, 0))}
                                </Typography>
                            </Box>
                        </>
                    )}
                </Paper>
            </Container>

            {/* Dialog de detalhes da venda */}
            <Dialog
                open={detailsDialog.open}
                onClose={handleCloseDetailsDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ 
                    backgroundColor: detailsDialog.venda?.tipoOperacao === 'TROCA' ? '#2196F3' : '#F06292', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    {detailsDialog.venda?.tipoOperacao === 'TROCA' ? (
                        <SwapHoriz sx={{ mr: 1 }} />
                    ) : (
                        <Receipt sx={{ mr: 1 }} />
                    )}
                    {detailsDialog.venda?.tipoOperacao === 'TROCA' ? 'Detalhes da Troca' : 'Detalhes da Venda'} #{detailsDialog.venda?.id}
                </DialogTitle>
                <DialogContent sx={{ p: 3 }}>
                    {detailsDialog.venda && (
                        <Box>
                            <Typography variant="h6" gutterBottom color="#333">
                                Informações da {detailsDialog.venda.tipoOperacao === 'TROCA' ? 'Troca' : 'Venda'}
                            </Typography>
                            <Box sx={{ mb: 3, p: 2, backgroundColor: '#F8F9FA', borderRadius: 2 }}>
                                <Typography><strong>Data:</strong> {detailsDialog.venda.dataVenda} às {detailsDialog.venda.horaVenda}</Typography>
                                <Typography><strong>Cliente:</strong> {detailsDialog.venda.nomeCliente} ({formatarCPF(detailsDialog.venda.cpfCliente)})</Typography>
                                <Typography><strong>Vendedor:</strong> {detailsDialog.venda.nomeVendedor} ({formatarCPF(detailsDialog.venda.cpfVendedor)})</Typography>
                                <Typography><strong>Status:</strong> {detailsDialog.venda.status}</Typography>
                                {detailsDialog.venda.tipoOperacao === 'TROCA' && (
                                    <>
                                        <Typography><strong>Venda Original:</strong> #{detailsDialog.venda.vendaOriginalId}</Typography>
                                        <Typography><strong>ID da Troca:</strong> {detailsDialog.venda.trocaId}</Typography>
                                        {detailsDialog.venda.valorAdicional > 0 && (
                                            <Typography><strong>Valor Adicional:</strong> {formatarValor(detailsDialog.venda.valorAdicional)}</Typography>
                                        )}
                                    </>
                                )}
                            </Box>

                            {/* 🆕 Seção específica para trocas */}
                            <DetalhesTroca venda={detailsDialog.venda} />

                            <Typography variant="h6" gutterBottom color="#333">
                                Itens da {detailsDialog.venda.tipoOperacao === 'TROCA' ? 'Nova Venda' : 'Venda'}
                            </Typography>
                            {detailsDialog.venda.itens && detailsDialog.venda.itens.length > 0 ? (
                                <TableContainer component={Paper} elevation={0} sx={{ mb: 2 }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow sx={{ backgroundColor: '#FCE4EC' }}>
                                                <TableCell><strong>Produto</strong></TableCell>
                                                <TableCell><strong>Código</strong></TableCell>
                                                <TableCell><strong>Lote</strong></TableCell>
                                                <TableCell align="center"><strong>Qtd</strong></TableCell>
                                                <TableCell align="right"><strong>Valor Unit.</strong></TableCell>
                                                <TableCell align="right"><strong>Subtotal</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {detailsDialog.venda.itens.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{item.nomeProduto || 'Produto'}</TableCell>
                                                    <TableCell>{item.codigoBarra}</TableCell>
                                                    <TableCell>{item.loteProduto}</TableCell>
                                                    <TableCell align="center">{item.qtdeProduto}</TableCell>
                                                    <TableCell align="right">{formatarValor(item.valorUnitario || 0)}</TableCell>
                                                    <TableCell align="right">{formatarValor((item.valorUnitario || 0) * item.qtdeProduto)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography color="textSecondary" sx={{ p: 2, textAlign: 'center', backgroundColor: '#F8F9FA', borderRadius: 2 }}>
                                    Nenhum item encontrado para esta venda.
                                </Typography>
                            )}

                            <Box sx={{ mt: 2, p: 2, backgroundColor: '#E8F5E8', borderRadius: 2, textAlign: 'right' }}>
                                <Typography variant="h6" fontWeight="bold" color="#2E7D32">
                                    Total: {formatarValor(detailsDialog.venda.valorTotal)}
                                </Typography>
                                {detailsDialog.venda.tipoOperacao === 'TROCA' && detailsDialog.venda.valorAdicional > 0 && (
                                    <Typography variant="body2" color="#4CAF50">
                                        (Inclui {formatarValor(detailsDialog.venda.valorAdicional)} adicional da troca)
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button 
                        onClick={handleCloseDetailsDialog} 
                        variant="outlined"
                        sx={{ borderColor: '#F06292', color: '#F06292' }}
                    >
                        Fechar
                    </Button>
                    <Button 
                        onClick={() => handleEmitirNF(detailsDialog.venda)}
                        variant="contained"
                        sx={{ 
                            backgroundColor: '#F06292',
                            '&:hover': { backgroundColor: '#E91E63' }
                        }}
                        startIcon={<Receipt />}
                    >
                        Gerar NF
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog MIRABOLANTE de Emissão de NF */}
            <Dialog
                open={nfDialog.open}
                onClose={!nfDialog.processando ? handleCloseNFDialog : undefined}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, #F06292 0%, #E91E63 100%)',
                        color: 'white'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    textAlign: 'center',
                    py: 3,
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Receipt sx={{ fontSize: 48, mb: 1, opacity: 0.9 }} />
                        <Typography variant="h5" fontWeight="bold">
                            {nfDialog.processando ? '⚡ Processando NF...' : '📋 Emitir Nota Fiscal'}
                        </Typography>
                        {nfDialog.numeroNF && (
                            <Typography variant="h6" sx={{ mt: 1, opacity: 0.8 }}>
                                {nfDialog.numeroNF}
                            </Typography>
                        )}
                        {nfDialog.venda?.tipoOperacao === 'TROCA' && (
                            <Chip 
                                label="NOTA FISCAL DE TROCA" 
                                sx={{ 
                                    mt: 1, 
                                    backgroundColor: 'rgba(255,255,255,0.2)', 
                                    color: 'white',
                                    fontWeight: 'bold'
                                }} 
                            />
                        )}
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ p: 3, textAlign: 'center' }}>
                    {nfDialog.processando ? (
                        <Box sx={{ py: 3 }}>
                            <CircularProgress 
                                size={60} 
                                sx={{ 
                                    color: 'white', 
                                    mb: 2,
                                    '& .MuiCircularProgress-circle': {
                                        strokeLinecap: 'round',
                                    }
                                }} 
                            />
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                🔄 Gerando sua Nota Fiscal...
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                • Validando dados fiscais<br/>
                                • Calculando impostos<br/>
                                • Formatando documento<br/>
                                • Preparando download...
                            </Typography>
                        </Box>
                    ) : (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                🎯 Confirma a emissão da NF?
                            </Typography>
                            {nfDialog.venda && (
                                <Box sx={{ 
                                    background: 'rgba(255,255,255,0.1)', 
                                    borderRadius: 2, 
                                    p: 2, 
                                    my: 2,
                                    backdropFilter: 'blur(5px)'
                                }}>
                                    <Typography><strong>Cliente:</strong> {nfDialog.venda.nomeCliente}</Typography>
                                    <Typography><strong>Valor:</strong> {formatarValor(nfDialog.venda.valorTotal)}</Typography>
                                    <Typography><strong>Itens:</strong> {nfDialog.venda.itens?.length || 0} produto(s)</Typography>
                                    {nfDialog.venda.tipoOperacao === 'TROCA' && (
                                        <>
                                            <Typography><strong>Tipo:</strong> Nota Fiscal de Troca</Typography>
                                            <Typography><strong>Venda Original:</strong> #{nfDialog.venda.vendaOriginalId}</Typography>
                                            {nfDialog.venda.valorAdicional > 0 && (
                                                <Typography><strong>Valor Adicional:</strong> {formatarValor(nfDialog.venda.valorAdicional)}</Typography>
                                            )}
                                        </>
                                    )}
                                </Box>
                            )}
                            <Typography variant="body2" sx={{ opacity: 0.9, fontStyle: 'italic' }}>
                                💡 Será gerado um arquivo HTML simulando uma NF real!
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                {!nfDialog.processando && (
                    <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
                        <Button 
                            onClick={handleCloseNFDialog}
                            variant="outlined"
                            sx={{ 
                                borderColor: 'white', 
                                color: 'white',
                                '&:hover': {
                                    borderColor: 'rgba(255,255,255,0.8)',
                                    backgroundColor: 'rgba(255,255,255,0.1)'
                                }
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            onClick={processarNF}
                            variant="contained"
                            sx={{ 
                                backgroundColor: 'white',
                                color: '#F06292',
                                fontWeight: 'bold',
                                '&:hover': { 
                                    backgroundColor: 'rgba(255,255,255,0.9)',
                                    transform: 'scale(1.05)'
                                },
                                transition: 'all 0.2s'
                            }}
                            startIcon={<Receipt />}
                        >
                            🚀 Emitir NF
                        </Button>
                    </DialogActions>
                )}
            </Dialog>

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

export default HistoricoVendasPeloDiretor;
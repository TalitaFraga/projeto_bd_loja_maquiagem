import React, { useEffect, useState } from 'react';

const HistoricoVendasPeloDiretor = () => {
    const [vendas, setVendas] = useState([]);
    const [trocasDetalhadas, setTrocasDetalhadas] = useState([]);
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

    const fetchVendas = async () => {
        setLoading(true);
        try {
            console.log('🔄 Buscando vendas do banco de dados...');
            
            // 1️⃣ Buscar todas as vendas normais
            const vendasResponse = await fetch('http://localhost:8081/vendas');
            const vendasData = await vendasResponse.json();
            console.log('📦 Vendas normais encontradas:', vendasData.length);
            
            // 2️⃣ Buscar todas as trocas com detalhes completos do BD
            const trocasResponse = await fetch('http://localhost:8081/trocas/detalhadas');
            const trocasData = await trocasResponse.json();
            console.log('🔄 Trocas detalhadas encontradas:', trocasData.length);
            setTrocasDetalhadas(trocasData);

            // 3️⃣ Buscar produtos para cálculos de preço
            const produtosResponse = await fetch('http://localhost:8081/produtos');
            const produtos = await produtosResponse.json();

            // 4️⃣ Processar vendas normais
            const vendasProcessadas = await Promise.all(vendasData.map(async (venda) => {
                let nomeCliente = 'Cliente não identificado';
                let nomeVendedor = 'Vendedor não identificado';
                let valorTotal = 0;

                // Buscar nome do cliente
                if (venda.cpfCliente) {
                    try {
                        const clienteResponse = await fetch(`http://localhost:8081/clientes/${venda.cpfCliente}`);
                        if (clienteResponse.ok) {
                            const clienteData = await clienteResponse.json();
                            nomeCliente = clienteData.nome || 'Cliente não identificado';
                        }
                    } catch (error) {
                        console.log(`Cliente não encontrado para CPF: ${venda.cpfCliente}`);
                    }
                }

                // Buscar nome do vendedor
                if (venda.cpfVendedor) {
                    try {
                        const vendedorResponse = await fetch(`http://localhost:8081/vendedores/${venda.cpfVendedor}`);
                        if (vendedorResponse.ok) {
                            const vendedorData = await vendedorResponse.json();
                            nomeVendedor = vendedorData.nome || 'Vendedor não identificado';
                        }
                    } catch (error) {
                        console.log(`Vendedor não encontrado para CPF: ${venda.cpfVendedor}`);
                    }
                }

                // Calcular valor total
                if (venda.itens && venda.itens.length > 0) {
                    valorTotal = venda.itens.reduce((total, item) => {
                        const produto = produtos.find(p => p.codigo_barra === item.codigoBarra);
                        const preco = produto ? parseFloat(produto.preco) : 0;
                        return total + (preco * parseInt(item.qtdeProduto));
                    }, 0);
                }

                const dataOriginal = venda.dataHoraVenda ? new Date(venda.dataHoraVenda) : new Date();
                
                return {
                    id: venda.idVenda || 'N/A',
                    cpfCliente: venda.cpfCliente || 'N/A',
                    nomeCliente: nomeCliente,
                    cpfVendedor: venda.cpfVendedor || 'N/A',
                    nomeVendedor: nomeVendedor,
                    dataVenda: dataOriginal.toLocaleDateString('pt-BR'),
                    horaVenda: dataOriginal.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    dataHoraCompleta: dataOriginal,
                    valorTotal: valorTotal,
                    status: 'CONCLUÍDA',
                    itens: venda.itens || [],
                    tipoOperacao: 'VENDA',
                    vendaOriginalId: null,
                    trocaId: null,
                    valorAdicional: 0
                };
            }));

            console.log('✅ Vendas processadas:', vendasProcessadas.length);

            // 5️⃣ Processar trocas do banco de dados
            const vendasDeTrocas = await Promise.all(trocasData.map(async (trocaDetalhada) => {
                const troca = trocaDetalhada.troca;
                const vendaNova = trocaDetalhada.vendaNova;
                const vendaOriginal = trocaDetalhada.vendaOriginal;
                
                if (!vendaNova) {
                    console.warn('⚠️ Venda nova não encontrada para troca:', troca.idTroca);
                    return null;
                }

                // Calcular valor total da nova venda
                let valorTotal = 0;
                if (vendaNova.itens && vendaNova.itens.length > 0) {
                    valorTotal = vendaNova.itens.reduce((total, item) => {
                        const produto = produtos.find(p => p.codigo_barra === item.codigoBarra);
                        const preco = produto ? parseFloat(produto.preco) : 0;
                        return total + (preco * parseInt(item.qtdeProduto));
                    }, 0);
                } else {
                    valorTotal = trocaDetalhada.valorVendaNova || 0;
                }

                // Calcular valor da venda original
                let valorOriginal = 0;
                if (vendaOriginal && vendaOriginal.itens && vendaOriginal.itens.length > 0) {
                    valorOriginal = vendaOriginal.itens.reduce((total, item) => {
                        const produto = produtos.find(p => p.codigo_barra === item.codigoBarra);
                        const preco = produto ? parseFloat(produto.preco) : 0;
                        return total + (preco * parseInt(item.qtdeProduto));
                    }, 0);
                } else {
                    valorOriginal = trocaDetalhada.valorVendaOriginal || 0;
                }

                // 🆕 Buscar nome do cliente para trocas
                let nomeClienteTroca = 'Cliente não identificado';
                const cpfClienteTroca = vendaNova.cpfCliente || (vendaOriginal ? vendaOriginal.cpfCliente : null);

                if (cpfClienteTroca) {
                    try {
                        const clienteResponse = await fetch(`http://localhost:8081/clientes/${cpfClienteTroca}`);
                        if (clienteResponse.ok) {
                            const clienteData = await clienteResponse.json();
                            nomeClienteTroca = clienteData.nome || 'Cliente não identificado';
                        }
                    } catch (error) {
                        console.log(`Cliente não encontrado para CPF: ${cpfClienteTroca}`);
                    }
                }

                const diferenca = valorTotal - valorOriginal;
                const dataOriginal = troca.dataHora ? new Date(troca.dataHora) : new Date();

                return {
                    id: vendaNova.idVenda || 'N/A',
                    cpfCliente: vendaNova.cpfCliente || (vendaOriginal ? vendaOriginal.cpfCliente : 'N/A'),
                    nomeCliente: nomeClienteTroca, // 🔧 Agora usa o nome buscado
                    cpfVendedor: vendaNova.cpfVendedor || 'DIRETOR',
                    nomeVendedor: 'Diretor',
                    dataVenda: dataOriginal.toLocaleDateString('pt-BR'),
                    horaVenda: dataOriginal.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    dataHoraCompleta: dataOriginal,
                    valorTotal: valorTotal,
                    status: 'TROCA CONCLUÍDA',
                    itens: vendaNova.itens || [],
                    tipoOperacao: 'TROCA',
                    vendaOriginalId: troca.idVendaOriginal,
                    trocaId: troca.idTroca,
                    valorAdicional: diferenca > 0 ? diferenca : 0,
                    dadosTrocaBD: {
                        troca: troca,
                        vendaOriginal: vendaOriginal,
                        vendaNova: vendaNova,
                        valorOriginal: valorOriginal,
                        valorNovo: valorTotal,
                        diferenca: diferenca,
                        status: trocaDetalhada.status || 'CONCLUIDA'
                    }
                };
            }));

            // Filtrar valores nulos após o Promise.all
            const vendasDeTrocasFiltradas = vendasDeTrocas.filter(Boolean);

            console.log('🔄 Vendas de troca processadas:', vendasDeTrocasFiltradas.length);

            // 6️⃣ Combinar vendas normais e de troca
            let todasVendas = [...vendasProcessadas];

            // Verificar se alguma venda normal já é uma troca (para evitar duplicatas)
            vendasDeTrocasFiltradas.forEach(vendaTroca => {
                const vendaExistente = todasVendas.find(v => v.id === vendaTroca.id);
                if (vendaExistente) {
                    Object.assign(vendaExistente, vendaTroca);
                } else {
                    todasVendas.push(vendaTroca);
                }
            });

            // 7️⃣ Ordenar por data/hora mais recente primeiro
            todasVendas.sort((a, b) => b.dataHoraCompleta - a.dataHoraCompleta);
            
            console.log('📊 Total de vendas (normais + trocas):', todasVendas.length);
            console.log('📈 Vendas normais:', vendasProcessadas.length);
            console.log('🔄 Trocas:', vendasDeTrocasFiltradas.length);
            
            setVendas(todasVendas);
            setError(null);

        } catch (err) {
            console.error('❌ Erro ao buscar vendas:', err);
            setError('Erro ao carregar histórico de vendas. Por favor, tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVendas();
    }, []);

    const handleViewDetails = async (venda) => {
        console.log('👁️ Visualizando detalhes da venda:', venda.id, 'Tipo:', venda.tipoOperacao);
        
        let vendaComDetalhes = { ...venda };
        
        if (venda.itens && venda.itens.length > 0) {
            try {
                const produtosResponse = await fetch('http://localhost:8081/produtos');
                const produtos = await produtosResponse.json();
                
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

        // Se for uma troca, buscar detalhes completos do BD
        if (venda.tipoOperacao === 'TROCA' && venda.trocaId) {
            try {
                console.log('🔍 Buscando detalhes da troca:', venda.trocaId);
                const trocaResponse = await fetch(`http://localhost:8081/trocas/${venda.trocaId}/detalhada`);
                
                if (trocaResponse.ok) {
                    const trocaDetalhada = await trocaResponse.json();
                    console.log('✅ Detalhes da troca carregados:', trocaDetalhada);
                    
                    const produtosResponse = await fetch('http://localhost:8081/produtos');
                    const produtos = await produtosResponse.json();

                    if (trocaDetalhada.vendaOriginal && trocaDetalhada.vendaOriginal.itens) {
                        trocaDetalhada.vendaOriginal.itens = trocaDetalhada.vendaOriginal.itens.map(item => {
                            const produto = produtos.find(p => p.codigo_barra === item.codigoBarra);
                            return {
                                ...item,
                                nomeProduto: produto?.nome || 'Produto não encontrado',
                                valorUnitario: produto ? parseFloat(produto.preco) : 0
                            };
                        });
                    }

                    if (trocaDetalhada.vendaNova && trocaDetalhada.vendaNova.itens) {
                        trocaDetalhada.vendaNova.itens = trocaDetalhada.vendaNova.itens.map(item => {
                            const produto = produtos.find(p => p.codigo_barra === item.codigoBarra);
                            return {
                                ...item,
                                nomeProduto: produto?.nome || 'Produto não encontrado',
                                valorUnitario: produto ? parseFloat(produto.preco) : 0
                            };
                        });
                    }

                    vendaComDetalhes.dadosTrocaBD = trocaDetalhada;
                }
            } catch (error) {
                console.error('⚠️ Erro ao buscar detalhes da troca:', error);
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
        
        // Simulação de processamento
        await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 2000));
        
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
        const tipoDocumento = venda.tipoOperacao === 'TROCA' ? 'NOTA FISCAL DE TROCA' : 'NOTA FISCAL ELETRÔNICA';
        const infoTroca = venda.tipoOperacao === 'TROCA' ? `
            <div style="background: #E3F2FD; padding: 10px; margin: 10px 0; border-radius: 5px;">
                <strong>🔄 OPERAÇÃO DE TROCA</strong><br/>
                Venda Original: #${venda.vendaOriginalId}<br/>
                ID da Troca: ${venda.trocaId}<br/>
                ${venda.valorAdicional > 0 ? `Valor Adicional Pago: ${formatarValor(venda.valorAdicional)}` : 'Troca Equivalente'}
            </div>
        ` : '';
        
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
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="company">🏪 LOJA MAQUIAGEM & CIA</div>
                    <div>CNPJ: 12.345.678/0001-90 | IE: 123.456.789</div>
                    <div>Rua das Flores, 123 - Centro - Sumaré/SP</div>
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

                <div class="footer">
                    <p>📋 Esta é uma simulação de Nota Fiscal Eletrônica gerada pelo sistema.</p>
                    <p>🔐 Chave de Acesso: ${generateRandomKey()}</p>
                    <p>⚡ Gerado em ${new Date().toLocaleString('pt-BR')}</p>
                    ${venda.tipoOperacao === 'TROCA' ? '<p>🔄 Documento referente à operação de troca de mercadoria.</p>' : ''}
                </div>
            </body>
            </html>
        `;

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

    // Componente para renderizar detalhes de troca do BD
    const DetalhesTrocaBD = ({ venda }) => {
        if (venda.tipoOperacao !== 'TROCA' || !venda.dadosTrocaBD) return null;

        const dadosTroca = venda.dadosTrocaBD;
        const vendaOriginal = dadosTroca.vendaOriginal || {};
        const vendaNova = dadosTroca.vendaNova || {};
        const itensOriginais = vendaOriginal.itens || [];
        const itensNovos = vendaNova.itens || [];
        
        return (
            <div style={{ marginTop: '24px', padding: '16px', borderRadius: '8px', backgroundColor: '#F8F9FA' }}>
                <h3 style={{ color: '#F06292', display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0 }}>
                    <span>🔄</span>
                    Informações da Troca (Banco de Dados)
                </h3>
                
                <div style={{ 
                    backgroundColor: '#E8F5E8', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    marginBottom: '16px',
                    border: '1px solid #4CAF50'
                }}>
                    <strong>✅ Dados carregados diretamente do banco de dados!</strong>
                    <br />Status: {dadosTroca.status || 'CONCLUIDA'}
                    <br />ID da Troca: {dadosTroca.troca?.idTroca}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ 
                        border: '2px solid #F06292', 
                        padding: '16px', 
                        borderRadius: '8px',
                        backgroundColor: '#FFF'
                    }}>
                        <h4 style={{ color: '#F06292', marginTop: 0 }}>Venda Original</h4>
                        <p><strong>ID:</strong> #{vendaOriginal.idVenda || 'N/A'}</p>
                        <p><strong>Data:</strong> {vendaOriginal.dataHoraVenda ? new Date(vendaOriginal.dataHoraVenda).toLocaleString('pt-BR') : 'N/A'}</p>
                        <p><strong>Valor:</strong> {formatarValor(dadosTroca.valorOriginal || 0)}</p>
                        <p><strong>Itens:</strong> {itensOriginais.length} produto(s)</p>
                    </div>
                    
                    <div style={{ 
                        border: '2px solid #4CAF50', 
                        padding: '16px', 
                        borderRadius: '8px',
                        backgroundColor: '#FFF'
                    }}>
                        <h4 style={{ color: '#4CAF50', marginTop: 0 }}>Nova Venda</h4>
                        <p><strong>ID:</strong> #{vendaNova.idVenda || venda.id}</p>
                        <p><strong>Data:</strong> {dadosTroca.troca?.dataHora ? new Date(dadosTroca.troca.dataHora).toLocaleString('pt-BR') : 'N/A'}</p>
                        <p><strong>Valor:</strong> {formatarValor(dadosTroca.valorNovo || venda.valorTotal)}</p>
                        <p><strong>Itens:</strong> {itensNovos.length || venda.itens?.length || 0} produto(s)</p>
                    </div>
                </div>

                <div style={{ 
                    padding: '16px', 
                    backgroundColor: (dadosTroca.diferenca || 0) > 0 ? '#E8F5E8' : '#F0F0F0', 
                    borderRadius: '8px',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ 
                        color: (dadosTroca.diferenca || 0) > 0 ? '#4CAF50' : '#666',
                        margin: 0,
                        marginBottom: '8px'
                    }}>
                        💰 Diferença Financeira: {formatarValor(dadosTroca.diferenca || 0)}
                    </h3>
                    {(dadosTroca.diferenca || 0) > 0 && (
                        <p style={{ color: '#4CAF50', margin: 0 }}>
                            ✅ Cliente pagou valor adicional de {formatarValor(dadosTroca.diferenca)}
                        </p>
                    )}
                    {(dadosTroca.diferenca || 0) === 0 && (
                        <p style={{ color: '#666', margin: 0 }}>
                            ⚖️ Troca equivalente - sem diferença de valor
                        </p>
                    )}
                </div>

                {(itensOriginais.length > 0 || itensNovos.length > 0) && (
                    <div style={{ marginTop: '20px' }}>
                        <details style={{ marginBottom: '16px' }}>
                            <summary style={{ 
                                cursor: 'pointer', 
                                padding: '12px',
                                backgroundColor: '#E3F2FD',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                🔄 Comparação de Produtos (Do Banco de Dados)
                            </summary>
                            <div style={{ padding: '16px', borderTop: '1px solid #E0E0E0' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div>
                                        <h4 style={{ color: '#F06292' }}>Produtos Originais (Devolvidos)</h4>
                                        {itensOriginais.length > 0 ? (
                                            <table style={{ 
                                                width: '100%', 
                                                borderCollapse: 'collapse',
                                                border: '1px solid #E0E0E0',
                                                fontSize: '12px'
                                            }}>
                                                <thead>
                                                    <tr style={{ backgroundColor: '#FCE4EC' }}>
                                                        <th style={{ padding: '6px', border: '1px solid #E0E0E0' }}>Produto</th>
                                                        <th style={{ padding: '6px', border: '1px solid #E0E0E0' }}>Código</th>
                                                        <th style={{ padding: '6px', border: '1px solid #E0E0E0' }}>Qtd</th>
                                                        <th style={{ padding: '6px', border: '1px solid #E0E0E0' }}>Valor</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {itensOriginais.map((item, index) => (
                                                        <tr key={index}>
                                                            <td style={{ padding: '6px', border: '1px solid #E0E0E0' }}>
                                                                {item.nomeProduto || 'Produto'}
                                                            </td>
                                                            <td style={{ padding: '6px', border: '1px solid #E0E0E0' }}>
                                                                {item.codigoBarra}
                                                            </td>
                                                            <td style={{ padding: '6px', border: '1px solid #E0E0E0' }}>
                                                                {item.qtdeProduto || 0}
                                                            </td>
                                                            <td style={{ padding: '6px', border: '1px solid #E0E0E0' }}>
                                                                {formatarValor((item.valorUnitario || 0) * (item.qtdeProduto || 0))}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div style={{ 
                                                padding: '12px', 
                                                textAlign: 'center', 
                                                backgroundColor: '#F8F9FA', 
                                                borderRadius: '4px',
                                                color: '#666'
                                            }}>
                                                Nenhum item original disponível
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <h4 style={{ color: '#4CAF50' }}>Produtos Novos (Entregues)</h4>
                                        {itensNovos.length > 0 ? (
                                            <table style={{ 
                                                width: '100%', 
                                                borderCollapse: 'collapse',
                                                border: '1px solid #E0E0E0',
                                                fontSize: '12px'
                                            }}>
                                                <thead>
                                                    <tr style={{ backgroundColor: '#E8F5E8' }}>
                                                        <th style={{ padding: '6px', border: '1px solid #E0E0E0' }}>Produto</th>
                                                        <th style={{ padding: '6px', border: '1px solid #E0E0E0' }}>Código</th>
                                                        <th style={{ padding: '6px', border: '1px solid #E0E0E0' }}>Qtd</th>
                                                        <th style={{ padding: '6px', border: '1px solid #E0E0E0' }}>Valor</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {itensNovos.map((item, index) => (
                                                        <tr key={index}>
                                                            <td style={{ padding: '6px', border: '1px solid #E0E0E0' }}>
                                                                {item.nomeProduto || 'Produto'}
                                                            </td>
                                                            <td style={{ padding: '6px', border: '1px solid #E0E0E0' }}>
                                                                {item.codigoBarra}
                                                            </td>
                                                            <td style={{ padding: '6px', border: '1px solid #E0E0E0' }}>
                                                                {item.qtdeProduto || 0}
                                                            </td>
                                                            <td style={{ padding: '6px', border: '1px solid #E0E0E0' }}>
                                                                {formatarValor((item.valorUnitario || 0) * (item.qtdeProduto || 0))}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <div style={{ 
                                                padding: '12px', 
                                                textAlign: 'center', 
                                                backgroundColor: '#F8F9FA', 
                                                borderRadius: '4px',
                                                color: '#666'
                                            }}>
                                                Itens atuais da venda serão exibidos na seção principal
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </details>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ 
            minHeight: '100vh', 
            backgroundColor: '#F5F5F5', 
            fontFamily: 'Arial, sans-serif' 
        }}>
            {/* Botão Home */}
            <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
                <button 
                    onClick={() => window.location.href = '/dashboard'}
                    style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer',
                        fontSize: '30px',
                        color: '#F06292'
                    }}
                >
                    🏠
                </button>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
                <div style={{ 
                    padding: '32px', 
                    borderRadius: '12px', 
                    marginTop: '24px', 
                    backgroundColor: '#FFF',
                    borderTop: '4px solid #F06292',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                        <span style={{ fontSize: '36px', color: '#F06292', marginRight: '16px' }}>🛍️</span>
                        <h1 style={{ color: '#333', fontWeight: '500', margin: 0 }}>
                            Histórico de Vendas
                        </h1>
                    </div>
                    
                    <hr style={{ marginBottom: '32px', border: 'none', height: '1px', backgroundColor: '#E0E0E0' }} />

                    {/* Barra de pesquisa e botão Nova Venda */}
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginBottom: '24px', 
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '16px'
                    }}>
                        <div style={{ position: 'relative', width: '400px', maxWidth: '100%' }}>
                            <input
                                type="text"
                                placeholder="Buscar por ID, cliente, vendedor ou CPF..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 12px 12px 40px',
                                    border: '1px solid #E0E0E0',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    outline: 'none'
                                }}
                            />
                            <span style={{ 
                                position: 'absolute', 
                                left: '12px', 
                                top: '50%', 
                                transform: 'translateY(-50%)',
                                color: '#999'
                            }}>
                                🔍
                            </span>
                        </div>

                        <button
                            onClick={() => window.location.href = '/registro-venda-pelo-diretor'}
                            style={{
                                backgroundColor: '#F06292',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '12px 24px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '14px'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#E91E63'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#F06292'}
                        >
                            <span style={{ fontSize: '16px', color: 'white' }}>+</span> NOVA VENDA
                        </button>
                    </div>

                    {loading ? (
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            padding: '40px',
                            flexDirection: 'column',
                            gap: '16px'
                        }}>
                            <div style={{ 
                                width: '40px', 
                                height: '40px', 
                                border: '3px solid #F06292', 
                                borderTop: '3px solid transparent',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }}></div>
                            <p style={{ color: '#F06292', margin: 0 }}>Carregando histórico...</p>
                            <style>{`
                                @keyframes spin {
                                    0% { transform: rotate(0deg); }
                                    100% { transform: rotate(360deg); }
                                }
                            `}</style>
                        </div>
                    ) : error ? (
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            padding: '40px',
                            gap: '16px'
                        }}>
                            <p style={{ color: '#F44336', margin: 0 }}>{error}</p>
                            <button 
                                onClick={fetchVendas}
                                style={{
                                    color: '#F06292',
                                    borderColor: '#F06292',
                                    backgroundColor: 'transparent',
                                    border: '1px solid #F06292',
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Tentar Novamente
                            </button>
                        </div>
                    ) : (
                        <>
                            {filteredVendas.length === 0 ? (
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    padding: '40px' 
                                }}>
                                    <p style={{ color: '#666', margin: 0 }}>
                                        {searchTerm ? "Nenhuma venda encontrada para esta busca." : "Nenhuma venda realizada ainda."}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Tabela de Vendas */}
                                    <div style={{ 
                                        backgroundColor: '#FFF',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                        marginBottom: '24px'
                                    }}>
                                        <table style={{ 
                                            width: '100%', 
                                            borderCollapse: 'collapse'
                                        }}>
                                            <thead style={{ backgroundColor: '#FCE4EC' }}>
                                                <tr>
                                                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 'bold' }}>ID Venda</th>
                                                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 'bold' }}>Data/Hora</th>
                                                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 'bold' }}>Cliente</th>
                                                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 'bold' }}>Vendedor</th>
                                                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 'bold' }}>Valor Total</th>
                                                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: 'bold' }}>Status</th>
                                                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold' }}>Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredVendas.map((venda, index) => (
                                                    <tr key={venda.id || index} style={{ 
                                                        backgroundColor: index % 2 === 1 ? '#FAFAFA' : '#FFF',
                                                        transition: 'background-color 0.2s'
                                                    }}>
                                                        <td style={{ padding: '16px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <span style={{ fontWeight: 'bold', color: '#F06292' }}>
                                                                    #{venda.id}
                                                                </span>
                                                                {venda.tipoOperacao === 'TROCA' && (
                                                                    <span style={{ 
                                                                        backgroundColor: '#E3F2FD',
                                                                        color: '#1976D2',
                                                                        fontSize: '10px',
                                                                        fontWeight: 'bold',
                                                                        padding: '2px 6px',
                                                                        borderRadius: '4px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '2px'
                                                                    }}>
                                                                        🔄 TROCA
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '16px' }}>
                                                            <div>
                                                                <div style={{ fontWeight: '500' }}>
                                                                    {venda.dataVenda}
                                                                </div>
                                                                <div style={{ fontSize: '12px', color: '#666' }}>
                                                                    {venda.horaVenda}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '16px' }}>
                                                            <div>
                                                                <div style={{ fontWeight: '500' }}>
                                                                    {venda.nomeCliente}
                                                                </div>
                                                                <div style={{ fontSize: '12px', color: '#666' }}>
                                                                    {formatarCPF(venda.cpfCliente)}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '16px' }}>
                                                            <div>
                                                                <div style={{ fontWeight: '500' }}>
                                                                    {venda.nomeVendedor}
                                                                </div>
                                                                <div style={{ fontSize: '12px', color: '#666' }}>
                                                                    {formatarCPF(venda.cpfVendedor)}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '16px' }}>
                                                            <div>
                                                                <div style={{ fontWeight: 'bold', color: '#2E7D32' }}>
                                                                    {formatarValor(venda.valorTotal)}
                                                                </div>
                                                                {venda.tipoOperacao === 'TROCA' && venda.valorAdicional > 0 && (
                                                                    <div style={{ fontSize: '12px', color: '#4CAF50' }}>
                                                                        +{formatarValor(venda.valorAdicional)} adicional
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '16px' }}>
                                                            <span style={{ 
                                                                backgroundColor: venda.status === 'CONCLUÍDA' ? '#4CAF50' : 
                                                                               venda.status === 'TROCA CONCLUÍDA' ? '#2196F3' : '#F06292',
                                                                color: 'white',
                                                                fontWeight: 'bold',
                                                                fontSize: '11px',
                                                                padding: '4px 8px',
                                                                borderRadius: '4px'
                                                            }}>
                                                                {venda.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                                            <button
                                                                onClick={() => handleViewDetails(venda)}
                                                                style={{
                                                                    backgroundColor: 'transparent',
                                                                    border: 'none',
                                                                    color: '#1976D2',
                                                                    cursor: 'pointer',
                                                                    padding: '4px',
                                                                    marginRight: '8px',
                                                                    fontSize: '16px'
                                                                }}
                                                                title="Ver detalhes"
                                                            >
                                                                👁️
                                                            </button>
                                                            <button
                                                                onClick={() => handleEmitirNF(venda)}
                                                                style={{
                                                                    backgroundColor: 'transparent',
                                                                    border: 'none',
                                                                    color: '#F06292',
                                                                    cursor: 'pointer',
                                                                    padding: '4px',
                                                                    fontSize: '16px'
                                                                }}
                                                                title="Gerar NF"
                                                            >
                                                                🧾
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Resumo final */}
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        padding: '16px',
                                        backgroundColor: '#F8F9FA',
                                        borderRadius: '8px'
                                    }}>
                                        <span style={{ fontSize: '14px', color: '#666' }}>
                                            Total: {filteredVendas.length} venda(s)
                                        </span>
                                        <span style={{ fontSize: '14px', color: '#666', fontWeight: 'bold' }}>
                                            Valor Total: {formatarValor(filteredVendas.reduce((total, venda) => total + venda.valorTotal, 0))}
                                        </span>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Dialog de detalhes da venda */}
            {detailsDialog.open && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '0',
                        maxWidth: '800px',
                        width: '90%',
                        maxHeight: '90vh',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Header do Dialog */}
                        <div style={{
                            backgroundColor: detailsDialog.venda?.tipoOperacao === 'TROCA' ? '#2196F3' : '#F06292',
                            color: 'white',
                            padding: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{ fontSize: '24px' }}>
                                {detailsDialog.venda?.tipoOperacao === 'TROCA' ? '🔄' : '🧾'}
                            </span>
                            <h2 style={{ margin: 0 }}>
                                {detailsDialog.venda?.tipoOperacao === 'TROCA' ? 'Detalhes da Troca' : 'Detalhes da Venda'} #{detailsDialog.venda?.id}
                            </h2>
                        </div>

                        {/* Conteúdo do Dialog */}
                        <div style={{ padding: '24px', overflow: 'auto', flex: 1 }}>
                            {detailsDialog.venda && (
                                <div>
                                    <h3 style={{ color: '#333', marginTop: 0 }}>
                                        Informações da {detailsDialog.venda.tipoOperacao === 'TROCA' ? 'Troca' : 'Venda'}
                                    </h3>
                                    <div style={{ 
                                        marginBottom: '24px', 
                                        padding: '16px', 
                                        backgroundColor: '#F8F9FA', 
                                        borderRadius: '8px' 
                                    }}>
                                        <p><strong>Data:</strong> {detailsDialog.venda.dataVenda} às {detailsDialog.venda.horaVenda}</p>
                                        <p><strong>Cliente:</strong> {detailsDialog.venda.nomeCliente} ({formatarCPF(detailsDialog.venda.cpfCliente)})</p>
                                        <p><strong>Vendedor:</strong> {detailsDialog.venda.nomeVendedor} ({formatarCPF(detailsDialog.venda.cpfVendedor)})</p>
                                        <p><strong>Status:</strong> {detailsDialog.venda.status}</p>
                                        {detailsDialog.venda.tipoOperacao === 'TROCA' && (
                                            <>
                                                <p><strong>Venda Original:</strong> #{detailsDialog.venda.vendaOriginalId}</p>
                                                <p><strong>ID da Troca:</strong> {detailsDialog.venda.trocaId}</p>
                                                {detailsDialog.venda.valorAdicional > 0 && (
                                                    <p><strong>Valor Adicional:</strong> {formatarValor(detailsDialog.venda.valorAdicional)}</p>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* Detalhes específicos da troca do BD */}
                                    <DetalhesTrocaBD venda={detailsDialog.venda} />

                                    <h3 style={{ color: '#333' }}>
                                        Itens da {detailsDialog.venda.tipoOperacao === 'TROCA' ? 'Nova Venda' : 'Venda'}
                                    </h3>
                                    {detailsDialog.venda.itens && detailsDialog.venda.itens.length > 0 ? (
                                        <table style={{ 
                                            width: '100%', 
                                            borderCollapse: 'collapse',
                                            marginBottom: '16px'
                                        }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#FCE4EC' }}>
                                                    <th style={{ padding: '8px', border: '1px solid #E0E0E0' }}>Produto</th>
                                                    <th style={{ padding: '8px', border: '1px solid #E0E0E0' }}>Código</th>
                                                    <th style={{ padding: '8px', border: '1px solid #E0E0E0' }}>Lote</th>
                                                    <th style={{ padding: '8px', border: '1px solid #E0E0E0', textAlign: 'center' }}>Qtd</th>
                                                    <th style={{ padding: '8px', border: '1px solid #E0E0E0', textAlign: 'right' }}>Valor Unit.</th>
                                                    <th style={{ padding: '8px', border: '1px solid #E0E0E0', textAlign: 'right' }}>Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detailsDialog.venda.itens.map((item, index) => (
                                                    <tr key={index}>
                                                        <td style={{ padding: '8px', border: '1px solid #E0E0E0' }}>
                                                            {item.nomeProduto || 'Produto'}
                                                        </td>
                                                        <td style={{ padding: '8px', border: '1px solid #E0E0E0' }}>
                                                            {item.codigoBarra}
                                                        </td>
                                                        <td style={{ padding: '8px', border: '1px solid #E0E0E0' }}>
                                                            {item.loteProduto}
                                                        </td>
                                                        <td style={{ padding: '8px', border: '1px solid #E0E0E0', textAlign: 'center' }}>
                                                            {item.qtdeProduto}
                                                        </td>
                                                        <td style={{ padding: '8px', border: '1px solid #E0E0E0', textAlign: 'right' }}>
                                                            {formatarValor(item.valorUnitario || 0)}
                                                        </td>
                                                        <td style={{ padding: '8px', border: '1px solid #E0E0E0', textAlign: 'right' }}>
                                                            {formatarValor((item.valorUnitario || 0) * item.qtdeProduto)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div style={{ 
                                            padding: '16px', 
                                            textAlign: 'center', 
                                            backgroundColor: '#F8F9FA', 
                                            borderRadius: '8px',
                                            color: '#666'
                                        }}>
                                            Nenhum item encontrado para esta venda.
                                        </div>
                                    )}

                                    <div style={{ 
                                        marginTop: '16px', 
                                        padding: '16px', 
                                        backgroundColor: '#E8F5E8', 
                                        borderRadius: '8px', 
                                        textAlign: 'right' 
                                    }}>
                                        <h3 style={{ margin: 0, color: '#2E7D32' }}>
                                            Total: {formatarValor(detailsDialog.venda.valorTotal)}
                                        </h3>
                                        {detailsDialog.venda.tipoOperacao === 'TROCA' && detailsDialog.venda.valorAdicional > 0 && (
                                            <div style={{ fontSize: '14px', color: '#4CAF50', marginTop: '4px' }}>
                                                (Inclui {formatarValor(detailsDialog.venda.valorAdicional)} adicional da troca)
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer do Dialog */}
                        <div style={{ 
                            padding: '20px', 
                            borderTop: '1px solid #E0E0E0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '12px'
                        }}>
                            <button 
                                onClick={handleCloseDetailsDialog}
                                style={{
                                    border: '1px solid #F06292',
                                    color: '#F06292',
                                    backgroundColor: 'transparent',
                                    padding: '10px 20px',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                Fechar
                            </button>
                            <button 
                                onClick={() => handleEmitirNF(detailsDialog.venda)}
                                style={{
                                    backgroundColor: '#F06292',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                🧾 Gerar NF
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Dialog de Emissão de NF */}
            {nfDialog.open && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1001
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '0',
                        maxWidth: '500px',
                        width: '90%',
                        overflow: 'hidden',
                        background: 'linear-gradient(135deg, #F06292 0%, #E91E63 100%)',
                        color: 'white'
                    }}>
                        {/* Header do Dialog NF */}
                        <div style={{
                            textAlign: 'center',
                            padding: '24px',
                            background: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span style={{ fontSize: '48px', marginBottom: '8px', opacity: 0.9 }}>🧾</span>
                                <h2 style={{ margin: 0, marginBottom: '8px' }}>
                                    {nfDialog.processando ? '⚡ Processando NF...' : '📋 Emitir Nota Fiscal'}
                                </h2>
                                {nfDialog.numeroNF && (
                                    <h3 style={{ margin: 0, marginBottom: '8px', opacity: 0.8 }}>
                                        {nfDialog.numeroNF}
                                    </h3>
                                )}
                                {nfDialog.venda?.tipoOperacao === 'TROCA' && (
                                    <span style={{ 
                                        marginTop: '8px',
                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        padding: '4px 12px',
                                        borderRadius: '16px',
                                        fontSize: '12px'
                                    }}>
                                        NOTA FISCAL DE TROCA
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Conteúdo do Dialog NF */}
                        <div style={{ padding: '24px', textAlign: 'center' }}>
                            {nfDialog.processando ? (
                                <div style={{ padding: '24px 0' }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        border: '4px solid rgba(255,255,255,0.3)',
                                        borderTop: '4px solid white',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite',
                                        margin: '0 auto 16px'
                                    }}></div>
                                    <p style={{ marginBottom: '16px' }}>
                                        🔄 Gerando sua Nota Fiscal...
                                    </p>
                                    <div style={{ opacity: 0.8, fontSize: '14px', lineHeight: '1.6' }}>
                                        • Validando dados fiscais<br/>
                                        • Calculando impostos<br/>
                                        • Formatando documento<br/>
                                        • Preparando download...
                                    </div>
                                    <style>{`
                                        @keyframes spin {
                                            0% { transform: rotate(0deg); }
                                            100% { transform: rotate(360deg); }
                                        }
                                    `}</style>
                                </div>
                            ) : (
                                <div>
                                    <h3 style={{ marginBottom: '16px' }}>
                                        🎯 Confirma a emissão da NF?
                                    </h3>
                                    {nfDialog.venda && (
                                        <div style={{ 
                                            background: 'rgba(255,255,255,0.1)', 
                                            borderRadius: '8px', 
                                            padding: '16px', 
                                            margin: '16px 0',
                                            backdropFilter: 'blur(5px)',
                                            textAlign: 'left'
                                        }}>
                                            <p><strong>Cliente:</strong> {nfDialog.venda.nomeCliente}</p>
                                            <p><strong>Valor:</strong> {formatarValor(nfDialog.venda.valorTotal)}</p>
                                            <p><strong>Itens:</strong> {nfDialog.venda.itens?.length || 0} produto(s)</p>
                                            {nfDialog.venda.tipoOperacao === 'TROCA' && (
                                                <>
                                                    <p><strong>Tipo:</strong> Nota Fiscal de Troca</p>
                                                    <p><strong>Venda Original:</strong> #{nfDialog.venda.vendaOriginalId}</p>
                                                    {nfDialog.venda.valorAdicional > 0 && (
                                                        <p><strong>Valor Adicional:</strong> {formatarValor(nfDialog.venda.valorAdicional)}</p>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                    <p style={{ opacity: 0.9, fontStyle: 'italic', fontSize: '14px' }}>
                                        💡 Será gerado um arquivo HTML simulando uma NF real!
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer do Dialog NF */}
                        {!nfDialog.processando && (
                            <div style={{ 
                                padding: '20px', 
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: '12px'
                            }}>
                                <button 
                                    onClick={handleCloseNFDialog}
                                    style={{
                                        border: '1px solid white',
                                        color: 'white',
                                        backgroundColor: 'transparent',
                                        padding: '10px 20px',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={processarNF}
                                    style={{
                                        backgroundColor: 'white',
                                        color: '#F06292',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    🚀 Emitir NF
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Snackbar de notificações */}
            {snackbar.open && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: snackbar.severity === 'success' ? '#4CAF50' : 
                                   snackbar.severity === 'error' ? '#F44336' : '#2196F3',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 1002,
                    maxWidth: '90%',
                    textAlign: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                        <span>{snackbar.message}</span>
                        <button
                            onClick={handleCloseSnackbar}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '16px',
                                padding: '0'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoricoVendasPeloDiretor;
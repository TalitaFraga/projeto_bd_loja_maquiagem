import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ListaPessoas from './components/ListaPessoas';
import CadastrarPessoa from './components/CadastroPessoa';
import Home from './components/Home';
import Login from './components/Login';
import VincularPessoa from './components/VincularPessoa';
import CadastrarProduto from './components/CadastroProduto';
import CadastrarFornecedor from './components/CadastroFornecedor';
import Dashboard from './components/dashboard/Dashboard';
import DashboardVendedor from './components/dashboard-vendedor/DashboardVendedor';
import EditarPessoa from './components/EditarPessoa';
import ListarFuncionariosDiretor from './components/ListarFuncionariosDiretor';
import ListaFornecedores from './components/ListaFornecedores';
import ListaProdutosDiretor from './components/ListaProdutosDiretor';
import ListaProdutosVendedor from './components/ListaProdutosVendedor';
import EditarFornecedor from './components/EditarFornecedor';
import CadastroClienteDiretor from './components/CadastroClienteDiretor';
import EditarClienteDiretor from './components/EditarClienteDiretor';
import ListarClientesDiretor from './components/ListaClientesDiretor';
import Sidebar from './pages/SideBar';
import SidebarVendedor from './pages/SideBarVendedor';
import CadastroFuncionarioDiretor from './components/CadastroFuncionarioDiretor';
import EditarFuncionarioDiretor from './components/EditarFuncionarioDiretor';
import RegistroVendaDiretor from './components/RegistroVendaDiretor';
import HistoricoVendasDiretor from './components/HistoricoVendasDiretor';
import TrocaPedidoDiretor from './components/TrocaPedidoDiretor';
import RegistroVendaVendedor from './components/RegistroVendaVendedor';
import HistoricoVendasVendedor from './components/HistoricoVendasVendedor';
import TrocaPedidoVendedor from './components/TrocaPedidoVendedor';
import CadastroClienteVendedor from './components/CadastroClienteVendedor';
import EditarClienteVendedor from './components/EditarClienteVendedor';
import ListarClientesVendedor from './components/ListaClientesVendedor';

// 🔧 SUBSTITUA a função AppContent completa no App.js:

function AppContent() {
  const location = useLocation();

  // Rotas que NÃO devem ter Sidebar
  const rotasSemSidebar = ['/', '/login'];
  const deveMostrarSidebar = !rotasSemSidebar.includes(location.pathname);

  // Rotas SEM sidebar (login e root)
  if (!deveMostrarSidebar) {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  // 🎯 DEFINIR ROTAS DO VENDEDOR (TODAS):
  const rotasVendedor = [
    '/dashboard-vendedor',
    '/registro-venda-pelo-vendedor', 
    '/historico-vendas-pelo-vendedor',
    '/troca-pedido-pelo-vendedor',
    '/lista-produtos'  // ✅ Adicionar rotas que vendedor acessa
  ];

  // ✅ VERIFICAR SE É ROTA DO VENDEDOR:
  const isRotaVendedor = rotasVendedor.some(rota => 
    location.pathname.startsWith(rota)
  );

  // Rotas do VENDEDOR com SidebarVendedor
  if (isRotaVendedor) {
    return (
      <SidebarVendedor>
        <Routes>
          <Route path="/dashboard-vendedor" element={<DashboardVendedor />} />
          <Route path="/registro-venda-pelo-vendedor" element={<RegistroVendaVendedor />} />
          <Route path="/historico-vendas-pelo-vendedor" element={<HistoricoVendasVendedor />} />
          <Route path="/troca-pedido-pelo-vendedor" element={<TrocaPedidoVendedor />} />
          <Route path="/lista-produtos" element={<ListaProdutosVendedor />} />
          <Route path="/cadastro-cliente-pelo-vendedor" element={<CadastroClienteVendedor />} />
          <Route path="/editar-cliente-pelo-vendedor/:cpf" element={<EditarClienteVendedor />} />
          <Route path="/lista-clientes-pelo-vendedor" element={<ListarClientesVendedor />} />
          {/* ✅ Adicionar outras rotas do vendedor aqui */}
        </Routes>
      </SidebarVendedor>
    );
  }

  // Rotas PADRÃO com Sidebar normal (Diretor)
  return (
    <Sidebar>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cadastro-pessoa" element={<CadastrarPessoa />} />
        <Route path="/vincular" element={<VincularPessoa />} />
        <Route path="/produtos" element={<CadastrarProduto />} />
        <Route path="/lista-produtos" element={<ListaProdutosDiretor />} />
        <Route path="/produtos-vendedor" element={<ListaProdutosVendedor />} />
        <Route path="/fornecedor" element={<CadastrarFornecedor />} />
        <Route path="/pessoas/:cpf" element={<EditarPessoa />} />
        <Route path="/clientes-pelo-diretor" element={<ListarClientesDiretor />} />
        <Route path="/lista-funcionario-pelo-diretor" element={<ListarFuncionariosDiretor />} />
        <Route path="/lista-fornecedores" element={<ListaFornecedores />} />
        <Route path="/editar-fornecedor" element={<EditarFornecedor />} />
        <Route path="/cadastro-cliente-pelo-diretor" element={<CadastroClienteDiretor />} />
        <Route path="/editar-cliente-pelo-diretor/:cpf" element={<EditarClienteDiretor />} />
        <Route path="/lista-clientes-pelo-diretor" element={<ListarClientesDiretor />} />
        <Route path="/cadastro-funcionario-pelo-diretor" element={<CadastroFuncionarioDiretor />} />
        <Route path="/lista-funcionario-pelo-diretor" element={<ListarFuncionariosDiretor />} />
        <Route path="/editar-funcionario-pelo-diretor/:cpf" element={<EditarFuncionarioDiretor />} />
        <Route path="/registro-venda-pelo-diretor" element={<RegistroVendaDiretor />} />
        <Route path="/historico-vendas-pelo-diretor" element={<HistoricoVendasDiretor />} />
        <Route path="/troca-pedido-pelo-diretor" element={<TrocaPedidoDiretor />} />
      </Routes>
    </Sidebar>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
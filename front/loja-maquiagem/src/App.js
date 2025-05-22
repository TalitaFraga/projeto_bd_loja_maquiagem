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
import ListarClientesDiretor from './components/ListaClientesDiretor';
import ListarFuncionariosDiretor from './components/ListarFuncionariosDiretor';
import ListaFornecedores from './components/ListaFornecedores';
import ListaProdutos from './components/ListaProdutos';
import EditarFornecedor from './components/EditarFornecedor';
import CadastroClienteDiretor from './components/CadastroClienteDiretor';
import EditarClienteDiretor from './components/EditarClienteDiretor';
import Sidebar from './pages/SideBar';
import SidebarVendedor from './pages/SideBarVendedor';
import CadastroFuncionarioDiretor from './components/CadastroFuncionarioDiretor';
import EditarFuncionarioDiretor from './components/EditarFuncionarioDiretor';

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

  // Rotas do VENDEDOR com SidebarVendedor
  if (location.pathname === '/dashboard-vendedor') {
    return (
      <SidebarVendedor>
        <Routes>
          <Route path="/dashboard-vendedor" element={<DashboardVendedor />} />
        </Routes>
      </SidebarVendedor>
    );
  }

  // Rotas PADRÃO com Sidebar normal
  return (
    <Sidebar>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cadastro-pessoa" element={<CadastrarPessoa />} />
        <Route path="/vincular" element={<VincularPessoa />} />
        <Route path="/produtos" element={<CadastrarProduto />} />
        <Route path="/lista-produtos" element={<ListaProdutos />} />
        <Route path="/fornecedor" element={<CadastrarFornecedor />} />
        <Route path="/pessoas/:cpf" element={<EditarPessoa />} />
        <Route path="/clientes-pelo-diretor" element={<ListarClientesDiretor />} />
        <Route path="/lista-funcionario-pelo-diretor" element={<ListarFuncionariosDiretor />} />
        <Route path="/lista-fornecedores" element={<ListaFornecedores />} />
        <Route path="/editar-fornecedor/:cnpj" element={<EditarFornecedor />} />
        <Route path="/cadastro-cliente-pelo-diretor" element={<CadastroClienteDiretor />} />
        <Route path="/editar-cliente-pelo-diretor/:cpf" element={<EditarClienteDiretor />} />
        <Route path="/lista-clientes-pelo-diretor" element={<ListarClientesDiretor />} />
        <Route path="/cadastro-funcionario-pelo-diretor" element={<CadastroFuncionarioDiretor />} />
        <Route path="/lista-funcionario-pelo-diretor" element={<ListarFuncionariosDiretor />} />
        <Route path="/editar-funcionario-pelo-diretor/:cpf" element={<EditarFuncionarioDiretor />} />
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
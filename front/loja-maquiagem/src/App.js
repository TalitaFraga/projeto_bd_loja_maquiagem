import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ListaPessoas from './components/ListaPessoas';
import CadastrarPessoa from './components/CadastroPessoa';
import Home from './components/Home';
import Login from './components/Login';
import VincularPessoa from './components/VincularPessoa';
import CadastrarProduto from './components/CadastroProduto';
import CadastrarFornecedor from './components/CadastroFornecedor';
import Dashboard from './components/dashboard/Dashboard';
import DashboardVendedor from './components/DashboardVendedor';
import EditarPessoa from './components/EditarPessoa';
import ListarClientes from './components/ListarClientes';
import ListarFuncionarios from './components/ListarFuncionarios';
import ListaFornecedores from './components/ListaFornecedores';
import EditarFornecedor from './components/EditarFornecedor';
import Sidebar from '../src/pages/SideBar';



function App() {
  return (
    <Router>
      <Sidebar>
        <Routes>
          <Route path="/lista" element={<ListaPessoas />} />
          <Route path="/cadastro-pessoa" element={<CadastrarPessoa />} />
          <Route path="/login" element={<Login />} />
          <Route path="/vincular" element={<VincularPessoa />} />
          <Route path="/produtos" element={<CadastrarProduto />} />
          <Route path="/fornecedor" element={<CadastrarFornecedor/>}/>
          <Route path="/pessoas/:cpf" element={<EditarPessoa/>}/>
          <Route path="/clientes" element={<ListarClientes />} />
          <Route path="/funcionarios" element={<ListarFuncionarios />} />
          <Route path="/lista-fornecedores" element={<ListaFornecedores />} />
          <Route path="/editar-fornecedor/:cnpj" element={<EditarFornecedor />} />
          <Route path="/dashboard" element={<Dashboard/>}/>
        </Routes>
      </Sidebar>

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/dashboard-vendedor" element={<DashboardVendedor/>}/>

      </Routes>
    </Router>
  );
}

export default App;
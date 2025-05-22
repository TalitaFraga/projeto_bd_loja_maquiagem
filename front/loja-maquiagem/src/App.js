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
import ListarClientesDiretor from './components/ListaClientesDiretor';
import ListarFuncionarios from './components/ListarFuncionarios';
import ListaFornecedores from './components/ListaFornecedores';
import EditarFornecedor from './components/EditarFornecedor';
import CadastroClienteDiretor from './components/CadastroClienteDiretor';
import Sidebar from '../src/pages/SideBar';
import EditarClienteDiretor from './components/EditarClienteDiretor';



function App() {
  return (
    <Router>
      <Sidebar>
        <Routes>
          <Route path="/cadastro-pessoa" element={<CadastrarPessoa />} />
          <Route path="/login" element={<Login />} />
          <Route path="/vincular" element={<VincularPessoa />} />
          <Route path="/produtos" element={<CadastrarProduto />} />
          <Route path="/fornecedor" element={<CadastrarFornecedor/>}/>
          <Route path="/pessoas/:cpf" element={<EditarPessoa/>}/>
          <Route path="/clientes-pelo-diretor" element={<ListarClientesDiretor />} />
          <Route path="/funcionarios" element={<ListarFuncionarios />} />
          <Route path="/lista-fornecedores" element={<ListaFornecedores />} />
          <Route path="/editar-fornecedor/:cnpj" element={<EditarFornecedor />} />
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/cadastro-cliente-pelo-diretor" element={<CadastroClienteDiretor />} />
          <Route path="/editar-cliente-pelo-diretor/:cpf" element={<EditarClienteDiretor />} />
          <Route path="/lista-clientes-pelo-diretor" element={<ListarClientesDiretor />} />
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
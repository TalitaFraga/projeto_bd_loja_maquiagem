import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ListaPessoas from './components/ListaPessoas';
import CadastrarPessoa from './components/CadastroPessoa';
import Home from './components/Home';
import Login from './components/Login';
import VincularPessoa from './components/VincularPessoa';
import CadastrarProduto from './components/CadastroProduto';
import CadastrarFornecedor from './components/CadastroFornecedor';
import Dashboard from './components/dashboard/Dashboard';
import EditarPessoa from './components/EditarPessoa';
import ListarClientes from './components/ListarClientes';
import ListarFuncionarios from './components/ListarFuncionarios';
import ListaFornecedores from './components/ListaFornecedores';
import EditarFornecedor from './components/EditarFornecedor';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lista" element={<ListaPessoas />} />
        <Route path="/cadastro-pessoa" element={<CadastrarPessoa />} />
        <Route path="/login" element={<Login />} />
        <Route path="/vincular" element={<VincularPessoa />} />
        <Route path="/produtos" element={<CadastrarProduto />} />
        <Route path="/fornecedor" element={<CadastrarFornecedor/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/pessoas/:cpf" element={<EditarPessoa/>}/>
        <Route path="/clientes" element={<ListarClientes />} />
        <Route path="/funcionarios" element={<ListarFuncionarios />} />
        <Route path="/lista-fornecedores" element={<ListaFornecedores />} />
        <Route path="/editar-fornecedor/:cnpj" element={<EditarFornecedor />} />

      </Routes>
    </Router>
  );
}

export default App;
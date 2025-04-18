import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ListaPessoas from './components/ListaPessoas';
import CadastrarPessoa from './components/CadastroPessoa';
import Home from './components/Home';
import Login from './components/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lista" element={<ListaPessoas />} />
        <Route path="/cadastrar" element={<CadastrarPessoa />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;

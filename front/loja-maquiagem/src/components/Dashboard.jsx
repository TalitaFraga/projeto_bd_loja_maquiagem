import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
} from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout'; // Importando ícone de logout
import { Link } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [estoque, setEstoque] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clienteData = await axios.get("http://localhost:8080/clientes");
        const produtoData = await axios.get("http://localhost:8080/produtos");
        const fornecedorData = await axios.get("http://localhost:8080/fornecedores");
        const funcionarioData = await axios.get("http://localhost:8080/funcionarios");
        const vendaData = await axios.get("http://localhost:8080/vendas");
        const estoqueData = await axios.get("http://localhost:8080/estoque");

        setClientes(clienteData.data);
        setProdutos(produtoData.data);
        setFornecedores(fornecedorData.data);
        setFuncionarios(funcionarioData.data);
        setVendas(vendaData.data);
        setEstoque(estoqueData.data);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    // Lógica de deslogar (por exemplo, limpar tokens ou qualquer dado de sessão)
    window.location.href = '/login'; // Redireciona para a página de login
  };

  return (
    <Box sx={{ padding: 4 }}>
      {/* Botão de Logout - Canto superior direito */}
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <IconButton onClick={handleLogout}>
          <LogoutIcon sx={{ fontSize: 30, color: '#F06292' }} />
        </IconButton>
      </Box>

      <Container>
        <Typography variant="h4" align="center" color="#D81B60" gutterBottom>
          Dashboard - Diretor
        </Typography>

        <Grid container spacing={3}>
          {/* Clientes */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ padding: 2 }}>
              <Typography variant="h6" gutterBottom>
                Clientes
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>CPF</TableCell>
                      <TableCell>Nome</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clientes.map(cliente => (
                      <TableRow key={cliente.fk_Pessoa_CPF}>
                        <TableCell>{cliente.fk_Pessoa_CPF}</TableCell>
                        <TableCell>{cliente.nome}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Produtos */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ padding: 2 }}>
              <Typography variant="h6" gutterBottom>
                Produtos
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Código de Barra</TableCell>
                      <TableCell>Nome</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {produtos.map(produto => (
                      <TableRow key={produto.codigo_barra}>
                        <TableCell>{produto.codigo_barra}</TableCell>
                        <TableCell>{produto.nome}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Fornecedores */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ padding: 2 }}>
              <Typography variant="h6" gutterBottom>
                Fornecedores
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>CNPJ</TableCell>
                      <TableCell>Nome</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fornecedores.map(fornecedor => (
                      <TableRow key={fornecedor.CNPJ}>
                        <TableCell>{fornecedor.CNPJ}</TableCell>
                        <TableCell>{fornecedor.nome}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Funcionários */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ padding: 2 }}>
              <Typography variant="h6" gutterBottom>
                Funcionários
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>CPF</TableCell>
                      <TableCell>Nome</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {funcionarios.map(funcionario => (
                      <TableRow key={funcionario.fk_Pessoa_CPF}>
                        <TableCell>{funcionario.fk_Pessoa_CPF}</TableCell>
                        <TableCell>{funcionario.nome}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Vendas */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ padding: 2 }}>
              <Typography variant="h6" gutterBottom>
                Vendas
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID Venda</TableCell>
                      <TableCell>Cliente CPF</TableCell>
                      <TableCell>Produto</TableCell>
                      <TableCell>Vendedor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vendas.map(venda => (
                      <TableRow key={venda.id_venda}>
                        <TableCell>{venda.id_venda}</TableCell>
                        <TableCell>{venda.Cliente_fk_Pessoa_CPF}</TableCell>
                        <TableCell>{venda.Produto_codigo_barra}</TableCell>
                        <TableCell>{venda.Vendedor_fk_Funcionário_fk_Pessoa_CPF}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Estoque */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ padding: 2 }}>
              <Typography variant="h6" gutterBottom>
                Estoque
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Produto</TableCell>
                      <TableCell>Quantidade</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {estoque.map(item => (
                      <TableRow key={item.produto_codigo_barra}>
                        <TableCell>{item.produto_nome}</TableCell>
                        <TableCell>{item.quantidade}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;

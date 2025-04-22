import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  Paper,
  IconButton,
} from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CadastrarProduto = () => {
  const [form, setForm] = useState({
    codigo_barra: "",
    lote_produto: "",
    tipo_produto: "",
    nome: "",
    marca: "",
    preco: "",
    data_validade: "",
    fk_Fornecedor_cnpj: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8080/produtos", form);
      alert("Produto cadastrado com sucesso!");
      navigate("/produtos");
    } catch (error) {
      console.error("Erro no cadastro:", error.response?.data || error.message);
      alert("Ocorreu um erro ao cadastrar o produto.");
    }
  };

  return (
    <>
      <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
        <Link to="/">
          <IconButton>
            <HomeIcon sx={{ fontSize: 30, color: '#F06292' }} />
          </IconButton>
        </Link>
      </Box>

      <Container maxWidth="md" sx={{ position: 'relative' }}>
        <Paper elevation={4} sx={{ padding: 4, borderRadius: 4, mt: 5, backgroundColor: '#F3F3F3' }}>
          <Typography variant="h4" align="center" gutterBottom color="#D81B60">
            Cadastro de Produto
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {[
                ["codigo_barra", "Código de Barra"],
                ["lote_produto", "Lote do Produto"],
                ["tipo_produto", "Tipo de Produto"],
                ["nome", "Nome"],
                ["marca", "Marca"],
                ["preco", "Preço", "number"],
                ["data_validade", "Data de Validade", "date"],
                ["fk_Fornecedor_cnpj", "CNPJ do Fornecedor"],
              ].map(([name, label, type = "text"]) => (
                <Grid item xs={12} sm={name === "nome" || name === "preco" ? 12 : 6} key={name}>
                  <TextField
                    fullWidth
                    type={type}
                    label={label}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    required
                    InputLabelProps={type === "date" ? { shrink: true } : undefined}
                  />
                </Grid>
              ))}
            </Grid>

            <Button
              variant="contained"
              type="submit"
              fullWidth
              sx={{
                marginTop: 3,
                backgroundColor: "#F48FB1",
                "&:hover": { backgroundColor: "#F06292" },
              }}
            >
              Cadastrar Produto
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default CadastrarProduto;
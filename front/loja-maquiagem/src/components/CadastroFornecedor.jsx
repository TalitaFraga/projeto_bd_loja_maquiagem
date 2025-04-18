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

const CadastrarFornecedor = () => {
  const [form, setForm] = useState({
    CNPJ: "",
    nome: "",
    telefone1: "",
    telefone2: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Enviar os dados do fornecedor
      await axios.post("http://localhost:8080/fornecedores", form);

      alert("Fornecedor cadastrado com sucesso!");

      // Redireciona para a tela de listagem de fornecedores ou outra tela
      navigate("/fornecedores");
    } catch (error) {
      console.error("Erro no cadastro:", error);
      alert("Ocorreu um erro ao cadastrar o fornecedor.");
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
            Cadastro de Fornecedor
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {[
                ["CNPJ", "CNPJ"],
                ["nome", "Nome"],
                ["telefone1", "Telefone 1"],
                ["telefone2", "Telefone 2"],
              ].map(([name, label]) => (
                <Grid item xs={12} sm={name === "nome" ? 12 : 6} key={name}>
                  <TextField
                    fullWidth
                    label={label}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    required={name !== "telefone2"}  // Telefone 2 é opcional
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
              Cadastrar Fornecedor
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default CadastrarFornecedor;

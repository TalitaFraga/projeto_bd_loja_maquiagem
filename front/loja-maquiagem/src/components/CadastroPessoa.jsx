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

const CadastrarPessoa = () => {
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    dataNasc: "",
    rg: "",
    email: "",
    telefone1: "",
    telefone2: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    cep: "",
  });
  
  const navigate = useNavigate();  // Aqui usamos useNavigate

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // Enviar os dados da pessoa sem um array
      await axios.post("http://localhost:8080/pessoas", form);
  
      // Cadastrar como cliente ou funcionário
      const tipo = form.tipo;
      const cpfPayload = { fk_Pessoa_CPF: form.cpf };
  
      if (tipo === "CLIENTE") {
        await axios.post("http://localhost:8080/clientes", cpfPayload);
      } else {
        await axios.post("http://localhost:8080/funcionarios", cpfPayload);
      }
  
      alert("Cadastro realizado com sucesso!");

      // Redireciona para a tela de Vinculação, passando o CPF
      navigate({
        pathname: '/vincular-pessoa',
        state: { cpf: form.cpf } // Passa o CPF para a próxima tela
      });
    } catch (error) {
      console.error("Erro no cadastro:", error);
      alert("Ocorreu um erro ao cadastrar.");
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
            Cadastro de Pessoa
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {[
                ["nome", "Nome"],
                ["cpf", "CPF"],
                ["dataNasc", "Data de Nascimento", "date"],
                ["rg", "RG"],
                ["email", "Email", "email"],
                ["telefone1", "Telefone 1"],
                ["telefone2", "Telefone 2"],
                ["rua", "Rua"],
                ["numero", "Número"],
                ["bairro", "Bairro"],
                ["cidade", "Cidade"],
                ["cep", "CEP"],
              ].map(([name, label, type = "text"]) => (
                <Grid item xs={12} sm={name === "nome" || name === "email" ? 12 : 6} key={name}>
                  <TextField
                    fullWidth
                    type={type}
                    label={label}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    required={name !== "telefone2"}
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
              Cadastrar Pessoa
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default CadastrarPessoa;

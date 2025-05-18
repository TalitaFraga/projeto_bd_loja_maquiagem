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

  const [isCliente, setIsCliente] = useState(true);
  const [tipoFuncionario, setTipoFuncionario] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Monta o payload dinamicamente
    const payload = {
      pessoa: form,
      isCliente: isCliente,
    };

    payload.tipoFuncionario = isCliente ? "DIRETOR" : tipoFuncionario;

    console.log("Enviando:", JSON.stringify(payload, null, 2));

    try {
      await axios.post("http://localhost:8081/cadastro-pessoa", payload);
      alert("Cadastro realizado com sucesso!");
      navigate("/lista");
    } catch (error) {
      console.log(error.response?.data);
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

                <Grid item xs={12}>
                  <Typography variant="subtitle1">Tipo de Pessoa</Typography>
                  <Button
                      variant={isCliente ? "contained" : "outlined"}
                      onClick={() => setIsCliente(true)}
                  >
                    Cliente
                  </Button>
                  <Button
                      variant={!isCliente ? "contained" : "outlined"}
                      onClick={() => setIsCliente(false)}
                      sx={{ ml: 2 }}
                  >
                    Funcionário
                  </Button>
                </Grid>

                {!isCliente && (
                    <Grid item xs={12}>
                      <TextField
                          fullWidth
                          select
                          label="Tipo de Funcionário"
                          value={tipoFuncionario}
                          onChange={(e) => setTipoFuncionario(e.target.value)}
                          required
                          SelectProps={{ native: true }}
                      >
                        <option value="">Selecione</option>
                        <option value="DIRETOR">Diretor</option>
                        <option value="ATENDENTE">Atendente</option>
                        <option value="ESTOQUISTA">Estoquista</option>
                      </TextField>
                    </Grid>
                )}
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

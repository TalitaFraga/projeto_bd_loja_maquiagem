import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  Paper,
} from "@mui/material";

const EditarPessoa = () => {
  const { cpf } = useParams();
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchPessoa = async () => {
      try {
        const response = await axios.get(`http://localhost:8081/pessoas/${cpf}`);
        setForm(response.data);
      } catch (error) {
        alert("Erro ao buscar dados da pessoa.");
      }
    };

    fetchPessoa();
  }, [cpf]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8080/pessoas/${cpf}`, form);
      alert("Pessoa atualizada com sucesso!");
      navigate("/lista");
    } catch (error) {
      console.error("Erro ao atualizar pessoa:", error);
      alert("Erro ao atualizar pessoa.");
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Paper elevation={4} sx={{ padding: 4, borderRadius: 4, backgroundColor: "#F3F3F3" }}>
        <Typography variant="h4" align="center" gutterBottom color="#D81B60">
          Editar Pessoa
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
                  disabled={name === "cpf"}
                />
              </Grid>
            ))}
          </Grid>
          <Button
            variant="contained"
            type="submit"
            fullWidth
            sx={{ mt: 3, backgroundColor: "#F48FB1", "&:hover": { backgroundColor: "#F06292" } }}
          >
            Salvar Alterações
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditarPessoa;

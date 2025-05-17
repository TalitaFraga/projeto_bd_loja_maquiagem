import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  Paper,
  IconButton
} from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CadastrarFornecedor = () => {
  const [form, setForm] = useState({
    cnpj: "",
    nome: "",
    telefone1: "",
    telefone2: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:8081/fornecedores", form);
      alert("Fornecedor cadastrado com sucesso!");
      navigate("/lista-fornecedores");
    } catch (error) {
      console.error("Erro ao cadastrar:", error.response?.data || error.message);
      alert("Erro ao cadastrar fornecedor.");
    }
  };

  return (
    <>
      <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
        <Link to="/">
          <IconButton>
            <HomeIcon sx={{ fontSize: 30, color: '#e91e63' }} />
          </IconButton>
        </Link>
      </Box>

      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ padding: 4, borderRadius: 4 }}>
          <Typography variant="h4" align="center" gutterBottom color="#e91e63">
            Cadastro de Fornecedor
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {[
                ["cnpj", "CNPJ"],
                ["nome", "Nome"],
                ["telefone1", "Telefone Principal"],
                ["telefone2", "Telefone Secundário (opcional)"],
              ].map(([name, label]) => (
                <Grid item xs={12} key={name}>
                  <TextField
                    fullWidth
                    label={label}
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    required={name !== "telefone2"}
                  />
                </Grid>
              ))}
            </Grid>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 3,
                backgroundColor: "#e91e63",
                "&:hover": { backgroundColor: "#c2185b" }  
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

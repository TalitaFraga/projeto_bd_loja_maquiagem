import React, { useState, useEffect } from "react";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const EditarFornecedor = () => {
  const { cnpj } = useParams(); 
  const [fornecedor, setFornecedor] = useState({
    nome: "",
    cnpj: "",
    telefone1: "",
    telefone2: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFornecedor = async () => {
      try {
        const response = await axios.get(`http://localhost:8081/fornecedores/${cnpj}`);
        setFornecedor(response.data);
      } catch (error) {
        console.error("Erro ao carregar fornecedor", error);
      }
    };
    fetchFornecedor();
  }, [cnpj]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFornecedor({ ...fornecedor, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      console.log("Enviando dados para atualização:", fornecedor);
      const response = await axios.put(`http://localhost:8080/fornecedores/${cnpj}`, fornecedor);
      console.log("Resposta da API:", response);
      if (response.status === 200) {
        navigate("/lista-fornecedores");
      } else {
        console.error("Erro ao salvar fornecedor", response);
      }
    } catch (error) {
      console.error("Erro ao salvar fornecedor", error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" sx={{ color: "#e91e63", fontWeight: "bold", mb: 3 }}>
        Editar Fornecedor
      </Typography>
      <Box>
        <TextField
          label="Nome"
          variant="outlined"
          fullWidth
          name="nome"
          value={fornecedor.nome}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          label="CNPJ"
          variant="outlined"
          fullWidth
          name="cnpj"
          value={fornecedor.cnpj}
          onChange={handleChange}
          disabled
          sx={{ mb: 2 }}
        />
        <TextField
          label="Telefone 1"
          variant="outlined"
          fullWidth
          name="telefone1"
          value={fornecedor.telefone1}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Telefone 2"
          variant="outlined"
          fullWidth
          name="telefone2"
          value={fornecedor.telefone2}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{ bgcolor: "#e91e63", ":hover": { bgcolor: "#c2185b" } }}
        >
          SALVAR
        </Button>
      </Box>
    </Container>
  );
};

export default EditarFornecedor;
import React, { useState } from "react";
import {
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Box,
  IconButton
} from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import { Link } from 'react-router-dom';
import axios from "axios";

const VincularPessoa = () => {
  const [cpf, setCpf] = useState("");
  const [tipo, setTipo] = useState("FUNCIONARIO");
  const [tipoFuncionario, setTipoFuncionario] = useState("ESTOQUISTA");

  // Validate CPF field (simple example)
  const isValidCpf = cpf.length === 11;

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!isValidCpf) {
      alert("CPF deve ter 11 dígitos!");
      return;
    }
  
    try {
      const payload = {
        cpf,
        tipo,
        tipoFuncionario: tipo === "FUNCIONARIO" ? tipoFuncionario : null
      };
  
      await axios.post("http://localhost:8080/api/pessoas", payload);
  
      alert("Pessoa vinculada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao vincular pessoa.");
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

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 4
        }}
      >
        <h2 style={{ color: "#C2185B" }}>Vincular Pessoa</h2>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
            justifyContent: "center",
            mt: 2
          }}
        >
          <TextField
            label="CPF *"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            error={!isValidCpf} // Display error if CPF is invalid
            helperText={!isValidCpf ? "CPF deve ter 11 dígitos!" : ""}
          />

          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              label="Tipo"
            >
              <MenuItem value="FUNCIONARIO">Funcionário</MenuItem>
              <MenuItem value="CLIENTE">Cliente</MenuItem>
            </Select>
          </FormControl>

          {tipo === "FUNCIONARIO" && (
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Tipo de Funcionário</InputLabel>
              <Select
                value={tipoFuncionario}
                onChange={(e) => setTipoFuncionario(e.target.value)}
                label="Tipo de Funcionário"
              >
                <MenuItem value="ESTOQUISTA">Estoquista</MenuItem>
                <MenuItem value="VENDEDOR">Vendedor</MenuItem>
                <MenuItem value="DIRETOR">Diretor</MenuItem>
              </Select>
            </FormControl>
          )}

          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: "#E187A7",
              color: "#fff",
              height: "56px"
            }}
            disabled={!isValidCpf} // Disable the button if CPF is invalid
          >
            VINCULAR PESSOA
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default VincularPessoa;

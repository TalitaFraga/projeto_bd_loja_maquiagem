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
  Divider,
  Alert,
  Snackbar
} from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BadgeIcon from '@mui/icons-material/Badge';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CadastroClienteDiretor = () => {
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
    cep: ""
  });

  const [erros, setErros] = useState({
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
    cep: ""
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  
  const navigate = useNavigate();

  // Função para validar email
  const validarEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Formatar CPF enquanto digita (apenas formatação visual)
  const formatCPF = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      if (value.length > 9) {
        value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      } else if (value.length > 6) {
        value = value.replace(/^(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
      } else if (value.length > 3) {
        value = value.replace(/^(\d{3})(\d{3})/, '$1.$2');
      }
    }
    
    setForm({ ...form, cpf: value });
    setErros(prev => ({ ...prev, cpf: "" }));
  };

  // Formatar RG enquanto digita
  const formatRG = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 9) {
      setForm({ ...form, rg: value });
    }
    setErros(prev => ({ ...prev, rg: "" }));
  };

  // Formatar telefone enquanto digita
  const formatTelefone = (e, campo) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      if (value.length > 10) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else if (value.length > 6) {
        value = value.replace(/^(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
      } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d+)/, '($1) $2');
      }
    }
    setForm({ ...form, [campo]: value });
    setErros(prev => ({ ...prev, [campo]: "" }));
  };

  // Formatar CEP enquanto digita
  const formatCEP = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length <= 8) {
      if (value.length > 5) {
        value = value.replace(/^(\d{5})(\d)/, '$1-$2');
      }
    }
    
    setForm({ ...form, cep: value });
    setErros(prev => ({ ...prev, cep: "" }));
  };

  // Validar email em tempo real
  const handleEmailChange = (e) => {
    const { value } = e.target;
    setForm(prev => ({ ...prev, email: value }));
    
    if (value && !validarEmail(value)) {
      setErros(prev => ({ ...prev, email: "Email inválido" }));
    } else {
      setErros(prev => ({ ...prev, email: "" }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
    setErros((prevErros) => ({ ...prevErros, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Limpar e formatar dados antes de enviar
    const dadosLimpos = {
      nome: form.nome.trim(),
      cpf: form.cpf.replace(/\D/g, ''), // Remove pontos e hífen do CPF
      dataNasc: form.dataNasc,
      rg: form.rg.replace(/\D/g, ''), // Remove caracteres especiais do RG
      email: form.email.trim().toLowerCase(),
      telefone1: form.telefone1.replace(/\D/g, ''), // Remove formatação do telefone
      telefone2: form.telefone2 ? form.telefone2.replace(/\D/g, '') : '', // Remove formatação se preenchido
      rua: form.rua.trim(),
      numero: form.numero.trim(),
      bairro: form.bairro.trim(),
      cidade: form.cidade.trim(),
      cep: form.cep.replace(/\D/g, '') // Remove hífen do CEP
    };

    // Payload para cadastro de cliente
    const payload = {
      pessoa: dadosLimpos,
      isCliente: true,
    };

    console.log("Payload enviado:", JSON.stringify(payload, null, 2));

    try {
      const response = await axios.post("http://localhost:8081/cadastro-pessoa", payload);
      
      console.log("Resposta completa:", response);
      
      setSnackbar({
        open: true,
        message: "Cliente cadastrado com sucesso!",
        severity: "success"
      });
      
      // Limpar formulário após sucesso
      setForm({
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
        cep: ""
      });
      
      setTimeout(() => navigate("/lista-clientes-pelo-diretor"), 2000);
      
    } catch (error) {
      console.error("Erro no cadastro:", error);
      
      let errorMessage = "Erro ao cadastrar cliente. Verifique os dados informados.";
      let severity = "error";
      
      if (error.response) {
        const errorText = error.response.data;
        
        // DETECTAR ERROS COMUNS POR KEYWORDS NA MENSAGEM DE ERRO
        if (typeof errorText === 'string') {
          const errorLower = errorText.toLowerCase();
          
          // CPF duplicado
          if (errorLower.includes('cpf') || 
              errorLower.includes('duplicate entry') && errorLower.includes('cpf') ||
              errorLower.includes('unique constraint') && errorLower.includes('cpf') ||
              errorLower.includes('primary key')) {
            errorMessage = "Este CPF já está cadastrado no sistema. Verifique se o cliente não foi cadastrado anteriormente.";
            severity = "warning";
          }
          // RG duplicado  
          else if (errorLower.includes('rg') || 
                   errorLower.includes('duplicate entry') && errorLower.includes('rg')) {
            errorMessage = "Este RG já está cadastrado no sistema.";
            severity = "warning";
          }
          // Email duplicado
          else if (errorLower.includes('email') || 
                   errorLower.includes('duplicate entry') && errorLower.includes('email')) {
            errorMessage = "Este email já está cadastrado no sistema.";
            severity = "warning";
          }
          // Erro de constraint/validação genérico
          else if (errorLower.includes('constraint') || 
                   errorLower.includes('duplicate') ||
                   errorLower.includes('unique')) {
            errorMessage = "Dados duplicados detectados. Verifique CPF, RG ou Email.";
            severity = "warning";
          }
          // Erro de conexão com banco
          else if (errorLower.includes('connection') || 
                   errorLower.includes('timeout') ||
                   errorLower.includes('database')) {
            errorMessage = "Erro de conexão com o servidor. Tente novamente em alguns instantes.";
            severity = "error";
          }
        }
        
        // STATUS HTTP
        switch (error.response.status) {
          case 409: // Conflict
            if (severity === "error") { // Se não detectou tipo específico acima
              errorMessage = "Dados conflitantes. CPF, RG ou Email já cadastrado.";
              severity = "warning";
            }
            break;
          case 400: // Bad Request
            if (severity === "error") {
              errorMessage = "Dados inválidos. Verifique se todos os campos estão preenchidos corretamente.";
            }
            break;
          case 500: // Internal Server Error
            if (severity === "error") {
              errorMessage = "Erro interno do servidor. Tente novamente mais tarde.";
            }
            break;
        }
        
      } else if (error.request) {
        errorMessage = "Sem resposta do servidor. Verifique sua conexão com a internet.";
        severity = "error";
      } else {
        errorMessage = "Erro na preparação da requisição. Tente recarregar a página.";
        severity = "error";
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: severity
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
        <Link to="/dashboard">
          <IconButton>
            <HomeIcon sx={{ fontSize: 30, color: '#F06292' }} />
          </IconButton>
        </Link>
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper 
          elevation={4} 
          sx={{ 
            padding: 4, 
            borderRadius: 3, 
            mt: 3, 
            backgroundColor: '#FFF',
            borderTop: '4px solid #F06292',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <PersonAddIcon sx={{ fontSize: 36, color: '#F06292', mr: 2 }} />
            <Typography variant="h4" color="#333" fontWeight="500">
              Cadastro de Cliente
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 4 }} />

          <Box component="form" onSubmit={handleSubmit} autoComplete="on">
            <Typography variant="h6" color="#555" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <BadgeIcon sx={{ mr: 1, color: '#F06292' }} />
              Informações Pessoais
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome Completo"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  error={!!erros.nome}
                  helperText={erros.nome}
                  autoComplete="name"
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="CPF"
                  name="cpf"
                  value={form.cpf}
                  onChange={formatCPF}
                  required
                  variant="outlined"
                  placeholder="000.000.000-00"
                  error={!!erros.cpf}
                  helperText={erros.cpf}
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Data de Nascimento"
                  name="dataNasc"
                  value={form.dataNasc}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  error={!!erros.dataNasc}
                  helperText={erros.dataNasc}
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="RG"
                  name="rg"
                  value={form.rg}
                  onChange={formatRG}
                  required
                  variant="outlined"
                  error={!!erros.rg}
                  helperText={erros.rg || "Apenas números"}
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" color="#555" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <PhoneIcon sx={{ mr: 1, color: '#F06292' }} />
              Contato
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleEmailChange}
                  required
                  variant="outlined"
                  error={!!erros.email}
                  helperText={erros.email}
                  autoComplete="email"
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Telefone Principal"
                  name="telefone1"
                  value={form.telefone1}
                  onChange={(e) => formatTelefone(e, 'telefone1')}
                  required
                  variant="outlined"
                  placeholder="(00) 00000-0000"
                  error={!!erros.telefone1}
                  helperText={erros.telefone1}
                  autoComplete="tel"
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Telefone Secundário"
                  name="telefone2"
                  value={form.telefone2}
                  onChange={(e) => formatTelefone(e, 'telefone2')}
                  variant="outlined"
                  placeholder="(00) 00000-0000"
                  error={!!erros.telefone2}
                  helperText={erros.telefone2 || "Opcional"}
                  autoComplete="tel"
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" color="#555" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <LocationOnIcon sx={{ mr: 1, color: '#F06292' }} />
              Endereço
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Rua"
                  name="rua"
                  value={form.rua}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  error={!!erros.rua}
                  helperText={erros.rua}
                  autoComplete="street-address"
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={2}>
                <TextField
                  fullWidth
                  label="Número"
                  name="numero"
                  value={form.numero}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  error={!!erros.numero}
                  helperText={erros.numero}
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Bairro"
                  name="bairro"
                  value={form.bairro}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  error={!!erros.bairro}
                  helperText={erros.bairro}
                  autoComplete="address-level3"
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cidade"
                  name="cidade"
                  value={form.cidade}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  error={!!erros.cidade}
                  helperText={erros.cidade}
                  autoComplete="address-level2"
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="CEP"
                  name="cep"
                  value={form.cep}
                  onChange={formatCEP}
                  required
                  variant="outlined"
                  placeholder="00000-000"
                  error={!!erros.cep}
                  helperText={erros.cep || "Digite apenas números"}
                  autoComplete="postal-code"
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                type="submit"
                size="large"
                sx={{
                  px: 6,
                  py: 1.5,
                  borderRadius: 2,
                  backgroundColor: "#F06292",
                  "&:hover": { backgroundColor: "#E91E63" },
                  transition: "transform 0.2s",
                  "&:active": { transform: "scale(0.98)" },
                  boxShadow: '0 4px 10px rgba(240, 98, 146, 0.3)',
                  fontWeight: "bold"
                }}
              >
                Cadastrar Cliente
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={snackbar.severity === 'warning' ? 7000 : 5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            '& .MuiAlert-message': {
              fontSize: '14px',
              fontWeight: snackbar.severity === 'warning' ? 'bold' : 'normal'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CadastroClienteDiretor;
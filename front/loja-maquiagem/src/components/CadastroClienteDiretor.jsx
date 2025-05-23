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
  Snackbar,
  FormHelperText
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

  // Estado para gerenciar os erros de validação
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

  // Função para validar CPF (formato e dígitos verificadores)
  const validarCPF = (cpf) => {
    // Remove caracteres não numéricos
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpfLimpo.length !== 11) {
      return false;
    }
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpfLimpo)) {
      return false;
    }
    
    // Valida os dígitos verificadores
    let soma = 0;
    let resto;
    
    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(cpfLimpo.substring(i-1, i)) * (11 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(9, 10))) return false;
    
    // Segundo dígito verificador
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(cpfLimpo.substring(i-1, i)) * (12 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpfLimpo.substring(10, 11))) return false;
    
    return true;
  };

  // Função para validar email
  const validarEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Função para validar telefone
  const validarTelefone = (telefone) => {
    // Remove caracteres não numéricos
    const telefoneLimpo = telefone.replace(/\D/g, '');
    // Verifica se tem entre 10 e 11 dígitos (com ou sem DDD)
    return telefoneLimpo.length >= 10 && telefoneLimpo.length <= 11;
  };

  // Função para validar CEP - versão corrigida
  const validarCEP = (cep) => {
    // Remove caracteres não numéricos
    const cepLimpo = cep.replace(/\D/g, '');
    
    // Aceita CEPs com pelo menos 5 dígitos
    return cepLimpo.length >= 5;
  };

  // Função para validar data de nascimento
  const validarDataNasc = (data) => {
    if (!data) return false;
    
    const dataObj = new Date(data);
    const hoje = new Date();
    
    // Verifica se é uma data válida
    if (isNaN(dataObj.getTime())) return false;
    
    // Verifica se não é uma data futura
    if (dataObj > hoje) return false;
    
    // Verifica se a pessoa tem pelo menos 16 anos (regra de negócio)
    const idade = hoje.getFullYear() - dataObj.getFullYear();
    const mesAtual = hoje.getMonth();
    const diaAtual = hoje.getDate();
    const mesNasc = dataObj.getMonth();
    const diaNasc = dataObj.getDate();
    
    if (idade < 16 || (idade === 16 && (mesAtual < mesNasc || (mesAtual === mesNasc && diaAtual < diaNasc)))) {
      return false;
    }
    
    return true;
  };

  // Função para validar número inteiro
  const validarNumeroInteiro = (numero) => {
    return /^\d+$/.test(numero);
  };

  // Função para validar nome (apenas letras e espaços)
  const validarNome = (nome) => {
    // Permite letras, espaços e caracteres com acentos
    return /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(nome) && nome.trim().length >= 3;
  };

  // Função para validar RG (formato)
  const validarRG = (rg) => {
    // Remove caracteres não numéricos
    const rgLimpo = rg.replace(/\D/g, '');
    // Verifica se tem pelo menos 7 dígitos
    return rgLimpo.length >= 7;
  };

  // Função para validar texto (não vazio)
  const validarTexto = (texto) => {
    return texto.trim().length >= 2;
  };

  // Função para validar o formulário inteiro
  const validarFormulario = () => {
    let novosErros = { ...erros };
    let formValido = true;

    // Validação de Nome
    if (!validarNome(form.nome)) {
      novosErros.nome = "Nome deve conter apenas letras e ter pelo menos 3 caracteres";
      formValido = false;
    } else {
      novosErros.nome = "";
    }

    // Validação de CPF
    if (!validarCPF(form.cpf)) {
      novosErros.cpf = "CPF inválido, verifique se digitou corretamente";
      formValido = false;
    } else {
      novosErros.cpf = "";
    }

    // Validação de Data de Nascimento
    if (!validarDataNasc(form.dataNasc)) {
      novosErros.dataNasc = "Data inválida. Você deve ter pelo menos 16 anos";
      formValido = false;
    } else {
      novosErros.dataNasc = "";
    }

    // Validação de RG
    if (!validarRG(form.rg)) {
      novosErros.rg = "RG inválido, verifique se digitou corretamente";
      formValido = false;
    } else {
      novosErros.rg = "";
    }

    // Validação de Email
    if (!validarEmail(form.email)) {
      novosErros.email = "Email inválido, digite no formato exemplo@dominio.com";
      formValido = false;
    } else {
      novosErros.email = "";
    }

    // Validação de Telefone 1
    if (!validarTelefone(form.telefone1)) {
      novosErros.telefone1 = "Telefone inválido, deve conter DDD + número";
      formValido = false;
    } else {
      novosErros.telefone1 = "";
    }

    // Validação de Telefone 2 (opcional)
    if (form.telefone2 && !validarTelefone(form.telefone2)) {
      novosErros.telefone2 = "Telefone inválido, deve conter DDD + número";
      formValido = false;
    } else {
      novosErros.telefone2 = "";
    }

    // Validação de Rua
    if (!validarTexto(form.rua)) {
      novosErros.rua = "Informe um endereço válido";
      formValido = false;
    } else {
      novosErros.rua = "";
    }

    // Validação de Número
    if (!validarNumeroInteiro(form.numero)) {
      novosErros.numero = "Digite apenas números";
      formValido = false;
    } else {
      novosErros.numero = "";
    }

    // Validação de Bairro
    if (!validarTexto(form.bairro)) {
      novosErros.bairro = "Informe um bairro válido";
      formValido = false;
    } else {
      novosErros.bairro = "";
    }

    // Validação de Cidade
    if (!validarTexto(form.cidade)) {
      novosErros.cidade = "Informe uma cidade válida";
      formValido = false;
    } else {
      novosErros.cidade = "";
    }

    // Validação de CEP
    if (!validarCEP(form.cep)) {
      novosErros.cep = "CEP inválido, deve conter pelo menos 5 dígitos";
      formValido = false;
    } else {
      novosErros.cep = "";
    }

    setErros(novosErros);
    return formValido;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
    
    // Limpar o erro quando o campo for alterado
    setErros((prevErros) => ({ ...prevErros, [name]: "" }));
  };

  // Formatar CPF enquanto digita
  const formatCPF = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    setForm({ ...form, cpf: value });
    
    // Limpar o erro quando o campo for alterado
    setErros((prevErros) => ({ ...prevErros, cpf: "" }));
  };

  // Formatar CEP enquanto digita
  const formatCEP = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    // Limita a 8 dígitos e formata com hífen
    if (value.length <= 8) {
      // Formato: 00000-000
      if (value.length > 5) {
        value = value.replace(/^(\d{5})(\d)/, '$1-$2');
      }
    }
    
    setForm({ ...form, cep: value });
    
    // Limpar o erro quando o campo for alterado
    setErros((prevErros) => ({ ...prevErros, cep: "" }));
  };

  // Formatar telefone enquanto digita
  const formatTelefone = (e, campo) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      // Formato: (XX) XXXXX-XXXX
      value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
      value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    }
    setForm({ ...form, [campo]: value });
    
    // Limpar o erro quando o campo for alterado
    setErros((prevErros) => ({ ...prevErros, [campo]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar todo o formulário antes de enviar
    if (!validarFormulario()) {
      setSnackbar({
        open: true,
        message: "Por favor, corrija os erros antes de enviar.",
        severity: "error"
      });
      return;
    }

    const payload = {
      pessoa: form,
      isCliente: true,
      tipoFuncionario: "DIRETOR"
    };

    try {
      await axios.post("http://localhost:8081/cadastro-pessoa", payload);
      setSnackbar({
        open: true,
        message: "Cliente cadastrado com sucesso!",
        severity: "success"
      });
      setTimeout(() => navigate("/lista-clientes-pelo-diretor"), 2000);
    } catch (error) {
      console.error("Erro no cadastro:", error);
      setSnackbar({
        open: true,
        message: "Erro ao cadastrar cliente. Verifique os dados informados.",
        severity: "error"
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

          <Box component="form" onSubmit={handleSubmit}>
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
                  onChange={handleChange}
                  required
                  variant="outlined"
                  error={!!erros.rg}
                  helperText={erros.rg}
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
                  onChange={handleChange}
                  required
                  variant="outlined"
                  error={!!erros.email}
                  helperText={erros.email}
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
                  helperText={erros.telefone2}
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
                  helperText={erros.cep || "Digite apenas números. A formatação será aplicada automaticamente."}
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
        autoHideDuration={5000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CadastroClienteDiretor;
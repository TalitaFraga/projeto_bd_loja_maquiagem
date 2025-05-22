import React, { useState, useEffect } from "react";
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
  Snackbar,
  Alert,
  CircularProgress,
  Chip
} from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import EditIcon from '@mui/icons-material/Edit';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BadgeIcon from '@mui/icons-material/Badge';
import WorkIcon from '@mui/icons-material/Work';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const EditarFuncionarioDiretor = () => {
  const { cpf } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);

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
    tipoFuncionario: ""
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

  // Buscar dados do funcionário
  useEffect(() => {
    const fetchFuncionario = async () => {
      setLoading(true);
      try {
        console.log("CPF da URL original:", cpf);
        
        // ✅ ESTRATÉGIA: Tentar múltiplas formas de buscar o funcionário
        const tentativas = [
          cpf, // CPF como veio da URL
          cpf.replace(/\D/g, ''), // CPF apenas números
          encodeURIComponent(cpf) // CPF com encoding para URL
        ];
        
        let response = null;
        let cpfEncontrado = null;
        
        for (const cpfTentativa of tentativas) {
          try {
            console.log("Tentando buscar com CPF:", cpfTentativa);
            response = await axios.get(`http://localhost:8081/funcionarios/${cpfTentativa}`);
            cpfEncontrado = cpfTentativa;
            console.log("✅ Funcionário encontrado com CPF:", cpfTentativa);
            break;
          } catch (error) {
            if (error.response?.status === 404) {
              console.log("❌ Funcionário não encontrado com CPF:", cpfTentativa);
              continue; // Tentar próxima variação
            } else {
              throw error; // Se não for 404, é outro erro
            }
          }
        }
        
        // Se nenhuma tentativa funcionou
        if (!response) {
          throw new Error("Funcionário não encontrado com nenhuma variação do CPF");
        }
        
        console.log("Dados do funcionário recebidos:", response.data);
        console.log("Campo tipoFuncionario especificamente:", response.data.tipoFuncionario);
        
        // Formatação da data para formato de input
        let dadosFuncionario = response.data;
        if (dadosFuncionario.dataNasc) {
          // Se a data estiver em formato array [ano, mês, dia]
          if (Array.isArray(dadosFuncionario.dataNasc)) {
            const [ano, mes, dia] = dadosFuncionario.dataNasc;
            dadosFuncionario.dataNasc = `${ano}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
          }
          // Se a data estiver no formato DD/MM/YYYY, converter para YYYY-MM-DD
          else if (dadosFuncionario.dataNasc.includes('/')) {
            const partes = dadosFuncionario.dataNasc.split('/');
            dadosFuncionario.dataNasc = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
          }
        }
        
        // Aplicar formatação aos dados recebidos do servidor
        if (dadosFuncionario.cpf) {
          dadosFuncionario.cpf = formatCPFDisplay(dadosFuncionario.cpf);
        }
        if (dadosFuncionario.telefone1) {
          dadosFuncionario.telefone1 = formatTelefoneDisplay(dadosFuncionario.telefone1);
        }
        if (dadosFuncionario.telefone2) {
          dadosFuncionario.telefone2 = formatTelefoneDisplay(dadosFuncionario.telefone2);
        }
        if (dadosFuncionario.cep) {
          dadosFuncionario.cep = formatCEPDisplay(dadosFuncionario.cep);
        }
        
        // ✅ CORREÇÃO: Verificar melhor o tipo de funcionário
        if (!dadosFuncionario.tipoFuncionario || dadosFuncionario.tipoFuncionario === '') {
          dadosFuncionario.tipoFuncionario = "FUNCIONÁRIO";
          console.warn("tipoFuncionario não encontrado, usando padrão:", dadosFuncionario.tipoFuncionario);
        }
        
        console.log("Tipo de funcionário detectado:", dadosFuncionario.tipoFuncionario);
        
        setForm(dadosFuncionario);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar dados do funcionário:", error);
        setLoadingError(true);
        setLoading(false);
        
        let errorMessage = "Erro ao carregar dados do funcionário. Tente novamente mais tarde.";
        
        if (error.response) {
          switch (error.response.status) {
            case 404:
              errorMessage = "Funcionário não encontrado. Verifique se o CPF está correto.";
              break;
            case 500:
              errorMessage = "Erro interno do servidor. Tente novamente mais tarde.";
              break;
            default:
              errorMessage = `Erro: ${error.response.data || 'Falha ao carregar dados'}`;
          }
        }
        
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: "error"
        });
      }
    };

    fetchFuncionario();
  }, [cpf]);

  // Funções de formatação para exibição
  const formatCPFDisplay = (value) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 11) {
      if (cleanValue.length > 9) {
        return cleanValue.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      } else if (cleanValue.length > 6) {
        return cleanValue.replace(/^(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
      } else if (cleanValue.length > 3) {
        return cleanValue.replace(/^(\d{3})(\d{3})/, '$1.$2');
      }
    }
    return cleanValue;
  };

  const formatTelefoneDisplay = (value) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 11) {
      if (cleanValue.length > 10) {
        return cleanValue.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else if (cleanValue.length > 6) {
        return cleanValue.replace(/^(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
      } else if (cleanValue.length > 2) {
        return cleanValue.replace(/^(\d{2})(\d+)/, '($1) $2');
      }
    }
    return cleanValue;
  };

  const formatCEPDisplay = (value) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 8) {
      if (cleanValue.length > 5) {
        return cleanValue.replace(/^(\d{5})(\d)/, '$1-$2');
      }
    }
    return cleanValue;
  };

  // Função para validar email
  const validarEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
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

    console.log("Dados limpos para envio:", JSON.stringify(dadosLimpos, null, 2));

    try {
      // ✅ CORREÇÃO: Usar as mesmas tentativas da busca
      const tentativas = [
        cpf, // CPF como veio da URL
        cpf.replace(/\D/g, ''), // CPF apenas números
        encodeURIComponent(cpf) // CPF com encoding para URL
      ];
      
      let response = null;
      
      for (const cpfTentativa of tentativas) {
        try {
          console.log("Tentando atualizar com CPF:", cpfTentativa);
          response = await axios.put(`http://localhost:8081/funcionarios/${cpfTentativa}`, dadosLimpos);
          console.log("✅ Funcionário atualizado com CPF:", cpfTentativa);
          break;
        } catch (error) {
          if (error.response?.status === 404) {
            console.log("❌ Funcionário não encontrado para atualização com CPF:", cpfTentativa);
            continue; // Tentar próxima variação
          } else {
            throw error; // Se não for 404, é outro erro
          }
        }
      }
      
      // Se nenhuma tentativa funcionou
      if (!response) {
        throw new Error("Funcionário não encontrado para atualização com nenhuma variação do CPF");
      }

      console.log("Resposta da atualização:", response);
      
      setSnackbar({
        open: true,
        message: "Funcionário atualizado com sucesso!",
        severity: "success"
      });
      
      setTimeout(() => navigate("/lista-funcionario-pelo-diretor"), 2000);
    } catch (error) {
      console.error("Erro ao atualizar funcionário:", error);
      
      let errorMessage = "Erro ao atualizar funcionário. Verifique os dados informados.";
      let severity = "error";
      
      if (error.response) {
        const errorText = error.response.data;
        
        // Detectar erros comuns por keywords na mensagem de erro
        if (typeof errorText === 'string') {
          const errorLower = errorText.toLowerCase();
          
          // RG duplicado  
          if (errorLower.includes('rg') || 
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
            errorMessage = "Dados duplicados detectados. Verifique RG ou Email.";
            severity = "warning";
          }
        }
        
        // Status HTTP
        switch (error.response.status) {
          case 409: // Conflict
            if (severity === "error") {
              errorMessage = "Dados conflitantes. RG ou Email já cadastrado.";
              severity = "warning";
            }
            break;
          case 400: // Bad Request
            if (severity === "error") {
              errorMessage = "Dados inválidos. Verifique se todos os campos estão preenchidos corretamente.";
            }
            break;
          case 404: // Not Found
            errorMessage = "Funcionário não encontrado para atualização.";
            severity = "error";
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

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress sx={{ color: '#F06292' }} />
      </Container>
    );
  }

  if (loadingError) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, bgcolor: '#FFF4F5', borderRadius: 3 }}>
          <Typography variant="h5" color="error" gutterBottom>
            Não foi possível carregar os dados do funcionário
          </Typography>
          <Typography variant="body1" gutterBottom>
            Ocorreu um erro ao tentar buscar as informações. Tente novamente mais tarde.
          </Typography>
          <Button 
            variant="contained" 
            component={Link} 
            to="/lista-funcionario-pelo-diretor"
            sx={{ 
              mt: 3, 
              bgcolor: '#F06292', 
              '&:hover': { bgcolor: '#E91E63' } 
            }}
          >
            Voltar para a Lista
          </Button>
        </Paper>
      </Container>
    );
  }

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
            <EditIcon sx={{ fontSize: 36, color: '#F06292', mr: 2 }} />
            <Typography variant="h4" color="#333" fontWeight="500">
              Editar Funcionário
            </Typography>
          </Box>
          
          <Divider sx={{ mb: 4 }} />

          <Box component="form" onSubmit={handleSubmit} autoComplete="on">
            {/* Tipo de Funcionário (somente exibição) */}
            <Typography variant="h6" color="#555" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <WorkIcon sx={{ mr: 1, color: '#F06292' }} />
              Tipo de Funcionário
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    label={form.tipoFuncionario || "FUNCIONÁRIO"} 
                    sx={{ 
                      bgcolor: '#F06292', 
                      color: 'white', 
                      fontWeight: 'bold',
                      fontSize: '14px',
                      py: 2
                    }} 
                  />
                  <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                    (Não é possível alterar o tipo)
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Informações Pessoais */}
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
                  disabled
                  variant="outlined"
                  InputProps={{
                    sx: { borderRadius: 2, bgcolor: '#f5f5f5' }
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

            {/* Contato */}
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

            {/* Endereço */}
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

            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                component={Link}
                to="/lista-funcionario-pelo-diretor"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  borderColor: "#9E9E9E",
                  color: "#757575",
                  "&:hover": { borderColor: "#757575", backgroundColor: "#F5F5F5" },
                }}
              >
                Cancelar
              </Button>
              
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
                Salvar Alterações
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

export default EditarFuncionarioDiretor;
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
  CircularProgress
} from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import EditIcon from '@mui/icons-material/Edit';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const EditarFornecedor = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);

  // Pegar CNPJ da query string
  const searchParams = new URLSearchParams(location.search);
  const cnpj = searchParams.get('cnpj');

  const [form, setForm] = useState({
    nome: "",
    cnpj: "",
    telefone1: "",
    telefone2: ""
  });

  const [erros, setErros] = useState({
    nome: "",
    cnpj: "",
    telefone1: "",
    telefone2: ""
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Buscar dados do fornecedor
  useEffect(() => {
    const fetchFornecedor = async () => {
      setLoading(true);
      try {
        console.log("CNPJ recebido da URL:", cnpj);
        const cnpjEncoded = encodeURIComponent(cnpj);
        console.log("CNPJ encoded para requisição:", cnpjEncoded);
        const response = await axios.get(`http://localhost:8081/fornecedores/${cnpjEncoded}`);
        console.log("Dados do fornecedor recebidos:", response.data);

        let dadosFornecedor = response.data;

        // Aplicar formatação aos dados recebidos do servidor
        if (dadosFornecedor.cnpj) {
          dadosFornecedor.cnpj = formatCNPJDisplay(dadosFornecedor.cnpj);
        }
        if (dadosFornecedor.telefone1) {
          dadosFornecedor.telefone1 = formatTelefoneDisplay(dadosFornecedor.telefone1);
        }
        if (dadosFornecedor.telefone2) {
          dadosFornecedor.telefone2 = formatTelefoneDisplay(dadosFornecedor.telefone2);
        }

        setForm(dadosFornecedor);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar dados do fornecedor:", error);
        setLoadingError(true);
        setLoading(false);
        setSnackbar({
          open: true,
          message: "Erro ao carregar dados do fornecedor. Tente novamente mais tarde.",
          severity: "error"
        });
      }
    };

    fetchFornecedor();
  }, [cnpj]);

  // Funções de formatação para exibição
  const formatCNPJDisplay = (value) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 14) {
      if (cleanValue.length > 12) {
        return cleanValue.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
      } else if (cleanValue.length > 8) {
        return cleanValue.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})/, '$1.$2.$3/$4');
      } else if (cleanValue.length > 5) {
        return cleanValue.replace(/^(\d{2})(\d{3})(\d{3})/, '$1.$2.$3');
      } else if (cleanValue.length > 2) {
        return cleanValue.replace(/^(\d{2})(\d{3})/, '$1.$2');
      }
    }
    return cleanValue;
  };

  const formatTelefoneDisplay = (value) => {
    if (!value) return '';
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
      cnpj: form.cnpj.replace(/\D/g, ''), // Remove pontos, barras e hífen do CNPJ
      telefone1: form.telefone1.replace(/\D/g, ''), // Remove formatação do telefone
      telefone2: form.telefone2 ? form.telefone2.replace(/\D/g, '') : '' // Remove formatação se preenchido
    };

    console.log("Dados limpos para envio:", JSON.stringify(dadosLimpos, null, 2));

    try {
      const response = await axios.put(`http://localhost:8081/fornecedores/${cnpj}`, dadosLimpos);

      console.log("Resposta da atualização:", response);

      setSnackbar({
        open: true,
        message: "Fornecedor atualizado com sucesso!",
        severity: "success"
      });

      setTimeout(() => navigate("/lista-fornecedores"), 2000);
    } catch (error) {
      console.error("Erro ao atualizar fornecedor:", error);

      let errorMessage = "Erro ao atualizar fornecedor. Verifique os dados informados.";
      let severity = "error";

      if (error.response) {
        const errorText = error.response.data;

        // Detectar erros comuns por keywords na mensagem de erro
        if (typeof errorText === 'string') {
          const errorLower = errorText.toLowerCase();

          // Nome duplicado
          if (errorLower.includes('nome') ||
              errorLower.includes('duplicate entry') && errorLower.includes('nome')) {
            errorMessage = "Este nome já está cadastrado no sistema.";
            severity = "warning";
          }
          // Telefone duplicado
          else if (errorLower.includes('telefone') ||
              errorLower.includes('duplicate entry') && errorLower.includes('telefone')) {
            errorMessage = "Este telefone já está cadastrado no sistema.";
            severity = "warning";
          }
          // Erro de constraint/validação genérico
          else if (errorLower.includes('constraint') ||
              errorLower.includes('duplicate') ||
              errorLower.includes('unique')) {
            errorMessage = "Dados duplicados detectados. Verifique Nome ou Telefone.";
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

        // Status HTTP
        switch (error.response.status) {
          case 409: // Conflict
            if (severity === "error") {
              errorMessage = "Dados conflitantes. Nome ou Telefone já cadastrado.";
              severity = "warning";
            }
            break;
          case 400: // Bad Request
            if (severity === "error") {
              errorMessage = "Dados inválidos. Verifique se todos os campos estão preenchidos corretamente.";
            }
            break;
          case 404: // Not Found
            errorMessage = "Fornecedor não encontrado para atualização.";
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
              Não foi possível carregar os dados do fornecedor
            </Typography>
            <Typography variant="body1" gutterBottom>
              Ocorreu um erro ao tentar buscar as informações. Tente novamente mais tarde.
            </Typography>
            <Button
                variant="contained"
                component={Link}
                to="/lista-fornecedores"
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
          <Link to="/">
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
                Editar Fornecedor
              </Typography>
            </Box>

            <Divider sx={{ mb: 4 }} />

            <Box component="form" onSubmit={handleSubmit} autoComplete="on">
              {/* Informações da Empresa */}
              <Typography variant="h6" color="#555" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <BusinessIcon sx={{ mr: 1, color: '#F06292' }} />
                Informações da Empresa
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12}>
                  <TextField
                      fullWidth
                      label="Nome da Empresa"
                      name="nome"
                      value={form.nome}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      error={!!erros.nome}
                      helperText={erros.nome}
                      autoComplete="organization"
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                      fullWidth
                      label="CNPJ"
                      name="cnpj"
                      value={form.cnpj}
                      disabled
                      variant="outlined"
                      InputProps={{
                        sx: { borderRadius: 2, bgcolor: '#f5f5f5' }
                      }}
                  />
                </Grid>
              </Grid>

              {/* Contato */}
              <Typography variant="h6" color="#555" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <PhoneIcon sx={{ mr: 1, color: '#F06292' }} />
                Contato
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
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

                <Grid item xs={12} sm={6}>
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

              <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                    variant="outlined"
                    component={Link}
                    to="/lista-fornecedores"
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

export default EditarFornecedor;
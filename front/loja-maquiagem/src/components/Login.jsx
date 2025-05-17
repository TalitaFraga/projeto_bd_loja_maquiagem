import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, InputAdornment, CircularProgress } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';

const Login = () => {
  const [form, setForm] = useState({
    cpf: '',
    password: '',
  });

  // Função para formatar CPF no padrão brasileiro (XXX.XXX.XXX-XX)
  const formatCPF = (value) => {
    // Remove todos os caracteres não numéricos
    const cpfNumbers = value.replace(/\D/g, '');
    
    // Limita o CPF a 11 dígitos
    const limitedCPF = cpfNumbers.slice(0, 11);
    
    // Formata o CPF com pontos e traço
    let formattedCPF = limitedCPF;
    
    if (limitedCPF.length > 3) {
      formattedCPF = limitedCPF.replace(/^(\d{3})/, '$1.');
    }
    if (limitedCPF.length > 6) {
      formattedCPF = formattedCPF.replace(/^(\d{3})\.(\d{3})/, '$1.$2.');
    }
    if (limitedCPF.length > 9) {
      formattedCPF = formattedCPF.replace(/^(\d{3})\.(\d{3})\.(\d{3})/, '$1.$2.$3-');
    }
    
    return formattedCPF;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cpf') {
      // Aplica a formatação ao CPF
      const formattedValue = formatCPF(value);
      setForm((prevForm) => ({ ...prevForm, [name]: formattedValue }));
    } else {
      setForm((prevForm) => ({ ...prevForm, [name]: value }));
    }
  };

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Remove a formatação do CPF para enviar apenas números se necessário
    const cpfClean = form.cpf.replace(/\D/g, '');
    
    try {
      // Primeira requisição: verificar se é diretor
      const responseDiretor = await fetch(`http://localhost:8081/diretores/${form.cpf}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json'
        }
      });
      
      if (responseDiretor.status === 200) {
        // É um diretor, redireciona para dashboard
        window.location.href = '/dashboard';
        return;
      }
      
      // Segunda requisição: verificar se é estoquista
      const responseEstoquista = await fetch(`http://localhost:8081/estoquistas/${form.cpf}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json'
        }
      });
      
      if (responseEstoquista.status === 200) {
        // É um estoquista, redireciona para dashboard-vendedor
        window.location.href = '/dashboard-vendedor';
        return;
      }
      
      // Terceira requisição: verificar se é vendedor
      const responseVendedor = await fetch(`http://localhost:8081/vendedores/${form.cpf}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json'
        }
      });
      
      if (responseVendedor.status === 200) {
        // É um vendedor, redireciona para dashboard-vendedor
        window.location.href = '/dashboard-vendedor';
        return;
      }
      
      // Se chegou até aqui, nenhum dos perfis foi encontrado
      setError('Login incorreto. CPF não encontrado em nenhum funcionário.');
    } catch (error) {
      console.error('Erro na requisição:', error);
      setError('Erro ao verificar credenciais. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh',
      width: '100vw',
      overflow: 'hidden'
    }}>
      {/* Lado esquerdo - Imagem */}
      <Box 
        sx={{ 
          flex: 1,
          backgroundImage: 'url("/logo_maquiagem_cia.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: { xs: 'none', md: 'block' }
        }} 
      />
      
      {/* Lado direito - Formulário de login */}
      <Box 
        sx={{ 
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fef9f7',
          padding: '2rem'
        }}
      >
        <Paper
          elevation={0}
          sx={{
            padding: '40px',
            borderRadius: '12px',
            backgroundColor: 'transparent',
            width: '100%',
            maxWidth: '400px'
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#E91E63', 
              fontWeight: '600',
              marginBottom: '2rem',
              textAlign: 'center'
            }}
          >
            Sistema Interno da Maquiagem & Cia
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              fullWidth
              label="CPF"
              name="cpf"
              value={form.cpf}
              onChange={handleChange}
              required
              margin="normal"
              placeholder="000.000.000-00"
              inputProps={{
                maxLength: 14, // Comprimento total com formatação: XXX.XXX.XXX-XX
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: '#F06292' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                marginBottom: '1.5rem',
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#F06292',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#F06292',
                },
              }}
            />
            
            <TextField
              fullWidth
              type="password"
              label="Senha"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#F06292' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                marginBottom: '2rem',
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#F06292',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#F06292',
                },
              }}
            />

            <Button
              variant="contained"
              type="submit"
              fullWidth
              disabled={loading}
              sx={{
                backgroundColor: '#F06292',
                '&:hover': {
                  backgroundColor: '#E91E63',
                },
                padding: '12px',
                borderRadius: '30px',
                fontSize: '16px',
                fontWeight: '500',
                textTransform: 'none',
                boxShadow: '0px 4px 10px rgba(240, 98, 146, 0.3)',
              }}
            >
                            {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                  <span>Verificando...</span>
                </Box>
              ) : 'Entrar'}
            </Button>
            
            {error && (
              <Typography 
                color="error" 
                sx={{ 
                  mt: 2, 
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {error}
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Login;
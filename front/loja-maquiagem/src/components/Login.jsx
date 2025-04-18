import React, { useState } from 'react';
import { Box, Button, Container, Grid, TextField, Typography, Paper, IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { Link } from 'react-router-dom';

const Login = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui você pode fazer a requisição para o backend com axios ou fetch
    console.log('Dados enviados:', form);
  };

  return (
    <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Paper
        elevation={4}
        sx={{
          padding: '40px',
          borderRadius: '12px',
          backgroundColor: '#fef9f7',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Link to="/" style={{ position: 'absolute', top: '20px', left: '20px' }}>
          <IconButton>
            <HomeIcon sx={{ fontSize: '30px', color: '#F06292' }} />
          </IconButton>
        </Link>

        <Typography variant="h4" align="center" gutterBottom sx={{ color: '#E91E63', fontWeight: 'bold' }}>
          Login
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="email"
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                sx={{
                  input: { color: '#F06292' },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="Senha"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                sx={{
                  input: { color: '#F06292' },
                }}
              />
            </Grid>
          </Grid>

          <Button
            variant="contained"
            type="submit"
            fullWidth
            sx={{
              marginTop: 3,
              backgroundColor: '#F48FB1',
              '&:hover': {
                backgroundColor: '#F06292',
              },
              padding: '15px',
              borderRadius: '8px',
              fontSize: '18px',
            }}
          >
            Entrar
          </Button>
        </Box>

        <Typography variant="body2" sx={{ marginTop: 2, color: '#BDBDBD' }}>
          Não tem uma conta?{' '}
          <Link to="/pessoas" style={{ textDecoration: 'none' }}>
            <Button
              sx={{
                textTransform: 'none',
                color: '#F06292',
                '&:hover': {
                  color: '#E91E63',
                },
              }}
            >
              Cadastre-se
            </Button>
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
};

export default Login;

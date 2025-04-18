import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Box, Typography, Container, Paper } from '@mui/material';

const Home = () => {
  return (
    <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100vh' }}>
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
          justifyContent: 'center',
        }}
      >
        <Typography variant="h4" align="center" gutterBottom sx={{ color: '#E91E63', fontWeight: 'bold' }}>
          Bem-vindo à Loja *****
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
          <Link to="/lista" style={{ textDecoration: 'none' }}>
          </Link>
          <Link to="/cadastrar" style={{ textDecoration: 'none' }}>
            <Button
              variant="contained"
              sx={{
                width: '100%',
                backgroundColor: '#F48FB1', // Rosa suave
                color: 'white',
                '&:hover': {
                  backgroundColor: '#F06292', // Rosa mais intenso
                },
                padding: '15px',
                borderRadius: '8px',
                fontSize: '18px',
              }}
            >
              Cadastrar
            </Button>
          </Link>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button
              variant="outlined"
              sx={{
                width: '100%',
                borderColor: '#F48FB1', // Rosa suave
                color: '#F48FB1', // Rosa suave
                '&:hover': {
                  borderColor: '#F06292',
                  color: '#F06292',
                },
                padding: '15px',
                borderRadius: '8px',
                fontSize: '18px',
              }}
            >
              Login
            </Button>
          </Link>
        </Box>
      </Paper>
    </Container>
  );
};

export default Home;

import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    IconButton,
    TextField,
    InputAdornment,
    CircularProgress
} from '@mui/material';
import { Add, Search, Edit, Delete } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ListarClientes = () => {
    const [clientes, setClientes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('info');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const response = await axios.get('http://localhost:8081/clientes');

                console.log('Dados recebidos:', response.data);

                const dadosProcessados = response.data.map(cliente => {
                    const pessoa = cliente.pessoa || {};

                    return {
                        nome: cliente.nome || 'Não informado',
                        cpf: cliente.cpf || 'Não informado',
                        email: cliente.email || 'Não informado',
                        telefone: cliente.telefone1 || 'Não informado',
                    };
                });

                setClientes(dadosProcessados);
            } catch (error) {
                console.error('Erro ao buscar clientes:', error);
                setError('Erro ao carregar clientes');
            } finally {
                setLoading(false);
            }
        };

        fetchClientes();
    }, []);

    const handleExcluir = (cpf) => {
        if (window.confirm("Tem certeza que deseja excluir esse cliente?")) {
            axios.delete(`http://localhost:8080/clientes/${cpf}`)
                .then(() => {
                    setClientes(clientes.filter(f => f.cpf !== cpf));
                    setSnackbarMessage("Cliente excluído com sucesso!");
                    setSnackbarSeverity("success");
                    setSnackbarOpen(true);
                })
                .catch((error) => {
                    console.error("Erro ao excluir cliente:", error);
                    setSnackbarMessage("Erro ao excluir cliente.");
                    setSnackbarSeverity("error");
                    setSnackbarOpen(true);
                });
        }
    };

    const filteredClientes = clientes.filter(cliente =>
        cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.cpf.toLowerCase().includes(searchTerm)
    );

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 3, color: '#D81B60' }}>
                Lista de Clientes
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Pesquisar cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: 300 }}
                />

                <Button
                    variant="contained"
                    startIcon={<Add />}
                    component={Link}
                    to="/cadastro-pessoa"
                    sx={{
                        backgroundColor: '#F48FB1',
                        '&:hover': { backgroundColor: '#F06292' },
                    }}
                >
                    Novo Cliente
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
                        <TableRow>
                            <TableCell>Nome</TableCell>
                            <TableCell>CPF</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Telefone</TableCell>
                            <TableCell align="center">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredClientes.map((cliente) => (
                            <TableRow key={cliente.id}>
                                <TableCell>{cliente.nome}</TableCell>
                                <TableCell>{cliente.cpf}</TableCell>
                                <TableCell>{cliente.email}</TableCell>
                                <TableCell>{cliente.telefone}</TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        color="primary"
                                        onClick={() => navigate(`/editar-cliente/${cliente.cpf}`)}
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleExcluir(cliente.cpf)}
                                    >
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default ListarClientes;

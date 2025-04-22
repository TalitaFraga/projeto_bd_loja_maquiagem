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
    Chip,
    CircularProgress
} from '@mui/material';
import { Add, Search, Edit, Delete } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ListarFuncionarios = () => {
    const [funcionarios, setFuncionarios] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('info');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFuncionarios = async () => {
            try {
                const response = await axios.get('http://localhost:8080/funcionarios');

                console.log('Dados recebidos:', response.data);

                const dadosProcessados = response.data.map(func => {
                    return {
                        tipoFuncionario: func.tipoFuncionario || 'NÃO DEFINIDO',
                        nome: func.nome || 'Não informado',
                        cpf: func.cpf || 'Não informado',
                        email: func.email || 'Não informado',
                        telefone: func.telefone1 || 'Não informado',
                        dadosOriginais: func
                    };
                });

                setFuncionarios(dadosProcessados);
            } catch (err) {
                console.error('Erro ao buscar funcionários:', err);
                setError('Erro ao carregar dados');
            } finally {
                setLoading(false);
            }
        };

        fetchFuncionarios();
    }, []);

    const handleExcluir = (cpf) => {
        if (window.confirm("Tem certeza que deseja excluir este funcionário?")) {
            axios.delete(`http://localhost:8080/funcionarios/${cpf}`)
                .then(() => {
                    setFuncionarios(funcionarios.filter(f => f.cpf !== cpf));
                    setSnackbarMessage("Funcionário excluído com sucesso!");
                    setSnackbarSeverity("success");
                    setSnackbarOpen(true);
                })
                .catch((error) => {
                    console.error("Erro ao excluir funcionário:", error);
                    setSnackbarMessage("Erro ao excluir funcionário.");
                    setSnackbarSeverity("error");
                    setSnackbarOpen(true);
                });
        }
    };

    const handleEdit = (cpf) => {
        navigate(`/editar-funcionario/${cpf}`);
    };

    const filteredFuncionarios = funcionarios.filter(funcionario => {
        const search = searchTerm.toLowerCase();
        return (
            funcionario.nome.toLowerCase().includes(search) ||
            funcionario.cpf.toLowerCase().includes(search) ||
            funcionario.tipoFuncionario.toLowerCase().includes(search)
        );
    });

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
                Lista de Funcionários
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Pesquisar funcionário..."
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
                    Novo Funcionário
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={3}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#F5F5F5' }}>
                        <TableRow>
                            <TableCell>Nome</TableCell>
                            <TableCell>CPF</TableCell>
                            <TableCell>Cargo</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Telefone</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredFuncionarios.map((funcionario) => (
                            <TableRow key={funcionario.id}>
                                <TableCell>{funcionario.nome}</TableCell>
                                <TableCell>{funcionario.cpf}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={funcionario.tipoFuncionario}
                                    />
                                </TableCell>
                                <TableCell>{funcionario.email}</TableCell>
                                <TableCell>{funcionario.telefone}</TableCell>
                                <TableCell align="center">
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleEdit(funcionario.cpf)}
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleExcluir(funcionario.cpf)}
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

export default ListarFuncionarios;
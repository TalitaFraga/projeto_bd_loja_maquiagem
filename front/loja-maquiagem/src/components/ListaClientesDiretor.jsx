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
    CircularProgress,
    Container,
    Divider,
    Snackbar,
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import { Add, Search, Edit, Delete } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ListarClientes = () => {
    const [clientes, setClientes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'info'
    });
    const [deleteDialog, setDeleteDialog] = useState({
        open: false,
        clienteToDelete: null
    });
    
    const navigate = useNavigate();

    const fetchClientes = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8081/clientes');
            console.log('Dados recebidos:', response.data);

            const dadosProcessados = response.data.map(cliente => ({
                nome: cliente.nome || 'Não informado',
                cpf: cliente.cpf || 'Não informado',
                email: cliente.email || 'Não informado',
                telefone: cliente.telefone1 || 'Não informado'
            }));

            setClientes(dadosProcessados);
            setError(null);
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
            setError('Erro ao carregar clientes. Por favor, tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    const handleDeleteClick = (cliente) => {
        setDeleteDialog({
            open: true,
            clienteToDelete: cliente
        });
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialog({
            open: false,
            clienteToDelete: null
        });
    };

    const handleConfirmDelete = () => {
        const cpf = deleteDialog.clienteToDelete.cpf;
        
        axios.delete(`http://localhost:8081/clientes/${cpf}`)
            .then(() => {
                setClientes(clientes.filter(c => c.cpf !== cpf));
                setSnackbar({
                    open: true,
                    message: "Cliente excluído com sucesso!",
                    severity: "success"
                });
                handleCloseDeleteDialog();
            })
            .catch((error) => {
                console.error("Erro ao excluir cliente:", error);
                setSnackbar({
                    open: true,
                    message: "Erro ao excluir cliente. Por favor, tente novamente.",
                    severity: "error"
                });
                handleCloseDeleteDialog();
            });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const filteredClientes = clientes.filter(cliente => {
        const searchTermLower = searchTerm.toLowerCase();
        return cliente.nome.toLowerCase().includes(searchTermLower) || 
               cliente.cpf.toLowerCase().includes(searchTermLower);
    });

    const formatarCPF = (cpf) => {
        if (!cpf || cpf === 'Não informado') return cpf;
        // Remove caracteres não numéricos
        const cpfNumeros = cpf.replace(/\D/g, '');
        if (cpfNumeros.length !== 11) return cpf;
        // Formata CPF: 000.000.000-00
        return cpfNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
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
                        <PersonIcon sx={{ fontSize: 36, color: '#F06292', mr: 2 }} />
                        <Typography variant="h4" color="#333" fontWeight="500">
                            Lista de Clientes
                        </Typography>
                    </Box>
                    
                    <Divider sx={{ mb: 4 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                        <TextField
                            variant="outlined"
                            size="small"
                            placeholder="Buscar por nome ou CPF..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search color="action" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 2 }
                            }}
                            sx={{ width: 300 }}
                        />

                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            component={Link}
                            to="/cadastro-cliente-pelo-diretor"
                            sx={{
                                backgroundColor: '#F06292',
                                '&:hover': { backgroundColor: '#E91E63' },
                                borderRadius: 2,
                                px: 3,
                                py: 1,
                                fontWeight: 'bold'
                            }}
                        >
                            Novo Cliente
                        </Button>
                    </Box>

                    {loading ? (
                        <Box display="flex" justifyContent="center" my={4}>
                            <CircularProgress sx={{ color: '#F06292' }} />
                        </Box>
                    ) : error ? (
                        <Box display="flex" flexDirection="column" alignItems="center" my={4}>
                            <Typography color="error" gutterBottom>{error}</Typography>
                            <Button 
                                variant="outlined" 
                                onClick={fetchClientes}
                                sx={{ mt: 2, color: '#F06292', borderColor: '#F06292' }}
                            >
                                Tentar Novamente
                            </Button>
                        </Box>
                    ) : (
                        <>
                            {filteredClientes.length === 0 ? (
                                <Box display="flex" justifyContent="center" my={4}>
                                    <Typography color="textSecondary">
                                        {searchTerm ? "Nenhum cliente encontrado para esta busca." : "Nenhum cliente cadastrado."}
                                    </Typography>
                                </Box>
                            ) : (
                                <TableContainer component={Paper} elevation={0} sx={{ mb: 3, borderRadius: 2 }}>
                                    <Table>
                                        <TableHead sx={{ backgroundColor: '#FCE4EC' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>CPF</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Telefone</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredClientes.map((cliente, index) => (
                                                <TableRow key={index} hover sx={{ '&:nth-of-type(odd)': { backgroundColor: '#FAFAFA' } }}>
                                                    <TableCell>{cliente.nome}</TableCell>
                                                    <TableCell>{formatarCPF(cliente.cpf)}</TableCell>
                                                    <TableCell>{cliente.email}</TableCell>
                                                    <TableCell>{cliente.telefone}</TableCell>
                                                    <TableCell align="center">
                                                        <IconButton
                                                            onClick={() => navigate(`/editar-cliente-pelo-diretor/${cliente.cpf}`)}
                                                            sx={{ color: '#1976D2' }}
                                                        >
                                                            <Edit />
                                                        </IconButton>
                                                        <IconButton
                                                            onClick={() => handleDeleteClick(cliente)}
                                                            sx={{ color: '#F44336' }}
                                                        >
                                                            <Delete />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Typography variant="body2" color="textSecondary">
                                    Total: {filteredClientes.length} cliente(s)
                                </Typography>
                            </Box>
                        </>
                    )}
                </Paper>
            </Container>

            {/* Dialog de confirmação de exclusão */}
            <Dialog
                open={deleteDialog.open}
                onClose={handleCloseDeleteDialog}
            >
                <DialogTitle sx={{ color: '#D32F2F' }}>Confirmar Exclusão</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Tem certeza que deseja excluir o cliente <b>{deleteDialog.clienteToDelete?.nome}</b>?
                        <br />
                        Esta ação não pode ser desfeita.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button 
                        onClick={handleCloseDeleteDialog} 
                        variant="outlined"
                        sx={{ borderColor: '#9E9E9E', color: '#757575' }}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleConfirmDelete} 
                        variant="contained" 
                        color="error"
                    >
                        Excluir
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar de notificações */}
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

export default ListarClientes;
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
import { Add, Search, Edit, Delete, HomeRounded, PersonAddRounded } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ListaClientes = () => {
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
                telefone: cliente.telefone1 || 'Não informado',
                rg: cliente.rg || 'Não informado',
                dataNasc: cliente.dataNasc || 'Não informado',
                telefone2: cliente.telefone2 || '',
                rua: cliente.rua || '',
                numero: cliente.numero || '',
                bairro: cliente.bairro || '',
                cidade: cliente.cidade || '',
                cep: cliente.cep || ''
            }));

            setClientes(dadosProcessados);
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

    const formatarData = (data) => {
        if (!data || data === 'Não informado') return 'Não informado';
        try {
            // Formato esperado: YYYY-MM-DD
            const partes = data.split('-');
            if (partes.length !== 3) return data;
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        } catch (e) {
            return data;
        }
    };

    return (
        <>
            <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
                <Link to="/dashboard">
                    <IconButton>
                        <HomeRounded sx={{ fontSize: 30, color: '#F06292' }} />
                    </IconButton>
                </Link>
            </Box>

            <Container maxWidth="lg" sx={{ py: 4, mt: 2 }}>
                <Paper 
                    elevation={4} 
                    sx={{ 
                        padding: 3, 
                        borderRadius: 3, 
                        backgroundColor: '#FFF',
                        borderTop: '4px solid #F06292',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.08)'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <PersonAddRounded sx={{ fontSize: 32, color: '#F06292', mr: 2 }} />
                        <Typography variant="h4" color="#333" fontWeight="500">
                            Lista de Clientes
                        </Typography>
                    </Box>
                    
                    <Divider sx={{ mb: 3 }} />

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
                            to="/cadastro-cliente"
                            sx={{
                                backgroundColor: '#F06292',
                                '&:hover': { backgroundColor: '#E91E63' },
                                borderRadius: 2,
                                px: 3,
                                py: 1,
                                fontWeight: 'bold',
                                boxShadow: '0 4px 10px rgba(240, 98, 146, 0.3)',
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
                        <Paper 
                            elevation={0} 
                            sx={{ 
                                p: 3, 
                                textAlign: 'center', 
                                bgcolor: '#FFF4F5', 
                                borderRadius: 2,
                                border: '1px solid #FFCDD2'
                            }}
                        >
                            <Typography color="error">{error}</Typography>
                            <Button 
                                variant="outlined" 
                                sx={{ mt: 2, color: '#F06292', borderColor: '#F06292' }}
                                onClick={fetchClientes}
                            >
                                Tentar Novamente
                            </Button>
                        </Paper>
                    ) : (
                        <>
                            {filteredClientes.length === 0 ? (
                                <Paper 
                                    elevation={0} 
                                    sx={{ 
                                        p: 3, 
                                        textAlign: 'center', 
                                        bgcolor: '#F5F5F5', 
                                        borderRadius: 2 
                                    }}
                                >
                                    <Typography variant="h6" color="text.secondary">
                                        Nenhum cliente encontrado
                                    </Typography>
                                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                                        {searchTerm ? "Tente uma busca diferente" : "Cadastre um novo cliente para começar"}
                                    </Typography>
                                </Paper>
                            ) : (
                                <TableContainer sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
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
                                                            color="primary"
                                                            onClick={() => navigate(`/editar-cliente/${cliente.cpf}`)}
                                                            sx={{ 
                                                                color: '#1976D2',
                                                                '&:hover': { backgroundColor: '#E3F2FD' }
                                                            }}
                                                        >
                                                            <Edit />
                                                        </IconButton>
                                                        <IconButton
                                                            onClick={() => handleDeleteClick(cliente)}
                                                            sx={{ 
                                                                color: '#F44336',
                                                                '&:hover': { backgroundColor: '#FFEBEE' }
                                                            }}
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
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'right' }}>
                                Total: {filteredClientes.length} cliente(s)
                            </Typography>
                        </>
                    )}
                </Paper>
            </Container>

            {/* Dialog de confirmação de exclusão */}
            <Dialog
                open={deleteDialog.open}
                onClose={handleCloseDeleteDialog}
            >
                <DialogTitle sx={{ color: '#D32F2F', fontWeight: 'bold' }}>
                    Confirmar Exclusão
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Tem certeza que deseja excluir o cliente{' '}
                        <b>{deleteDialog.clienteToDelete?.nome}</b>?
                        Esta ação não pode ser desfeita.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
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
                        sx={{ bgcolor: '#F44336', '&:hover': { bgcolor: '#D32F2F' } }}
                        autoFocus
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

export default ListaClientes;
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

const ListarFuncionarios = () => {
    const [funcionarios, setFuncionarios] = useState([]);
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
        funcionarioToDelete: null
    });
    
    const navigate = useNavigate();

    const fetchFuncionarios = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8081/funcionarios');
            console.log('Dados recebidos:', response.data);

            const dadosProcessados = response.data.map(func => ({
                tipoFuncionario: func.tipoFuncionario || 'NÃO DEFINIDO',
                nome: func.nome || 'Não informado',
                cpf: func.cpf || 'Não informado',
                email: func.email || 'Não informado',
                telefone: func.telefone1 || 'Não informado'
            }));

            setFuncionarios(dadosProcessados);
            setError(null);
        } catch (err) {
            console.error('Erro ao buscar funcionários:', err);
            setError('Erro ao carregar funcionários. Por favor, tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFuncionarios();
    }, []);

    const handleDeleteClick = (funcionario) => {
        setDeleteDialog({
            open: true,
            funcionarioToDelete: funcionario
        });
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialog({
            open: false,
            funcionarioToDelete: null
        });
    };

    const handleConfirmDelete = async () => {
        const cpf = deleteDialog.funcionarioToDelete.cpf;
        console.log("CPF para exclusão:", cpf);
        
        // ✅ CORREÇÃO: Usar múltiplas tentativas para excluir (igual ao editar)
        const tentativas = [
            cpf, // CPF como está na lista
            cpf.replace(/\D/g, ''), // CPF apenas números
            encodeURIComponent(cpf) // CPF com encoding para URL
        ];
        
        let sucesso = false;
        let ultimoErro = null;
        
        for (const cpfTentativa of tentativas) {
            try {
                console.log("Tentando excluir com CPF:", cpfTentativa);
                await axios.delete(`http://localhost:8081/funcionarios/${cpfTentativa}`);
                console.log("✅ Funcionário excluído com CPF:", cpfTentativa);
                sucesso = true;
                break;
            } catch (error) {
                ultimoErro = error;
                if (error.response?.status === 404) {
                    console.log("❌ Funcionário não encontrado para exclusão com CPF:", cpfTentativa);
                    continue; // Tentar próxima variação
                } else {
                    // Se não for 404, é outro erro - parar as tentativas
                    break;
                }
            }
        }
        
        if (sucesso) {
            setFuncionarios(funcionarios.filter(f => f.cpf !== cpf));
            setSnackbar({
                open: true,
                message: "Funcionário excluído com sucesso!",
                severity: "success"
            });
            handleCloseDeleteDialog();
        } else {
            console.error("Erro ao excluir funcionário:", ultimoErro);
            let errorMessage = "Erro ao excluir funcionário.";
            
            if (ultimoErro?.response) {
                switch (ultimoErro.response.status) {
                    case 404:
                        errorMessage = "Funcionário não encontrado.";
                        break;
                    case 500:
                        errorMessage = "Erro interno do servidor.";
                        break;
                    default:
                        errorMessage = `Erro: ${ultimoErro.response.data || 'Falha na exclusão'}`;
                }
            }
            
            setSnackbar({
                open: true,
                message: errorMessage,
                severity: "error"
            });
            handleCloseDeleteDialog();
        }
    };

    const handleEdit = (cpf) => {
        // ✅ CORREÇÃO: Manter CPF formatado na URL (igual ao cliente)
        navigate(`/editar-funcionario-pelo-diretor/${cpf}`);
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const filteredFuncionarios = funcionarios.filter(funcionario => {
        const searchTermLower = searchTerm.toLowerCase();
        return funcionario.nome.toLowerCase().includes(searchTermLower) || 
               funcionario.cpf.toLowerCase().includes(searchTermLower) ||
               funcionario.tipoFuncionario.toLowerCase().includes(searchTermLower);
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

            <Container maxWidth="lg" sx={{ py: 4 }}>
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
                            Lista de Funcionários
                        </Typography>
                    </Box>
                    
                    <Divider sx={{ mb: 4 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                        <TextField
                            variant="outlined"
                            size="small"
                            placeholder="Buscar por nome, CPF ou cargo..."
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
                            sx={{ width: 350 }}
                        />

                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            component={Link}
                            to="/cadastro-funcionario-pelo-diretor"
                            sx={{
                                backgroundColor: '#F06292',
                                '&:hover': { backgroundColor: '#E91E63' },
                                borderRadius: 2,
                                px: 3,
                                py: 1,
                                fontWeight: 'bold'
                            }}
                        >
                            Novo Funcionário
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
                                onClick={fetchFuncionarios}
                                sx={{ mt: 2, color: '#F06292', borderColor: '#F06292' }}
                            >
                                Tentar Novamente
                            </Button>
                        </Box>
                    ) : (
                        <>
                            {filteredFuncionarios.length === 0 ? (
                                <Box display="flex" justifyContent="center" my={4}>
                                    <Typography color="textSecondary">
                                        {searchTerm ? "Nenhum funcionário encontrado para esta busca." : "Nenhum funcionário cadastrado."}
                                    </Typography>
                                </Box>
                            ) : (
                                <TableContainer component={Paper} elevation={0} sx={{ mb: 3, borderRadius: 2 }}>
                                    <Table>
                                        <TableHead sx={{ backgroundColor: '#FCE4EC' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>CPF</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Cargo</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>Telefone</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ações</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredFuncionarios.map((funcionario, index) => (
                                                <TableRow key={funcionario.cpf || index} hover sx={{ '&:nth-of-type(odd)': { backgroundColor: '#FAFAFA' } }}>
                                                    <TableCell>{funcionario.nome}</TableCell>
                                                    <TableCell>{formatarCPF(funcionario.cpf)}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={funcionario.tipoFuncionario}
                                                            sx={{ 
                                                                bgcolor: '#F06292', 
                                                                color: 'white', 
                                                                fontWeight: 'bold',
                                                                fontSize: '12px'
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{funcionario.email}</TableCell>
                                                    <TableCell>{funcionario.telefone}</TableCell>
                                                    <TableCell align="center">
                                                        <IconButton
                                                            onClick={() => handleEdit(formatarCPF(funcionario.cpf))}
                                                            sx={{ color: '#1976D2' }}
                                                        >
                                                            <Edit />
                                                        </IconButton>
                                                        <IconButton
                                                            onClick={() => handleDeleteClick(funcionario)}
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
                                    Total: {filteredFuncionarios.length} funcionário(s)
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
                        Tem certeza que deseja excluir o funcionário <b>{deleteDialog.funcionarioToDelete?.nome}</b>?
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

export default ListarFuncionarios;
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import axios from "axios";

const ProdutosVencendo = () => {
  const [produtosVencendo, setProdutosVencendo] = useState([]);
  const [mesVencimento, setMesVencimento] = useState(new Date().getMonth()+1);
  const [anoVencimento, setAnoVencimento] = useState(new Date().getFullYear());
  const [loadingVencimento, setLoadingVencimento] = useState(false);
  const [errorVencimento, setErrorVencimento] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const buscarProdutosVencendo = async () => {
    setLoadingVencimento(true);
    setErrorVencimento(null);
    try {
      console.log("Buscando produtos vencendo...");
      const resVencendo = await axios.get(
        `http://localhost:8081/produtos/vencimento?mes=${mesVencimento}&ano=${anoVencimento}`
      );
      console.log("Produtos vencendo:", resVencendo.data);

      const produtosComEstoque = resVencendo.data.filter(
        (produto) => produto.qtde_produto > 0
      );

      setProdutosVencendo(produtosComEstoque);
      setOpenModal(true);
    } catch (error) {
      console.error("Erro ao buscar produtos vencendo:", error);
      setErrorVencimento("Erro ao buscar produtos vencendo.");
      setProdutosVencendo([]);
    } finally {
      setLoadingVencimento(false);
    }
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Paper sx={{ p: 1, mb: 5 }}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={6} sm={3}>
            <TextField
              label="Mês"
              type="number"
              value={mesVencimento}
              onChange={(e) => setMesVencimento(Number(e.target.value))}
              inputProps={{ min: 1, max: 12 }}
              fullWidth
            />
          </Grid>

          <Grid item xs={6} sm={3}>
            <TextField
              label="Ano"
              type="number"
              value={anoVencimento}
              onChange={(e) => setAnoVencimento(Number(e.target.value))}
              inputProps={{ min: 1900, max: 2100 }}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={5}>
            <Button
              variant="contained"
              onClick={buscarProdutosVencendo}
              sx={{ 
                height: "56px", 
                backgroundColor: "#F48FB1",
                color: "#fff",
                '&:hover': {
                  backgroundColor: "#F06292", 
                }
              }}
              fullWidth
              disabled={loadingVencimento}
            >
              {loadingVencimento ? <CircularProgress size={24} /> : "Buscar"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Dialog open={openModal} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          Produtos vencendo em {mesVencimento}/{anoVencimento}
          <IconButton
            aria-label="fechar"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {errorVencimento ? (
            <Typography color="error">{errorVencimento}</Typography>
          ) : produtosVencendo.length === 0 ? (
            <Typography>Nenhum produto encontrado para esta data.</Typography>
          ) : (
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Validade</TableCell>
                  <TableCell>Quantidade em Estoque</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {produtosVencendo.map((produto, index) => (
                  <TableRow key={index}>
                    <TableCell>{produto.nome}</TableCell>
                    <TableCell>
                      {new Date(produto.data_validade + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>{produto.qtde_produto ?? '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} variant="outlined">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProdutosVencendo;

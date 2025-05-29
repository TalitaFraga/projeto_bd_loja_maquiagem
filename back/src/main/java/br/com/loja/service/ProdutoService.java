package br.com.loja.service;

import br.com.loja.entities.Produto;
import br.com.loja.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;

    @Autowired
    public ProdutoService(ProdutoRepository produtoRepository) {
        this.produtoRepository = produtoRepository;
    }

    public Produto salvar(Produto produto) {
        return produtoRepository.save(produto);
    }

    public Optional<Produto> buscarPorCodigoDeBarra(String codigo_barra) {
        return produtoRepository.findByCodigoDeBarra(codigo_barra);
    }

    public Produto buscarPorCodigoDeBarraOuFalhar(String codigo_barra) {
        return produtoRepository.findByCodigoDeBarra(codigo_barra)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado por Código de Barras: " + codigo_barra));
    }

    public List<Produto> listarTodos() {
        return produtoRepository.findAll();
    }

    public List<Produto> buscarPorNome(String nome) {
        return produtoRepository.findByNome(nome);
    }

    public Produto atualizar(Produto produto) {
        buscarPorCodigoDeBarraOuFalhar(produto.getCodigo_barra());
        return produtoRepository.update(produto);
    }

    public void excluir(String codigo_barra) {
        buscarPorCodigoDeBarraOuFalhar(codigo_barra);
        produtoRepository.delete(codigo_barra);
    }

    public List<Map<String, Object>> buscarProdutosPorMesEAno(int mes, int ano) throws SQLException {
        if (mes < 1 || mes > 12) {
            throw new IllegalArgumentException("Mês deve estar entre 1 e 12.");
        }

        if (ano < 1900 || ano > 2100) {
            throw new IllegalArgumentException("Ano inválido.");
        }

        return produtoRepository.buscarProdutosPorMesEAno(mes, ano);
    }

}
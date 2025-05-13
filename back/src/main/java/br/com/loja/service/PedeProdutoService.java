package br.com.loja.service;

import br.com.loja.entities.PedeProduto;
import br.com.loja.repository.PedeProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PedeProdutoService {

    private final PedeProdutoRepository pedeProdutoRepository;

    @Autowired
    public PedeProdutoService(PedeProdutoRepository pedeProdutoRepository) {
        this.pedeProdutoRepository = pedeProdutoRepository;
    }

    public PedeProduto salvar(PedeProduto pedeProduto) {
        return pedeProdutoRepository.save(pedeProduto);
    }

    public Optional<PedeProduto> buscarPorId(String id_pedido) {
        return pedeProdutoRepository.findById(id_pedido);
    }

    public PedeProduto buscarPorIdOuFalhar(String id_pedido) {
        return pedeProdutoRepository.findById(id_pedido)
                .orElseThrow(() -> new RuntimeException("Pedido de produto não encontrado com ID: " + id_pedido));
    }

    public List<PedeProduto> listarTodos() {
        return pedeProdutoRepository.findAll();
    }

    public List<PedeProduto> buscarPorProdutoCodigo(String codigoBarra) {
        return pedeProdutoRepository.findByProdutoCodigo(codigoBarra);
    }

    public List<PedeProduto> buscarPorFornecedorCnpj(String cnpj) {
        return pedeProdutoRepository.findByFornecedorCnpj(cnpj);
    }

    public List<PedeProduto> buscarPorDiretorCpf(String cpf) {
        return pedeProdutoRepository.findByDiretorCpf(cpf);
    }

    public PedeProduto atualizar(PedeProduto pedeProduto) {
        // Verifica se o pedido existe
        buscarPorIdOuFalhar(pedeProduto.getId_pedido());
        return pedeProdutoRepository.update(pedeProduto);
    }

    public void excluir(String id_pedido) {
        buscarPorIdOuFalhar(id_pedido);
        pedeProdutoRepository.delete(id_pedido);
    }
}
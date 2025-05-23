package br.com.loja.service;

import br.com.loja.entities.Estoque;
import br.com.loja.repository.EstoqueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EstoqueService {

    private final EstoqueRepository estoqueRepository;

    @Autowired
    public EstoqueService(EstoqueRepository estoqueRepository) {
        this.estoqueRepository = estoqueRepository;
    }

    public Estoque salvar(Estoque estoque) {
        return estoqueRepository.save(estoque);
    }

    public List<Estoque> listarTodos() {
        return estoqueRepository.findAll();
    }

    public Optional<Estoque> buscarPorId(String codigoBarra, String loteProduto) {
        return estoqueRepository.findById(codigoBarra, loteProduto);
    }

    public Estoque atualizar(Estoque estoque) {
        return estoqueRepository.update(estoque);
    }

    public void deletar(String codigoBarra, String loteProduto) {
        estoqueRepository.delete(codigoBarra, loteProduto);
    }

    public void adicionarAoEstoque(String codigoBarra, String loteProduto, int quantidade) {
        estoqueRepository.restaurarEstoque(codigoBarra, loteProduto, quantidade);
    }

    public void diminuirEstoque(String codigoBarra, String loteProduto, int quantidade) {
        estoqueRepository.diminuirEstoque(codigoBarra, loteProduto, quantidade);
    }
}

package br.com.loja.service;

import br.com.loja.entities.Fornecedor;
import br.com.loja.repository.FornecedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FornecedorService {

    private final FornecedorRepository fornecedorRepository;

    @Autowired
    public FornecedorService(FornecedorRepository fornecedorRepository) {
        this.fornecedorRepository = fornecedorRepository;
    }

    public Fornecedor salvar(Fornecedor fornecedor) {
        return fornecedorRepository.save(fornecedor);
    }

    public Optional<Fornecedor> buscarPorCnpj(String cnpj) {
        return fornecedorRepository.findByCnpj(cnpj);
    }

    public Fornecedor buscarPorCnpjOuFalhar(String cnpj) {
        return fornecedorRepository.findByCnpj(cnpj)
                .orElseThrow(() -> new RuntimeException("Fornecedor não encontrado com CNPJ: " + cnpj));
    }

    public List<Fornecedor> listarTodos() {
        return fornecedorRepository.findAll();
    }

    public List<Fornecedor> buscarPorNome(String nome) {
        return fornecedorRepository.findByNome(nome);
    }

    public Fornecedor atualizar(Fornecedor fornecedor) {
        buscarPorCnpjOuFalhar(fornecedor.getCnpj());
        return fornecedorRepository.update(fornecedor);
    }

    public void excluir(String cnpj) {
        buscarPorCnpjOuFalhar(cnpj);
        fornecedorRepository.delete(cnpj);
    }
}
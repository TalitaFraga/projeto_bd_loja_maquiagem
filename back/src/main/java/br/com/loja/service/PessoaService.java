package br.com.loja.service;

import br.com.loja.entities.Pessoa;
import br.com.loja.repository.PessoaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PessoaService {

    private final PessoaRepository pessoaRepository;

    @Autowired
    public PessoaService(PessoaRepository pessoaRepository) {
        this.pessoaRepository = pessoaRepository;
    }

    public Pessoa salvar(Pessoa pessoa) {
        return pessoaRepository.save(pessoa);
    }

    public Optional<Pessoa> buscarPorCpf(String cpf) {
        return pessoaRepository.findByCpf(cpf);
    }

    public Pessoa buscarPorCpfOuFalhar(String cpf) {
        return pessoaRepository.findByCpf(cpf)
                .orElseThrow(() -> new RuntimeException("Pessoa não encontrada com CPF: " + cpf));
    }

    public List<Pessoa> listarTodos() {
        return pessoaRepository.findAll();
    }

    public List<Pessoa> buscarPorNome(String nome) {
        return pessoaRepository.findByNome(nome);
    }

    public Pessoa atualizar(Pessoa pessoa) {
        buscarPorCpfOuFalhar(pessoa.getCpf());
        return pessoaRepository.update(pessoa);
    }

    public void excluir(String cpf) {
        buscarPorCpfOuFalhar(cpf);
        pessoaRepository.delete(cpf);
    }
}
package br.com.loja.service;

import br.com.loja.entities.Diretor;
import br.com.loja.repository.DiretorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class DiretorService {

    private final DiretorRepository diretorRepository;

    @Autowired
    public DiretorService(DiretorRepository diretorRepository) {
        this.diretorRepository = diretorRepository;
    }

    public Diretor salvar(Diretor diretor) {
        return diretorRepository.save(diretor);
    }

    public Optional<Diretor> buscarPorCpf(String cpf) {
        return diretorRepository.findByCpf(cpf);
    }

    public Diretor buscarPorCpfOuFalhar(String cpf) {
        return diretorRepository.findByCpf(cpf)
                .orElseThrow(() -> new RuntimeException("Diretor não encontrado com CPF: " + cpf));
    }

    public List<Diretor> listarTodos() {
        return diretorRepository.findAll();
    }

    public void excluir(String cpf) {
        buscarPorCpfOuFalhar(cpf);
        diretorRepository.delete(cpf);
    }

    @Transactional
    public Diretor atualizar(Diretor diretor) {
        buscarPorCpfOuFalhar(diretor.getCpf());

        return diretorRepository.update(diretor);
    }
}
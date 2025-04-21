package br.com.loja.service;

import br.com.loja.entities.Estoquista;
import br.com.loja.repository.EstoquistaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class EstoquistaService {

    private final EstoquistaRepository estoquistaRepository;

    @Autowired
    public EstoquistaService(EstoquistaRepository estoquistaRepository) {
        this.estoquistaRepository = estoquistaRepository;
    }

    public Estoquista salvar(Estoquista estoquista) {
        return estoquistaRepository.save(estoquista);
    }

    public Optional<Estoquista> buscarPorCpf(String cpf) {
        return estoquistaRepository.findByCpf(cpf);
    }

    public Estoquista buscarPorCpfOuFalhar(String cpf) {
        return estoquistaRepository.findByCpf(cpf)
                .orElseThrow(() -> new RuntimeException("Estoquista não encontrado com CPF: " + cpf));
    }

    public List<Estoquista> listarTodos() {
        return estoquistaRepository.findAll();
    }

    public void excluir(String cpf) {
        buscarPorCpfOuFalhar(cpf);
        estoquistaRepository.delete(cpf);
    }

    @Transactional
    public Estoquista atualizar(Estoquista estoquista) {
        buscarPorCpfOuFalhar(estoquista.getCpf());

        return estoquistaRepository.update(estoquista);
    }
}
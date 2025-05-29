package br.com.loja.service;

import br.com.loja.entities.Cliente;
import br.com.loja.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    @Autowired
    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @Transactional
    public Cliente salvar(Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    public Optional<Cliente> buscarPorCpf(String cpf) {
        return clienteRepository.findByCpf(cpf);
    }

    public Cliente buscarPorCpfOuFalhar(String cpf) {
        return clienteRepository.findByCpf(cpf)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado com CPF: " + cpf));
    }

    public List<Cliente> listarTodos() {
        return clienteRepository.findAll();
    }

    @Transactional
    public void excluir(String cpf) {
        buscarPorCpfOuFalhar(cpf);
        clienteRepository.delete(cpf);
    }

    @Transactional
    public Cliente atualizar(Cliente cliente) {
        buscarPorCpfOuFalhar(cliente.getCpf());

        return clienteRepository.update(cliente);
    }

    public List<Map<String, Object>> obterClientesQueMaisCompram() {
        return clienteRepository.buscarClientesQueMaisCompram();
    }
}
package br.com.loja.service;

import br.com.loja.entities.Vendedor;
import br.com.loja.repository.VendedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class VendedorService {

    private final VendedorRepository vendedorRepository;

    @Autowired
    public VendedorService(VendedorRepository vendedorRepository) {
        this.vendedorRepository = vendedorRepository;
    }

    public Vendedor salvar(Vendedor vendedor) {
        return vendedorRepository.save(vendedor);
    }

    public Optional<Vendedor> buscarPorCpf(String cpf) {
        return vendedorRepository.findByCpf(cpf);
    }

    public Vendedor buscarPorCpfOuFalhar(String cpf) {
        return vendedorRepository.findByCpf(cpf)
                .orElseThrow(() -> new RuntimeException("Vendedor não encontrado com CPF: " + cpf));
    }

    public List<Vendedor> listarTodos() {
        return vendedorRepository.findAll();
    }

    public void excluir(String cpf) {
        buscarPorCpfOuFalhar(cpf);
        vendedorRepository.delete(cpf);
    }

    @Transactional
    public Vendedor atualizar(Vendedor vendedor) {
        buscarPorCpfOuFalhar(vendedor.getCpf());

        return vendedorRepository.update(vendedor);
    }
}
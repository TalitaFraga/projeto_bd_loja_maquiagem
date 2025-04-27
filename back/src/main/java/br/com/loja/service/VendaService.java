package br.com.loja.service;

import br.com.loja.entities.Venda;
import br.com.loja.repository.VendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VendaService {

    private final VendaRepository vendaRepository;

    @Autowired
    public VendaService(VendaRepository vendaRepository) {
        this.vendaRepository = vendaRepository;
    }

    public Venda salvar(Venda venda) {
        return vendaRepository.save(venda);
    }

    public Optional<Venda> buscarPorId(String idVenda) {
        return vendaRepository.findById(idVenda);
    }

    public List<Venda> listarTodas() {
        return vendaRepository.findAll();
    }

    public Venda atualizar(Venda venda) {
        Optional<Venda> vendaExistente = vendaRepository.findById(venda.getIdVenda());
        if (vendaExistente.isPresent()) {
            return vendaRepository.update(venda);
        }
        throw new RuntimeException("Venda não encontrada para o ID: " + venda.getIdVenda());
    }

    public void excluir(String idVenda) {
        vendaRepository.delete(idVenda);
    }
}

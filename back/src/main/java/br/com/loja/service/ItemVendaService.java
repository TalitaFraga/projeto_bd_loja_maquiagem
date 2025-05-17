package br.com.loja.service;

import br.com.loja.entities.ItemVenda;
import br.com.loja.repository.ItemVendaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItemVendaService {

    private final ItemVendaRepository itemVendaRepository;

    @Autowired
    public ItemVendaService(ItemVendaRepository itemVendaRepository) {
        this.itemVendaRepository = itemVendaRepository;
    }

    public ItemVenda salvarItem(ItemVenda itemVenda) {
        return itemVendaRepository.save(itemVenda);
    }

    public List<ItemVenda> buscarItensPorVenda(String idVenda) {
        return itemVendaRepository.findByVendaId(idVenda);
    }

    public List<ItemVenda> buscarTodos() {
        return itemVendaRepository.buscarTodos();
    }

    public void deletarItensPorVenda(String idVenda) {
        itemVendaRepository.delete(idVenda);
    }

    public void atualizarItem(ItemVenda itemVenda) {
        itemVendaRepository.update(itemVenda);
    }

    public void deletarSilencioso(String idVenda) {
        itemVendaRepository.deleteSilencioso(idVenda);
    }
}

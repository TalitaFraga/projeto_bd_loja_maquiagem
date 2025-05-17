package br.com.loja.controller;

import br.com.loja.entities.ItemVenda;
import br.com.loja.repository.ItemVendaRepository;
import br.com.loja.service.ItemVendaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/itens-venda")
public class ItemVendaController {

    private final ItemVendaService itemVendaService;

    @Autowired
    public ItemVendaController(ItemVendaService itemVendaService) {
        this.itemVendaService = itemVendaService;
    }

    @GetMapping
    public List<ItemVenda> listarTodos() {
        return itemVendaService.buscarTodos();
    }
}

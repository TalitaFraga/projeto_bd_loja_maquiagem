package br.com.loja.controller;

import br.com.loja.entities.Estoque;
import br.com.loja.service.EstoqueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/estoque")
public class EstoqueController {

    private final EstoqueService estoqueService;

    @Autowired
    public EstoqueController(EstoqueService estoqueService) {
        this.estoqueService = estoqueService;
    }

    @PostMapping
    public ResponseEntity<Estoque> criar(@RequestBody Estoque estoque) {
        Estoque salvo = estoqueService.salvar(estoque);
        return ResponseEntity.ok(salvo);
    }

    @GetMapping
    public ResponseEntity<List<Estoque>> listar() {
        List<Estoque> estoques = estoqueService.listarTodos();
        return ResponseEntity.ok(estoques);
    }

    @GetMapping("/{codigoBarra}/{loteProduto}")
    public ResponseEntity<Estoque> buscarPorId(@PathVariable String codigoBarra, @PathVariable String loteProduto) {
        Optional<Estoque> estoque = estoqueService.buscarPorId(codigoBarra, loteProduto);
        return estoque.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{codigoBarra}/{loteProduto}")
    public ResponseEntity<Estoque> atualizar(@PathVariable String codigoBarra,
                                             @PathVariable String loteProduto,
                                             @RequestBody Estoque estoque) {
        if (!codigoBarra.equals(estoque.getCodigoBarra()) || !loteProduto.equals(estoque.getLoteProduto())) {
            return ResponseEntity.badRequest().build();
        }
        Estoque atualizado = estoqueService.atualizar(estoque);
        return ResponseEntity.ok(atualizado);
    }

    @DeleteMapping("/{codigoBarra}/{loteProduto}")
    public ResponseEntity<Void> excluir(@PathVariable String codigoBarra, @PathVariable String loteProduto) {
        estoqueService.deletar(codigoBarra, loteProduto);
        return ResponseEntity.noContent().build();
    }
}

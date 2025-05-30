package br.com.loja.controller;

import br.com.loja.entities.Venda;
import br.com.loja.entities.VendaComItensDTO;
import br.com.loja.service.VendaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/vendas")
public class VendaController {

    private final VendaService vendaService;

    @Autowired
    public VendaController(VendaService vendaService) {
        this.vendaService = vendaService;
    }


    @GetMapping("/{idVenda}")
    public ResponseEntity<Venda> buscarPorId(@PathVariable String idVenda) {
        Optional<Venda> venda = vendaService.buscarPorId(idVenda);
        return venda.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Venda>> listarTodas() {
        List<Venda> vendas = vendaService.listarTodas();
        return ResponseEntity.ok(vendas);
    }

    @PutMapping("/{idVenda}")
    public ResponseEntity<Venda> atualizar(@PathVariable String idVenda, @RequestBody Venda venda) {
        if (!idVenda.equals(venda.getIdVenda())) {
            return ResponseEntity.badRequest().build();
        }
        try {
            Venda vendaAtualizada = vendaService.atualizar(venda);
            return ResponseEntity.ok(vendaAtualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{idVenda}")
    public ResponseEntity<Void> excluir(@PathVariable String idVenda) {
        vendaService.cancelarVenda(idVenda);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<Venda> criar(@RequestBody Venda venda) {
        Venda vendaSalva = vendaService.registrarVendaComItens(venda);
        return ResponseEntity.status(HttpStatus.CREATED).body(vendaSalva);
    }

    @GetMapping("/faturamento")
    public List<Map<String, Object>> faturamentoFiltrado(
            @RequestParam(required = false) Integer ano,
            @RequestParam(required = false) Integer mes
    ) {
        return vendaService.getFaturamentoFiltrado(ano, mes);
    }

    @GetMapping("/vendas-estoque")
    public ResponseEntity<List<Map<String, Object>>> listarQuantidadeVendidaEEstoque() {
        try {
            List<Map<String, Object>> dados = vendaService.obterQuantidadeVendidaEEstoque();
            return ResponseEntity.ok(dados);
        } catch (SQLException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/vendas-por-vendedor-semana")
    public ResponseEntity<List<Map<String, Object>>> vendasPorVendedorSemana() {
        List<Map<String, Object>> resultado = vendaService.obterVendasPorVendedorPorSemana();
        return ResponseEntity.ok(resultado);
    }



}

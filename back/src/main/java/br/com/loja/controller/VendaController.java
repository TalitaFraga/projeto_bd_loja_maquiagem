package br.com.loja.controller;

import br.com.loja.entities.Venda;
import br.com.loja.entities.VendaComItensDTO;
import br.com.loja.service.VendaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/vendas-chart")
    public ResponseEntity<List<Map<String, Object>>> getVendasParaGrafico(
            @RequestParam String periodo,
            @RequestParam String cpfVendedor,
            @RequestParam(required = false) Integer ano) {
        try {
            if (cpfVendedor == null || cpfVendedor.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(null);
            }
            List<Map<String, Object>> dados = vendaRepository.findVendasAgrupadas(periodo, cpfVendedor, ano);
            return ResponseEntity.ok(dados);
        } catch (IllegalArgumentException e) {
            System.err.println("Erro de argumento inválido em VendaController: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            System.err.println("Erro de Runtime em VendaController ao chamar findVendasAgrupadas:");
            if (e.getCause() instanceof SQLException) {
                System.err.println("Causa SQL: " + e.getCause().getMessage());
            } else {
                System.err.println("Causa: " + (e.getCause() != null ? e.getCause().getMessage() : e.getMessage()));
            }
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}

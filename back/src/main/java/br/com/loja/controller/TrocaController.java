package br.com.loja.controller;

import br.com.loja.dto.TrocaComVendaDTO;
import br.com.loja.service.TrocaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/trocas")
@RequiredArgsConstructor
public class TrocaController {

    private final TrocaService trocaService;

    @PostMapping("/processar")
    public ResponseEntity<Troca> processarTroca(@RequestBody TrocaComVendaDTO dto) {
        try {
            Troca novaTroca = trocaService.processarTrocaComEstoque(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(novaTroca);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping("/{idTroca}")
    public ResponseEntity<Troca> buscarPorId(@PathVariable String idTroca) {
        Optional<Troca> troca = trocaService.buscarPorId(idTroca);
        return troca.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Troca>> listarTodas() {
        return ResponseEntity.ok(trocaService.listarTodas());
    }

    @PutMapping("/{idTroca}")
    public ResponseEntity<Troca> atualizar(@PathVariable String idTroca, @RequestBody Troca troca) {
        if (!idTroca.equals(troca.getIdTroca())) {
            return ResponseEntity.badRequest().build();
        }
        try {
            Troca atualizada = trocaService.atualizarTroca(troca);
            return ResponseEntity.ok(atualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{idTroca}")
    public ResponseEntity<Void> deletar(@PathVariable String idTroca) {
        trocaService.deletarTroca(idTroca);
        return ResponseEntity.noContent().build();
    }
}

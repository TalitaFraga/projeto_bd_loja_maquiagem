package br.com.loja.controller;

import br.com.loja.entities.TrocaComVendaDTO;
import br.com.loja.entities.Troca;
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

    // Processa a troca completa (devolve itens antigos, baixa os novos e salva a troca)
    @PostMapping("/processar")
    public ResponseEntity<?> processarTroca(@RequestBody TrocaComVendaDTO dto) {
        try {
            System.out.println("Recebendo requisição de troca...");
            System.out.println("DTO recebido: " + dto);

            Troca novaTroca = trocaService.processarTrocaComEstoque(dto);

            System.out.println("Troca processada com sucesso: " + novaTroca.getIdTroca());
            return ResponseEntity.status(HttpStatus.CREATED).body(novaTroca);

        } catch (IllegalArgumentException e) {
            System.err.println("Erro de validação: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erro de validação: " + e.getMessage());

        } catch (RuntimeException e) {
            System.err.println("Erro de negócio: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Erro ao processar troca: " + e.getMessage());

        } catch (Exception e) {
            System.err.println("Erro interno: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro interno do servidor: " + e.getMessage());
        }
    }

    // Buscar uma troca por ID
    @GetMapping("/{idTroca}")
    public ResponseEntity<?> buscarPorId(@PathVariable String idTroca) {
        try {
            Optional<Troca> troca = trocaService.buscarPorId(idTroca);

            if (troca.isPresent()) {
                return ResponseEntity.ok(troca.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Troca não encontrada: " + idTroca);
            }

        } catch (Exception e) {
            System.err.println("Erro ao buscar troca: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao buscar troca: " + e.getMessage());
        }
    }

    // Listar todas as trocas
    @GetMapping
    public ResponseEntity<?> listarTodas() {
        try {
            List<Troca> trocas = trocaService.listarTodas();
            return ResponseEntity.ok(trocas);

        } catch (Exception e) {
            System.err.println("Erro ao listar trocas: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao listar trocas: " + e.getMessage());
        }
    }

    // Atualizar uma troca (caso precise corrigir dados)
    @PutMapping("/{idTroca}")
    public ResponseEntity<?> atualizar(@PathVariable String idTroca, @RequestBody Troca troca) {
        try {
            if (!idTroca.equals(troca.getIdTroca())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("ID da URL não corresponde ao ID do corpo da requisição");
            }

            Troca atualizada = trocaService.atualizarTroca(troca);
            return ResponseEntity.ok(atualizada);

        } catch (RuntimeException e) {
            System.err.println("Erro ao atualizar troca: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Erro ao atualizar: " + e.getMessage());

        } catch (Exception e) {
            System.err.println("Erro interno ao atualizar: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro interno: " + e.getMessage());
        }
    }

    // Deletar uma troca
    @DeleteMapping("/{idTroca}")
    public ResponseEntity<?> deletar(@PathVariable String idTroca) {
        try {
            trocaService.deletarTroca(idTroca);
            return ResponseEntity.noContent().build();

        } catch (RuntimeException e) {
            System.err.println("Erro ao deletar troca: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Erro ao deletar: " + e.getMessage());

        } catch (Exception e) {
            System.err.println("Erro interno ao deletar: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro interno: " + e.getMessage());
        }
    }
}
package br.com.loja.controller;

import br.com.loja.entities.Fornecedor;
import br.com.loja.service.FornecedorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/fornecedores")
public class FornecedorController {

    private final FornecedorService fornecedorService;

    @Autowired
    public FornecedorController(FornecedorService fornecedorService) {
        this.fornecedorService = fornecedorService;
    }

    @PostMapping
    public ResponseEntity<Fornecedor> criar(@RequestBody Fornecedor fornecedor) {
        Fornecedor fornecedorSalva = fornecedorService.salvar(fornecedor);
        return ResponseEntity.status(HttpStatus.CREATED).body(fornecedorSalva);
    }

    @GetMapping("/{cnpj}")
    public ResponseEntity<Fornecedor> buscarPorCnpj(@PathVariable String cnpj) {
        Fornecedor fornecedor = fornecedorService.buscarPorCnpjOuFalhar(cnpj);
        return ResponseEntity.ok(fornecedor);
    }

    @GetMapping
    public ResponseEntity<List<Fornecedor>> listar() {
        List<Fornecedor> fornecedor = fornecedorService.listarTodos();
        return ResponseEntity.ok(fornecedor);
    }

    @GetMapping("/por-nome")
    public ResponseEntity<List<Fornecedor>> buscarPorNome(@RequestParam String nome) {
        List<Fornecedor> fornecedor = fornecedorService.buscarPorNome(nome);
        return ResponseEntity.ok(fornecedor);
    }

    @PutMapping("/{cnpj}")
    public ResponseEntity<Fornecedor> atualizar(@PathVariable String cnpj, @RequestBody Fornecedor fornecedor) {
        if (!cnpj.equals(fornecedor.getCnpj())) {
            return ResponseEntity.badRequest().build();
        }

        Fornecedor fornecedorAtualizado = fornecedorService.atualizar(fornecedor);
        return ResponseEntity.ok(fornecedorAtualizado);
    }

    @DeleteMapping("/{cnpj}")
    public ResponseEntity<Void> excluir(@PathVariable String cnpj) {
        fornecedorService.excluir(cnpj);
        return ResponseEntity.noContent().build();
    }
}
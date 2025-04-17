package br.com.loja.controller;

import br.com.loja.entities.Pessoa;
import br.com.loja.service.PessoaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pessoas")
public class PessoaController {

    private final PessoaService pessoaService;

    @Autowired
    public PessoaController(PessoaService pessoaService) {
        this.pessoaService = pessoaService;
    }

    @PostMapping
    public ResponseEntity<Pessoa> criar(@RequestBody Pessoa pessoa) {
        Pessoa pessoaSalva = pessoaService.salvar(pessoa);
        return ResponseEntity.status(HttpStatus.CREATED).body(pessoaSalva);
    }

    @GetMapping("/{cpf}")
    public ResponseEntity<Pessoa> buscarPorCpf(@PathVariable String cpf) {
        Pessoa pessoa = pessoaService.buscarPorCpfOuFalhar(cpf);
        return ResponseEntity.ok(pessoa);
    }

    @GetMapping
    public ResponseEntity<List<Pessoa>> listar() {
        List<Pessoa> pessoas = pessoaService.listarTodos();
        return ResponseEntity.ok(pessoas);
    }

    @GetMapping("/por-nome")
    public ResponseEntity<List<Pessoa>> buscarPorNome(@RequestParam String nome) {
        List<Pessoa> pessoas = pessoaService.buscarPorNome(nome);
        return ResponseEntity.ok(pessoas);
    }

    @PutMapping("/{cpf}")
    public ResponseEntity<Pessoa> atualizar(@PathVariable String cpf, @RequestBody Pessoa pessoa) {
        if (!cpf.equals(pessoa.getCpf())) {
            return ResponseEntity.badRequest().build();
        }

        Pessoa pessoaAtualizada = pessoaService.atualizar(pessoa);
        return ResponseEntity.ok(pessoaAtualizada);
    }

    @DeleteMapping("/{cpf}")
    public ResponseEntity<Void> excluir(@PathVariable String cpf) {
        pessoaService.excluir(cpf);
        return ResponseEntity.noContent().build();
    }
}
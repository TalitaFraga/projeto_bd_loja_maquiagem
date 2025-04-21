package br.com.loja.controller;

import br.com.loja.entities.Funcionario;
import br.com.loja.entities.Pessoa;
import br.com.loja.service.FuncionarioService;
import br.com.loja.service.PessoaFactoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/funcionarios")
public class FuncionarioController {

    private final FuncionarioService funcionarioService;
    private final PessoaFactoryService pessoaFactoryService;

    @Autowired
    public FuncionarioController(FuncionarioService funcionarioService,
                                 PessoaFactoryService pessoaFactoryService) {
        this.funcionarioService = funcionarioService;
        this.pessoaFactoryService = pessoaFactoryService;
    }

    @GetMapping("/{cpf}")
    public ResponseEntity<Funcionario> buscarPorCpf(@PathVariable String cpf) {
        Funcionario funcionario = funcionarioService.buscarPorCpfOuFalhar(cpf);
        return ResponseEntity.ok(funcionario);
    }

    @GetMapping
    public ResponseEntity<List<Funcionario>> listar() {
        List<Funcionario> funcionarios = funcionarioService.listarTodos();
        return ResponseEntity.ok(funcionarios);
    }

    @DeleteMapping("/{cpf}")
    public ResponseEntity<Void> excluir(@PathVariable String cpf) {
        funcionarioService.excluir(cpf);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{cpf}")
    public ResponseEntity<Funcionario> atualizar(@PathVariable String cpf, @RequestBody Pessoa novosDados) {
        Funcionario funcionarioAtualizado = funcionarioService.atualizar(cpf, novosDados);
        return ResponseEntity.ok(funcionarioAtualizado);
    }
}

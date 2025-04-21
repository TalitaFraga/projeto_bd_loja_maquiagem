package br.com.loja.controller;

import br.com.loja.entities.Cliente;
import br.com.loja.entities.Pessoa;
import br.com.loja.service.ClienteService;
import br.com.loja.service.PessoaFactoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clientes")
public class ClienteController {

    private final ClienteService clienteService;

    @Autowired
    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping("/{cpf}")
    public ResponseEntity<Cliente> buscarPorCpf(@PathVariable String cpf) {
        Cliente cliente = clienteService.buscarPorCpfOuFalhar(cpf);
        return ResponseEntity.ok(cliente);
    }

    @GetMapping
    public ResponseEntity<List<Cliente>> listarTodos() {
        List<Cliente> clientes = clienteService.listarTodos();
        return ResponseEntity.ok(clientes);
    }

    @PutMapping("/{cpf}")
    public ResponseEntity<Cliente> atualizar(@PathVariable String cpf, @RequestBody Pessoa dadosAtualizados) {
        if (!cpf.equals(dadosAtualizados.getCpf())) {
            return ResponseEntity.badRequest().body(null);
        }

        try {
            Cliente clienteExistente = clienteService.buscarPorCpfOuFalhar(cpf);

            clienteExistente.setNome(dadosAtualizados.getNome());
            clienteExistente.setDataNasc(dadosAtualizados.getDataNasc());

            Cliente clienteAtualizado = clienteService.atualizar(clienteExistente);
            return ResponseEntity.ok(clienteAtualizado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @DeleteMapping("/{cpf}")
    public ResponseEntity<Void> excluir(@PathVariable String cpf) {
        try {
            clienteService.excluir(cpf);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
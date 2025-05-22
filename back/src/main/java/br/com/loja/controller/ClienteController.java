package br.com.loja.controller;

import br.com.loja.entities.Cliente;
import br.com.loja.entities.Pessoa;
import br.com.loja.service.ClienteService;
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
        try {
            Cliente cliente = clienteService.buscarPorCpfOuFalhar(cpf);
            return ResponseEntity.ok(cliente);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Cliente>> listarTodos() {
        List<Cliente> clientes = clienteService.listarTodos();
        return ResponseEntity.ok(clientes);
    }

    @PutMapping("/{cpf}")
    public ResponseEntity<?> atualizar(@PathVariable String cpf, @RequestBody Pessoa dadosAtualizados) {
        try {
            // VALIDAÇÃO: Verificar se o CPF do path corresponde ao do body (se fornecido)
            if (dadosAtualizados.getCpf() != null && !cpf.equals(dadosAtualizados.getCpf().replaceAll("\\D", ""))) {
                // Permitir que o CPF do path seja usado como referência
                dadosAtualizados.setCpf(cpf);
            }

            // Buscar o cliente existente
            Cliente clienteExistente = clienteService.buscarPorCpfOuFalhar(cpf);

            // ATUALIZAR TODOS OS CAMPOS (não apenas nome e data de nascimento)
            clienteExistente.setNome(dadosAtualizados.getNome());
            clienteExistente.setDataNasc(dadosAtualizados.getDataNasc());
            clienteExistente.setRg(dadosAtualizados.getRg());
            clienteExistente.setEmail(dadosAtualizados.getEmail());
            clienteExistente.setTelefone1(dadosAtualizados.getTelefone1());
            clienteExistente.setTelefone2(dadosAtualizados.getTelefone2());
            clienteExistente.setRua(dadosAtualizados.getRua());
            clienteExistente.setNumero(dadosAtualizados.getNumero());
            clienteExistente.setBairro(dadosAtualizados.getBairro());
            clienteExistente.setCidade(dadosAtualizados.getCidade());
            clienteExistente.setCep(dadosAtualizados.getCep());

            Cliente clienteAtualizado = clienteService.atualizar(clienteExistente);
            return ResponseEntity.ok(clienteAtualizado);

        } catch (RuntimeException e) {
            // Tratamento específico de erros
            String errorMessage = e.getMessage().toLowerCase();

            if (errorMessage.contains("não encontrado")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Cliente não encontrado com CPF: " + cpf);
            } else if (errorMessage.contains("rg já cadastrado")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("RG já cadastrado para outro cliente");
            } else if (errorMessage.contains("email já cadastrado")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Email já cadastrado para outro cliente");
            } else if (errorMessage.contains("cpf já cadastrado")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("CPF já cadastrado no sistema");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Erro interno: " + e.getMessage());
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro inesperado ao atualizar cliente: " + e.getMessage());
        }
    }

    @DeleteMapping("/{cpf}")
    public ResponseEntity<?> excluir(@PathVariable String cpf) {
        try {
            clienteService.excluir(cpf);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            if (e.getMessage().toLowerCase().contains("não encontrado")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Cliente não encontrado com CPF: " + cpf);
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Erro ao excluir cliente: " + e.getMessage());
            }
        }
    }
}
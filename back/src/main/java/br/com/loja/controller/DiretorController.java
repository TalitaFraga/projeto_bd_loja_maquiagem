package br.com.loja.controller;

import br.com.loja.entities.Diretor;
import br.com.loja.entities.Pessoa;
import br.com.loja.service.DiretorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/diretores")
public class DiretorController {

    private final DiretorService diretorService;

    @Autowired
    public DiretorController(DiretorService diretorService) {
        this.diretorService = diretorService;
    }

    // Método POST removido, pois agora usamos o CadastroController

    @GetMapping("/{cpf}")
    public ResponseEntity<Diretor> buscarPorCpf(@PathVariable String cpf) {
        Diretor diretor = diretorService.buscarPorCpfOuFalhar(cpf);
        return ResponseEntity.ok(diretor);
    }

    @GetMapping
    public ResponseEntity<List<Diretor>> listar() {
        List<Diretor> diretores = diretorService.listarTodos();
        return ResponseEntity.ok(diretores);
    }

    @PutMapping("/{cpf}")
    public ResponseEntity<Diretor> atualizar(@PathVariable String cpf, @RequestBody Pessoa dadosAtualizados) {
        if (!cpf.equals(dadosAtualizados.getCpf())) {
            return ResponseEntity.badRequest().body(null);
        }

        try {
            Diretor diretorExistente = diretorService.buscarPorCpfOuFalhar(cpf);

            diretorExistente.setNome(dadosAtualizados.getNome());
            diretorExistente.setDataNasc(dadosAtualizados.getDataNasc());
            diretorExistente.setRua(dadosAtualizados.getRua());
            diretorExistente.setCidade(dadosAtualizados.getCidade());
            diretorExistente.setNumero(dadosAtualizados.getNumero());
            diretorExistente.setCep(dadosAtualizados.getCep());
            diretorExistente.setBairro(dadosAtualizados.getBairro());
            diretorExistente.setTelefone1(dadosAtualizados.getTelefone1());
            diretorExistente.setTelefone2(dadosAtualizados.getTelefone2());
            diretorExistente.setEmail(dadosAtualizados.getEmail());
            diretorExistente.setRg(dadosAtualizados.getRg());

            Diretor diretorAtualizado = diretorService.atualizar(diretorExistente);
            return ResponseEntity.ok(diretorAtualizado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @DeleteMapping("/{cpf}")
    public ResponseEntity<Void> excluir(@PathVariable String cpf) {
        try {
            diretorService.excluir(cpf);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
package br.com.loja.controller;

import br.com.loja.entities.Estoquista;
import br.com.loja.entities.Pessoa;
import br.com.loja.service.EstoquistaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/estoquistas")
public class EstoquistaController {

    private final EstoquistaService estoquistaService;

    @Autowired
    public EstoquistaController(EstoquistaService estoquistaService) {
        this.estoquistaService = estoquistaService;
    }

    // Método POST removido, pois agora usamos o CadastroController

    @GetMapping("/{cpf}")
    public ResponseEntity<Estoquista> buscarPorCpf(@PathVariable String cpf) {
        Estoquista estoquista = estoquistaService.buscarPorCpfOuFalhar(cpf);
        return ResponseEntity.ok(estoquista);
    }

    @GetMapping
    public ResponseEntity<List<Estoquista>> listar() {
        List<Estoquista> estoquistas = estoquistaService.listarTodos();
        return ResponseEntity.ok(estoquistas);
    }

    @PutMapping("/{cpf}")
    public ResponseEntity<Estoquista> atualizar(@PathVariable String cpf, @RequestBody Pessoa dadosAtualizados) {
        if (!cpf.equals(dadosAtualizados.getCpf())) {
            return ResponseEntity.badRequest().body(null);
        }

        try {
            Estoquista estoquistaExistente = estoquistaService.buscarPorCpfOuFalhar(cpf);

            estoquistaExistente.setNome(dadosAtualizados.getNome());
            estoquistaExistente.setDataNasc(dadosAtualizados.getDataNasc());
            estoquistaExistente.setRua(dadosAtualizados.getRua());
            estoquistaExistente.setCidade(dadosAtualizados.getCidade());
            estoquistaExistente.setNumero(dadosAtualizados.getNumero());
            estoquistaExistente.setCep(dadosAtualizados.getCep());
            estoquistaExistente.setBairro(dadosAtualizados.getBairro());
            estoquistaExistente.setTelefone1(dadosAtualizados.getTelefone1());
            estoquistaExistente.setTelefone2(dadosAtualizados.getTelefone2());
            estoquistaExistente.setEmail(dadosAtualizados.getEmail());
            estoquistaExistente.setRg(dadosAtualizados.getRg());

            Estoquista estoquistaAtualizado = estoquistaService.atualizar(estoquistaExistente);
            return ResponseEntity.ok(estoquistaAtualizado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @DeleteMapping("/{cpf}")
    public ResponseEntity<Void> excluir(@PathVariable String cpf) {
        try {
            estoquistaService.excluir(cpf);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
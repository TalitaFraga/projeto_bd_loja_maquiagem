package br.com.loja.controller;

import br.com.loja.entities.Vendedor;
import br.com.loja.entities.Pessoa;
import br.com.loja.service.VendedorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/vendedores")
public class VendedorController {

    private final VendedorService vendedorService;

    @Autowired
    public VendedorController(VendedorService vendedorService) {
        this.vendedorService = vendedorService;
    }

    @GetMapping("/{cpf}")
    public ResponseEntity<Vendedor> buscarPorCpf(@PathVariable String cpf) {
        Vendedor vendedor = vendedorService.buscarPorCpfOuFalhar(cpf);
        return ResponseEntity.ok(vendedor);
    }

    @GetMapping
    public ResponseEntity<List<Vendedor>> listar() {
        List<Vendedor> vendedores = vendedorService.listarTodos();
        return ResponseEntity.ok(vendedores);
    }

    @GetMapping("/desempenho")
    public List<Map<String, Object>> getDesempenho(
            @RequestParam Integer mes,
            @RequestParam Integer ano) {
        return vendedorService.vendedorDesempenho(mes, ano);
    }



    @PutMapping("/{cpf}")
    public ResponseEntity<Vendedor> atualizar(@PathVariable String cpf, @RequestBody Pessoa dadosAtualizados) {
        if (!cpf.equals(dadosAtualizados.getCpf())) {
            return ResponseEntity.badRequest().body(null);
        }

        try {
            Vendedor vendedorExistente = vendedorService.buscarPorCpfOuFalhar(cpf);

            vendedorExistente.setNome(dadosAtualizados.getNome());
            vendedorExistente.setDataNasc(dadosAtualizados.getDataNasc());
            vendedorExistente.setRua(dadosAtualizados.getRua());
            vendedorExistente.setCidade(dadosAtualizados.getCidade());
            vendedorExistente.setNumero(dadosAtualizados.getNumero());
            vendedorExistente.setCep(dadosAtualizados.getCep());
            vendedorExistente.setBairro(dadosAtualizados.getBairro());
            vendedorExistente.setTelefone1(dadosAtualizados.getTelefone1());
            vendedorExistente.setTelefone2(dadosAtualizados.getTelefone2());
            vendedorExistente.setEmail(dadosAtualizados.getEmail());
            vendedorExistente.setRg(dadosAtualizados.getRg());

            Vendedor vendedorAtualizado = vendedorService.atualizar(vendedorExistente);
            return ResponseEntity.ok(vendedorAtualizado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    @DeleteMapping("/{cpf}")
    public ResponseEntity<Void> excluir(@PathVariable String cpf) {
        try {
            vendedorService.excluir(cpf);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
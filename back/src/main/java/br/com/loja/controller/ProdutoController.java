package br.com.loja.controller;

import br.com.loja.entities.Produto;
import br.com.loja.service.ProdutoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/produtos")
public class ProdutoController {

    private final ProdutoService produtoService;

    @Autowired
    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @PostMapping
    public ResponseEntity<Produto> criar(@RequestBody Produto produto) {
        Produto produtoSalvo = produtoService.salvar(produto);
        return ResponseEntity.status(HttpStatus.CREATED).body(produtoSalvo);
    }

    @GetMapping("/{codigo_barra}")
    public ResponseEntity<Produto> buscarPorCodigoDeBarra(@PathVariable String codigo_barra) {
        Produto produto = produtoService.buscarPorCodigoDeBarraOuFalhar(codigo_barra);
        return ResponseEntity.ok(produto);
    }

    @GetMapping
    public ResponseEntity<List<Produto>> listar() {
        List<Produto> produtos = produtoService.listarTodos();
        return ResponseEntity.ok(produtos);
    }

    @GetMapping("/por-nome")
    public ResponseEntity<List<Produto>> buscarPorNome(@RequestParam String nome) {
        List<Produto> produtos = produtoService.buscarPorNome(nome);
        return ResponseEntity.ok(produtos);
    }

    @PutMapping("/{codigo_barra}")
    public ResponseEntity<Produto> atualizar(@PathVariable String codigo_barra, @RequestBody Produto produto) {
        if (!codigo_barra.equals(produto.getCodigo_barra())) {
            return ResponseEntity.badRequest().build();
        }

        Produto produtoAtualizado = produtoService.atualizar(produto);
        return ResponseEntity.ok(produtoAtualizado);
    }

    @DeleteMapping("/{codigo_barra}")
    public ResponseEntity<Void> excluir(@PathVariable String codigo_barra) {
        produtoService.excluir(codigo_barra);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/vencimento")
    public ResponseEntity<?> buscarProdutosPorMesEAno(@RequestParam int mes, @RequestParam int ano) {
        try {
            List<Map<String, Object>> produtos = produtoService.buscarProdutosPorMesEAno(mes, ano);
            return ResponseEntity.ok(produtos);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Erro: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao buscar produtos: " + e.getMessage());
        }
    }

}
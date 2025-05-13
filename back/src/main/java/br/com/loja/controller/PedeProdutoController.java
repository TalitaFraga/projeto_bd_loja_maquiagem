package br.com.loja.controller;

import br.com.loja.entities.PedeProduto;
import br.com.loja.service.PedeProdutoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/pede-produtos")
public class PedeProdutoController {

    private final PedeProdutoService pedeProdutoService;

    @Autowired
    public PedeProdutoController(PedeProdutoService pedeProdutoService) {
        this.pedeProdutoService = pedeProdutoService;
    }

    @PostMapping
    public ResponseEntity<PedeProduto> criar(@RequestBody PedeProduto pedeProduto) {
        try {
            PedeProduto pedeProdutoSalvo = pedeProdutoService.salvar(pedeProduto);
            return ResponseEntity.status(HttpStatus.CREATED).body(pedeProdutoSalvo);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao criar pedido de produto: " + e.getMessage(), e);
        }
    }

    @GetMapping
    public ResponseEntity<List<PedeProduto>> listar() {
        List<PedeProduto> pedidos = pedeProdutoService.listarTodos();
        return ResponseEntity.ok(pedidos);
    }

    @GetMapping("/{id_pedido}")
    public ResponseEntity<PedeProduto> buscarPorId(@PathVariable String id_pedido) {
        PedeProduto pedeProduto = pedeProdutoService.buscarPorIdOuFalhar(id_pedido);
        return ResponseEntity.ok(pedeProduto);
    }

    @GetMapping("/por-produto/{codigoBarra}")
    public ResponseEntity<List<PedeProduto>> buscarPorProdutoCodigo(@PathVariable String codigoBarra) {
        List<PedeProduto> pedidos = pedeProdutoService.buscarPorProdutoCodigo(codigoBarra);
        return ResponseEntity.ok(pedidos);
    }

    @GetMapping("/por-fornecedor")
    public ResponseEntity<List<PedeProduto>> buscarPorFornecedorCnpj(@RequestParam String cnpj) {
        List<PedeProduto> pedidos = pedeProdutoService.buscarPorFornecedorCnpj(cnpj);
        return ResponseEntity.ok(pedidos);
    }

    @GetMapping("/por-diretor/{cpf}")
    public ResponseEntity<List<PedeProduto>> buscarPorDiretorCpf(@PathVariable String cpf) {
        List<PedeProduto> pedidos = pedeProdutoService.buscarPorDiretorCpf(cpf);
        return ResponseEntity.ok(pedidos);
    }

    @PutMapping("/{id_pedido}")
    public ResponseEntity<PedeProduto> atualizar(@PathVariable String id_pedido, @RequestBody PedeProduto pedeProduto) {
        try {
            // Garante que o ID na URL seja usado
            if (!id_pedido.equals(pedeProduto.getId_pedido())) {
                pedeProduto.setId_pedido(id_pedido);
            }

            PedeProduto pedeProdutoAtualizado = pedeProdutoService.atualizar(pedeProduto);
            return ResponseEntity.ok(pedeProdutoAtualizado);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao atualizar pedido de produto: " + e.getMessage(), e);
        }
    }

    @DeleteMapping("/{id_pedido}")
    public ResponseEntity<Void> excluir(@PathVariable String id_pedido) {
        pedeProdutoService.excluir(id_pedido);
        return ResponseEntity.noContent().build();
    }
}
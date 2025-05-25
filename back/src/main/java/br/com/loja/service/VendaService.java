package br.com.loja.service;

import br.com.loja.entities.ItemVenda;
import br.com.loja.entities.Produto;
import br.com.loja.entities.Venda;
import br.com.loja.repository.EstoqueRepository;
import br.com.loja.repository.ItemVendaRepository;
import br.com.loja.repository.VendaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VendaService {

    private final VendaRepository vendaRepository;
    private final ItemVendaRepository itemVendaRepository;
    private final EstoqueRepository estoqueRepository;

    public Optional<Venda> buscarPorId(String idVenda) {
        Optional<Venda> vendaOptional = vendaRepository.findById(idVenda);

        if (vendaOptional.isPresent()) {
            Venda venda = vendaOptional.get();

            List<ItemVenda> itens = itemVendaRepository.findByVendaId(venda.getIdVenda());
            venda.setItens(itens);
        }

        return vendaOptional;
    }


    public List<Venda> listarTodas() {
        List<Venda> vendas = vendaRepository.findAll();

        for(Venda venda : vendas){
            List<ItemVenda> itens = itemVendaRepository.findByVendaId(venda.getIdVenda());
            venda.setItens(itens);
        }

        return vendas;
    }

    @Transactional
    public Venda atualizar(Venda venda) {
        vendaRepository.update(venda);

        List<ItemVenda> itensExistentes = itemVendaRepository.findByVendaId(venda.getIdVenda());

        for (ItemVenda itemNovo : venda.getItens()) {
            ItemVenda itemExistente = itensExistentes.stream()
                    .filter(item -> item.getCodigoBarra().equals(itemNovo.getCodigoBarra())
                            && item.getLoteProduto().equals(itemNovo.getLoteProduto()))
                    .findFirst()
                    .orElse(null);

            if (itemExistente != null) {
                int quantidadeAntiga = itemExistente.getQtdeProduto();
                int quantidadeNova = itemNovo.getQtdeProduto();


                if (quantidadeNova > quantidadeAntiga) {
                    estoqueRepository.diminuirEstoque(itemNovo.getCodigoBarra(), itemNovo.getLoteProduto(), quantidadeNova - quantidadeAntiga);
                }
                else if (quantidadeNova < quantidadeAntiga) {
                    estoqueRepository.restaurarEstoque(itemNovo.getCodigoBarra(), itemNovo.getLoteProduto(), quantidadeAntiga - quantidadeNova);
                }

                itemExistente.setQtdeProduto(quantidadeNova);
                itemVendaRepository.update(itemExistente);
            } else {
                estoqueRepository.diminuirEstoque(itemNovo.getCodigoBarra(), itemNovo.getLoteProduto(), itemNovo.getQtdeProduto());
                itemVendaRepository.save(itemNovo);
            }
        }

        return venda;
    }

    public void excluir(String idVenda) {
        vendaRepository.delete(idVenda);
    }

    @Transactional
    public Venda registrarVendaComItens(Venda vendaRecebida) {
        vendaRecebida.setIdVenda(UUID.randomUUID().toString());
        vendaRecebida.setDataHoraVenda(LocalDateTime.now());

        Venda vendaSalva = vendaRepository.save(vendaRecebida);

        if (vendaRecebida.getItens() != null && !vendaRecebida.getItens().isEmpty()) {
            for (ItemVenda item : vendaRecebida.getItens()) {
                item.setIdVenda(vendaSalva.getIdVenda());
                itemVendaRepository.save(item);
                estoqueRepository.diminuirEstoque(item.getCodigoBarra(), item.getLoteProduto(), item.getQtdeProduto());
            }
        } else {
            throw new IllegalArgumentException("A venda não pode ter itens vazios");
        }
        return vendaSalva;
    }

    @Transactional
    public void cancelarVenda(String idVenda) {
        Venda venda = vendaRepository.findById(idVenda)
                .orElseThrow(() -> new RuntimeException("Venda não encontrada"));

        List<ItemVenda> itens = itemVendaRepository.findByVendaId(idVenda);
        venda.setItens(itens);

        for (ItemVenda item : venda.getItens()) {
            estoqueRepository.restaurarEstoque(item.getCodigoBarra(), item.getLoteProduto(), item.getQtdeProduto());
        }

        vendaRepository.delete(idVenda);
    }

    public List<Map<String, Object>> getFaturamentoFiltrado(Integer ano, Integer mes) {
        return vendaRepository.findFaturamentoFiltrado(ano, mes);
    }


}
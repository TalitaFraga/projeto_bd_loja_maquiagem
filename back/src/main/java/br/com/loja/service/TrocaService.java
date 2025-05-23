package br.com.loja.service;

import br.com.loja.dto.TrocaComVendaDTO;
import br.com.loja.entities.ItemVenda;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TrocaService {

    private final TrocaRepository trocaRepository;
    private final ItemVendaService itemVendaService;
    private final EstoqueService estoqueService;

    public Troca processarTrocaComEstoque(TrocaComVendaDTO dto) {
        Troca troca = dto.getTroca();
        troca.setIdTroca(UUID.randomUUID().toString());

        // 1. Devolver ao estoque os itens da venda original
        List<ItemVenda> itensOriginais = itemVendaService.buscarItensPorVenda(troca.getIdVendaOriginal());
        for (ItemVenda item : itensOriginais) {
            estoqueService.buscarPorId(item.getCodigoBarra(), item.getLoteProduto()).ifPresent(estoque -> {
                estoque.setQtdeEstoque(estoque.getQtdeEstoque() + item.getQtdeProduto());
                estoqueService.atualizar(estoque);
            });
        }

        // 2. Retirar do estoque os itens da nova venda
        List<ItemVenda> itensNovos = dto.getItensVendaNova();
        for (ItemVenda item : itensNovos) {
            estoqueService.b

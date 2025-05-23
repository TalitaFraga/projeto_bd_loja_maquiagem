package br.com.loja.service;

import br.com.loja.entities.TrocaComVendaDTO;
import br.com.loja.entities.Estoque;
import br.com.loja.entities.ItemVenda;
import br.com.loja.entities.Troca;
import br.com.loja.entities.Venda;
import br.com.loja.repository.TrocaRepository;
import br.com.loja.repository.VendaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TrocaService {

    private final TrocaRepository trocaRepository;
    private final ItemVendaService itemVendaService;
    private final EstoqueService estoqueService;
    private final VendaService vendaService; // Adicionar para criar a nova venda

    @Transactional
    public Troca processarTrocaComEstoque(TrocaComVendaDTO dto) {
        try {
            System.out.println("🔄 Iniciando processamento da troca...");

            // Validações existentes
            validarDTO(dto);

            Troca troca = dto.getTroca();

            // Gerar IDs se necessário
            if (troca.getIdTroca() == null || troca.getIdTroca().isEmpty()) {
                troca.setIdTroca(UUID.randomUUID().toString());
            }

            if (dto.getVendaNova().getIdVenda() == null || dto.getVendaNova().getIdVenda().isEmpty()) {
                dto.getVendaNova().setIdVenda(UUID.randomUUID().toString());
            }

            if (troca.getDataHora() == null) {
                troca.setDataHora(LocalDateTime.now());
            }

            // 1. Buscar itens originais
            List<ItemVenda> itensOriginais = itemVendaService.buscarItensPorVenda(troca.getIdVendaOriginal());
            if (itensOriginais.isEmpty()) {
                throw new RuntimeException("Nenhum item encontrado para a venda original: " + troca.getIdVendaOriginal());
            }

            System.out.println("📦 Itens da venda original encontrados: " + itensOriginais.size());

            // 2. 🚫 VALIDAÇÃO: NÃO PERMITIR TROCA PELO MESMO PRODUTO
            System.out.println("🔍 Verificando produtos duplicados...");
            for (ItemVenda itemOriginal : itensOriginais) {
                for (ItemVenda itemNovo : dto.getItensVendaNova()) {
                    if (itemOriginal.getCodigoBarra().equals(itemNovo.getCodigoBarra()) &&
                            itemOriginal.getLoteProduto().equals(itemNovo.getLoteProduto())) {

                        System.out.println("🚫 Produto duplicado detectado: " + itemOriginal.getCodigoBarra() + "/" + itemOriginal.getLoteProduto());

                        throw new IllegalArgumentException(
                                "Não é possível trocar pelo mesmo produto. " +
                                        "Produto: " + itemOriginal.getCodigoBarra() + " (Lote: " + itemOriginal.getLoteProduto() + ") " +
                                        "já está na venda original. Por favor, escolha um produto diferente."
                        );
                    }
                }
            }

            System.out.println("✅ Validação de produtos - OK");

            // 3. Restaurar estoque dos itens originais (devolução)
            for (ItemVenda item : itensOriginais) {
                System.out.println("↩️ Devolvendo ao estoque: " + item.getCodigoBarra() + " - Qtd: " + item.getQtdeProduto());
                estoqueService.adicionarAoEstoque(item.getCodigoBarra(), item.getLoteProduto(), item.getQtdeProduto());
            }

            // 4. Criar nova venda (agora sem risco de deadlock)
            System.out.println("🆕 Criando nova venda...");

            Venda vendaNova = dto.getVendaNova();
            vendaNova.setItens(dto.getItensVendaNova());
            vendaNova.setDataHoraVenda(LocalDateTime.now());

            // Como não há produtos iguais, pode usar o método normal
            Venda vendaSalva = vendaService.registrarVendaComItens(vendaNova);

            // 5. Finalizar troca
            troca.setIdVendaNova(vendaSalva.getIdVenda());
            troca.setIdVendaOriginal(dto.getTroca().getIdVendaOriginal());

            System.out.println("💾 Salvando troca:");
            System.out.println("🆔 ID Troca: " + troca.getIdTroca());
            System.out.println("📋 ID Venda Original: " + troca.getIdVendaOriginal());
            System.out.println("🆕 ID Venda Nova: " + troca.getIdVendaNova());

            trocaRepository.save(troca);

            System.out.println("🎉 Troca processada com sucesso!");
            return troca;

        } catch (IllegalArgumentException e) {
            System.err.println("⚠️ Erro de validação: " + e.getMessage());
            throw e; // Propagar erro de validação
        } catch (Exception e) {
            System.err.println("❌ Erro ao processar troca: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro ao processar troca: " + e.getMessage(), e);
        }
    }

    private void validarDTO(TrocaComVendaDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("DTO de troca não pode ser nulo.");
        }

        if (dto.getTroca() == null) {
            throw new IllegalArgumentException("Objeto 'troca' não pode ser nulo.");
        }

        if (dto.getTroca().getIdVendaOriginal() == null || dto.getTroca().getIdVendaOriginal().isEmpty()) {
            throw new IllegalArgumentException("ID da venda original é obrigatório.");
        }

        if (dto.getVendaNova() == null) {
            throw new IllegalArgumentException("Objeto 'vendaNova' não pode ser nulo.");
        }

        if (dto.getItensVendaNova() == null || dto.getItensVendaNova().isEmpty()) {
            throw new IllegalArgumentException("Itens da nova venda não podem ser nulos ou vazios.");
        }

        // Validar se há estoque suficiente para os novos itens
        for (ItemVenda item : dto.getItensVendaNova()) {
            Optional<Estoque> estoqueOpt = estoqueService.buscarPorId(item.getCodigoBarra(), item.getLoteProduto());
            if (estoqueOpt.isEmpty()) {
                throw new RuntimeException("Produto não encontrado no estoque: " + item.getCodigoBarra());
            }

            Estoque estoque = estoqueOpt.get();
            if (estoque.getQtdeProduto() < item.getQtdeProduto()) {
                throw new RuntimeException("Estoque insuficiente para " + item.getCodigoBarra() +
                        ". Disponível: " + estoque.getQtdeProduto() + ", Solicitado: " + item.getQtdeProduto());
            }
        }

        // 🆕 VALIDAÇÃO ADICIONAL: Verificar produtos duplicados (preview)
        System.out.println("🔍 Pré-validação de produtos duplicados...");

        // Buscar itens da venda original para validação prévia
        try {
            List<ItemVenda> itensOriginais = itemVendaService.buscarItensPorVenda(dto.getTroca().getIdVendaOriginal());

            for (ItemVenda itemOriginal : itensOriginais) {
                for (ItemVenda itemNovo : dto.getItensVendaNova()) {
                    if (itemOriginal.getCodigoBarra().equals(itemNovo.getCodigoBarra()) &&
                            itemOriginal.getLoteProduto().equals(itemNovo.getLoteProduto())) {

                        throw new IllegalArgumentException(
                                "Não é possível trocar pelo mesmo produto. " +
                                        "O produto " + itemOriginal.getCodigoBarra() + " (Lote: " + itemOriginal.getLoteProduto() + ") " +
                                        "já está na venda original. Selecione um produto diferente para a troca."
                        );
                    }
                }
            }

            System.out.println("✅ Pré-validação OK - Nenhum produto duplicado");

        } catch (IllegalArgumentException e) {
            throw e; // Re-throw validation errors
        } catch (Exception e) {
            System.err.println("⚠️ Erro na pré-validação (continuando): " + e.getMessage());
            // Continua - a validação principal será feita no método principal
        }
    }

    public Optional<Troca> buscarPorId(String idTroca) {
        return trocaRepository.findById(idTroca);
    }

    public List<Troca> listarTodas() {
        return trocaRepository.findAll();
    }

    public Troca atualizarTroca(Troca troca) {
        // Verificar se existe antes de atualizar
        Optional<Troca> existente = trocaRepository.findById(troca.getIdTroca());
        if (existente.isEmpty()) {
            throw new RuntimeException("Troca não encontrada: " + troca.getIdTroca());
        }

        trocaRepository.update(troca);
        return troca;
    }

    public void deletarTroca(String idTroca) {
        // Verificar se existe antes de deletar
        Optional<Troca> existente = trocaRepository.findById(idTroca);
        if (existente.isEmpty()) {
            throw new RuntimeException("Troca não encontrada: " + idTroca);
        }

        trocaRepository.delete(idTroca);
    }
}
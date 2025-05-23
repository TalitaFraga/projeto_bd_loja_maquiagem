package br.com.loja.dto;

import br.com.loja.entities.ItemVenda;
import br.com.loja.entities.Troca;
import br.com.loja.entities.Venda;
import lombok.Data;

import java.util.List;

@Data
public class TrocaComVendaDTO {
    private Troca troca;
    private Venda vendaNova;
    private List<ItemVenda> itensVendaNova;
}

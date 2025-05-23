package br.com.loja.entities;

import lombok.Data;
import java.util.List;

@Data
public class TrocaComVendaDTO {
    private Troca troca;
    private Venda vendaOriginal;
    private Venda vendaNova;
    private List<ItemVenda> itensVendaNova;
}

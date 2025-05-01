package br.com.loja.entities;

import java.util.List;

public class VendaComItensDTO {
    private Venda venda;
    private List<ItemVenda> itens;

    public Venda getVenda(){return venda;}
    public void setVenda(Venda venda){this.venda = venda;}

    public List<ItemVenda> getItens() { return itens; }
    public void setItens(List<ItemVenda> itens) { this.itens = itens; }
}

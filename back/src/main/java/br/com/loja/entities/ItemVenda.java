package br.com.loja.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ItemVenda {
    private String idVenda;
    private String codigoBarra;
    private String loteProduto;
    private int qtdeProduto;
}

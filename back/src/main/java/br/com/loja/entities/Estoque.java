package br.com.loja.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Estoque {
    private String codigoBarra;
    private String loteProduto;
    private int qtdeProduto;
}
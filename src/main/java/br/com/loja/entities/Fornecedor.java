package br.com.loja.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Fornecedor {
    private String cnpj;
    private String nome;
    private String telefone1;
    private String telefone2;
}

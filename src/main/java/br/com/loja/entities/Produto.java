package br.com.loja.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Produto {
    private String codigo_barra;
    private String lote_produto;
    private String tipo_produto;
    private String nome;
    private String marca;
    private java.math.BigDecimal preco;
    private LocalDate data_validade;
    private String fk_fornecedor_CNPJ;
}


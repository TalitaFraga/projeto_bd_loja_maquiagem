package br.com.loja.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PedeProduto {
    private String id_pedido;
    private String fk_Produto_codigo_barra;
    private String fk_Produto_lote_produto;
    private String fk_Fornecedor_CNPJ;  // Observe que mantemos a propriedade Java com o nome original
    private String fk_Diretor_fk_Funcionario_fk_Pessoa_CPF;  // Observe que mantemos a propriedade Java com o nome original
    private Integer qtde_produto;
}
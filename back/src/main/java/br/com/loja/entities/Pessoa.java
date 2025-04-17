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
public class Pessoa {
    private String cpf;
    private LocalDate dataNasc;
    private String nome;
    private String rua;
    private String cidade;
    private String numero;
    private String cep;
    private String bairro;
    private String telefone1;
    private String telefone2;
    private String email;
    private String rg;
}


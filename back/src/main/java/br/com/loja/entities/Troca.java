package br.com.loja.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Troca {
    private String idTroca = UUID.randomUUID().toString();
    private String idVendaOriginal; // Esta é a venda que o cliente está devolvendo
    private String idVendaNova;     // Esta é a nova venda gerada com os novos itens
    private LocalDateTime dataHora = LocalDateTime.now();
}

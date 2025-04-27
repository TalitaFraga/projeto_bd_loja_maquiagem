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
public class Venda {
    private String idVenda = UUID.randomUUID().toString();
    private String cpfCliente;
    private String cpfVendedor;
    private LocalDateTime dataHoraVenda = LocalDateTime.now();
}

package br.com.loja.controller;

import br.com.loja.entities.Pessoa;
import br.com.loja.service.PessoaFactoryService;
import br.com.loja.service.PessoaFactoryService.TipoFuncionario;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/cadastro-pessoa")
public class CadastroPessoaController {

    private final PessoaFactoryService pessoaFactoryService;

    @Autowired
    public CadastroPessoaController(PessoaFactoryService pessoaFactoryService) {
        this.pessoaFactoryService = pessoaFactoryService;
    }

    public static class CadastroPessoaDTO {
        private Pessoa pessoa;

        // SOLUÇÃO: Usar apenas "isCliente" de forma consistente
        @JsonProperty("isCliente")
        private boolean isCliente;

        private TipoFuncionario tipoFuncionario;

        // Getters e Setters
        public Pessoa getPessoa() {
            return pessoa;
        }

        public void setPessoa(Pessoa pessoa) {
            this.pessoa = pessoa;
        }

        // Getter personalizado para evitar confusão com "cliente"
        @JsonProperty("isCliente")
        public boolean getIsCliente() {
            return isCliente;
        }

        @JsonProperty("isCliente")
        public void setIsCliente(boolean isCliente) {
            this.isCliente = isCliente;
        }

        // Método de conveniência para usar no código Java
        public boolean isCliente() {
            return isCliente;
        }

        public TipoFuncionario getTipoFuncionario() {
            return tipoFuncionario;
        }

        public void setTipoFuncionario(TipoFuncionario tipoFuncionario) {
            this.tipoFuncionario = tipoFuncionario;
        }
    }

    @PostMapping
    public ResponseEntity<?> cadastrarPessoa(@RequestBody CadastroPessoaDTO cadastroDTO) {
        try {
            if (cadastroDTO.isCliente()) {
                return ResponseEntity.status(HttpStatus.CREATED).body(
                        pessoaFactoryService.cadastrarCliente(cadastroDTO.getPessoa())
                );
            } else {
                // Validação para funcionários - tipoFuncionario é obrigatório
                if (cadastroDTO.getTipoFuncionario() == null) {
                    return ResponseEntity.badRequest()
                            .body("Tipo de funcionário é obrigatório quando não é cliente");
                }

                return ResponseEntity.status(HttpStatus.CREATED).body(
                        pessoaFactoryService.cadastrarFuncionario(
                                cadastroDTO.getPessoa(),
                                cadastroDTO.getTipoFuncionario()
                        )
                );
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao cadastrar pessoa: " + e.getMessage());
        }
    }
}
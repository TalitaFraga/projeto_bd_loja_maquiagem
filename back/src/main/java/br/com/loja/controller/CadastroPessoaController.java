package br.com.loja.controller;

import br.com.loja.entities.Pessoa;
import br.com.loja.service.PessoaFactoryService;
import br.com.loja.service.PessoaFactoryService.TipoFuncionario;
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
        private boolean isCliente;
        private TipoFuncionario tipoFuncionario;

        public Pessoa getPessoa() { return pessoa; }
        public void setPessoa(Pessoa pessoa) { this.pessoa = pessoa; }
        public boolean isCliente() { return isCliente; }
        public void setCliente(boolean cliente) { isCliente = cliente; }
        public TipoFuncionario getTipoFuncionario() { return tipoFuncionario; }
        public void setTipoFuncionario(TipoFuncionario tipoFuncionario) {
            this.tipoFuncionario = tipoFuncionario;
        }
    }

    @PostMapping
    public ResponseEntity<?> cadastrarPessoa(@RequestBody CadastroPessoaDTO cadastroDTO) {
        if (cadastroDTO.isCliente()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    pessoaFactoryService.cadastrarCliente(cadastroDTO.getPessoa())
            );
        } else {
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    pessoaFactoryService.cadastrarFuncionario(
                            cadastroDTO.getPessoa(),
                            cadastroDTO.getTipoFuncionario()
                    )
            );
        }
    }
}
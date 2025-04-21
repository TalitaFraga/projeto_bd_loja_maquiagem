package br.com.loja.controller;

import br.com.loja.entities.Pessoa;
import br.com.loja.entities.Cliente;
import br.com.loja.entities.Funcionario;
import br.com.loja.service.PessoaFactoryService;
import br.com.loja.service.PessoaService;
import br.com.loja.service.PessoaFactoryService.TipoFuncionario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/pessoas")
public class PessoaController {

    private final PessoaService pessoaService;
    private final PessoaFactoryService pessoaFactoryService;

    @Autowired
    public PessoaController(PessoaService pessoaService, PessoaFactoryService pessoaFactoryService) {
        this.pessoaService = pessoaService;
        this.pessoaFactoryService = pessoaFactoryService;
    }

    @GetMapping("/{cpf}")
    public ResponseEntity<Pessoa> buscarPorCpf(@PathVariable String cpf) {
        Pessoa pessoa = pessoaService.buscarPorCpfOuFalhar(cpf);
        return ResponseEntity.ok(pessoa);
    }

    @GetMapping
    public ResponseEntity<List<Pessoa>> listar() {
        List<Pessoa> pessoas = pessoaService.listarTodos();
        return ResponseEntity.ok(pessoas);
    }

    @GetMapping("/por-nome")
    public ResponseEntity<List<Pessoa>> buscarPorNome(@RequestParam String nome) {
        List<Pessoa> pessoas = pessoaService.buscarPorNome(nome);
        return ResponseEntity.ok(pessoas);
    }

    @PutMapping("/{cpf}")
    public ResponseEntity<Pessoa> atualizar(@PathVariable String cpf, @RequestBody Pessoa pessoa) {
        if (!cpf.equals(pessoa.getCpf())) {
            return ResponseEntity.badRequest().build();
        }

        Pessoa pessoaAtualizada = pessoaService.atualizar(pessoa);
        return ResponseEntity.ok(pessoaAtualizada);
    }

    @DeleteMapping("/{cpf}")
    public ResponseEntity<Void> excluir(@PathVariable String cpf) {
        pessoaService.excluir(cpf);
        return ResponseEntity.noContent().build();
    }

    public static class PessoaRequest {
        private String tipo;
        private String cargo;
        private String nome;
        private String cpf;
        private LocalDate dataNasc;
        private String rua;
        private String cidade;
        private String numero;
        private String cep;
        private String bairro;
        private String telefone1;
        private String telefone2;
        private String email;
        private String rg;

        public Pessoa toPessoa() {
            Pessoa pessoa = new Pessoa();
            pessoa.setNome(this.nome);
            pessoa.setCpf(this.cpf);
            pessoa.setDataNasc(this.dataNasc);
            pessoa.setRua(this.rua);
            pessoa.setCidade(this.cidade);
            pessoa.setNumero(this.numero);
            pessoa.setCep(this.cep);
            pessoa.setBairro(this.bairro);
            pessoa.setTelefone1(this.telefone1);
            pessoa.setTelefone2(this.telefone2);
            pessoa.setEmail(this.email);
            pessoa.setRg(this.rg);
            return pessoa;
        }

        public String getTipo() {
            return tipo;
        }

        public void setTipo(String tipo) {
            this.tipo = tipo;
        }

        public String getCargo() {
            return cargo;
        }

        public void setCargo(String cargo) {
            this.cargo = cargo;
        }

        public String getNome() {
            return nome;
        }

        public void setNome(String nome) {
            this.nome = nome;
        }

        public String getCpf() {
            return cpf;
        }

        public void setCpf(String cpf) {
            this.cpf = cpf;
        }

        public LocalDate getDataNasc() {
            return dataNasc;
        }

        public void setDataNasc(LocalDate dataNasc) {
            this.dataNasc = dataNasc;
        }

        public String getRua() {
            return rua;
        }

        public void setRua(String rua) {
            this.rua = rua;
        }

        public String getCidade() {
            return cidade;
        }

        public void setCidade(String cidade) {
            this.cidade = cidade;
        }

        public String getNumero() {
            return numero;
        }

        public void setNumero(String numero) {
            this.numero = numero;
        }

        public String getCep() {
            return cep;
        }

        public void setCep(String cep) {
            this.cep = cep;
        }

        public String getBairro() {
            return bairro;
        }

        public void setBairro(String bairro) {
            this.bairro = bairro;
        }

        public String getTelefone1() {
            return telefone1;
        }

        public void setTelefone1(String telefone1) {
            this.telefone1 = telefone1;
        }

        public String getTelefone2() {
            return telefone2;
        }

        public void setTelefone2(String telefone2) {
            this.telefone2 = telefone2;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getRg() {
            return rg;
        }

        public void setRg(String rg) {
            this.rg = rg;
        }
    }
}

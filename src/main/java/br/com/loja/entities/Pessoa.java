package br.com.loja.entities;

import java.time.LocalDate;

public class Pessoa {
    private String cpf;
    private LocalDate dataNasc;
    private String nome;
    private String rua;

    public Pessoa() {
    }

    private String cidade;
    private String numero;
    private String cep;
    private String bairro;
    private String telefone1;
    private String telefone2;
    private String email;
    private String rg;

    public Pessoa(String cpf, LocalDate dataNasc, String nome, String rua, String cidade, String numero, String cep, String bairro, String telefone1, String telefone2, String email, String rg) {
        this.cpf = cpf;
        this.dataNasc = dataNasc;
        this.nome = nome;
        this.rua = rua;
        this.cidade = cidade;
        this.numero = numero;
        this.cep = cep;
        this.bairro = bairro;
        this.telefone1 = telefone1;
        this.telefone2 = telefone2;
        this.email = email;
        this.rg = rg;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
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

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
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


package br.com.loja.entities;

import br.com.loja.service.PessoaFactoryService;

public class PessoaFuncionarioDTO {

    private Pessoa pessoa;
    private PessoaFactoryService.TipoFuncionario tipoFuncionario;

    public Pessoa getPessoa() {
        return pessoa;
    }

    public void setPessoa(Pessoa pessoa) {
        this.pessoa = pessoa;
    }

    public PessoaFactoryService.TipoFuncionario getTipoFuncionario() {
        return tipoFuncionario;
    }

    public void setTipoFuncionario(PessoaFactoryService.TipoFuncionario tipoFuncionario) {
        this.tipoFuncionario = tipoFuncionario;
    }
}

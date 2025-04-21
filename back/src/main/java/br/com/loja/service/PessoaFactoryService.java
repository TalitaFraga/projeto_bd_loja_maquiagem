package br.com.loja.service;

import br.com.loja.entities.Cliente;
import br.com.loja.entities.Funcionario;
import br.com.loja.entities.Diretor;
import br.com.loja.entities.Estoquista;
import br.com.loja.entities.Vendedor;
import br.com.loja.entities.Pessoa;
import br.com.loja.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PessoaFactoryService {

    private final ClienteRepository clienteRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final VendedorRepository vendedorRepository;
    private final DiretorRepository diretorRepository;
    private final EstoquistaRepository estoquistaRepository;

    public enum TipoFuncionario {
        VENDEDOR,
        DIRETOR,
        ESTOQUISTA
    }

    @Autowired
    public PessoaFactoryService(ClienteRepository clienteRepository,
                                FuncionarioRepository funcionarioRepository,
                                VendedorRepository vendedorRepository,
                                DiretorRepository diretorRepository,
                                EstoquistaRepository estoquistaRepository) {
        this.clienteRepository = clienteRepository;
        this.funcionarioRepository = funcionarioRepository;
        this.vendedorRepository = vendedorRepository;
        this.diretorRepository = diretorRepository;
        this.estoquistaRepository = estoquistaRepository;
    }

    // Método para cadastrar Cliente
    public Cliente cadastrarCliente(Pessoa dadosPessoa) {
        Cliente cliente = new Cliente();
        copiarDadosPessoa(dadosPessoa, cliente);

        return clienteRepository.save(cliente);
    }

    // Método para cadastrar Funcionário
    public Funcionario cadastrarFuncionario(Pessoa dadosPessoa, TipoFuncionario tipoFuncionario) {
        switch (tipoFuncionario) {
            case VENDEDOR:
                Vendedor vendedor = new Vendedor();
                copiarDadosPessoa(dadosPessoa, vendedor);
                return vendedorRepository.save(vendedor);

            case DIRETOR:
                Diretor diretor = new Diretor();
                copiarDadosPessoa(dadosPessoa, diretor);
                return diretorRepository.save(diretor);

            case ESTOQUISTA:
                Estoquista estoquista = new Estoquista();
                copiarDadosPessoa(dadosPessoa, estoquista);
                return estoquistaRepository.save(estoquista);

            default:
                throw new IllegalArgumentException("Tipo de funcionário inválido");
        }
    }

    // Método comum para copiar os dados de pessoa para qualquer entidade
    private void copiarDadosPessoa(Pessoa origem, Pessoa destino) {
        destino.setCpf(origem.getCpf());
        destino.setDataNasc(origem.getDataNasc());
        destino.setNome(origem.getNome());
        destino.setRua(origem.getRua());
        destino.setCidade(origem.getCidade());
        destino.setNumero(origem.getNumero());
        destino.setCep(origem.getCep());
        destino.setBairro(origem.getBairro());
        destino.setTelefone1(origem.getTelefone1());
        destino.setTelefone2(origem.getTelefone2());
        destino.setEmail(origem.getEmail());
        destino.setRg(origem.getRg());
    }
}
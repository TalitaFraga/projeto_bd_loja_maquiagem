package br.com.loja.service;

import br.com.loja.entities.Funcionario;
import br.com.loja.repository.FuncionarioRepository;
import br.com.loja.entities.Pessoa;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FuncionarioService {

    private final FuncionarioRepository funcionarioRepository;

    @Autowired
    public FuncionarioService(FuncionarioRepository funcionarioRepository) {
        this.funcionarioRepository = funcionarioRepository;
    }

    public Funcionario salvar(Funcionario funcionario) {
        return funcionarioRepository.save(funcionario);
    }

    public Optional<Funcionario> buscarPorCpf(String cpf) {
        return funcionarioRepository.findByCpf(cpf);
    }

    public Funcionario buscarPorCpfOuFalhar(String cpf) {
        return funcionarioRepository.findByCpf(cpf)
                .orElseThrow(() -> new RuntimeException("Funcionário não encontrado com CPF: " + cpf));
    }

    public List<Funcionario> listarTodos() {
        return funcionarioRepository.findAll();
    }

    public void excluir(String cpf) {
        Funcionario funcionario = buscarPorCpfOuFalhar(cpf);
        funcionarioRepository.delete(cpf);  // Passar apenas o CPF, não o objeto inteiro
    }

    public Funcionario atualizar(String cpf, Pessoa novosDados) {
        Funcionario funcionario = buscarPorCpfOuFalhar(cpf);

        funcionario.setNome(novosDados.getNome());
        funcionario.setDataNasc(novosDados.getDataNasc());
        funcionario.setRua(novosDados.getRua());
        funcionario.setCidade(novosDados.getCidade());
        funcionario.setNumero(novosDados.getNumero());
        funcionario.setCep(novosDados.getCep());
        funcionario.setBairro(novosDados.getBairro());
        funcionario.setTelefone1(novosDados.getTelefone1());
        funcionario.setTelefone2(novosDados.getTelefone2());
        funcionario.setEmail(novosDados.getEmail());
        funcionario.setRg(novosDados.getRg());

        return funcionarioRepository.update(funcionario);
    }
}

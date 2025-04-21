package br.com.loja.repository;

import br.com.loja.entities.Funcionario;
import br.com.loja.entities.Pessoa;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class FuncionarioRepository {

    private final DataSource dataSource;
    private final PessoaRepository pessoaRepository;
    private final VendedorRepository vendedorRepository;
    private final EstoquistaRepository estoquistaRepository;
    private final DiretorRepository diretorRepository;

    @Autowired
    @Lazy
    public FuncionarioRepository(
            DataSource dataSource,
            PessoaRepository pessoaRepository,
            VendedorRepository vendedorRepository,
            EstoquistaRepository estoquistaRepository,
            DiretorRepository diretorRepository) {
        this.dataSource = dataSource;
        this.pessoaRepository = pessoaRepository;
        this.vendedorRepository = vendedorRepository;
        this.estoquistaRepository = estoquistaRepository;
        this.diretorRepository = diretorRepository;
    }

    public Funcionario save(Funcionario funcionario) {
        pessoaRepository.save(funcionario);

        String sql = "INSERT INTO Funcionario (fk_Pessoa_CPF) VALUES (?)";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, funcionario.getCpf());
            stmt.executeUpdate();
            return funcionario;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao salvar funcionario", e);
        }
    }

    public Optional<Funcionario> findByCpf(String cpf) {
        Optional<Pessoa> pessoaOpt = pessoaRepository.findByCpf(cpf);
        if (pessoaOpt.isEmpty()) {
            return Optional.empty();
        }

        String sql = "SELECT * FROM Funcionario WHERE fk_Pessoa_CPF = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, cpf);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Pessoa pessoa = pessoaOpt.get();
                    Funcionario funcionario = new Funcionario();
                    // Copiar todos os atributos de Pessoa para Funcionario
                    funcionario.setCpf(pessoa.getCpf());
                    funcionario.setDataNasc(pessoa.getDataNasc());
                    funcionario.setNome(pessoa.getNome());
                    funcionario.setRua(pessoa.getRua());
                    funcionario.setCidade(pessoa.getCidade());
                    funcionario.setNumero(pessoa.getNumero());
                    funcionario.setCep(pessoa.getCep());
                    funcionario.setBairro(pessoa.getBairro());
                    funcionario.setTelefone1(pessoa.getTelefone1());
                    funcionario.setTelefone2(pessoa.getTelefone2());
                    funcionario.setEmail(pessoa.getEmail());
                    funcionario.setRg(pessoa.getRg());

                    return Optional.of(funcionario);
                }
            }
            return Optional.empty();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar funcionario por CPF", e);
        }
    }

    public Funcionario update(Funcionario funcionario) {
        pessoaRepository.update(funcionario);
        return funcionario;
    }

    public void delete(String cpf) {
        vendedorRepository.deleteSilencioso(cpf);
        estoquistaRepository.deleteSilencioso(cpf);
        diretorRepository.deleteSilencioso(cpf);

        String sql = "DELETE FROM Funcionario WHERE fk_Pessoa_CPF = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, cpf);
            stmt.executeUpdate();

            // Apaga pessoa
            pessoaRepository.delete(cpf);
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar funcionario", e);
        }
    }

    public List<Funcionario> findAll() {
        String sql = "SELECT * FROM Funcionario";
        List<Funcionario> funcionarios = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                String cpf = rs.getString("fk_Pessoa_CPF");
                pessoaRepository.findByCpf(cpf).ifPresent(pessoa -> {
                    Funcionario funcionario = new Funcionario();
                    funcionario.setCpf(pessoa.getCpf());
                    funcionario.setDataNasc(pessoa.getDataNasc());
                    funcionario.setNome(pessoa.getNome());
                    funcionario.setRua(pessoa.getRua());
                    funcionario.setCidade(pessoa.getCidade());
                    funcionario.setNumero(pessoa.getNumero());
                    funcionario.setCep(pessoa.getCep());
                    funcionario.setBairro(pessoa.getBairro());
                    funcionario.setTelefone1(pessoa.getTelefone1());
                    funcionario.setTelefone2(pessoa.getTelefone2());
                    funcionario.setEmail(pessoa.getEmail());
                    funcionario.setRg(pessoa.getRg());

                    funcionarios.add(funcionario);
                });
            }
            return funcionarios;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar todos os funcionarios", e);
        }
    }

    public List<Funcionario> findByNome(String nome) {
        List<Funcionario> funcionarios = new ArrayList<>();
        List<Pessoa> pessoas = pessoaRepository.findByNome(nome);

        for (Pessoa pessoa : pessoas) {
            Optional<Funcionario> funcionarioOpt = findByCpf(pessoa.getCpf());
            funcionarioOpt.ifPresent(funcionarios::add);
        }

        return funcionarios;
    }

    public void deleteSilencioso(String cpf) {
        String sql = "DELETE FROM Funcionario WHERE fk_Pessoa_CPF = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, cpf);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar funcionario", e);
        }
    }

}
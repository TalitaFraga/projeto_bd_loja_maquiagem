package br.com.loja.repository;

import br.com.loja.entities.Diretor;
import br.com.loja.entities.Funcionario;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class DiretorRepository {

    private final DataSource dataSource;
    private final FuncionarioRepository funcionarioRepository;
    private final PessoaRepository pessoaRepository;

    @Autowired
    @Lazy
    public DiretorRepository(DataSource dataSource, FuncionarioRepository funcionarioRepository, PessoaRepository pessoaRepository) {
        this.dataSource = dataSource;
        this.funcionarioRepository = funcionarioRepository;
        this.pessoaRepository = pessoaRepository;
    }

    public Diretor save(Diretor diretor) {
        Optional<Funcionario> funcionarioOpt = funcionarioRepository.findByCpf(diretor.getCpf());
        if (funcionarioOpt.isEmpty()) {
            funcionarioRepository.save(diretor);
        }

        String sql = "INSERT INTO Diretor (fk_Funcionario_fk_Pessoa_CPF) VALUES (?)";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, diretor.getCpf());
            stmt.executeUpdate();
            return diretor;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao salvar diretor", e);
        }
    }

    public Optional<Diretor> findByCpf(String cpf) {
        Optional<Funcionario> funcionarioOpt = funcionarioRepository.findByCpf(cpf);
        if (funcionarioOpt.isEmpty()) {
            return Optional.empty();
        }

        String sql = "SELECT * FROM Diretor WHERE fk_Funcionario_fk_Pessoa_CPF = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, cpf);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    // Converte Funcionario para Diretor
                    Funcionario funcionario = funcionarioOpt.get();
                    Diretor diretor = new Diretor();

                    // Copia todos os atributos de Funcionario para Diretor
                    diretor.setCpf(funcionario.getCpf());
                    diretor.setDataNasc(funcionario.getDataNasc());
                    diretor.setNome(funcionario.getNome());
                    diretor.setRua(funcionario.getRua());
                    diretor.setCidade(funcionario.getCidade());
                    diretor.setNumero(funcionario.getNumero());
                    diretor.setCep(funcionario.getCep());
                    diretor.setBairro(funcionario.getBairro());
                    diretor.setTelefone1(funcionario.getTelefone1());
                    diretor.setTelefone2(funcionario.getTelefone2());
                    diretor.setEmail(funcionario.getEmail());
                    diretor.setRg(funcionario.getRg());

                    return Optional.of(diretor);
                }
            }
            return Optional.empty();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar diretor por CPF", e);
        }
    }

    public List<Diretor> findAll() {
        String sql = "SELECT d.fk_Funcionario_fk_Pessoa_CPF FROM Diretor d";
        List<Diretor> diretores = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                String cpf = rs.getString("fk_Funcionario_fk_Pessoa_CPF");
                findByCpf(cpf).ifPresent(diretores::add);
            }
            return diretores;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar todos os diretores", e);
        }
    }

    public void delete(String cpf) {
        String sqlEspecializado = "DELETE FROM Diretor WHERE fk_Funcionario_fk_Pessoa_CPF = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sqlEspecializado)) {
            stmt.setString(1, cpf);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar diretor", e);
        }

        String sqlFuncionario = "DELETE FROM Funcionario WHERE fk_Pessoa_CPF = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sqlFuncionario)) {
            stmt.setString(1, cpf);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar funcionario", e);
        }

        pessoaRepository.deleteSilencioso(cpf);
    }

    public void deleteSilencioso(String cpf) {
        String sql = "DELETE FROM Diretor WHERE fk_Funcionario_fk_Pessoa_CPF = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, cpf);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar diretor (silencioso)", e);
        }
    }

    public Diretor update(Diretor diretor) {
        funcionarioRepository.update(diretor);
        return diretor;
    }
}
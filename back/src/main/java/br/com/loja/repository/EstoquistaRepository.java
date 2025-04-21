package br.com.loja.repository;

import br.com.loja.entities.Estoquista;
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
public class EstoquistaRepository {

    private final DataSource dataSource;
    private final FuncionarioRepository funcionarioRepository;
    private final PessoaRepository pessoaRepository;

    @Autowired
    @Lazy
    public EstoquistaRepository(DataSource dataSource, FuncionarioRepository funcionarioRepository, PessoaRepository pessoaRepository) {
        this.dataSource = dataSource;
        this.funcionarioRepository = funcionarioRepository;
        this.pessoaRepository = pessoaRepository;
    }

    public Estoquista save(Estoquista estoquista) {
        Optional<Funcionario> funcionarioOpt = funcionarioRepository.findByCpf(estoquista.getCpf());
        if (funcionarioOpt.isEmpty()) {
            funcionarioRepository.save(estoquista);
        }

        String sql = "INSERT INTO Estoquista (fk_Funcionario_fk_Pessoa_CPF) VALUES (?)";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, estoquista.getCpf());
            stmt.executeUpdate();
            return estoquista;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao salvar estoquista", e);
        }
    }

    public Optional<Estoquista> findByCpf(String cpf) {
        Optional<Funcionario> funcionarioOpt = funcionarioRepository.findByCpf(cpf);
        if (funcionarioOpt.isEmpty()) {
            return Optional.empty();
        }

        String sql = "SELECT * FROM Estoquista WHERE fk_Funcionario_fk_Pessoa_CPF = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, cpf);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Funcionario funcionario = funcionarioOpt.get();
                    Estoquista estoquista = new Estoquista();

                    estoquista.setCpf(funcionario.getCpf());
                    estoquista.setDataNasc(funcionario.getDataNasc());
                    estoquista.setNome(funcionario.getNome());
                    estoquista.setRua(funcionario.getRua());
                    estoquista.setCidade(funcionario.getCidade());
                    estoquista.setNumero(funcionario.getNumero());
                    estoquista.setCep(funcionario.getCep());
                    estoquista.setBairro(funcionario.getBairro());
                    estoquista.setTelefone1(funcionario.getTelefone1());
                    estoquista.setTelefone2(funcionario.getTelefone2());
                    estoquista.setEmail(funcionario.getEmail());
                    estoquista.setRg(funcionario.getRg());

                    return Optional.of(estoquista);
                }
            }
            return Optional.empty();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar estoquista por CPF", e);
        }
    }

    public List<Estoquista> findAll() {
        String sql = "SELECT e.fk_Funcionario_fk_Pessoa_CPF FROM Estoquista e";
        List<Estoquista> estoquistas = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                String cpf = rs.getString("fk_Funcionario_fk_Pessoa_CPF");
                findByCpf(cpf).ifPresent(estoquistas::add);
            }
            return estoquistas;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar todos os estoquistas", e);
        }
    }

    public void delete(String cpf) {
        String sqlEspecializado = "DELETE FROM Estoquista WHERE fk_Funcionario_fk_Pessoa_CPF = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sqlEspecializado)) {
            stmt.setString(1, cpf);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar estoquista", e);
        }

        String sqlFuncionario = "DELETE FROM Funcionario WHERE fk_Pessoa_CPF = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sqlFuncionario)) {
            stmt.setString(1, cpf);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar funcionario", e);
        }

        // Deleta a Pessoa
        pessoaRepository.deleteSilencioso(cpf);
    }

    public void deleteSilencioso(String cpf) {
        String sql = "DELETE FROM Estoquista WHERE fk_Funcionario_fk_Pessoa_CPF = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, cpf);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar estoquista (silencioso)", e);
        }
    }

    public Estoquista update(Estoquista estoquista) {
        funcionarioRepository.update(estoquista);
        return estoquista;
    }
}
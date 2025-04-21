package br.com.loja.repository;

import br.com.loja.entities.Vendedor;
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
public class VendedorRepository {

    private final DataSource dataSource;
    private final FuncionarioRepository funcionarioRepository;
    private final PessoaRepository pessoaRepository;

    @Autowired
    @Lazy
    public VendedorRepository(DataSource dataSource, FuncionarioRepository funcionarioRepository, PessoaRepository pessoaRepository) {
        this.dataSource = dataSource;
        this.funcionarioRepository = funcionarioRepository;
        this.pessoaRepository = pessoaRepository;
    }

    public Vendedor save(Vendedor vendedor) {
        Optional<Funcionario> funcionarioOpt = funcionarioRepository.findByCpf(vendedor.getCpf());
        if (funcionarioOpt.isEmpty()) {
            funcionarioRepository.save(vendedor);
        }

        String sql = "INSERT INTO Vendedor (fk_Funcionario_fk_Pessoa_CPF) VALUES (?)";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, vendedor.getCpf());
            stmt.executeUpdate();
            return vendedor;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao salvar vendedor", e);
        }
    }

    public Optional<Vendedor> findByCpf(String cpf) {
        Optional<Funcionario> funcionarioOpt = funcionarioRepository.findByCpf(cpf);
        if (funcionarioOpt.isEmpty()) {
            return Optional.empty();
        }

        String sql = "SELECT * FROM Vendedor WHERE fk_Funcionario_fk_Pessoa_CPF = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, cpf);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Funcionario funcionario = funcionarioOpt.get();
                    Vendedor vendedor = new Vendedor();

                    vendedor.setCpf(funcionario.getCpf());
                    vendedor.setDataNasc(funcionario.getDataNasc());
                    vendedor.setNome(funcionario.getNome());
                    vendedor.setRua(funcionario.getRua());
                    vendedor.setCidade(funcionario.getCidade());
                    vendedor.setNumero(funcionario.getNumero());
                    vendedor.setCep(funcionario.getCep());
                    vendedor.setBairro(funcionario.getBairro());
                    vendedor.setTelefone1(funcionario.getTelefone1());
                    vendedor.setTelefone2(funcionario.getTelefone2());
                    vendedor.setEmail(funcionario.getEmail());
                    vendedor.setRg(funcionario.getRg());

                    return Optional.of(vendedor);
                }
            }
            return Optional.empty();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar vendedor por CPF", e);
        }
    }

    public List<Vendedor> findAll() {
        String sql = "SELECT v.fk_Funcionario_fk_Pessoa_CPF FROM Vendedor v";
        List<Vendedor> vendedores = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                String cpf = rs.getString("fk_Funcionario_fk_Pessoa_CPF");
                findByCpf(cpf).ifPresent(vendedores::add);
            }
            return vendedores;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar todos os vendedores", e);
        }
    }

    public void delete(String cpf) {
        String sqlEspecializado = "DELETE FROM Vendedor WHERE fk_Funcionario_fk_Pessoa_CPF = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sqlEspecializado)) {
            stmt.setString(1, cpf);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar vendedor", e);
        }

        String sqlFuncionario = "DELETE FROM Funcionario WHERE fk_Pessoa_CPF = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sqlFuncionario)) {
            stmt.setString(1, cpf);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar funcionario", e);
        }
        pessoaRepository.delete(cpf);
    }

    public Vendedor update(Vendedor vendedor) {
        funcionarioRepository.update(vendedor);
        return vendedor;
    }

    public void deleteSilencioso(String cpf) {
        String sql = "DELETE FROM Vendedor WHERE fk_Funcionario_fk_Pessoa_CPF = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, cpf);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar vendedor (silencioso)", e);
        }
    }

}
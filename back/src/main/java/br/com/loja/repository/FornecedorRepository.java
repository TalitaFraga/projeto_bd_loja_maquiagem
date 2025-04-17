package br.com.loja.repository;

import br.com.loja.entities.Fornecedor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class FornecedorRepository {

    private final DataSource dataSource;

    @Autowired
    public FornecedorRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public Fornecedor save(Fornecedor fornecedor) {
        String sql = "INSERT INTO Fornecedor (cnpj, nome, telefone1, telefone2) VALUES (?, ?, ?, ?)";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            setFornecedorParameters(stmt, fornecedor);
            stmt.executeUpdate();
            return fornecedor;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao salvar fornecedor", e);
        }
    }

    public Optional<Fornecedor> findByCnpj(String cnpj) {
        String sql = "SELECT * FROM Fornecedor WHERE cnpj = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, cnpj);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToFornecedor(rs));
                }
            }
            return Optional.empty();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar fornecedor por CNPJ", e);
        }
    }

    public List<Fornecedor> findAll() {
        String sql = "SELECT * FROM Fornecedor";
        List<Fornecedor> fornecedores = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                fornecedores.add(mapResultSetToFornecedor(rs));
            }
            return fornecedores;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar todas os fornecedores", e);
        }
    }

    public Fornecedor update(Fornecedor fornecedor) {
        String sql = "UPDATE Fornecedor SET nome = ?, " +
                "telefone1 = ?, telefone2 = ? " +
                "WHERE cnpj = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, fornecedor.getNome());
            stmt.setString(2, fornecedor.getTelefone1());
            stmt.setString(3, fornecedor.getTelefone2());
            stmt.setString(4, fornecedor.getCnpj());

            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected == 0) {
                throw new RuntimeException("Fornecedor não encontrado com CNPJ: " + fornecedor.getCnpj());
            }
            return fornecedor;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar fornecedor", e);
        }
    }

    public void delete(String cnpj) {
        String sql = "DELETE FROM Fornecedor WHERE cnpj = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, cnpj);
            int rowsAffected = stmt.executeUpdate();

            if (rowsAffected == 0) {
                throw new RuntimeException("Fornecedor não encontradao com CNPJ: " + cnpj);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar fornecedor", e);
        }
    }

    public List<Fornecedor> findByNome(String nome) {
        String sql = "SELECT * FROM Fornecedor WHERE nome LIKE ?";
        List<Fornecedor> fornecedor = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, "%" + nome + "%");

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    fornecedor.add(mapResultSetToFornecedor(rs));
                }
            }
            return fornecedor;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar fornecedores por nome", e);
        }
    }

    private Fornecedor mapResultSetToFornecedor(ResultSet rs) throws SQLException {
        // Usando construtor padrão e setters em vez de Builder
        Fornecedor fornecedor = new Fornecedor();
        fornecedor.setCnpj(rs.getString("cnpj"));
        fornecedor.setNome(rs.getString("nome"));
        fornecedor.setTelefone1(rs.getString("telefone1"));
        fornecedor.setTelefone1(rs.getString("telefone2"));
        return fornecedor;
    }

    private void setFornecedorParameters(PreparedStatement stmt, Fornecedor fornecedor) throws SQLException {
        stmt.setString(1, fornecedor.getCnpj());
        stmt.setString(2, fornecedor.getNome());
        stmt.setString(3, fornecedor.getTelefone1());
        stmt.setString(4, fornecedor.getTelefone2());
    }
}
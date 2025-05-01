package br.com.loja.repository;

import br.com.loja.entities.Estoque;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class EstoqueRepository {

    private final DataSource dataSource;
    @Autowired
    private JdbcTemplate jdbcTemplate;


    @Autowired
    public EstoqueRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public Estoque save(Estoque estoque) {
        String sql = "INSERT INTO Estoque (fk_Produto_codigo_barra, fk_Produto_lote_produto, qtde_produto) VALUES (?, ?, ?)";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            setEstoqueParameters(stmt, estoque);
            stmt.executeUpdate();
            return estoque;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao salvar estoque", e);
        }
    }

    public List<Estoque> findAll() {
        List<Estoque> estoques = new ArrayList<>();
        String sql = "SELECT * FROM Estoque";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                estoques.add(mapResultSetToEstoque(rs));
            }
            return estoques;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao listar estoques", e);
        }
    }

    public Optional<Estoque> findById(String codigoBarra, String loteProduto) {
        String sql = "SELECT * FROM Estoque WHERE fk_Produto_codigo_barra = ? AND fk_Produto_lote_produto = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, codigoBarra);
            stmt.setString(2, loteProduto);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToEstoque(rs));
                } else {
                    return Optional.empty();
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar estoque", e);
        }
    }

    public Estoque update(Estoque estoque) {
        String sql = "UPDATE Estoque SET qtde_produto = ? WHERE fk_Produto_codigo_barra = ? AND fk_Produto_lote_produto = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, estoque.getQtdeProduto());
            stmt.setString(2, estoque.getCodigoBarra());
            stmt.setString(3, estoque.getLoteProduto());

            int linhasAfetadas = stmt.executeUpdate();
            if (linhasAfetadas == 0) {
                throw new RuntimeException("Estoque não encontrado para atualização");
            }
            return estoque;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar estoque", e);
        }
    }

    public void delete(String codigoBarra, String loteProduto) {
        String sql = "DELETE FROM Estoque WHERE fk_Produto_codigo_barra = ? AND fk_Produto_lote_produto = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, codigoBarra);
            stmt.setString(2, loteProduto);

            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar estoque", e);
        }
    }

    public void diminuirEstoque(String codigoBarra, String loteProduto, int quantidade) {
        String sql = "UPDATE Estoque SET qtde_produto = qtde_produto - ? WHERE fk_Produto_codigo_barra = ? AND fk_Produto_lote_produto = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, quantidade);
            stmt.setString(2, codigoBarra);
            stmt.setString(3, loteProduto);

            int linhasAfetadas = stmt.executeUpdate();
            if (linhasAfetadas == 0) {
                throw new RuntimeException("Erro ao diminuir o estoque. Produto não encontrado ou estoque insuficiente.");
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao diminuir estoque", e);
        }
    }

    public void restaurarEstoque(String codigoBarra, String loteProduto, int quantidade) {
        String sql = "UPDATE Estoque SET qtde_produto = qtde_produto + ? WHERE fk_Produto_codigo_barra = ? AND fk_Produto_lote_produto = ?";
        jdbcTemplate.update(sql, quantidade, codigoBarra, loteProduto);
    }


    private Estoque mapResultSetToEstoque(ResultSet rs) throws SQLException {
        Estoque estoque = new Estoque();
        estoque.setCodigoBarra(rs.getString("fk_Produto_codigo_barra"));
        estoque.setLoteProduto(rs.getString("fk_Produto_lote_produto"));
        estoque.setQtdeProduto(rs.getInt("qtde_produto"));
        return estoque;
    }

    private void setEstoqueParameters(PreparedStatement stmt, Estoque estoque) throws SQLException {
        stmt.setString(1, estoque.getCodigoBarra());
        stmt.setString(2, estoque.getLoteProduto());
        stmt.setInt(3, estoque.getQtdeProduto());
    }
}

package br.com.loja.repository;

import br.com.loja.entities.Produto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class ProdutoRepository {

    private final DataSource dataSource;

    @Autowired
    public ProdutoRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public Produto save(Produto produto) {
        String sql = "{CALL cadastrar_produto(?, ?, ?, ?, ?, ?, ?, ?)}";

        try (Connection conn = dataSource.getConnection();
             CallableStatement stmt = conn.prepareCall(sql)) {

            setProdutoParameters(stmt, produto);
            stmt.execute();
            return produto;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao salvar produto", e);
        }
    }

    public Optional<Produto> findByCodigoDeBarra(String codigo_barra) {
        String sql = "SELECT * FROM Produto WHERE codigo_barra = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, codigo_barra);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToProduto(rs));
                }
            }
            return Optional.empty();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar pessoa por Código de Barra", e);
        }
    }

    public List<Produto> findAll() {
        String sql = "SELECT * FROM Produto";
        List<Produto> produtos = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                produtos.add(mapResultSetToProduto(rs));
            }
            return produtos;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar todos os produtos", e);
        }
    }

    public Produto update(Produto produto) {
        String sql = "UPDATE Produto SET lote_produto = ?, tipo_produto = ?, nome = ?, marca = ?, " +
                "preco = ?, data_validade = ?, fk_fornecedor_CNPJ = ? " +
                "WHERE codigo_barra = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, produto.getLote_produto());
            stmt.setString(2, produto.getTipo_produto());
            stmt.setString(3, produto.getNome());
            stmt.setString(4, produto.getMarca());
            stmt.setBigDecimal(5, produto.getPreco());
            stmt.setDate(6, Date.valueOf(produto.getData_validade()));
            stmt.setString(7, produto.getFk_fornecedor_CNPJ());
            stmt.setString(8, produto.getCodigo_barra());

            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected == 0) {
                throw new RuntimeException("Produto não encontrado por Código de Barras: " + produto.getCodigo_barra());
            }
            return produto;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar produto", e);
        }
    }

    public void delete(String codigo_barra) {
        String sql = "DELETE FROM Produto WHERE codigo_barra = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, codigo_barra);
            int rowsAffected = stmt.executeUpdate();

            if (rowsAffected == 0) {
                throw new RuntimeException("Produto não encontrado por Código de Barras: " + codigo_barra);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar produto", e);
        }
    }

    public List<Produto> findByNome(String nome) {
        String sql = "SELECT * FROM Produto WHERE nome LIKE ?";
        List<Produto> produtos = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, "%" + nome + "%");

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    produtos.add(mapResultSetToProduto(rs));
                }
            }
            return produtos;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar produtos por nome", e);
        }
    }

    public List<Produto> buscarProdutosPorMesEAno(int mes, int ano) throws SQLException {
        List<Produto> produtos = new ArrayList<>();
        String sql = "SELECT * FROM Produto " +
                "WHERE MONTH(data_validade) = ? AND YEAR(data_validade) = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, mes);
            stmt.setInt(2, ano);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Produto produto = new Produto();
                    produto.setCodigo_barra(rs.getString("codigo_barra"));
                    produto.setLote_produto(rs.getString("lote_produto"));
                    produto.setTipo_produto(rs.getString("tipo_produto"));
                    produto.setNome(rs.getString("nome"));
                    produto.setMarca(rs.getString("marca"));
                    produto.setPreco(rs.getBigDecimal("preco"));
                    produto.setData_validade(rs.getDate("data_validade").toLocalDate());
                    produto.setFk_fornecedor_CNPJ(rs.getString("fk_fornecedor_CNPJ"));
                    produtos.add(produto);
                }
            }
        }
        return produtos;
    }



    private Produto mapResultSetToProduto(ResultSet rs) throws SQLException {
        // Usando construtor padrão e setters em vez de Builder
        Produto produto = new Produto();
        produto.setCodigo_barra(rs.getString("codigo_barra"));
        produto.setLote_produto(rs.getString("lote_produto"));
        produto.setTipo_produto(rs.getString("tipo_produto"));
        produto.setNome(rs.getString("nome"));
        produto.setMarca(rs.getString("marca"));
        produto.setPreco(rs.getBigDecimal("preco"));
        produto.setData_validade(rs.getDate("data_validade").toLocalDate());
        produto.setFk_fornecedor_CNPJ(rs.getString("fk_fornecedor_CNPJ"));
        return produto;
    }

    private void setProdutoParameters(PreparedStatement stmt, Produto produto) throws SQLException {
        stmt.setString(1, produto.getCodigo_barra());
        stmt.setString(2, produto.getLote_produto());
        stmt.setString(3, produto.getTipo_produto());
        stmt.setString(4, produto.getNome());
        stmt.setString(5, produto.getMarca());
        stmt.setBigDecimal(6, produto.getPreco());
        stmt.setDate(7, Date.valueOf(produto.getData_validade()));
        stmt.setString(8, produto.getFk_fornecedor_CNPJ());
    }
}
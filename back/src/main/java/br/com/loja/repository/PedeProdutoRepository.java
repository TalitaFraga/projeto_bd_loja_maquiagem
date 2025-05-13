package br.com.loja.repository;

import br.com.loja.entities.PedeProduto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class PedeProdutoRepository {

    private final DataSource dataSource;

    @Autowired
    public PedeProdutoRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public PedeProduto save(PedeProduto pedeProduto) {
        // Gerar ID automaticamente se não foi fornecido
        if (pedeProduto.getId_pedido() == null || pedeProduto.getId_pedido().trim().isEmpty()) {
            pedeProduto.setId_pedido("PED" + UUID.randomUUID().toString().substring(0, 8));
        }

        String sql = "INSERT INTO Pede_produto (id_pedido, fk_Produto_codigo_barra, fk_Produto_lote_produto, " +
                "fk_Fornecedor_cnpj, fk_Diretor_fk_Funcionario_fk_Pessoa_cpf, qtde_produto) " +
                "VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, pedeProduto.getId_pedido());
            stmt.setString(2, pedeProduto.getFk_Produto_codigo_barra());
            stmt.setString(3, pedeProduto.getFk_Produto_lote_produto());
            stmt.setString(4, pedeProduto.getFk_Fornecedor_CNPJ());
            stmt.setString(5, pedeProduto.getFk_Diretor_fk_Funcionario_fk_Pessoa_CPF());
            stmt.setInt(6, pedeProduto.getQtde_produto());

            stmt.executeUpdate();
            return pedeProduto;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao salvar pedido de produto: " + e.getMessage(), e);
        }
    }

    public Optional<PedeProduto> findById(String id_pedido) {
        String sql = "SELECT * FROM Pede_produto WHERE id_pedido = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, id_pedido);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToPedeProduto(rs));
                }
            }
            return Optional.empty();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar pedido de produto por ID: " + e.getMessage(), e);
        }
    }

    public List<PedeProduto> findAll() {
        String sql = "SELECT * FROM Pede_produto";
        List<PedeProduto> pedidos = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                pedidos.add(mapResultSetToPedeProduto(rs));
            }
            return pedidos;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar todos os pedidos de produtos: " + e.getMessage(), e);
        }
    }

    public List<PedeProduto> findByProdutoCodigo(String codigoBarra) {
        String sql = "SELECT * FROM Pede_produto WHERE fk_Produto_codigo_barra = ?";
        List<PedeProduto> pedidos = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, codigoBarra);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    pedidos.add(mapResultSetToPedeProduto(rs));
                }
            }
            return pedidos;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar pedidos por código de barras do produto: " + e.getMessage(), e);
        }
    }

    public List<PedeProduto> findByFornecedorCnpj(String cnpj) {
        String sql = "SELECT * FROM Pede_produto WHERE fk_Fornecedor_cnpj = ?";
        List<PedeProduto> pedidos = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, cnpj);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    pedidos.add(mapResultSetToPedeProduto(rs));
                }
            }
            return pedidos;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar pedidos por CNPJ do fornecedor: " + e.getMessage(), e);
        }
    }

    public List<PedeProduto> findByDiretorCpf(String cpf) {
        String sql = "SELECT * FROM Pede_produto WHERE fk_Diretor_fk_Funcionario_fk_Pessoa_cpf = ?";
        List<PedeProduto> pedidos = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, cpf);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    pedidos.add(mapResultSetToPedeProduto(rs));
                }
            }
            return pedidos;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar pedidos por CPF do diretor: " + e.getMessage(), e);
        }
    }

    public PedeProduto update(PedeProduto pedeProduto) {
        String sql = "UPDATE Pede_produto SET qtde_produto = ?, " +
                "fk_Produto_codigo_barra = ?, fk_Produto_lote_produto = ?, " +
                "fk_Fornecedor_cnpj = ?, fk_Diretor_fk_Funcionario_fk_Pessoa_cpf = ? " +
                "WHERE id_pedido = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, pedeProduto.getQtde_produto());
            stmt.setString(2, pedeProduto.getFk_Produto_codigo_barra());
            stmt.setString(3, pedeProduto.getFk_Produto_lote_produto());
            stmt.setString(4, pedeProduto.getFk_Fornecedor_CNPJ());
            stmt.setString(5, pedeProduto.getFk_Diretor_fk_Funcionario_fk_Pessoa_CPF());
            stmt.setString(6, pedeProduto.getId_pedido());

            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected == 0) {
                throw new RuntimeException("Pedido de produto não encontrado com ID: " + pedeProduto.getId_pedido());
            }
            return pedeProduto;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar pedido de produto: " + e.getMessage(), e);
        }
    }

    public void delete(String id_pedido) {
        String sql = "DELETE FROM Pede_produto WHERE id_pedido = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, id_pedido);

            int rowsAffected = stmt.executeUpdate();

            if (rowsAffected == 0) {
                throw new RuntimeException("Pedido de produto não encontrado com ID: " + id_pedido);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar pedido de produto: " + e.getMessage(), e);
        }
    }

    private PedeProduto mapResultSetToPedeProduto(ResultSet rs) throws SQLException {
        PedeProduto pedeProduto = new PedeProduto();
        pedeProduto.setId_pedido(rs.getString("id_pedido"));
        pedeProduto.setFk_Produto_codigo_barra(rs.getString("fk_Produto_codigo_barra"));
        pedeProduto.setFk_Produto_lote_produto(rs.getString("fk_Produto_lote_produto"));
        pedeProduto.setFk_Fornecedor_CNPJ(rs.getString("fk_Fornecedor_cnpj"));
        pedeProduto.setFk_Diretor_fk_Funcionario_fk_Pessoa_CPF(rs.getString("fk_Diretor_fk_Funcionario_fk_Pessoa_cpf"));
        pedeProduto.setQtde_produto(rs.getInt("qtde_produto"));
        return pedeProduto;
    }
}
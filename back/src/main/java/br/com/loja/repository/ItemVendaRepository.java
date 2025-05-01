package br.com.loja.repository;

import br.com.loja.entities.ItemVenda;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Repository
public class ItemVendaRepository {

    private final DataSource dataSource;

    @Autowired
    public ItemVendaRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public ItemVenda save(ItemVenda itemVenda) {
        String sql = "INSERT INTO Item_venda (fk_Venda_id_venda, fk_Produto_codigo_barra, fk_Produto_lote_produto, qtde_produto) " +
                "VALUES (?, ?, ?, ?)";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, itemVenda.getIdVenda());
            stmt.setString(2, itemVenda.getCodigoBarra());
            stmt.setString(3, itemVenda.getLoteProduto());
            stmt.setInt(4, itemVenda.getQtdeProduto());

            stmt.executeUpdate();
            return itemVenda;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao salvar item da venda", e);
        }
    }


    public List<ItemVenda> findByVendaId(String idVenda) {
        String sql = "SELECT * FROM Item_venda WHERE fk_Venda_id_venda = ?";
        List<ItemVenda> itens = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, idVenda);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    ItemVenda itemVenda = new ItemVenda();
                    itemVenda.setIdVenda(rs.getString("fk_Venda_id_venda"));
                    itemVenda.setCodigoBarra(rs.getString("fk_Produto_codigo_barra"));
                    itemVenda.setLoteProduto(rs.getString("fk_Produto_lote_produto"));
                    itemVenda.setQtdeProduto(rs.getInt("qtde_produto"));
                    itens.add(itemVenda);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar itens da venda", e);
        }
        return itens;
    }



    public void delete(String idVenda) {
        String sql = "DELETE FROM Item_venda WHERE fk_Venda_id_venda = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, idVenda);
            int rowsAffected = stmt.executeUpdate();

            if (rowsAffected == 0) {
                throw new RuntimeException("Item não encontrado na venda:" + idVenda);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar item", e);
        }
    }

    public void update(ItemVenda itemVenda) {
        String sql = "UPDATE Item_venda SET qtde_produto = ?, fk_Produto_codigo_barra = ?, fk_Produto_lote_produto = ? WHERE fk_Venda_id_venda = ? AND fk_Produto_codigo_barra = ? AND fk_Produto_lote_produto = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, itemVenda.getQtdeProduto());
            stmt.setString(2, itemVenda.getCodigoBarra());
            stmt.setString(3, itemVenda.getLoteProduto());
            stmt.setString(4, itemVenda.getIdVenda());
            stmt.setString(5, itemVenda.getCodigoBarra());
            stmt.setString(6, itemVenda.getLoteProduto());

            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected == 0) {
                throw new RuntimeException("ItemVenda não encontrado para atualização: " + itemVenda.getIdVenda());
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar ItemVenda", e);
        }
    }


    public void deleteSilencioso(String id_venda) {
        String sql = "DELETE FROM Item_venda WHERE fk_Venda_id_venda = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, id_venda);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar itens da venda", e);
        }
    }

}
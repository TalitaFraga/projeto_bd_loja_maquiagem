package br.com.loja.repository;

import br.com.loja.entities.Venda;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class VendaRepository {

    private final DataSource dataSource;

    @Autowired
    public VendaRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public Venda save(Venda venda) {
        String sql = "INSERT INTO Venda (id_venda, fk_Cliente_fk_Pessoa_cpf, fk_Vendedor_fk_Funcionario_fk_Pessoa_cpf, datahora_venda) VALUES (?, ?, ?, ?)";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            setVendaParameters(stmt, venda);
            stmt.executeUpdate();
            return venda;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao salvar venda", e);
        }
    }

    public Optional<Venda> findById(String idVenda) {
        String sql = "SELECT * FROM Venda WHERE id_venda = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, idVenda);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToVenda(rs));
                }
            }
            return Optional.empty();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar venda por ID", e);
        }
    }

    public List<Venda> findAll() {
        String sql = "SELECT * FROM Venda";
        List<Venda> vendas = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                vendas.add(mapResultSetToVenda(rs));
            }
            return vendas;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar todas as vendas", e);
        }
    }

    public Venda update(Venda venda) {
        String sql = "UPDATE Venda SET fk_Cliente_fk_Pessoa_cpf = ?, fk_Vendedor_fk_Funcionario_fk_Pessoa_cpf = ?, datahora_venda = ? WHERE id_venda = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, venda.getCpfCliente());
            stmt.setString(2, venda.getCpfVendedor());
            stmt.setTimestamp(3, Timestamp.valueOf(venda.getDataHoraVenda()));
            stmt.setString(4, venda.getIdVenda());

            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected == 0) {
                throw new RuntimeException("Venda não encontrada por ID: " + venda.getIdVenda());
            }
            return venda;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar venda", e);
        }
    }


    public void delete(String idVenda) {
        String sql = "DELETE FROM Venda WHERE id_venda = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, idVenda);
            int rowsAffected = stmt.executeUpdate();

            if (rowsAffected == 0) {
                throw new RuntimeException("Venda não encontrada por ID: " + idVenda);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar venda", e);
        }
    }


    private Venda mapResultSetToVenda(ResultSet rs) throws SQLException {
        Venda venda = new Venda();
        venda.setIdVenda(rs.getString("id_venda"));
        venda.setCpfCliente(rs.getString("fk_Cliente_fk_Pessoa_cpf"));
        venda.setCpfVendedor(rs.getString("fk_Vendedor_fk_Funcionario_fk_Pessoa_cpf"));
        venda.setDataHoraVenda(rs.getTimestamp("datahora_venda").toLocalDateTime());
        return venda;
    }


    private void setVendaParameters(PreparedStatement stmt, Venda venda) throws SQLException {
        stmt.setString(1, venda.getIdVenda());
        stmt.setString(2, venda.getCpfCliente());
        stmt.setString(3, venda.getCpfVendedor());
        stmt.setTimestamp(4, Timestamp.valueOf(venda.getDataHoraVenda()));
    }
}

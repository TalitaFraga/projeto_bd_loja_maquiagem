package br.com.loja.repository;

import br.com.loja.entities.Troca;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class TrocaRepository {

    private final DataSource dataSource;

    @Autowired
    public TrocaRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void save(Troca troca) {
        // Nomes das colunas corretos conforme o banco de dados
        String sql = "INSERT INTO Troca (id_troca, fk_Venda_id_venda_antiga, fk_Venda_id_venda_nova, datahora_troca) VALUES (?, ?, ?, ?)";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, troca.getIdTroca());
            stmt.setString(2, troca.getIdVendaOriginal());
            stmt.setString(3, troca.getIdVendaNova());
            stmt.setTimestamp(4, Timestamp.valueOf(troca.getDataHora()));

            int rowsAffected = stmt.executeUpdate();
            System.out.println("Linhas afetadas no INSERT: " + rowsAffected);

        } catch (SQLException e) {
            System.err.println("Erro SQL ao salvar troca: " + e.getMessage());
            System.err.println("SQL State: " + e.getSQLState());
            System.err.println("Error Code: " + e.getErrorCode());
            throw new RuntimeException("Erro ao salvar troca: " + e.getMessage(), e);
        }
    }

    public Optional<Troca> findById(String idTroca) {
        String sql = "SELECT * FROM Troca WHERE id_troca = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, idTroca);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToTroca(rs));
                }
            }
            return Optional.empty();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar troca: " + e.getMessage(), e);
        }
    }

    public List<Troca> findAll() {
        String sql = "SELECT * FROM Troca";
        List<Troca> trocas = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                trocas.add(mapResultSetToTroca(rs));
            }
            return trocas;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao listar trocas: " + e.getMessage(), e);
        }
    }

    public void update(Troca troca) {
        String sql = "UPDATE Troca SET fk_Venda_id_venda_antiga = ?, fk_Venda_id_venda_nova = ?, datahora_troca = ? WHERE id_troca = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, troca.getIdVendaOriginal());
            stmt.setString(2, troca.getIdVendaNova());
            stmt.setTimestamp(3, Timestamp.valueOf(troca.getDataHora()));
            stmt.setString(4, troca.getIdTroca());

            if (stmt.executeUpdate() == 0) {
                throw new RuntimeException("Troca não encontrada para atualização: " + troca.getIdTroca());
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar troca: " + e.getMessage(), e);
        }
    }

    public void delete(String idTroca) {
        String sql = "DELETE FROM Troca WHERE id_troca = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, idTroca);
            if (stmt.executeUpdate() == 0) {
                throw new RuntimeException("Troca não encontrada para exclusão: " + idTroca);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar troca: " + e.getMessage(), e);
        }
    }

    private Troca mapResultSetToTroca(ResultSet rs) throws SQLException {
        Troca troca = new Troca();
        troca.setIdTroca(rs.getString("id_troca"));
        troca.setIdVendaOriginal(rs.getString("fk_Venda_id_venda_antiga"));
        troca.setIdVendaNova(rs.getString("fk_Venda_id_venda_nova"));

        // Verificar se o timestamp não é nulo antes de converter
        Timestamp timestamp = rs.getTimestamp("datahora_troca");
        if (timestamp != null) {
            troca.setDataHora(timestamp.toLocalDateTime());
        }

        return troca;
    }
}
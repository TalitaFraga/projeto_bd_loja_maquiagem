package br.com.loja.repository;

import br.com.loja.entities.Venda;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.*;

@Repository
public class VendaRepository {

    private final DataSource dataSource;
    private final ItemVendaRepository itemVendaRepository;


    @Autowired
    public VendaRepository(DataSource dataSource, ItemVendaRepository itemVendaRepository) {
        this.dataSource = dataSource;
        this.itemVendaRepository = itemVendaRepository;
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
        itemVendaRepository.deleteSilencioso(idVenda);
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

    public List<Map<String, Object>> findFaturamentoFiltrado(Integer ano, Integer mes) {
        StringBuilder sql = new StringBuilder("""
        SELECT DATE_FORMAT(V.datahora_venda, '%Y-%m') AS mes,
               ROUND(SUM(IV.qtde_produto * P.preco), 2) AS total_vendas
        FROM Venda V
        JOIN Item_venda IV ON V.id_venda = IV.fk_Venda_id_venda
        JOIN Produto P ON IV.fk_Produto_codigo_barra = P.codigo_barra
            AND IV.fk_Produto_lote_produto = P.lote_produto
        WHERE 1=1
    """);

        if (ano != null) {
            sql.append(" AND YEAR(V.datahora_venda) = ").append(ano);
        }

        if (mes != null) {
            sql.append(" AND MONTH(V.datahora_venda) = ").append(mes);
        }

        sql.append(" GROUP BY mes ORDER BY mes DESC");

        List<Map<String, Object>> resultado = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString());
             ResultSet rs = stmt.executeQuery()) {

            ResultSetMetaData metaData = rs.getMetaData();
            int columnCount = metaData.getColumnCount();

            while (rs.next()) {
                Map<String, Object> row = new HashMap<>();
                for (int i = 1; i <= columnCount; i++) {
                    row.put(metaData.getColumnLabel(i), rs.getObject(i));
                }
                resultado.add(row);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar faturamento filtrado", e);
        }

        return resultado;
    }

    public List<Map<String, Object>> findVendasAgrupadas(String periodo, String cpfVendedor, Integer ano) {
        StringBuilder sql = new StringBuilder();
        List<Object> params = new ArrayList<>();

        String nomeCampoDataSQL;
        String groupByBaseSQL;
        String orderByClauseSQL;

        switch (periodo.toLowerCase()) {
            case "semanal":
                nomeCampoDataSQL = """
                    CASE DAYOFWEEK(V.datahora_venda)
                        WHEN 1 THEN 'Dom' WHEN 2 THEN 'Seg' WHEN 3 THEN 'Ter' WHEN 4 THEN 'Qua'
                        WHEN 5 THEN 'Qui' WHEN 6 THEN 'Sex' WHEN 7 THEN 'Sab'
                    END
                """;
                groupByBaseSQL = " DAYOFWEEK(V.datahora_venda) ";
                orderByClauseSQL = " DAYOFWEEK(V.datahora_venda) ASC ";
                break;
            case "mensal":
                nomeCampoDataSQL = " DATE_FORMAT(V.datahora_venda, '%b') ";
                groupByBaseSQL = " MONTH(V.datahora_venda) ";
                orderByClauseSQL = " MONTH(V.datahora_venda) ASC ";
                break;
            case "trimestral":
                nomeCampoDataSQL = " CONCAT('T', QUARTER(V.datahora_venda)) ";
                groupByBaseSQL = " QUARTER(V.datahora_venda) ";
                orderByClauseSQL = " QUARTER(V.datahora_venda) ASC ";
                break;
            default:
                throw new IllegalArgumentException("Período inválido: " + periodo);
        }

        sql.append("SELECT ")
                .append(nomeCampoDataSQL).append(" AS name, ")
                .append("SUM(IV.qtde_produto) AS total, ")
                .append("SUM(CASE WHEN V.cpf_vendedor = ? THEN IV.qtde_produto ELSE 0 END) AS vendedor ")
                .append("FROM `Venda` V ")
                .append("JOIN `Item_venda` IV ON V.id_venda = IV.fk_Venda_id_venda ");

        params.add(cpfVendedor);

        sql.append("WHERE 1=1 ");
        if (ano != null) {
            sql.append("AND YEAR(V.datahora_venda) = ? ");
            params.add(ano);
        }

        sql.append("GROUP BY name, ").append(groupByBaseSQL);
        sql.append("ORDER BY ").append(orderByClauseSQL);

        List<Map<String, Object>> resultado = new ArrayList<>();

        System.out.println("Executando SQL (findVendasAgrupadas): " + sql.toString());
        System.out.println("Com parâmetros: " + params);

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql.toString())) {

            for (int i = 0; i < params.size(); i++) {
                stmt.setObject(i + 1, params.get(i));
            }

            try (ResultSet rs = stmt.executeQuery()) {
                ResultSetMetaData metaData = rs.getMetaData();
                int columnCount = metaData.getColumnCount();
                while (rs.next()) {
                    Map<String, Object> row = new HashMap<>();
                    for (int i = 1; i <= columnCount; i++) {
                        row.put(metaData.getColumnLabel(i).toLowerCase(), rs.getObject(i));
                    }
                    resultado.add(row);
                }
            }
        } catch (SQLException e) {
            System.err.println("Erro SQL em findVendasAgrupadas: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erro ao buscar vendas agrupadas para gráfico: " + e.getMessage(), e);
        }
        return resultado;
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
package br.com.loja.repository;

import br.com.loja.entities.Pessoa;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class PessoaRepository {

    private final DataSource dataSource;

    @Autowired
    public PessoaRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    // MÉTODO UTILITÁRIO: Formatar CPF
    private String formatarCPF(String cpf) {
        if (cpf == null) return null;

        // Remove tudo que não é número
        String cpfLimpo = cpf.replaceAll("\\D", "");

        // Verifica se tem 11 dígitos
        if (cpfLimpo.length() != 11) {
            throw new IllegalArgumentException("CPF deve ter 11 dígitos: " + cpf);
        }

        // Formata: 123.456.789-01
        return cpfLimpo.substring(0, 3) + "." +
                cpfLimpo.substring(3, 6) + "." +
                cpfLimpo.substring(6, 9) + "-" +
                cpfLimpo.substring(9, 11);
    }

    // MÉTODO UTILITÁRIO: Limpar CPF (apenas números)
    private String limparCPF(String cpf) {
        if (cpf == null) return null;
        return cpf.replaceAll("\\D", "");
    }

    // MÉTODO UTILITÁRIO: Formatar RG
    private String formatarRG(String rg) {
        if (rg == null) return null;
        return rg.replaceAll("\\D", ""); // Apenas números para RG
    }

    public Pessoa save(Pessoa pessoa) {
        // FORMATAR CPF antes de validar e salvar
        String cpfFormatado = formatarCPF(pessoa.getCpf());
        pessoa.setCpf(cpfFormatado);

        // FORMATAR RG
        String rgFormatado = formatarRG(pessoa.getRg());
        pessoa.setRg(rgFormatado);

        // VALIDAÇÃO: Verificar se CPF já existe
        if (findByCpf(cpfFormatado).isPresent()) {
            throw new RuntimeException("CPF já cadastrado no sistema: " + cpfFormatado);
        }

        // VALIDAÇÃO: Verificar se RG já existe
        if (findByRg(rgFormatado).isPresent()) {
            throw new RuntimeException("RG já cadastrado no sistema: " + rgFormatado);
        }

        // VALIDAÇÃO: Verificar se Email já existe
        if (findByEmail(pessoa.getEmail()).isPresent()) {
            throw new RuntimeException("Email já cadastrado no sistema: " + pessoa.getEmail());
        }

        String sql = "INSERT INTO Pessoa (cpf, data_nasc, nome, rua, cidade, numero, cep, " +
                "bairro, telefone1, telefone2, email, rg) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            setPessoaParameters(stmt, pessoa);
            stmt.executeUpdate();
            return pessoa;
        } catch (SQLException e) {
            // Tratar erros específicos do MySQL
            if (e.getMessage().contains("Duplicate entry")) {
                if (e.getMessage().contains("cpf")) {
                    throw new RuntimeException("CPF já cadastrado no sistema: " + cpfFormatado);
                } else if (e.getMessage().contains("RG")) {
                    throw new RuntimeException("RG já cadastrado no sistema: " + rgFormatado);
                }
            }
            throw new RuntimeException("Erro ao salvar pessoa: " + e.getMessage(), e);
        }
    }

    public Optional<Pessoa> findByCpf(String cpf) {
        // Buscar tanto por CPF formatado quanto por CPF limpo
        String cpfFormatado = formatarCPF(cpf);

        String sql = "SELECT * FROM Pessoa WHERE cpf = ? OR cpf = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, cpfFormatado);
            stmt.setString(2, limparCPF(cpf));

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToPessoa(rs));
                }
            }
            return Optional.empty();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar pessoa por CPF", e);
        }
    }

    // NOVO MÉTODO: Buscar por RG
    public Optional<Pessoa> findByRg(String rg) {
        String sql = "SELECT * FROM Pessoa WHERE rg = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, formatarRG(rg));

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToPessoa(rs));
                }
            }
            return Optional.empty();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar pessoa por RG", e);
        }
    }

    // NOVO MÉTODO: Buscar por Email
    public Optional<Pessoa> findByEmail(String email) {
        String sql = "SELECT * FROM Pessoa WHERE LOWER(email) = LOWER(?)";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, email.trim());

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapResultSetToPessoa(rs));
                }
            }
            return Optional.empty();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar pessoa por Email", e);
        }
    }

    public List<Pessoa> findAll() {
        String sql = "SELECT * FROM Pessoa";
        List<Pessoa> pessoas = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                pessoas.add(mapResultSetToPessoa(rs));
            }
            return pessoas;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar todas as pessoas", e);
        }
    }

    public Pessoa update(Pessoa pessoa) {
        // FORMATAR CPF e RG
        String cpfFormatado = formatarCPF(pessoa.getCpf());
        pessoa.setCpf(cpfFormatado);
        pessoa.setRg(formatarRG(pessoa.getRg()));

        // VALIDAÇÃO: Verificar se a pessoa existe
        Optional<Pessoa> pessoaExistente = findByCpf(cpfFormatado);
        if (pessoaExistente.isEmpty()) {
            throw new RuntimeException("Pessoa não encontrada com CPF: " + cpfFormatado);
        }

        // VALIDAÇÃO: Verificar se RG já existe (exceto para a própria pessoa)
        Optional<Pessoa> pessoaComRg = findByRg(pessoa.getRg());
        if (pessoaComRg.isPresent() && !pessoaComRg.get().getCpf().equals(cpfFormatado)) {
            throw new RuntimeException("RG já cadastrado para outra pessoa: " + pessoa.getRg());
        }

        // VALIDAÇÃO: Verificar se Email já existe (exceto para a própria pessoa)
        Optional<Pessoa> pessoaComEmail = findByEmail(pessoa.getEmail());
        if (pessoaComEmail.isPresent() && !pessoaComEmail.get().getCpf().equals(cpfFormatado)) {
            throw new RuntimeException("Email já cadastrado para outra pessoa: " + pessoa.getEmail());
        }

        String sql = "UPDATE Pessoa SET data_nasc = ?, nome = ?, rua = ?, cidade = ?, " +
                "numero = ?, cep = ?, bairro = ?, telefone1 = ?, telefone2 = ?, email = ?, rg = ? " +
                "WHERE cpf = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setDate(1, Date.valueOf(pessoa.getDataNasc()));
            stmt.setString(2, pessoa.getNome());
            stmt.setString(3, pessoa.getRua());
            stmt.setString(4, pessoa.getCidade());
            stmt.setString(5, pessoa.getNumero());
            stmt.setString(6, pessoa.getCep());
            stmt.setString(7, pessoa.getBairro());
            stmt.setString(8, pessoa.getTelefone1());
            stmt.setString(9, pessoa.getTelefone2());
            stmt.setString(10, pessoa.getEmail().toLowerCase().trim());
            stmt.setString(11, pessoa.getRg());
            stmt.setString(12, cpfFormatado);

            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected == 0) {
                throw new RuntimeException("Pessoa não encontrada com CPF: " + cpfFormatado);
            }
            return pessoa;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar pessoa", e);
        }
    }

    public void delete(String cpf) {
        String cpfFormatado = formatarCPF(cpf);
        String sql = "DELETE FROM Pessoa WHERE cpf = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, cpfFormatado);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar pessoa", e);
        }
    }

    public List<Pessoa> findByNome(String nome) {
        String sql = "SELECT * FROM Pessoa WHERE nome LIKE ?";
        List<Pessoa> pessoas = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, "%" + nome + "%");

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    pessoas.add(mapResultSetToPessoa(rs));
                }
            }
            return pessoas;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar pessoas por nome", e);
        }
    }

    private Pessoa mapResultSetToPessoa(ResultSet rs) throws SQLException {
        Pessoa pessoa = new Pessoa();
        pessoa.setCpf(rs.getString("cpf"));
        pessoa.setDataNasc(rs.getDate("data_nasc").toLocalDate());
        pessoa.setNome(rs.getString("nome"));
        pessoa.setRua(rs.getString("rua"));
        pessoa.setCidade(rs.getString("cidade"));
        pessoa.setNumero(rs.getString("numero"));
        pessoa.setCep(rs.getString("cep"));
        pessoa.setBairro(rs.getString("bairro"));
        pessoa.setTelefone1(rs.getString("telefone1"));
        pessoa.setTelefone2(rs.getString("telefone2"));
        pessoa.setEmail(rs.getString("email"));
        pessoa.setRg(rs.getString("rg"));
        return pessoa;
    }

    private void setPessoaParameters(PreparedStatement stmt, Pessoa pessoa) throws SQLException {
        stmt.setString(1, pessoa.getCpf());
        stmt.setDate(2, Date.valueOf(pessoa.getDataNasc()));
        stmt.setString(3, pessoa.getNome());
        stmt.setString(4, pessoa.getRua());
        stmt.setString(5, pessoa.getCidade());
        stmt.setString(6, pessoa.getNumero());
        stmt.setString(7, pessoa.getCep());
        stmt.setString(8, pessoa.getBairro());
        stmt.setString(9, pessoa.getTelefone1());
        stmt.setString(10, pessoa.getTelefone2());
        stmt.setString(11, pessoa.getEmail().toLowerCase().trim());
        stmt.setString(12, pessoa.getRg());
    }

    public void deleteSilencioso(String cpf) {
        String cpfFormatado = formatarCPF(cpf);
        String sql = "DELETE FROM Pessoa WHERE cpf = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, cpfFormatado);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar pessoa", e);
        }
    }
}
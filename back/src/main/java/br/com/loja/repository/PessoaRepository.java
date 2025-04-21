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
    private final FuncionarioRepository funcionarioRepository;
    private final VendedorRepository vendedorRepository;
    private final EstoquistaRepository estoquistaRepository;
    private final DiretorRepository diretorRepository;
    private final ClienteRepository clienteRepository;


    @Autowired
    public PessoaRepository(
            DataSource dataSource,
            FuncionarioRepository funcionarioRepository,
            VendedorRepository vendedorRepository,
            EstoquistaRepository estoquistaRepository,
            DiretorRepository diretorRepository,
            ClienteRepository clienteRepository) {
        this.dataSource = dataSource;
        this.funcionarioRepository = funcionarioRepository;
        this.vendedorRepository = vendedorRepository;
        this.estoquistaRepository = estoquistaRepository;
        this.diretorRepository = diretorRepository;
        this.clienteRepository = clienteRepository;
    }
    public Pessoa save(Pessoa pessoa) {
        String sql = "INSERT INTO Pessoa (cpf, data_nasc, nome, rua, cidade, numero, cep, " +
                "bairro, telefone1, telefone2, email, rg) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            setPessoaParameters(stmt, pessoa);
            stmt.executeUpdate();
            return pessoa;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao salvar pessoa", e);
        }
    }

    public Optional<Pessoa> findByCpf(String cpf) {
        String sql = "SELECT * FROM Pessoa WHERE cpf = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, cpf);

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
            stmt.setString(10, pessoa.getEmail());
            stmt.setString(11, pessoa.getRg());
            stmt.setString(12, pessoa.getCpf());

            int rowsAffected = stmt.executeUpdate();
            if (rowsAffected == 0) {
                throw new RuntimeException("Pessoa não encontrada com CPF: " + pessoa.getCpf());
            }
            return pessoa;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao atualizar pessoa", e);
        }
    }

    public void delete(String cpf) {
        vendedorRepository.deleteSilencioso(cpf);
        estoquistaRepository.deleteSilencioso(cpf);
        diretorRepository.deleteSilencioso(cpf);
        funcionarioRepository.deleteSilencioso(cpf);
        clienteRepository.deleteSilencioso(cpf);

        String sql = "DELETE FROM Pessoa WHERE cpf = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, cpf);
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
        // Usando construtor padrão e setters em vez de Builder
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
        stmt.setString(11, pessoa.getEmail());
        stmt.setString(12, pessoa.getRg());
    }

    public void deleteSilencioso(String cpf) {
        String sql = "DELETE FROM Pessoa WHERE CPF = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, cpf);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar pessoa", e);
        }
    }

}
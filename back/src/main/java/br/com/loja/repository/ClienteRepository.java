package br.com.loja.repository;

import br.com.loja.entities.Cliente;
import br.com.loja.entities.Pessoa;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class ClienteRepository {

    private final DataSource dataSource;
    private final PessoaRepository pessoaRepository;

    @Autowired
    @Lazy
    public ClienteRepository(DataSource dataSource, PessoaRepository pessoaRepository) {
        this.dataSource = dataSource;
        this.pessoaRepository = pessoaRepository;
    }

    public Cliente save(Cliente cliente) {
        pessoaRepository.save(cliente);

        String sql = "INSERT INTO Cliente (fk_Pessoa_cpf) VALUES (?)";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, cliente.getCpf());
            stmt.executeUpdate();
            return cliente;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao salvar cliente", e);
        }
    }

    public Optional<Cliente> findByCpf(String cpf) {
        Optional<Pessoa> pessoaOpt = pessoaRepository.findByCpf(cpf);
        if (pessoaOpt.isEmpty()) {
            return Optional.empty();
        }

        String sql = "SELECT * FROM Cliente WHERE fk_Pessoa_cpf = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, cpf);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    // Converte Pessoa para Cliente
                    Pessoa pessoa = pessoaOpt.get();
                    Cliente cliente = new Cliente();
                    // Copia os dados da Pessoa para o Cliente
                    cliente.setCpf(pessoa.getCpf());
                    cliente.setDataNasc(pessoa.getDataNasc());
                    cliente.setNome(pessoa.getNome());
                    cliente.setRua(pessoa.getRua());
                    cliente.setCidade(pessoa.getCidade());
                    cliente.setNumero(pessoa.getNumero());
                    cliente.setCep(pessoa.getCep());
                    cliente.setBairro(pessoa.getBairro());
                    cliente.setTelefone1(pessoa.getTelefone1());
                    cliente.setTelefone2(pessoa.getTelefone2());
                    cliente.setEmail(pessoa.getEmail());
                    cliente.setRg(pessoa.getRg());

                    return Optional.of(cliente);
                }
            }
            return Optional.empty();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar cliente por cpf", e);
        }
    }

    public Cliente update(Cliente cliente) {
        pessoaRepository.update(cliente);
        return cliente;
    }

    @Transactional
    public void delete(String cpf) {
        try {
            String deleteClienteSql = "DELETE FROM Cliente WHERE fk_Pessoa_cpf = ?";
            try (Connection conn = dataSource.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(deleteClienteSql)) {

                stmt.setString(1, cpf);
                int rowsAffected = stmt.executeUpdate();

                if (rowsAffected == 0) {
                    throw new RuntimeException("Cliente não encontrado com CPF: " + cpf);
                }
                pessoaRepository.delete(cpf);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar cliente", e);
        }
    }

    public List<Cliente> findAll() {
        String sql = "SELECT * FROM Cliente";
        List<Cliente> clientes = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                String cpf = rs.getString("fk_Pessoa_cpf");
                pessoaRepository.findByCpf(cpf).ifPresent(pessoa -> {
                    Cliente cliente = new Cliente();
                    cliente.setCpf(pessoa.getCpf());
                    cliente.setDataNasc(pessoa.getDataNasc());
                    cliente.setNome(pessoa.getNome());
                    cliente.setRua(pessoa.getRua());
                    cliente.setCidade(pessoa.getCidade());
                    cliente.setNumero(pessoa.getNumero());
                    cliente.setCep(pessoa.getCep());
                    cliente.setBairro(pessoa.getBairro());
                    cliente.setTelefone1(pessoa.getTelefone1());
                    cliente.setTelefone2(pessoa.getTelefone2());
                    cliente.setEmail(pessoa.getEmail());
                    cliente.setRg(pessoa.getRg());

                    clientes.add(cliente);
                });
            }
            return clientes;
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao buscar todos os clientes", e);
        }
    }

    public List<Cliente> findByNome(String nome) {
        List<Cliente> clientes = new ArrayList<>();
        List<Pessoa> pessoas = pessoaRepository.findByNome(nome);

        for (Pessoa pessoa : pessoas) {
            Optional<Cliente> clienteOpt = findByCpf(pessoa.getCpf());
            clienteOpt.ifPresent(clientes::add);
        }

        return clientes;
    }
    public void deleteSilencioso(String cpf) {
        String sql = "DELETE FROM Cliente WHERE fk_Pessoa_cpf = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, cpf);
            stmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Erro ao deletar cliente (silencioso)", e);
        }
    }
}

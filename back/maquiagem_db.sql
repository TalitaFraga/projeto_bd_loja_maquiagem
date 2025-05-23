-- Excluir banco se já existir
-- DROP DATABASE IF EXISTS maquiagem_db_v3;

-- Criação do banco

CREATE DATABASE maquiagem_db;

USE maquiagem_db;

-- Tabelas
CREATE TABLE Pessoa (
    cpf VARCHAR(14) PRIMARY KEY UNIQUE NOT NULL,
    data_nasc DATE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    rua VARCHAR(100) NOT NULL,
    cidade VARCHAR(50) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    cep VARCHAR(10) NOT NULL,
    bairro VARCHAR(50) NOT NULL,
    telefone1 VARCHAR(15) NOT NULL,
    telefone2 VARCHAR(15),
    email VARCHAR(100) NOT NULL,
    RG VARCHAR(12) UNIQUE NOT NULL
);

CREATE TABLE Funcionario (
    fk_Pessoa_cpf VARCHAR(14) UNIQUE NOT NULL,
    PRIMARY KEY (fk_Pessoa_cpf),
    FOREIGN KEY (fk_Pessoa_cpf) REFERENCES Pessoa(cpf)
);

CREATE TABLE Gerencia (
    fk_Funcionario_a_fk_Pessoa_cpf VARCHAR(14) NOT NULL,
    fk_Funcionario_b_fk_Pessoa_cpf VARCHAR(14) NOT NULL,
    PRIMARY KEY (fk_Funcionario_a_fk_Pessoa_cpf, fk_Funcionario_b_fk_Pessoa_cpf),
    FOREIGN KEY (fk_Funcionario_a_fk_Pessoa_cpf) REFERENCES Funcionario(fk_Pessoa_cpf),
    FOREIGN KEY (fk_Funcionario_b_fk_Pessoa_cpf) REFERENCES Funcionario(fk_Pessoa_cpf)
);

CREATE TABLE Diretor (
    fk_Funcionario_fk_Pessoa_cpf VARCHAR(14) UNIQUE NOT NULL,
    PRIMARY KEY (fk_Funcionario_fk_Pessoa_cpf),
    FOREIGN KEY (fk_Funcionario_fk_Pessoa_cpf) REFERENCES Funcionario(fk_Pessoa_cpf)
);

CREATE TABLE Estoquista (
    fk_Funcionario_fk_Pessoa_cpf VARCHAR(14) UNIQUE NOT NULL,
    PRIMARY KEY (fk_Funcionario_fk_Pessoa_cpf),
    FOREIGN KEY (fk_Funcionario_fk_Pessoa_cpf) REFERENCES Funcionario(fk_Pessoa_cpf)
);

CREATE TABLE Vendedor (
    fk_Funcionario_fk_Pessoa_cpf VARCHAR(14) UNIQUE NOT NULL,
    PRIMARY KEY (fk_Funcionario_fk_Pessoa_cpf),
    FOREIGN KEY (fk_Funcionario_fk_Pessoa_cpf) REFERENCES Funcionario(fk_Pessoa_cpf)
);

CREATE TABLE Cliente (
    fk_Pessoa_cpf VARCHAR(14) UNIQUE NOT NULL,
    PRIMARY KEY (fk_Pessoa_cpf),
    FOREIGN KEY (fk_Pessoa_cpf) REFERENCES Pessoa(cpf)
);

CREATE TABLE Fornecedor (
    cnpj VARCHAR(18) PRIMARY KEY UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    telefone1 VARCHAR(15) NOT NULL,
    telefone2 VARCHAR(15)
);

CREATE TABLE Produto (
    codigo_barra VARCHAR(20) NOT NULL,
    lote_produto VARCHAR(20) NOT NULL,
    tipo_produto VARCHAR(50) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    marca VARCHAR(50) NOT NULL,
    preco DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    data_validade DATE NOT NULL,
    fk_Fornecedor_cnpj VARCHAR(18) NOT NULL,
    PRIMARY KEY (codigo_barra, lote_produto),
    FOREIGN KEY (fk_Fornecedor_cnpj) REFERENCES Fornecedor(cnpj),
    CONSTRAINT chk_preco CHECK (preco >= 0)
);

CREATE TABLE Estoque (
    fk_Produto_codigo_barra VARCHAR(20) NOT NULL,
    fk_Produto_lote_produto VARCHAR(20) NOT NULL,
    qtde_produto INT DEFAULT 0,
    PRIMARY KEY (fk_Produto_codigo_barra, fk_Produto_lote_Produto),
    FOREIGN KEY (fk_Produto_codigo_barra, fk_Produto_lote_Produto) REFERENCES Produto(codigo_barra, lote_produto),
    CONSTRAINT chk_qtde CHECK (qtde_produto >= 0)
);

CREATE TABLE Venda (
    id_venda VARCHAR(36) PRIMARY KEY UNIQUE NOT NULL,
    fk_Cliente_fk_Pessoa_cpf VARCHAR(14) NOT NULL,
    fk_Vendedor_fk_Funcionario_fk_Pessoa_cpf VARCHAR(14) NOT NULL,
    datahora_venda DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fk_Cliente_fk_Pessoa_cpf) REFERENCES Cliente(fk_Pessoa_cpf),
    FOREIGN KEY (fk_Vendedor_fk_Funcionario_fk_Pessoa_cpf) REFERENCES Vendedor(fk_Funcionario_fk_Pessoa_cpf)
);

CREATE TABLE Item_venda (
    fk_Venda_id_venda VARCHAR(36) NOT NULL,
    fk_Produto_codigo_barra VARCHAR(20) NOT NULL,
    fk_Produto_lote_produto VARCHAR(20) NOT NULL,
    qtde_produto INT NOT NULL,
    PRIMARY KEY (fk_Venda_id_venda, fk_Produto_codigo_barra, fk_Produto_lote_produto),
    FOREIGN KEY (fk_Venda_id_venda) REFERENCES Venda(id_venda),
    FOREIGN KEY (fk_Produto_codigo_barra, fk_Produto_lote_produto) REFERENCES Produto(codigo_barra, lote_produto),
    CONSTRAINT chk_qtde_item_venda CHECK (qtde_produto > 0)
);

CREATE TABLE Pede_produto (
    id_pedido VARCHAR(36) PRIMARY KEY UNIQUE NOT NULL,
    fk_Produto_codigo_barra VARCHAR(20) NOT NULL,
    fk_Fornecedor_cnpj VARCHAR(18) NOT NULL,
    fk_Diretor_fk_Funcionario_fk_Pessoa_cpf VARCHAR(14) NOT NULL,
    fk_Produto_lote_produto VARCHAR(20) NOT NULL,
    qtde_produto INT NOT NULL,
    FOREIGN KEY (fk_Produto_codigo_barra, fk_Produto_lote_produto) REFERENCES Produto(codigo_barra, lote_produto),
    FOREIGN KEY (fk_Fornecedor_cnpj) REFERENCES Fornecedor(cnpj),
    FOREIGN KEY (fk_Diretor_fk_Funcionario_fk_Pessoa_cpf) REFERENCES Diretor(fk_Funcionario_fk_Pessoa_cpf)
);

CREATE TABLE Troca (
    id_troca VARCHAR(36) PRIMARY KEY NOT NULL,            -- ID da troca (uuid ou código)
    fk_Venda_id_venda_antiga VARCHAR(36) NOT NULL,       -- Venda antiga (que será devolvida)
    fk_Venda_id_venda_nova VARCHAR(36) NOT NULL,         -- Nova venda (com produtos que o cliente leva)
    datahora_troca DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Data da troca

    FOREIGN KEY (fk_Venda_id_venda_antiga) REFERENCES Venda(id_venda),
    FOREIGN KEY (fk_Venda_id_venda_nova) REFERENCES Venda(id_venda)
);


-- Populando o banco

INSERT INTO Pessoa VALUES
('390.533.447-05', '1990-05-10', 'Ana Clara', 'Rua A', 'Recife', '100', '50000-000', 'Boa Vista', '(81)99999-0001', NULL, 'ana@email.com', 'MG123456'),
('104.407.477-60', '1985-03-22', 'Bruno Silva', 'Rua B', 'Olinda', '200', '50000-001', 'Casa Caiada', '(81)99999-0002', NULL, 'bruno@email.com', 'PE654321'),
('614.284.623-02', '1998-11-30', 'Carla Dias', 'Rua C', 'Jaboatao', '300', '50000-002', 'Piedade', '(81)99999-0003', NULL, 'carla@email.com', 'SP789456'),
('865.443.027-53', '1993-07-15', 'Daniel Rocha', 'Rua D', 'Recife', '400', '50000-003', 'Derby', '(81)99999-0004', NULL, 'daniel@email.com', 'RJ987654'),
('210.468.350-20', '1992-02-18', 'Elaine Costa', 'Rua E', 'Olinda', '500', '50000-004', 'Bairro Novo', '(81)99999-0005', NULL, 'elaine@email.com', 'BA456123'),
('078.379.601-90', '1989-08-25', 'Fabio Lima', 'Rua F', 'Recife', '600', '50000-005', 'Gracas', '(81)99999-0006', NULL, 'fabio@email.com', 'CE321789');

INSERT INTO Cliente VALUES ('390.533.447-05'), ('104.407.477-60'), ('614.284.623-02');

INSERT INTO Funcionario VALUES ('865.443.027-53'), ('210.468.350-20'), ('078.379.601-90');

INSERT INTO Vendedor VALUES ('865.443.027-53');

INSERT INTO Estoquista VALUES ('210.468.350-20');

INSERT INTO Diretor VALUES ('078.379.601-90');

INSERT INTO Fornecedor VALUES ('11.222.333/0001-44', 'Beleza Distribuidora', '(81)98888-0000', NULL);

INSERT INTO Produto VALUES
('1001', 'L001', 'base', 'Base Clara', 'Marca A', 35.50, '2025-12-01', '11.222.333/0001-44'),
('1002', 'L002', 'base', 'Base Media', 'Marca A', 36.90, '2025-12-01', '11.222.333/0001-44'),
('1003', 'L003', 'base', 'Base Escura', 'Marca A', 37.00, '2025-12-01', '11.222.333/0001-44'),
('2001', 'L001', 'batom', 'Batom Nude', 'Marca B', 18.00, '2025-12-01', '11.222.333/0001-44'),
('2002', 'L002', 'batom', 'Batom Vermelho', 'Marca B', 19.00, '2025-12-01', '11.222.333/0001-44'),
('2003', 'L003', 'batom', 'Batom Rosa', 'Marca B', 19.50, '2025-12-01', '11.222.333/0001-44'),
('3001', 'L001', 'rimel', 'Rimel Volume', 'Marca C', 24.00, '2025-12-01', '11.222.333/0001-44'),
('3002', 'L002', 'rimel', 'Rimel Longo', 'Marca C', 25.00, '2025-12-01', '11.222.333/0001-44'),
('4001', 'L001', 'blush', 'Blush Rosado', 'Marca D', 22.00, '2025-12-01', '11.222.333/0001-44'),
('4002', 'L002', 'blush', 'Blush Coral', 'Marca D', 22.50, '2025-12-01', '11.222.333/0001-44');

INSERT INTO Estoque VALUES
('1001', 'L001', 15), ('1002', 'L002', 10), ('1003', 'L003', 12), ('2001', 'L001', 20),
('2002', 'L002', 18), ('2003', 'L003', 17), ('3001', 'L001', 25), ('3002', 'L002', 22),
('4001', 'L001', 14), ('4002', 'L002', 16);

-- Trigger para validar data de validade

DELIMITER $$
CREATE TRIGGER trg_validar_data_validade
BEFORE INSERT ON Produto
FOR EACH ROW
BEGIN
  IF NEW.data_validade <= CURDATE() THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'A data de validade deve ser maior que a data atual.';
  END IF;
END$$
DELIMITER ;

-- Vendas e itens vendidos

INSERT INTO Venda VALUES
('V001', '390.533.447-05', '865.443.027-53', NOW()),
('V002', '104.407.477-60', '865.443.027-53', NOW()),
('V003', '390.533.447-05', '865.443.027-53', NOW());

INSERT INTO Item_venda VALUES
('V001', '1001', 'L001', 2),
('V001', '3001', 'L001', 1),
('V002', '2002', 'L002', 1),
('V003', '3001', 'L001', 1);

-- Inserindo pedidos com IDs
INSERT INTO Pede_produto VALUES
('PED001', '1001', '11.222.333/0001-44', '078.379.601-90', 'L001', 50),
('PED002', '2001', '11.222.333/0001-44', '078.379.601-90', 'L001', 30),
('PED003', '3001', '11.222.333/0001-44', '078.379.601-90', 'L001', 25);

INSERT INTO Troca (id_troca, fk_Venda_id_venda_antiga, fk_Venda_id_venda_nova) VALUES
('T001', 'V001', 'V003');

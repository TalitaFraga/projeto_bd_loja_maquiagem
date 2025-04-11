create database modelo_fisico;

CREATE TABLE Pessoa (
    CPF VARCHAR(14) PRIMARY key unique not null,
    data_nasc DATE not null,
    nome VARCHAR(100) not null,
    rua VARCHAR(100) not null,
    cidade VARCHAR(50) not null,
    numero VARCHAR(10) not null,
    cep VARCHAR(10) not null,
    bairro VARCHAR(50) not null,
    telefone1 VARCHAR(15) not null,
    telefone2 VARCHAR(15),
    email VARCHAR(100) not null,
    RG VARCHAR(12) unique not null
);

CREATE TABLE Funcionário (
    fk_Pessoa_CPF VARCHAR(14)  unique not null,
    PRIMARY KEY (fk_Pessoa_CPF),
    FOREIGN KEY (fk_Pessoa_CPF) REFERENCES Pessoa(CPF)
);

CREATE TABLE Gerencia (
    Funcionário_A_fk_Pessoa_CPF VARCHAR(14) unique not null,
    Funcionário_B_fk_Pessoa_CPF VARCHAR(14) unique not null,
    PRIMARY KEY (Funcionário_A_fk_Pessoa_CPF, Funcionário_B_fk_Pessoa_CPF),
    FOREIGN KEY (Funcionário_A_fk_Pessoa_CPF) REFERENCES Funcionário(fk_Pessoa_CPF),
    FOREIGN KEY (Funcionário_B_fk_Pessoa_CPF) REFERENCES Funcionário(fk_Pessoa_CPF)
);


CREATE TABLE Diretor (
    fk_Funcionário_fk_Pessoa_CPF VARCHAR(14) unique not null,
    PRIMARY KEY (fk_Funcionário_fk_Pessoa_CPF),
    FOREIGN KEY (fk_Funcionário_fk_Pessoa_CPF) REFERENCES Funcionário(fk_Pessoa_CPF)
);

CREATE TABLE Estoquista (
    fk_Funcionário_fk_Pessoa_CPF VARCHAR(14) unique not null,
    PRIMARY KEY (fk_Funcionário_fk_Pessoa_CPF),
    FOREIGN KEY (fk_Funcionário_fk_Pessoa_CPF) REFERENCES Funcionário(fk_Pessoa_CPF)
);

CREATE TABLE Vendedor (
    fk_Funcionário_fk_Pessoa_CPF VARCHAR(14) unique not null,
    PRIMARY KEY (fk_Funcionário_fk_Pessoa_CPF),
    FOREIGN KEY (fk_Funcionário_fk_Pessoa_CPF) REFERENCES Funcionário(fk_Pessoa_CPF)
);

CREATE TABLE Cliente (
    fk_Pessoa_CPF VARCHAR(14) unique not null,
    PRIMARY KEY (fk_Pessoa_CPF),
    FOREIGN KEY (fk_Pessoa_CPF) REFERENCES Pessoa(CPF)
);

CREATE TABLE Fornecedor (
    CNPJ VARCHAR(18) PRIMARY key unique not null,
    nome VARCHAR(100) not null,
    telefone1 VARCHAR(15) not null,
    telefone2 VARCHAR(15)
);



CREATE TABLE Produto (
    codigo_barra VARCHAR(20) unique not null,
    lote_produto VARCHAR(20) not null,
    tipo_produto VARCHAR(50) not null,
    nome VARCHAR(100) not null,
    marca VARCHAR(50) not null,
    preco DECIMAL(10,2) not null,
    data_validade DATE not null,
    PRIMARY KEY (codigo_barra, lote_produto)
);

CREATE TABLE Estoque (
    fk_Produto_codigo_barra VARCHAR(20) unique not null,
    fk_Produto_lote_produto VARCHAR(20) unique not null,
    qtde_produto INT,
    PRIMARY KEY (fk_Produto_codigo_barra, fk_Produto_lote_produto),
    FOREIGN KEY (fk_Produto_codigo_barra, fk_Produto_lote_produto) REFERENCES Produto(codigo_barra, lote_produto)
);

CREATE TABLE venda (
    id_venda VARCHAR(36) primary key unique not null,
    Cliente_fk_Pessoa_CPF VARCHAR(14) unique not null,
    Produto_codigo_barra VARCHAR(20) unique not null,
    Produto_lote_produto VARCHAR(20) unique not null,
    Vendedor_fk_Funcionário_fk_Pessoa_CPF VARCHAR(14) unique not null,
    datahora_venda DATETIME not null,
    qtde_produto INT,
    FOREIGN KEY (Cliente_fk_Pessoa_CPF) REFERENCES Cliente(fk_Pessoa_CPF),
    FOREIGN KEY (Produto_codigo_barra, Produto_lote_produto) REFERENCES Produto(codigo_barra, lote_produto),
    FOREIGN KEY (Vendedor_fk_Funcionário_fk_Pessoa_CPF) REFERENCES Vendedor(fk_Funcionário_fk_Pessoa_CPF)
);

CREATE TABLE pede_produto (
    Produto_codigo_barra VARCHAR(20) unique not null,
    Fornecedor_CNPJ VARCHAR(18) unique not null,
    Diretor_fk_Funcionário_fk_Pessoa_CPF VARCHAR(14) unique not null,
    Produto_lote_produto VARCHAR(20) unique not null,
    PRIMARY KEY (Produto_codigo_barra, Fornecedor_CNPJ, Diretor_fk_Funcionário_fk_Pessoa_CPF),
    FOREIGN KEY (Produto_codigo_barra, Produto_lote_produto) REFERENCES Produto(codigo_barra, lote_produto),
    FOREIGN KEY (Fornecedor_CNPJ) REFERENCES Fornecedor(CNPJ),
    FOREIGN KEY (Diretor_fk_Funcionário_fk_Pessoa_CPF) REFERENCES Diretor(fk_Funcionário_fk_Pessoa_CPF)
);

alter table produto add column fk_fornecedor_CNPJ varchar(18) unique not null;

alter table produto add constraint foreign key (fk_fornecedor_CNPJ) references fornecedor(CNPJ);
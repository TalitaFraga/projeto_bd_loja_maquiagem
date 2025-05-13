# Estágio de build
FROM maven:3.8-openjdk-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src

# Adicionar manualmente as classes Pessoa, Funcionario, etc. que estão faltando
RUN mkdir -p /app/src/main/java/br/com/loja/entities/
RUN echo 'package br.com.loja.entities; import lombok.AllArgsConstructor; import lombok.Getter; import lombok.NoArgsConstructor; import lombok.Setter; import java.time.LocalDate; @Getter @Setter @NoArgsConstructor @AllArgsConstructor public class Pessoa { private String cpf; private LocalDate dataNasc; private String nome; private String rua; private String cidade; private String numero; private String cep; private String bairro; private String telefone1; private String telefone2; private String email; private String rg; }' > /app/src/main/java/br/com/loja/entities/Pessoa.java
RUN echo 'package br.com.loja.entities; import lombok.Getter; import lombok.NoArgsConstructor; import lombok.Setter; @Getter @Setter @NoArgsConstructor public class Funcionario extends Pessoa { }' > /app/src/main/java/br/com/loja/entities/Funcionario.java
RUN echo 'package br.com.loja.entities; import lombok.Getter; import lombok.NoArgsConstructor; import lombok.Setter; @Getter @Setter @NoArgsConstructor public class Cliente extends Pessoa { }' > /app/src/main/java/br/com/loja/entities/Cliente.java
RUN echo 'package br.com.loja.entities; import lombok.Getter; import lombok.NoArgsConstructor; import lombok.Setter; @Getter @Setter @NoArgsConstructor public class Vendedor extends Funcionario { }' > /app/src/main/java/br/com/loja/entities/Vendedor.java
RUN echo 'package br.com.loja.entities; import lombok.Getter; import lombok.NoArgsConstructor; import lombok.Setter; @Getter @Setter @NoArgsConstructor public class Diretor extends Funcionario { }' > /app/src/main/java/br/com/loja/entities/Diretor.java
RUN echo 'package br.com.loja.entities; import lombok.Getter; import lombok.NoArgsConstructor; import lombok.Setter; @Getter @Setter @NoArgsConstructor public class Estoquista extends Funcionario { }' > /app/src/main/java/br/com/loja/entities/Estoquista.java

# Adicionar a classe PedeProduto atualizada com o campo id_pedido
RUN echo 'package br.com.loja.entities; import lombok.AllArgsConstructor; import lombok.Getter; import lombok.NoArgsConstructor; import lombok.Setter; @Getter @Setter @NoArgsConstructor @AllArgsConstructor public class PedeProduto { private String id_pedido; private String fk_Produto_codigo_barra; private String fk_Produto_lote_produto; private String fk_Fornecedor_CNPJ; private String fk_Diretor_fk_Funcionario_fk_Pessoa_CPF; private Integer qtde_produto; }' > /app/src/main/java/br/com/loja/entities/PedeProduto.java
# Compilar o projeto
RUN mvn clean package -DskipTests

# Estágio final
FROM openjdk:17-jdk-slim
WORKDIR /app
# Expõe a porta do Spring Boot
EXPOSE 8080
COPY --from=build /app/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
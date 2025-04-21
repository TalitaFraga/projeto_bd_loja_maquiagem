# Usa imagem do Java
FROM openjdk:17-jdk-slim

# Cria diretório dentro do container
WORKDIR /app

# Copia o .jar e renomeia como app.jar
COPY target/loja-0.0.1-SNAPSHOT.jar app.jar

# Expõe a porta do Spring Boot
EXPOSE 8080

# Comando para rodar o app
ENTRYPOINT ["java", "-jar", "app.jar"]
"-b"]
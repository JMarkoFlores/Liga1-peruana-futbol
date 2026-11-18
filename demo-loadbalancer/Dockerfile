# syntax=docker/dockerfile:1
FROM eclipse-temurin:21-jdk-alpine AS build
ARG MODULE
ARG JAR_FILE
WORKDIR /workspace
COPY ${MODULE}/ ./
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw
RUN --mount=type=cache,id=liga1-maven21,target=/root/.m2,sharing=locked \
    ./mvnw -B -ntp -DskipTests package && cp "target/${JAR_FILE}" /application.jar

FROM eclipse-temurin:21-jre-alpine AS runtime
RUN apk add --no-cache curl \
    && addgroup -g 10001 app && adduser -D -u 10001 -G app app
WORKDIR /app
COPY --from=build --chown=app:app /application.jar /app/app.jar
USER app
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

# 📘 Aula 1 — Setup do Projeto

## 🎯 Objetivo

Criar a base do projeto NestJS e subir a API rodando com documentação Swagger.

---

## Requisitos

- **Node.js 18+** (LTS recomendado)
- **NestJS CLI**

> ⚠️ Importante: o código apresentado tem **base educacional**. Em produção, ajustes extras seriam necessários (variáveis de ambiente, validações, tratamento de erros, etc).

---

## 🧠 Conceitos

- **NestJS**: Framework Node.js progressivo baseado em TypeScript
- **Arquitetura baseada em módulos**: Organização modular e escalável
- **Entry point (`main.ts`)**: Ponto de entrada da aplicação
- **Injeção de dependência**: Padrão de design para desacoplamento
- **Swagger**: Documentação automática de APIs REST

---

## 💻 Passo a Passo

### 1. Instalar o NestJS CLI globalmente

```bash
npm install -g @nestjs/cli
```

### 2. Criar o projeto

```bash
nest new pony-collection-api
```

Escolha o gerenciador de pacotes (npm ou yarn).

### 3. Entrar na pasta do projeto

```bash
cd pony-collection-api
```

### 4. Instalar dependência do Swagger

```bash
npm install @nestjs/swagger
```

### 5. Configurar o Swagger

Abra o arquivo `src/main.ts` e adicione a configuração do Swagger:

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Pony Collection API')
    .setDescription('API para gerenciar coleção de poneis')
    .setVersion('1.0')
    .addBearerAuth() // Suporte a JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

### 6. Iniciar o servidor em modo desenvolvimento

```bash
npm run start:dev
```

A API estará em:
- **API**: http://localhost:3000
- **Swagger**: http://localhost:3000/swagger

---

## 📂 Estrutura inicial

```text
pony-collection-api/
├── src/
│   ├── app.controller.spec.ts    # Testes do controller
│   ├── app.controller.ts         # Controller principal
│   ├── app.module.ts             # Módulo raiz
│   ├── app.service.ts            # Service principal
│   └── main.ts                   # Entry point + Swagger
├── test/                         # Testes E2E
├── package.json
├── tsconfig.json
└── nest-cli.json
```

---

## 🔍 Entendendo os arquivos

### `main.ts`
- **Função**: Inicializa a aplicação NestJS
- **Responsabilidade**: Configurar middleware, CORS, Swagger, porta

### `app.module.ts`
- **Função**: Módulo raiz que importa todos os outros módulos
- **Responsabilidade**: Centralizar imports de módulos, controllers e providers

### `app.controller.ts`
- **Função**: Controller de exemplo
- **Responsabilidade**: Definir rotas HTTP

### `app.service.ts`
- **Função**: Service de exemplo
- **Responsabilidade**: Lógica de negócio

---

## ✅ Resultado

✔️ API rodando em http://localhost:3000  
✔️ Swagger disponível em http://localhost:3000/swagger  
✔️ Hot reload funcionando (mudanças refletem automaticamente)

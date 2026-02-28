# Apresentação da Arquitetura 🏗

## Índice

1. 🏗️ Arquitetura geral do sistema
2. 📐 Diagrama e modelagem das entidades
3. 🧱 Estrutura de pastas (Backend)
4. 📚 Sumário do Curso de Backend

---

## 1️⃣ Arquitetura Geral do Sistema

```text
    [ Angular SPA ]
          |
          | HTTP (JWT)
          v
    [ NestJS API ]
          |
          v
    [ SQLite Database ]
```

### Responsabilidades

#### Frontend (Angular)

* Autenticação (login/logout)
* Guards de rota
* Listagem de pôneis
* Sidesheet de detalhes
* UI (Figma)

#### API (NestJS + SQLite)

* Centraliza autenticação
* Gerencia JWT
* Valida permissões
* Regras de negócio
* Persistência de dados
* CRUD completo
* Relacionamentos

---

## 2️⃣ Modelagem das Entidades (Domínio)

### 🧑 User

```ts
User
- id (uuid)
- name (string)
- email (string, unique)
- password (string, hash bcrypt)
- createdAt (datetime)
```

### 🦄 Pony

```ts
Pony
- id (uuid)
- name (string)
- isFavorite (boolean)
- element (string) 
- personality (string)
- talent (string)
- summary (text)
- imageUrl (string)
- createdAt (datetime)
```

## 3️⃣ Estrutura de Pastas — Backend (NestJS)

```text
api/
├── src/
│   ├── main.ts              # Entry point + Swagger
│   ├── app.module.ts        # Módulo raiz
│   ├── app.controller.ts
│   ├── app.service.ts
│   │
│   ├── database/
│   │   ├── sqlite.config.ts      # Configuração TypeORM
│   │   ├── data-source.ts        # DataSource para migrations
│   │   └── migrations/           # Migrations do banco
│   │       └── *-InitialSchema.ts
│   │
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── jwt.strategy.ts
│   │   └── guards/
│   │       └── jwt-auth.guard.ts
│   │
│   ├── users/
│   │   ├── dto/
│   │   │   └── create-user.dto.ts
│   │   ├── user.entity.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   │
│   ├── ponies/
│   │   ├── dto/
│   │   │   ├── create-pony.dto.ts
│   │   │   └── update-pony.dto.ts
│   │   ├── pony.entity.ts
│   │   ├── ponies.controller.ts
│   │   ├── ponies.service.ts
│   │   └── ponies.module.ts
│   │
├── database.sqlite          # Banco SQLite
├── package.json
├── tsconfig.json
└── nest-cli.json
```

---

## 4️⃣ Fluxo de Desenvolvimento

### Ordem de Implementação

1. **Setup inicial** - Criar projeto NestJS
2. **Database** - Configurar SQLite + TypeORM
3. **Entidades** - Criar User e Pony
4. **Migrations** - Gerar e executar migrations
5. **Users** - CRUD básico + registro
6. **Auth** - Login + JWT
7. **Guards** - Proteção de rotas
8. **Ponies** - CRUD completo
9. **Swagger** - Documentação da API

### Tecnologias e Bibliotecas

- **@nestjs/core** - Framework base
- **@nestjs/typeorm** - Integração ORM
- **typeorm** - ORM para banco de dados
- **sqlite3** - Driver SQLite
- **@nestjs/jwt** - Autenticação JWT
- **@nestjs/passport** - Estratégias de autenticação
- **bcrypt** - Hash de senhas
- **@nestjs/swagger** - Documentação automática
<!-- - **class-validator** - Validação de DTOs -->
- **class-transformer** - Transformação de dados

---

### 📦 Versão do Node.js

> **⚠️ Importante:** Este projeto requer Node.js **v24.13.1** (ou compatível).
> 
> **Recomendação:** Crie um arquivo `.nvmrc` na raiz do projeto `/api` com o conteúdo:
> ```
> v20.18.1
> ```
> 
> Se você usa [nvm](https://github.com/nvm-sh/nvm), execute:
> ```bash
> cd api
> nvm use
> ```

---

## 5️⃣ Endpoints da API

### Autenticação (Públicas)

```
POST /users/register     - Cadastro de usuário
POST /auth/login         - Login (retorna JWT)
```

### Usuários (Protegidas)

```
GET  /users              - Listar usuários
GET  /users/:id          - Detalhe do usuário
```

### Ponies (Protegidas)

```
GET    /ponies           - Listar todos os ponies
GET    /ponies/:id       - Detalhe de um pony
POST   /ponies           - Criar pony (admin)
PUT    /ponies/:id       - Atualizar pony (admin)
DELETE /ponies/:id       - Remover pony (admin)
```

---

## 6️⃣ Swagger / Documentação

Acessível em: **http://localhost:3000/swagger**

Permite testar todos os endpoints diretamente pelo navegador, com suporte a autenticação Bearer Token.

---

# Backend com NestJS + SQLite (Sumário)

### 📘 Aula 1 — Setup do Projeto

**Objetivo:** Criar a base do backend

* Criar projeto NestJS
* Estrutura inicial
* Configurar Swagger
* Explicar arquitetura de módulos

✔️ Resultado: API rodando com Swagger

---

### 📘 Aula 2 — Banco de Dados e Entidades

**Objetivo:** Configurar SQLite e criar o domínio da aplicação

* Configurar SQLite + TypeORM
* Criar entidade User
* Criar entidade Pony
* Sistema de Migrations

✔️ Resultado: Banco modelado e migrations configuradas

---

### 📘 Aula 3 — Cadastro de Usuários

**Objetivo:** Implementar registro de usuários

* Cadastro de usuário
* Hash de senha com bcrypt
* DTOs e validação

✔️ Resultado: Cadastro funcional

---

### 📘 Aula 4 — Autenticação JWT

**Objetivo:** Autenticar usuários

* Login
* Geração de JWT
* Conceitos de autenticação stateless

✔️ Resultado: Login funcional com JWT

---

### 📘 Aula 5 — Guards e Segurança

**Objetivo:** Proteger a API

* JWT Strategy
* AuthGuard
* Rotas públicas vs privadas
* Contexto do usuário

✔️ Resultado: API segura

---

### 📘 Aula 6 — CRUD de Ponies

**Objetivo:** Gerenciar personagens

* Criar Pony
* Listar todos
* Detalhar por ID
* Atualizar
* Remover

✔️ Resultado: CRUD completo

---

### 📘 Aula 7 — Upload de Imagens

**Objetivo:** Implementar upload de arquivos com Multer

**Parte A: Configuração e Endpoints**
* Instalar e configurar Multer
* Criar pasta uploads e servir arquivos estáticos
* Implementar endpoint POST /ponies/:id/upload
* Validação de tipos de arquivo (jpg, png, webp)
* Limitar tamanho de arquivo (5MB)
* Atualizar imageUrl no banco

**Arquivo:** [07a-upload-imagens.md](07a-upload-imagens.md)

**Parte B: Testes e Melhorias**
* Servir arquivos estáticos
* Testar upload via Swagger
* Testar upload via cURL
* Melhorias: validação, erro handling
* Segurança e boas práticas
* Documentação Swagger

**Arquivo:** [07b-upload-imagens.md](07b-upload-imagens.md)

✔️ Resultado: Sistema de upload completo e seguro

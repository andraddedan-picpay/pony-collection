# Apresentação da Arquitetura 🏗

## Índice

1. 🏗️ Arquitetura geral do sistema
2. 📐 Diagrama e modelagem das entidades
3. 🧱 Estrutura de pastas (Backend)

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
* Favoritos
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
- element (string) 
- personality (string)
- talent (string)
- summary (text)
- imageUrl (string)
- createdAt (datetime)
```

### ⭐ Favorite

```ts
Favorite
- id (uuid)
- userId (uuid, FK -> User)
- ponyId (uuid, FK -> Pony)
- createdAt (datetime)
```

### 🔗 Relacionamentos

* User 1:N Favorite
* Pony 1:N Favorite
* User N:N Pony (via Favorite)

---

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
│   └── favorites/
│       ├── favorite.entity.ts
│       ├── favorites.controller.ts
│       ├── favorites.service.ts
│       └── favorites.module.ts
│
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
3. **Entidades** - Criar User, Pony, Favorite
4. **Migrations** - Gerar e executar migrations
5. **Users** - CRUD básico + registro
6. **Auth** - Login + JWT
7. **Guards** - Proteção de rotas
8. **Ponies** - CRUD completo
9. **Favorites** - Relacionamento User x Pony
10. **Swagger** - Documentação da API

### Tecnologias e Bibliotecas

- **@nestjs/core** - Framework base
- **@nestjs/typeorm** - Integração ORM
- **typeorm** - ORM para banco de dados
- **sqlite3** - Driver SQLite
- **@nestjs/jwt** - Autenticação JWT
- **@nestjs/passport** - Estratégias de autenticação
- **bcrypt** - Hash de senhas
- **@nestjs/swagger** - Documentação automática
- **class-validator** - Validação de DTOs
- **class-transformer** - Transformação de dados

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

### Favoritos (Protegidas)

```
GET    /favorites        - Listar favoritos do usuário logado
POST   /favorites/:ponyId - Favoritar um pony
DELETE /favorites/:ponyId - Desfavoritar um pony
```

---

## 6️⃣ Swagger / Documentação

Acessível em: **http://localhost:3000/swagger**

Permite testar todos os endpoints diretamente pelo navegador, com suporte a autenticação Bearer Token.
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   └── user.entity.ts
│
├── ponies/
│   ├── ponies.controller.ts
│   ├── ponies.service.ts
│   ├── ponies.module.ts
│   └── pony.entity.ts
│
├── favorites/
│   ├── favorites.controller.ts
│   ├── favorites.service.ts
│   ├── favorites.module.ts
│   └── favorite.entity.ts
│
├── database/
│   └── sqlite.config.ts
│
├── app.module.ts
└── main.ts
```
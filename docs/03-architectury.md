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
* UI (Figma)

#### API (NestJS + SQLite)

* Centraliza autenticação
* Gerencia JWT
* Pode validar permissões
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
- name
- email
- password
- createdAt
```

### 🦄 Pony

```ts
Pony
- id (uuid)
- name
- description
- imageUrl
- createdAt
```

### ⭐ Favorite

```ts
Favorite
- id (uuid)
- userId
- ponyId
- createdAt
```

### 🔗 Relacionamentos

* User 1:N Favorite
* Pony 1:N Favorite
* User N:N Pony (via Favorite)

---

## 3️⃣ Estrutura de Pastas — Backend (NestJS)

```text
src/
├── auth/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── jwt.strategy.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│
├── users/
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
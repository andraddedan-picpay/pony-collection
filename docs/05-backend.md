# Pony Collection API 🦄

## Requisitos

- **NestJS 10+**
- **TypeORM + SQLite**
- **JWT**
- **bcrypt**
- **uuid**

> ⚠️ Importante: o código apresentado tem **base educacional**. Em produção, ajustes extras seriam necessários.

---

# 📘 Aula 1 — Setup do Projeto

## 🎯 Objetivo

Criar a base do projeto NestJS e subir a API rodando.

---

## 🧠 Conceitos

- O que é NestJS
- Arquitetura baseada em módulos
- Entry point (`main.ts`)
- Injeção de dependência

---

## 💻 Comandos

```bash
npm i -g @nestjs/cli

nest new pony-collection-api
cd pony-collection-api
npm run start:dev
```

A API estará em:

```
http://localhost:3000
```

---

## 📂 Estrutura inicial

```text
src/
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts
```

## Configurar o Swagger

No arquivo `main.ts`

```ts
const config = new DocumentBuilder()
  .setTitle("Pony Collection API")
  .setDescription("API para gerenciar coleção de poneis")
  .setVersion("1.0")
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup("swagger", app, document);
```

---

## ✅ Resultado

✔️ API rodando
✔️ Ambiente de desenvolvimento configurado

---

# 📘 Aula 2 — Configurando SQLite + TypeORM

## 🎯 Objetivo

Configurar persistência com SQLite.

---

## 🧠 Conceitos

- ORM
- Entidades
- DataSource
- Sincronização de schema

---

## 📦 Dependências

```bash
npm install @nestjs/typeorm typeorm sqlite3
```

---

## 📂 Criar pasta de database

```text
src/database/sqlite.config.ts
```

```ts
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const sqliteConfig: TypeOrmModuleOptions = {
  type: "sqlite",
  database: "database.sqlite",
  autoLoadEntities: true,
  synchronize: true, // apenas para o curso
};
```

> autoLoadEntities: true → não precisa listar manualmente
> synchronize: true → cria tabelas automaticamente (⚠️ só em dev)

---

## 🔗 Importar no `app.module.ts`

```ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { sqliteConfig } from "./database/sqlite.config";

@Module({
  imports: [TypeOrmModule.forRoot(sqliteConfig)],
})
export class AppModule {}
```

---

## ✅ Resultado

✔️ SQLite conectado
✔️ ORM funcionando

---

# 📘 Aula 3 — Modelagem das Entidades

## 🎯 Objetivo

Criar o domínio da aplicação.

---

## 🧠 Conceitos

- Módulos
- Entidades
- Relacionamentos
- UUID
- Decorators do TypeORM

---

## Módulos

A seguir é apresentada a arquitetura esperada para a criação dos módulos

```text
src/
├── auth/
│
├── users/
│   ├── dto/
│   │   └── create-user.dto.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   └── user.entity.ts
│
├── ponies/
│   ├── dto/
│   ├── ponies.controller.ts
│   ├── ponies.service.ts
│   ├── ponies.module.ts
│   └── pony.entity.ts
│
├── favorites/
│   ├── dto/
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

Configuração por módulo.

```ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm/dist/typeorm.module";
import { Pony } from "./pony.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Pony])],
  controllers: [PoniesController],
  providers: [PoniesService],
})
export class PoniesModule {}
```

Comando para gerar os módulos

```shell
nest generate module <name>
# or
nest g mo <name>
```

Comando para gerar os controllers

```shell
nest generate controller <name>
# or
nest g co <name>
```

Comando para gerar os serviços

```shell
nest generate service <name>
# or
nest g s <name>
```

> ref: https://docs.nestjs.com/cli/usages

---

## 🧑 User Entity

```ts
@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

---

## 🦄 Pony Entity

```ts
@Entity("ponies")
export class Pony {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  element: string;

  @Column()
  personality: string;

  @Column()
  talent: string;

  @Column({ type: "text" })
  summary: string;

  @Column()
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

---

## ⭐ Favorite Entity

```ts
@Entity("favorites")
export class Favorite {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Pony)
  pony: Pony;

  @CreateDateColumn()
  createdAt: Date;
}
```

---

## ✅ Resultado

✔️ Banco criado automaticamente
✔️ Relacionamentos definidos

---

# 📘 Aula 4 — Cadastro de Usuário e Hash de Senha

## 🎯 Objetivo

Criar usuários com senha segura.

---

## 🧠 Conceitos

- DTO
- bcrypt
- Service vs Controller

---

## 📦 Dependência

```bash
npm install bcrypt
npm install -D @types/bcrypt
```

---

## 📄 DTO

```ts
export class CreateUserDto {
  name: string;
  email: string;
  password: string;
}
```

---

## ⚙️ Service

```ts
async create(dto: CreateUserDto) {
  const hash = await bcrypt.hash(dto.password, 10);

  const user = this.repo.create({
    ...dto,
    password: hash,
  });

  return this.repo.save(user);
}
```

---

## 🌐 Controller

```ts
@Post('register')
register(@Body() dto: CreateUserDto) {
  return this.usersService.create(dto);
}
```

---

## ✅ Resultado

✔️ Cadastro funcionando
✔️ Senha criptografada
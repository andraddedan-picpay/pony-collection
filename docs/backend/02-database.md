# 📘 Aula 2 — Banco de Dados e Entidades

## 🎯 Objetivo

Configurar persistência de dados com SQLite usando TypeORM e criar as entidades do domínio da aplicação.

---

## 🧠 Conceitos

- **ORM (Object-Relational Mapping)**: Mapeia objetos para tabelas do banco
- **TypeORM**: ORM popular para TypeScript
- **SQLite**: Banco de dados leve baseado em arquivo
- **Entidades**: Classes TypeScript que representam tabelas
- **Migrations**: Controle de versão do schema do banco
- **DataSource**: Configuração de conexão com o banco
- **Decorators do TypeORM**: `@Entity`, `@Column`, `@PrimaryGeneratedColumn`, etc.
- **UUID**: Identificador único universal
- **Módulos NestJS**: Organização em features isoladas
- **DTO (Data Transfer Object)**: Objeto para validação e transferência de dados

---

## 📦 Dependências

```bash
npm install @nestjs/typeorm typeorm sqlite3
```

---

## 📂 Estrutura de Database

Crie a pasta e arquivos de configuração:

```bash
mkdir src/database
touch src/database/sqlite.config.ts
touch src/database/data-source.ts
mkdir src/database/migrations
```

---

## 📝 Configuração do TypeORM para o NestJS

Crie o arquivo `src/database/sqlite.config.ts`:

```ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const sqliteConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'database.sqlite',
  autoLoadEntities: true, // Carrega entidades automaticamente
  synchronize: false,     // Usar migrations em produção
  migrations: ['dist/database/migrations/*.js'],
  migrationsRun: true,    // Executa migrations ao iniciar
};
```

> **⚠️ Importante sobre `synchronize`:**
> - `true`: TypeORM cria/atualiza tabelas automaticamente (APENAS para desenvolvimento/estudo)
> - `false`: Usar migrations para controlar mudanças (RECOMENDADO para produção)

---

## 📝 Configuração do DataSource para Migrations

Crie o arquivo `src/database/data-source.ts`:

```ts
import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import { Pony } from '../ponies/pony.entity';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  entities: [User, Pony],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true, // Log de queries SQL
});
```

> Este arquivo é usado pelo CLI do TypeORM para gerar e executar migrations.

---

## 🔗 Importar no `app.module.ts`

Edite o arquivo `src/app.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { sqliteConfig } from './database/sqlite.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(sqliteConfig),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

---

## 🛠️ Adicionar Scripts de Migration ao package.json

Edite `package.json` e adicione os scripts:

```json
{
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "typeorm": "ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js -d src/database/data-source.ts",
    "migration:generate": "npm run typeorm -- migration:generate",
    "migration:create": "npm run typeorm -- migration:create",
    "migration:run": "npm run typeorm -- migration:run",
    "migration:revert": "npm run typeorm -- migration:revert"
  }
}
```

---

## 📚 Comandos de Migration

```bash
# Gerar migration automaticamente (baseada nas entidades)
npm run migration:generate -- src/database/migrations/InitialSchema

# Criar migration vazia (para SQL customizado)
npm run migration:create -- src/database/migrations/NomeDaMigration

# Executar migrations pendentes
npm run migration:run

# Reverter última migration
npm run migration:revert
```

---

## 🏗️ Arquitetura de Módulos

Vamos criar 2 módulos principais:

```text
src/
├── users/      # Gerenciamento de usuários
├── ponies/     # Gerenciamento de personagens
```

## Comando para gerar os módulos

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

## 👤 Módulo Users

### 1. Gerar o módulo, controller e service

```bash
nest generate module users
nest generate controller users
nest generate service users
```

### 2. Criar a pasta DTO

```bash
mkdir src/users/dto
touch src/users/dto/create-user.dto.ts
```

### 3. Criar a entidade User

Crie o arquivo `src/users/user.entity.ts`:

```ts
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
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

### 4. Criar o DTO de criação

Crie o arquivo `src/users/dto/create-user.dto.ts`:

```ts
export class CreateUserDto {
  name: string;
  email: string;
  password: string;
}
```

### 5. Configurar o módulo

Edite `src/users/users.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Exportar para uso em outros módulos
})
export class UsersModule {}
```

---

## 🦄 Módulo Ponies

### 1. Gerar o módulo

```bash
nest generate module ponies
nest generate controller ponies
nest generate service ponies
```

### 2. Criar a entidade Pony

Crie o arquivo `src/ponies/pony.entity.ts`:

```ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('ponies')
export class Pony {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  element: string; // Ex: Magic, Loyalty, Kindness

  @Column()
  personality: string;

  @Column()
  talent: string;

  @Column({ type: 'text' })
  summary: string;

  @Column()
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

### 3. Configurar o módulo

Edite `src/ponies/ponies.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pony } from './pony.entity';
import { PoniesController } from './ponies.controller';
import { PoniesService } from './ponies.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pony])],
  controllers: [PoniesController],
  providers: [PoniesService],
})
export class PoniesModule {}
```

---

## 🔄 Atualizar o AppModule

Edite `src/app.module.ts` para importar os novos módulos:

```ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { sqliteConfig } from './database/sqlite.config';
import { UsersModule } from './users/users.module';
import { PoniesModule } from './ponies/ponies.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(sqliteConfig),
    UsersModule,
    PoniesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

---

## 🚀 Gerar e Executar Migrations

### 1. Compilar o projeto

```bash
npm run build
```

### 2. Gerar migration inicial

```bash
npm run migration:generate -- src/database/migrations/InitialSchema
```

Este comando irá:
- Analisar suas entidades
- Comparar com o banco atual (vazio)
- Gerar automaticamente o SQL necessário
- Criar um arquivo em `src/database/migrations/`

### 3. Executar a migration

```bash
npm run migration:run
```

Isso criará as tabelas `users` e `ponies`.

### 4. Verificar o banco

Um arquivo `database.sqlite` será criado na raiz do projeto. Você pode visualizá-lo com extensões do VS Code como "SQLite Viewer".

---

## ✅ Resultado

✔️ SQLite configurado  
✔️ TypeORM conectado  
✔️ Sistema de migrations preparado  
✔️ 2 entidades criadas (User, Pony)  
✔️ Migrations geradas e executadas  
✔️ Banco de dados criado com todas as tabelas  
✔️ Módulos organizados e desacoplados

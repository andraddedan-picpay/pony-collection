# 📘 Aula 2 — Banco de Dados e Entidades

## 🎯 Objetivo

Configurar persistência de dados com SQLite usando TypeORM e criar as entidades do domínio da aplicação.

---

## 🎯 O que vamos construir

- **Configuração do SQLite**: Banco de dados leve baseado em arquivo
- **TypeORM**: ORM para mapear objetos TypeScript em tabelas SQL
- **Sistema de Migrations**: Controle de versão do schema do banco
- **Entidade User**: Representa usuários da aplicação
- **Entidade Pony**: Representa os personagens
- **DTOs com Swagger**: Documentação automática da API
- **Módulos NestJS**: Organização em features isoladas

💡 **Próxima aula**: Implementaremos o cadastro de usuários com hash bcrypt.

---

## 📋 Conceitos Importantes

### ORM (Object-Relational Mapping)

Um **ORM** é uma técnica que permite manipular banco de dados usando objetos ao invés de SQL diretamente:

```typescript
// ❌ SQL puro (sem tipagem, propenso a erros)
db.query('SELECT * FROM users WHERE email = ?', [email])

// ✅ TypeORM (tipado, seguro, orientado a objetos)
userRepository.findOne({ where: { email } })
```

**Vantagens do ORM:**
- ✅ **Type-safe**: TypeScript garante tipos corretos
- ✅ **Produtividade**: Menos código, mais legível
- ✅ **Independência**: Funciona com MySQL, PostgreSQL, SQLite, etc
- ✅ **Migrations**: Controle de versão do schema
- ✅ **Relacionamentos**: Fácil gerenciar joins e foreign keys

### TypeORM vs. Outros ORMs

| Característica | TypeORM | Prisma | Sequelize |
|----------------|---------|--------|-----------|
| TypeScript nativo | ✅ | ✅ | ❌ (tem tipos) |
| Decorators | ✅ `@Entity()` | ❌ (schema próprio) | ✅ |
| Query Builder | ✅ | ❌ (client próprio) | ✅ |
| Migrations | ✅ Auto + Manual | ✅ Auto | ✅ Manual |
| Active Record | ✅ | ❌ | ✅ |

### SQLite: Por que usar?

**SQLite** é um banco de dados serverless armazenado em um único arquivo:

```
api/
├── database.sqlite  ← Arquivo único com todo o banco
├── src/
└── package.json
```

**Quando usar SQLite:**
- ✅ Desenvolvimento e testes locais
- ✅ Aplicações pequenas/médias
- ✅ Protótipos e estudos
- ✅ Apps mobile/desktop

**Quando NÃO usar:**
- ❌ Alta concorrência (muitas escritas simultâneas)
- ❌ Aplicações distribuídas
- ❌ Grandes volumes de dados (> 1GB)

> **💡 Dica**: Em produção, migre para PostgreSQL ou MySQL mantendo o mesmo código TypeORM!

### Migrations: Controle de Versão do Banco

**Migrations** são como um "Git para o banco de dados":

```typescript
// Migration gerada automaticamente
export class InitialSchema {
    async up(queryRunner) {
        // ⬆️ Criar tabelas, adicionar colunas
        await queryRunner.query(`CREATE TABLE "users" ...`)
    }
    
    async down(queryRunner) {
        // ⬇️ Reverter mudanças
        await queryRunner.query(`DROP TABLE "users"`)
    }
}
```

**Por que usar migrations?**
- ✅ **Rastreabilidade**: Histórico de mudanças no schema
- ✅ **Reversível**: Pode desfazer mudanças (`migration:revert`)
- ✅ **Colaboração**: Time sincronizado com mesmo schema
- ✅ **Deploy seguro**: Aplicar mudanças em produção de forma controlada

**Synchronize vs. Migrations:**

| `synchronize: true` | Migrations |
|---------------------|------------|
| ❌ Auto-cria/atualiza tabelas | ✅ Controle manual do schema |
| ❌ Pode perder dados | ✅ Seguro, reversível |
| ⚠️ Apenas desenvolvimento | ✅ Produção e desenvolvimento |
| ✅ Rápido para prototipar | ⏱️ Requer gerar migrations |

### Entidades: Mapeamento Objeto-Relacional

**Entidades** são classes TypeScript que representam tabelas do banco:

```typescript
@Entity('users')  // ← Nome da tabela
export class User {
    @PrimaryGeneratedColumn('uuid')  // ← Chave primária (UUID)
    id: string;
    
    @Column()  // ← Coluna simples
    name: string;
    
    @Column({ unique: true })  // ← Coluna com constraint
    email: string;
    
    @CreateDateColumn()  // ← Timestamp automático
    createdAt: Date;
}
```

**Decorators principais:**
- `@Entity()`: Define que é uma tabela
- `@PrimaryGeneratedColumn()`: Chave primária auto-gerada
- `@Column()`: Coluna normal
- `@CreateDateColumn()`: Timestamp de criação (automático)
- `@UpdateDateColumn()`: Timestamp de atualização (automático)

### UUID vs. Auto-increment

| Auto-increment | UUID |
|----------------|------|
| `1, 2, 3, 4...` | `550e8400-e29b-41d4-a716...` |
| ⚠️ Previsível | ✅ Imprevisível |
| ✅ Menor espaço | ❌ 36 caracteres |
| ❌ Conflito em merge | ✅ Único globalmente |
| ✅ Sequencial | ❌ Aleatório |

**Use UUID quando:**
- ✅ APIs públicas (não expor quantidade de registros)
- ✅ Sistemas distribuídos
- ✅ Segurança (IDs não previsíveis)

### DTOs e Swagger

**DTOs** (Data Transfer Objects) definem a estrutura de dados da API:

```typescript
export class CreateUserDto {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'john@example.com'
  })
  email: string;
}
```

**Por que usar DTOs?**
- ✅ **Documentação automática**: Swagger lê os decorators
- ✅ **Validação**: `class-validator` valida os dados
- ✅ **Type-safety**: TypeScript garante tipos
- ✅ **Separação de responsabilidades**: DTO ≠ Entity

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

### 📝 Explicação da Configuração

**Propriedades importantes:**

```typescript
type: 'sqlite'  // Tipo do banco (pode ser 'postgres', 'mysql', etc)
```
- Define qual driver usar
- Fácil migrar para outro banco depois

```typescript
database: 'database.sqlite'  // Nome do arquivo do banco
```
- SQLite cria um arquivo único na raiz do projeto
- Em produção com Postgres seria: `host`, `port`, `username`, `password`

```typescript
autoLoadEntities: true  // Carrega entidades automaticamente
```
- ✅ **Praticidade**: Não precisa listar todas as entidades manualmente
- ✅ **DRY**: Entidade registrada no módulo já é carregada

```typescript
synchronize: false  // ⚠️ IMPORTANTE!
```
- `true` = TypeORM cria/atualiza tabelas automaticamente (**PERIGO em produção!**)
- `false` = Usar migrations (controle total, seguro)

```typescript
migrations: ['dist/database/migrations/*.js']  // Onde estão as migrations compiladas
migrationsRun: true  // Executa migrations automaticamente ao iniciar
```
- **`dist/`**: Migrations são executadas após build (arquivos `.js`)
- **`migrationsRun: true`**: Aplica migrations pendentes ao subir a aplicação

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

### 📝 Por que dois arquivos de configuração?

| `sqlite.config.ts` | `data-source.ts` |
|--------------------|------------------|
| ✅ Usado pelo NestJS runtime | ✅ Usado pelo CLI do TypeORM |
| ✅ `dist/` (arquivos `.js`) | ✅ `src/` (arquivos `.ts`) |
| ✅ `autoLoadEntities` | ❌ Lista entidades manualmente |

**Fluxos diferentes:**
1. **Runtime** (app rodando): Usa `sqlite.config.ts`
2. **Migrations** (CLI): Usa `data-source.ts`

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

### 📝 Explicação da Entidade

**Decorator @Entity:**
```typescript
@Entity('users')  // Nome da tabela no banco
```
- Define que essa classe representa uma tabela
- TypeORM cria automaticamente a tabela `users`

**Chave Primária UUID:**
```typescript
@PrimaryGeneratedColumn('uuid')
id: string;
```
- Gera IDs únicos automaticamente (ex: `550e8400-e29b-41d4-a716...`)
- ✅ Mais seguro que auto-increment
- ✅ Único globalmente

**Coluna com Constraint:**
```typescript
@Column({ unique: true })
email: string;
```
- `unique: true` = Não permite emails duplicados
- Banco rejeita insert/update com email existente
- TypeORM lança `QueryFailedError` em duplicatas

**Timestamp Automático:**
```typescript
@CreateDateColumn()
createdAt: Date;
```
- ✅ Preenchido automaticamente ao inserir
- ✅ Não precisa setar manualmente
- Equivalente SQL: `DEFAULT (datetime('now'))`

### 4. Criar o DTO de criação

Crie o arquivo `src/users/dto/create-user.dto.ts`:

```ts
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'password123',
    minLength: 6,
  })
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
import { ApiProperty } from '@nestjs/swagger';

@Entity('ponies')
export class Pony {
  @ApiProperty({
    description: 'ID único do pony',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Nome do pony',
    example: 'Rainbow Dash',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Se o pony é favorito',
    example: false,
  })
  @Column({ default: false })
  isFavorite: boolean;

  @ApiProperty({
    description: 'Elemento de harmonia do pony',
    example: 'Loyalty',
  })
  @Column()
  element: string;

  @ApiProperty({
    description: 'Personalidade do pony',
    example: 'Brave and loyal',
  })
  @Column()
  personality: string;

  @ApiProperty({
    description: 'Talento especial do pony',
    example: 'Flying at supersonic speeds',
  })
  @Column()
  talent: string;

  @ApiProperty({
    description: 'Resumo sobre o pony',
    example: 'Rainbow Dash is a brave pegasus pony who represents the element of loyalty.',
  })
  @Column({ type: 'text' })
  summary: string;

  @ApiProperty({
    description: 'URL da imagem do pony',
    example: 'https://example.com/rainbow-dash.png',
  })
  @Column()
  imageUrl: string;

  @ApiProperty({
    description: 'Data de criação',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt: Date;
}
```

**Destaque: Column com Default Value**
```typescript
@Column({ default: false })
isFavorite: boolean;
```

**Por que usar default?**
- ✅ **Integridade**: Garante valor mesmo se não enviado
- ✅ **UX**: Campo opcional no DTO (não obriga usuário sempre enviar)
- ✅ **Banco**: SQL `DEFAULT (0)` aplicado automaticamente
- ✅ **Segurança**: Previne valores `null` indesejados

**Outros exemplos de defaults:**
```typescript
@Column({ default: 'active' })
status: string;

@Column({ default: 0 })
viewCount: number;

@Column({ nullable: true })  // ← Permite NULL
description?: string;
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

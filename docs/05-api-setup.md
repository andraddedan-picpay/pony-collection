# Pony Collection API 🦄 - Guia Completo de Implementação

## Requisitos

- **Node.js 18+** (LTS recomendado)
- **NestJS CLI**
- **TypeORM + SQLite**
- **JWT**
- **bcrypt**

> ⚠️ Importante: o código apresentado tem **base educacional**. Em produção, ajustes extras seriam necessários (variáveis de ambiente, validações, tratamento de erros, etc).

---

# 📘 Aula 1 — Setup do Projeto

## 🎯 Objetivo

Criar a base do projeto NestJS e subir a API rodando com documentação Swagger.

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

---

# 📘 Aula 2 — Configurando SQLite + TypeORM

## 🎯 Objetivo

Configurar persistência de dados com SQLite usando TypeORM.

---

## 🧠 Conceitos

- **ORM (Object-Relational Mapping)**: Mapeia objetos para tabelas do banco
- **TypeORM**: ORM popular para TypeScript
- **SQLite**: Banco de dados leve baseado em arquivo
- **Entidades**: Classes TypeScript que representam tabelas
- **Migrations**: Controle de versão do schema do banco
- **DataSource**: Configuração de conexão com o banco

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
import { Favorite } from '../favorites/favorite.entity';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  entities: [User, Pony, Favorite],
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

## ✅ Resultado

✔️ SQLite configurado  
✔️ TypeORM conectado  
✔️ Sistema de migrations preparado  
✔️ Banco será criado automaticamente na raiz: `database.sqlite`

---

# 📘 Aula 3 — Modelagem das Entidades

## 🎯 Objetivo

Criar as entidades (tabelas) do domínio da aplicação.

---

## 🧠 Conceitos

- **Entidade**: Classe TypeScript que mapeia uma tabela do banco
- **Decorators do TypeORM**: `@Entity`, `@Column`, `@PrimaryGeneratedColumn`, etc.
- **Relacionamentos**: `@ManyToOne`, `@OneToMany`, `@ManyToMany`
- **UUID**: Identificador único universal
- **Módulos NestJS**: Organização em features isoladas
- **DTO (Data Transfer Object)**: Objeto para validação e transferência de dados

---

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

## 🏗️ Arquitetura de Módulos

Vamos criar 3 módulos principais:

```text
src/
├── users/      # Gerenciamento de usuários
├── ponies/     # Gerenciamento de personagens
└── favorites/  # Relacionamento User x Pony
```

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

## ⭐ Módulo Favorites

### 1. Gerar o módulo

```bash
nest generate module favorites
```

### 2. Criar a entidade Favorite

Crie o arquivo `src/favorites/favorite.entity.ts`:

```ts
import { User } from '../users/user.entity';
import { Pony } from '../ponies/pony.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity('favorites')
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Pony)
  pony: Pony;

  @CreateDateColumn()
  createdAt: Date;
}
```

### 3. Configurar o módulo

Edite `src/favorites/favorites.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './favorite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite])],
})
export class FavoritesModule {}
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
import { FavoritesModule } from './favorites/favorites.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(sqliteConfig),
    UsersModule,
    PoniesModule,
    FavoritesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

---

## 📊 Diagrama de Relacionamentos

```
┌──────────┐         ┌──────────────┐         ┌──────────┐
│   User   │         │   Favorite   │         │   Pony   │
│──────────│         │──────────────│         │──────────│
│ id (PK)  │◄────────│ userId (FK)  │         │ id (PK)  │
│ name     │         │ ponyId (FK)  │────────►│ name     │
│ email    │         │ createdAt    │         │ element  │
│ password │         └──────────────┘         │ ...      │
└──────────┘                                  └──────────┘
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

Isso criará as tabelas `users`, `ponies` e `favorites` com todos os relacionamentos.

### 4. Verificar o banco

Um arquivo `database.sqlite` será criado na raiz do projeto. Você pode visualizá-lo com extensões do VS Code como "SQLite Viewer".

---

## ✅ Resultado

✔️ Banco criado automaticamente
✔️ 3 entidades criadas (User, Pony, Favorite)  
✔️ Relacionamento N:N configurado  
✔️ Migrations geradas e executadas  
✔️ Banco de dados criado com todas as tabelas  
✔️ Módulos organizados e desacoplados

---

# 📘 Aula 4 — Cadastro de Usuário e Hash de Senha

## 🎯 Objetivo

Implementar o registro de usuários com senha criptografada usando bcrypt.

---

## 🧠 Conceitos

- **Hash de senha**: Criptografia unidirecional para segurança
- **bcrypt**: Algoritmo de hash robusto e lento (dificulta ataques)
- **Salt**: Valor aleatório adicionado ao hash
- **Repository Pattern**: Acesso aos dados via TypeORM
- **Injeção de Dependência**: `@InjectRepository`

---

## 🌐 Implementar o UsersController

Edite `src/users/users.controller.ts`:

```ts
import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Cadastrar novo usuário' })
  async register(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}
```

---

## 📦 Instalar bcrypt

```bash
npm install bcrypt
npm install -D @types/bcrypt
```

---

## ⚙️ Implementar o UsersService

Edite `src/users/users.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private repository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    // 1. Gerar hash da senha (salt rounds = 10)
    const hash = await bcrypt.hash(dto.password, 10);

    // 2. Criar a instância do usuário
    const user = this.repository.create({
      ...dto,
      password: hash, // Substituir senha por hash
    });

    // 3. Salvar no banco
    return this.repository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }
}
```

---

## 🧪 Testar no Swagger

1. Acesse: http://localhost:3000/swagger
2. Localize o endpoint **POST /users/register**
3. Clique em "Try it out"
4. Preencha o JSON:

```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}
```

5. Execute e veja a resposta com o usuário criado (senha em hash)

---

## 🔒 Como funciona o bcrypt?

```typescript
// Entrada
const password = "senha123";

// Processo
const hash = await bcrypt.hash(password, 10);
// hash = "$2b$10$N9qo8uLOickgx2ZMRZoMye..."

// Comparação (login)
const isValid = await bcrypt.compare("senha123", hash);
// isValid = true
```

**Por que é seguro?**
- Hash unidirecional (não pode ser revertido)
- Salt único para cada senha
- Custo computacional alto (dificulta brute force)

---

## ⚠️ Melhorias para Produção

Em um projeto real, você deveria:

1. **Validar o DTO** com `class-validator`:
```ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

2. **Tratar erros** (email duplicado, etc.)
3. **Não retornar a senha** na resposta
4. **Usar ValidationPipe global**

---

## ✅ Resultado

✔️ Cadastro de usuário funcionando  
✔️ Senha criptografada com bcrypt  
✔️ Repository injetado via DI  
✔️ Endpoint documentado no Swagger

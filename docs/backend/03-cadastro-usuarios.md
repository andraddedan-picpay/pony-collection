# 📘 Aula 3 — Cadastro de Usuários

**Progresso do Curso Backend:** `[█████████░░░░░░░░░░░] 43% concluído`

## 🎯 Objetivo

Implementar o registro de usuários com senha criptografada usando bcrypt.

---

## 🎯 O que vamos construir

- **UsersController**: Endpoint `/users/register` para cadastro
- **UsersService**: Lógica de negócio separada do controller
- **Hash bcrypt**: Criptografia de senhas com salt automático
- **Repository Pattern**: Acesso ao banco via TypeORM
- **Injeção de Dependência**: NestJS gerencia instâncias automaticamente

💡 **Próxima aula**: Implementaremos login com JWT para autenticação.

---

## 📋 Conceitos Importantes

### Hash de Senha: Por que nunca salvar senha em texto puro?

**Cenários de ataque:**

```typescript
// ❌ NUNCA FAZER ISSO!
password: "senha123"  // Texto puro no banco
```

**O que acontece se o banco vazar?**
- ❌ Atacante tem acesso a todas as senhas
- ❌ Usuário usa mesma senha em outros sites
- ❌ Consequências legais (LGPD, GDPR)

**Solução: Hash unidirecional**
```typescript
// ✅ Hash bcrypt (não pode ser revertido)
password: "$2b$10$N9qo8uLOickgx2ZMRZoMye..."
```

### Bcrypt: Algoritmo de Hash Seguro

**Bcrypt** é um algoritmo projetado para ser lento e resistente a ataques:

| MD5 / SHA1 | bcrypt |
|------------|--------|
| ❌ Muito rápido (bilhões/segundo) | ✅ Configurável (lento por design) |
| ❌ Sem salt automático | ✅ Salt único por senha |
| ❌ Vulnerável a rainbow tables | ✅ Resistente a rainbow tables |
| ❌ Obsoleto | ✅ Ainda seguro em 2024+ |

**Como funciona:**
```typescript
const password = "senha123";
const saltRounds = 10;  // Custo computacional

// Gera hash (leva ~100ms de propósito!)
const hash = await bcrypt.hash(password, 10);
// "$2b$10$N9qo8uLOickgx2ZMRZoMye..."
//  ↑   ↑   ↑
//  |   |   └── Hash + Salt embutido
//  |   └────── Cost (2^10 = 1024 rounds)
//  └────────── Algoritmo bcrypt versão 2b
```

**Salt Rounds (custo):**
- `10` = ~100ms por hash (recomendado)
- `12` = ~400ms (mais seguro, mais lento)
- `15` = ~3s (overkill para a maioria dos casos)

> **💡 Dica**: Quanto maior o cost, mais difícil fazer brute force, mas mais lento o login!

### Repository Pattern

O **Repository Pattern** separa a lógica de acesso a dados da lógica de negócio:

```typescript
// ❌ Acoplado (controller fala diretamente com banco)
@Controller()
export class UsersController {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}
  
  async register() {
    return this.repo.save(...)  // ❌ Lógica no controller
  }
}

// ✅ Desacoplado (service encapsula lógica)
@Controller()
export class UsersController {
  constructor(private usersService: UsersService) {}
  
  async register() {
    return this.usersService.create(...)  // ✅ Delega para service
  }
}
```

**Vantagens:**
- ✅ **Testabilidade**: Mock do service facilmente
- ✅ **Reutilização**: Service pode ser usado por outros controllers
- ✅ **Manutenção**: Lógica centralizada
- ✅ **Single Responsibility**: Controller só roteia, Service processa

### Injeção de Dependência

**NestJS** gerencia instâncias automaticamente via Injeção de Dependência:

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)  // ← NestJS injeta automaticamente
    private repository: Repository<User>,
  ) {}
}
```

**Como funciona:**
1. NestJS cria uma única instância de `UsersService` (singleton)
2. Quando `UsersController` precisa, NestJS injeta automaticamente
3. Não precisa `new UsersService()` manualmente

**Sem DI (manual):**
```typescript
// ❌ Acoplado e difícil de testar
const repo = new Repository(...);
const service = new UsersService(repo);
const controller = new UsersController(service);
```

**Com DI (automático):**
```typescript
// ✅ NestJS gerencia tudo
constructor(private usersService: UsersService) {}
```

---

## 📦 Instalar bcrypt

```bash
npm install bcrypt
npm install -D @types/bcrypt
```

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

### 📝 Explicação do Service

**1. Injeção do Repository:**
```typescript
constructor(
  @InjectRepository(User)  // ← Decorator especial do TypeORM
  private repository: Repository<User>,
) {}
```
- `@InjectRepository(User)`: Diz ao NestJS qual entidade usar
- `Repository<User>`: Tipagem TypeScript para métodos do TypeORM
- NestJS injeta automaticamente quando `UsersModule` importa `TypeOrmModule.forFeature([User])`

**2. Hash da Senha:**
```typescript
const hash = await bcrypt.hash(dto.password, 10);
//                              ↑            ↑
//                    senha pura    salt rounds
```
- `await`: Operação assíncrona (leva ~100ms)
- `10`: Cost factor (2^10 = 1024 rounds) - quanto maior, mais seguro e mais lento
- Retorna string de ~60 caracteres com salt embutido

**Exemplo de hash gerado:**
```
$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
└┬┘ └┬┘ └──────────────┬─────────────┘└───────────┬──────────┘
 │   │                 │                            │
 │   │                 └─ Salt (22 chars)           └─ Hash (31 chars)
 │   └─ Cost (10 = 1024 rounds)
 └─ Algoritmo (2b = bcrypt)
```

**3. Criar Instância (não salva ainda):**
```typescript
const user = this.repository.create({
  ...dto,           // Spread: name, email, password
  password: hash,   // Sobrescreve password com hash
});
```
- `create()` apenas instancia um objeto `User`
- Ainda não foi persistido no banco
- TypeORM prepara o objeto para insert

**4. Persistir no Banco:**
```typescript
return this.repository.save(user);
```
- `save()` executa INSERT no banco
- Retorna o usuário com `id` e `createdAt` preenchidos
- É assíncrono (retorna Promise)

**5. Métodos de Busca:**
```typescript
findByEmail(email: string): Promise<User | null>
findById(id: string): Promise<User | null>
```
- Usados na próxima aula para login
- `findOne()` retorna `null` se não encontrar (não lança exception)
- `where: { email }` equivale a SQL: `WHERE email = ?`

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

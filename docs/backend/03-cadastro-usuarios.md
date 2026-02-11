# 📘 Aula 3 — Cadastro de Usuários

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

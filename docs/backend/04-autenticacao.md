# 📘 Aula 4 — Autenticação com JWT
**Progresso do Curso Backend:** `[███████████░░░░░░░░░] 57% concluído`
## 🎯 Objetivo

Implementar login de usuários com geração de token JWT para autenticação stateless.

---

## 🎯 O que vamos construir

- **AuthModule**: Módulo dedicado para autenticação
- **LoginDto**: Estrutura de dados para login (email + senha)
- **AuthController**: Endpoint `/auth/login`
- **AuthService**: Validação de credenciais e geração de JWT
- **JWT Token**: Token assinado contendo informações do usuário
- **Integração bcrypt**: Comparação segura de senhas

💡 **Próxima aula**: Criaremos JWT Strategy e Guards para proteger rotas.

---

## 📋 Conceitos Importantes

### JWT (JSON Web Token): Autenticação Stateless

**JWT** é um padrão aberto (RFC 7519) para transmitir informações seguras entre partes:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0IiwibmFtZSI6IkpvaG4ifQ.SflKxwRJSMeKKF2QT
└────────── Header ──────────┘ └──────── Payload ────────┘ └──── Signature ────┘
```

**Estrutura do JWT:**

1. **Header** (algoritmo + tipo):
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

2. **Payload** (dados do usuário):
```json
{
  "sub": "uuid-do-usuario",
  "email": "user@example.com",
  "name": "João Silva",
  "iat": 1677721600,  // Issued at
  "exp": 1677808000   // Expiration
}
```

3. **Signature** (assinatura criptográfica):
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

> **⚠️ Importante**: JWT **NÃO é criptografado**, apenas **assinado**! Qualquer pessoa pode decodificar e ver o payload. Nunca coloque senhas ou dados sensíveis no token.

### Stateless vs. Stateful Authentication

| Stateful (Sessions) | Stateless (JWT) |
|---------------------|-----------------|
| ❌ Servidor guarda sessão em memória/Redis | ✅ Servidor não guarda nada |
| ❌ Complexo em múltiplos servidores | ✅ Escalável horizontalmente |
| ❌ Precisa de storage compartilhado | ✅ Token auto-contido |
| ✅ Fácil invalidar sessão | ❌ Difícil invalidar token |
| ✅ Menos dados trafegados | ❌ Token grande (300+ bytes) |

**Fluxo Stateless (JWT):**
```
1. Cliente → POST /login (email + senha)
2. Servidor valida → Gera JWT
3. Clientes ← Retorna { access_token: "..." }
4. Cliente → GET /ponies (Header: Authorization: Bearer token)
5. Servidor valida assinatura → Extrai usuário do token → Retorna dados
```

**Vantagens do JWT:**
- ✅ **Escalabilidade**: Não precisa consultar banco/Redis em cada request
- ✅ **Microserviços**: Token pode ser validado por qualquer serviço
- ✅ **Mobile/SPA**: Ideal para apps sem cookies
- ✅ **Cross-domain**: Funciona entre diferentes domínios

**Desvantagens:**
- ❌ **Não pode ser revogado facilmente**: Token é válido até expirar
- ❌ **Tamanho**: Maior que session ID (pode impactar performance)
- ❌ **XSS**: Se roubado, atacantenão pode usar até expirar

### Secret: Chave de Assinatura

O **secret** é usado para assinar e validar tokens:

```typescript
JwtModule.register({
  secret: 'sua-chave-secreta-aqui',  // ⚠️ Nunca commitar no Git!
  signOptions: { expiresIn: '1d' },  // Token expira em 1 dia
})
```

**Boas práticas:**
```typescript
// ❌ Hardcoded no código
secret: 'minha-senha-123'

// ✅ Variável de ambiente
secret: process.env.JWT_SECRET

// ✅ String longa e aleatória
secret: 'xK9$mP2#nQ8@vL5&wR3^yT7!zA4%bD6*cF1(eG0)'
```

**Como gerar secret seguro:**
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# OpenSSL
openssl rand -hex 64
```

### Access Token vs. Refresh Token

| Access Token | Refresh Token |
|--------------|---------------|
| ✅ Curta duração (minutos/horas) | ✅ Longa duração (dias/semanas) |
| ✅ Usado em cada request | ❌ Usado só para renovar access |
| ❌ Se roubado, expire rápido | ⚠️ Se roubado, mais perigoso |
| Enviado: `Authorization: Bearer ...` | Geralmente em HTTP-only cookie |

**Neste curso:** Usaremos apenas Access Token por simplicidade.

### bcrypt.compare: Validação de Senha

**Por que não comparar strings diretamente?**

```typescript
// ❌ NUNCA FAZER!
if (dto.password === user.password) {
  // Compara senha pura com hash (sempre false)
}

// ✅ bcrypt.compare
if (await bcrypt.compare(dto.password, user.password)) {
  // Valida senha pura contra hash
}
```

**Como funciona:**
```typescript
const password = "senha123";
const hash = "$2b$10$N9qo8uLOickgx2ZMRZoMye...";

// bcrypt extrai o salt do hash e refaz o processo
await bcrypt.compare(password, hash)
  // 1. Extrai salt do hash
  // 2. Gera novo hash com password + salt
  // 3. Compara os dois hashes
  // 4. Retorna true se iguais
```

**Tempo de execução:**
- ✅ Constante (~100ms) independente da senha
- ✅ Previne timing attacks

---

## 📦 Dependências

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install -D @types/passport-jwt
```

---

## 🏗️ Criar o módulo Auth

```bash
nest generate module auth
nest generate service auth
nest generate controller auth
```

---

## 📝 Criar DTO de Login

Crie o arquivo `src/auth/dto/login.dto.ts`:

```ts
export class LoginDto {
  email: string;
  password: string;
}
```

---

## 🔧 Configurar o AuthModule

Edite `src/auth/auth.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: 'sua-chave-secreta-aqui', // ⚠️ Em produção, usar variável de ambiente
      signOptions: { expiresIn: '1d' }, // Token expira em 1 dia
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
```

**Importante:**
- ✅ `PassportModule` importado
- ✅ `JwtStrategy` registrado nos providers
- ✅ `JwtStrategy` e `PassportModule` exportados para outros módulos usarem

---

## 🔄 Atualizar o AppModule

Edite `src/app.module.ts` para importar o AuthModule:

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { sqliteConfig } from './database/sqlite.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PoniesModule } from './ponies/ponies.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(sqliteConfig),
    UsersModule,
    AuthModule,
    PoniesModule,
  ],
})
export class AppModule {}
```

---

## 🌐 Implementar o AuthController

Edite `src/auth/auth.controller.ts`:

```ts
import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login de usuário' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
```

---

## ⚙️ Implementar o AuthService

Edite `src/auth/auth.service.ts`:

```ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    // 1. Buscar usuário pelo email
    const user = await this.usersService.findByEmail(dto.email);

    // 2. Verificar se usuário existe e se a senha está correta
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // 3. Criar payload do token
    const payload = { 
      sub: user.id,      // 'sub' é convenção JWT para ID
      email: user.email,
      name: user.name 
    };

    // 4. Gerar e retornar o token
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
```

### 📝 Explicação do AuthService

**1. Injeção de Dependências:**
```typescript
constructor(
  private usersService: UsersService,  // ← Buscar usuário
  private jwtService: JwtService,       // ← Gerar token
) {}
```
- `UsersService`: Reutiliza lógica de busca de usuário
- `JwtService`: Fornecido por `@nestjs/jwt`
- NestJS injeta automaticamente

**2. Buscar Usuário:**
```typescript
const user = await this.usersService.findByEmail(dto.email);
```
- Busca no banco via email (campo único)
- Retorna `null` se não encontrado
- `await`: Operação assíncrona

**3. Validação de Credenciais:**
```typescript
if (!user || !(await bcrypt.compare(dto.password, user.password))) {
  throw new UnauthorizedException('Credenciais inválidas');
}
```
- **Primeira condição**: `!user` = email não existe
- **Segunda condição**: `!(await bcrypt.compare(...))` = senha incorreta
- **UnauthorizedException**: HTTP 401 (Não Autorizado)

> **💡 Segurança**: Mesma mensagem para ambos os erros! Não revelar se email existe ou se senha está errada (evita enumeration attack).

**4. Criar Payload:**
```typescript
const payload = { 
  sub: user.id,      // 'sub' (subject) = convenção JWT para user ID
  email: user.email,
  name: user.name 
};
```
- **`sub`**: Padrão JWT para identificador único do usuário
- **Campos adicionais**: Qualquer dado que precise estar disponível em rotas protegidas
- **⚠️ Não colocar**: Senha, dados sensíveis (JWT é decodificável!)

**5. Gerar Token:**
```typescript
return {
  access_token: this.jwtService.sign(payload),
};
```
- `sign(payload)`: Gera token assinado com secret configurado
- Adiciona automaticamente `iat` (issued at) e `exp` (expiration)
- Retorna string: `"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`

**Estrutura do token gerado:**
```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "email": "joao@example.com",
  "name": "João Silva",
  "iat": 1677721600,  // Timestamp de criação
  "exp": 1677808000   // Expira em 1 dia (86400 segundos)
}
```

---

## 🧪 Testar Login no Swagger

1. Primeiro, registre um usuário em **POST /users/register**
2. Depois, faça login em **POST /auth/login**:

```json
{
  "email": "joao@example.com",
  "password": "senha123"
}
```

3. Você receberá um `access_token`:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

4. Copie esse token para usar nas próximas requisições!

---

## 🔍 Entendendo o JWT

Um JWT tem 3 partes separadas por `.`:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.       <- Header
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4. <- Payload (dados do usuário)
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c   <- Signature (assinatura)
```

Você pode decodificar em: https://jwt.io

---

## ✅ Resultado

✔️ Login funcional  
✔️ JWT gerado corretamente  
✔️ Token contém informações do usuário  
✔️ Credenciais validadas com bcrypt

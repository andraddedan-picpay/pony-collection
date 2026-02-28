# 📘 Aula 5 — Guards e Proteção de Rotas

**Progresso do Curso Backend:** `[██████████████░░░░░░] 71% concluído`

## 🎯 Objetivo

Criar um sistema de Guards para proteger rotas e validar o token JWT.

---

## 🎯 O que vamos construir

- **JwtStrategy**: Lógica de validação do token JWT
- **JwtAuthGuard**: Guard reutilizável para proteger rotas
- **Request.user**: Dados do usuário disponíveis em rotas protegidas
- **Decorator @UseGuards**: Aplicar proteção em controllers/rotas
- **Bearer Token**: Padrão de autenticação via header HTTP

💡 **Próxima aula**: Implementaremos CRUD de Ponies com todas as rotas protegidas.

---

## 📋 Conceitos Importantes

### Guards: Controle de Acesso

**Guards** são middlewares especiais que decidem se uma requisição pode prosseguir:

```typescript
Request → Guard → Route Handler
          ↓
       ✅ Allow
       ❌ Deny (401/403)
```

**Fluxo de execução:**
1. Request chega com header `Authorization: Bearer token`
2. Guard extrai e valida o token
3. ✅ **Válido**: Extrai dados do usuário → `req.user`
4. ❌ **Inválido**: Retorna 401 Unauthorized

**Casos de uso:**
- ✅ Autenticação (usuário logado?)
- ✅ Autorização (usuário tem permissão?)
- ✅ Rate limiting
- ✅ Validação de API keys

### Passport: Framework de Autenticação

**Passport** é um middleware de autenticação com 500+ estratégias:

| Estratégia | Uso |
|------------|-----|
| `passport-jwt` | ✅ Token JWT (nosso caso) |
| `passport-local` | Email + senha |
| `passport-google` | Login com Google |
| `passport-github` | Login com GitHub |

**NestJS + Passport:**
```typescript
// ❌ Passport puro (muito código)
passport.use(new Strategy({ ... }))

// ✅ NestJS + Passport (integrado)
export class JwtStrategy extends PassportStrategy(Strategy)
```

### Strategy: Como Validar a Autenticação

**Strategy** define a lógica de validação:

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secret',
    });
  }

  async validate(payload) {
    // ⬅️ Chamado automaticamente após token válido
    return { id: payload.sub };  // ➡️ Vai para req.user
  }
}
```

**Fluxo:**
1. Guard chama Strategy
2. Strategy extrai token
3. Valida assinatura com secret
4. Se válido → chama `validate()`
5. Retorno de `validate()` vai para `req.user`

### Bearer Token: Padrão HTTP

**Bearer Token** é um padrão RFC 6750 para enviar tokens:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
└──────────┘ └─────┘ └─────────────── Token ──────────────────┘
   Header    Scheme
```

**Formato correto:**
- ✅ `Bearer <token>` (com espaço)
- ❌ `Bearer<token>` (sem espaço)
- ❌ `<token>` (sem prefixo)

### req.user: Dados do Usuário Autenticado

Após autenticação, dados do usuário ficam disponíveis via `req.user`:

```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@Request() req) {
  return req.user;  // ← { id: '...', email: '...', name: '...' }
}
```

**Como funciona:**
1. Guard valida token
2. Strategy chama `validate(payload)`
3. Retorno de `validate()` é atribuído a `req.user`
4. Controller tem acesso aos dados

---

## 🔐 Criar JWT Strategy

Crie a pasta e o arquivo `src/auth/strategies/jwt.strategy.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  name: string;
  iat?: number; // Issued at
  exp?: number; // Expiration
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'sua-chave-secreta-aqui', // Mesma do JwtModule
    });
  }

  // Este método é chamado após o token ser validado
  // O retorno é injetado em req.user
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    return { 
      id: payload.sub, 
      email: payload.email,
      name: payload.name 
    };
  }
}
```

### 📝 Explicação da Strategy

**1. Herança de PassportStrategy:**
```typescript
export class JwtStrategy extends PassportStrategy(Strategy)
```
- `PassportStrategy`: Classe base do NestJS para integrar Passport
- `Strategy`: Estratégia JWT do `passport-jwt`
- NestJS registra automaticamente como `'jwt'` (nome da estratégia)

**2. Configuração do SuperClass:**
```typescript
super({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  ignoreExpiration: false,
  secretOrKey: 'sua-chave-secreta-aqui',
});
```

**Propriedades:**

```typescript
jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
```
- Diz ao Passport onde extrair o token
- `fromAuthHeaderAsBearerToken()`: Busca no header `Authorization: Bearer <token>`
- **Outras opções**:
  - `fromUrlQueryParameter('token')`: Query param `?token=...`
  - `fromBodyField('token')`: Corpo da requisição
  - `fromCookies('jwt')`: Cookie

```typescript
ignoreExpiration: false
```
- `false`: ✅ **Seguro** - Rejeita tokens expirados (401)
- `true`: ❌ **PERIGO** - Aceita tokens expirados

```typescript
secretOrKey: 'sua-chave-secreta-aqui'
```
- ⚠️ **DEVE SER A MESMA** do `JwtModule.register()`
- Use variável de ambiente em produção:
  ```typescript
  secretOrKey: process.env.JWT_SECRET
  ```

**3. Método validate():**
```typescript
async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
  return { 
    id: payload.sub,
    email: payload.email,
    name: payload.name 
  };
}
```

**Quando é chamado:**
- ✅ **Após** token ser validado (assinatura + expiração OK)
- ❌ **Nunca** se token inválido

**Payload:**
```typescript
{
  sub: "uuid-do-usuario",
  email: "joao@example.com",
  name: "João Silva",
  iat: 1677721600,  // ← Adicionado automaticamente
  exp: 1677808000   // ← Adicionado automaticamente
}
```

**Retorno → req.user:**
```typescript
// O que você retorna aqui:
return { id: payload.sub, email: payload.email, name: payload.name };

// Fica disponível em:
@Get('profile')
getProfile(@Request() req) {
  console.log(req.user);  // { id: '...', email: '...', name: '...' }
}
```

**Por que mapear `sub` → `id`?**
- `sub` (subject) é convenção JWT
- `id` é mais intuitivo no código

**Casos avançados:**
```typescript
// Consultar banco para dados atualizados
async validate(payload: JwtPayload) {
  const user = await this.usersService.findById(payload.sub);
  if (!user) throw new UnauthorizedException();  // User deletado
  return user;
}
```

---

## 🛡️ Criar JWT Guard

Crie a pasta e o arquivo `src/auth/guards/jwt-auth.guard.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### 📝 Explicação do Guard

**Código simples, mas poderoso:**

```typescript
export class JwtAuthGuard extends AuthGuard('jwt')
//                                             ↑
//                        Nome da Strategy registrada
```

**O que acontece internamente:**
1. `AuthGuard('jwt')` busca `JwtStrategy` registrada com nome `'jwt'`
2. Guard chama `JwtStrategy` para validar
3. Se válido → Chama `validate()` → Preenche `req.user` → Permite acesso
4. Se inválido → Retorna 401 Unauthorized

**Por que tão simples?**
- ✅ Toda lógica está na `JwtStrategy`
- ✅ Guard é só um wrapper
- ✅ Reutilizável em qualquer rota

**Guard customizado (opcional):**
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    if (err || !user) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
    return user;
  }
}
```

---

## 🔒 Proteger Rotas

Agora você pode proteger qualquer rota usando o decorator `@UseGuards()`:

### Exemplo 1: Proteger um controller inteiro

```ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Ponies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Todas as rotas deste controller são protegidas
@Controller('ponies')
export class PoniesController {
  @Get()
  findAll() {
    return 'Rota protegida!';
  }
}
```

### Exemplo 2: Proteger rotas específicas

```ts
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  @Post('register')
  @ApiOperation({ summary: 'Cadastro de usuário' })
  register() {
    return 'Rota pública';
  }

  @UseGuards(JwtAuthGuard) // Apenas esta rota é protegida
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Obter perfil' })
  getProfile() {
    return 'Rota protegida!';
  }
}
```

---

## 👤 Acessar Dados do Usuário

Use o decorator `@Request()` para acessar os dados do usuário autenticado:

```ts
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Obter perfil do usuário autenticado' })
  getProfile(@Request() req: { user: AuthenticatedUser }) {
    return req.user; // { id, email, name }
  }
}
```

Ou crie um decorator customizado (recomendado):

Crie `src/auth/decorators/current-user.decorator.ts`:

```ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../strategies/jwt.strategy';

interface RequestWithUser {
  user: AuthenticatedUser;
}

export const CurrentUser = createParamDecorator(
  (_data, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
```

Uso:

```ts
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Get('me')
@ApiOperation({ summary: 'Obter perfil do usuário autenticado' })
getProfile(@CurrentUser() user: AuthenticatedUser) {
  return user; // { id, email, name }
}
```

---

## 🧪 Testar no Swagger

1. Faça login e copie o `access_token`
2. No Swagger, clique no botão **🔓 Authorize** no topo
3. Cole o token no campo (sem a palavra "Bearer")
4. Agora você pode testar rotas protegidas!

---

## ✅ Resultado

✔️ JWT Strategy configurada  
✔️ Guard criado e funcionando  
✔️ Rotas protegidas com `@UseGuards()`  
✔️ Dados do usuário acessíveis via `@CurrentUser()`  
✔️ Swagger com autenticação Bearer

# 📘 Aula 5 — Guards e Proteção de Rotas

## 🎯 Objetivo

Criar um sistema de Guards para proteger rotas e validar o token JWT.

---

## 🧠 Conceitos

- **Strategy**: Define como validar a autenticação (Passport)
- **Guard**: Middleware que decide se uma requisição pode prosseguir
- **Request.user**: Dados do usuário injetados na requisição após validação
- **Bearer Token**: Formato `Authorization: Bearer <token>`

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

---

## 🛡️ Criar JWT Guard

Crie a pasta e o arquivo `src/auth/guards/jwt-auth.guard.ts`:

```ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
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

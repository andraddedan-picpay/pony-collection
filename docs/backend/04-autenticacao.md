# 📘 Aula 4 — Autenticação com JWT

## 🎯 Objetivo

Implementar login de usuários com geração de token JWT para autenticação stateless.

---

## 🧠 Conceitos

- **JWT (JSON Web Token)**: Token assinado que contém informações do usuário
- **Stateless Authentication**: Servidor não guarda sessão, apenas valida o token
- **Payload**: Dados armazenados no token (id do usuário, email, etc.)
- **Secret**: Chave secreta para assinar e validar tokens
- **Access Token**: Token de curta duração para acesso à API

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

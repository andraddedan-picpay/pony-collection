# Pony Collection API 🦄 - Parte 2: Autenticação e CRUD

Este documento continua a implementação da API, focando em **autenticação JWT**, **proteção de rotas** e **CRUD completo**.

---

# 📘 Aula 5 — Autenticação com JWT

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

## 🔧 Configurar o AuthModule

Edite `src/auth/auth.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: 'sua-chave-secreta-aqui', // ⚠️ Em produção, usar variável de ambiente
      signOptions: { expiresIn: '1d' }, // Token expira em 1 dia
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
```

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
import { FavoritesModule } from './favorites/favorites.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(sqliteConfig),
    UsersModule,
    AuthModule,
    PoniesModule,
    FavoritesModule,
  ],
})
export class AppModule {}
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

---

# 📘 Aula 6 — Guards e Proteção de Rotas

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
  async validate(payload: any) {
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

## 📦 Registrar Strategy no AuthModule

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
      secret: 'sua-chave-secreta-aqui',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
```

---

## 🔒 Proteger Rotas

Agora você pode proteger qualquer rota usando o decorator `@UseGuards()`:

### Exemplo 1: Proteger um controller inteiro

```ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
@Controller('users')
export class UsersController {
  @Post('register')
  register() {
    return 'Rota pública';
  }

  @UseGuards(JwtAuthGuard) // Apenas esta rota é protegida
  @Get('profile')
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return req.user; // { id, email, name }
  }
}
```

Ou crie um decorator customizado (recomendado):

Crie `src/auth/decorators/current-user.decorator.ts`:

```ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

Uso:

```ts
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Get('me')
getProfile(@CurrentUser() user) {
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

---

# 📘 Aula 7 — CRUD de Ponies

## 🎯 Objetivo

Implementar o CRUD completo de personagens (Ponies).

---

## 🧠 Conceitos

- **CRUD**: Create, Read, Update, Delete
- **DTOs**: Validação e documentação de dados
- **Repository Pattern**: Acesso ao banco via TypeORM
- **HTTP Status Codes**: 200, 201, 204, 404

---

## 📁 Criar DTOs

Crie a pasta `src/ponies/dto` e os arquivos:

### create-pony.dto.ts

```ts
export class CreatePonyDto {
  name: string;
  element: string;
  personality: string;
  talent: string;
  summary: string;
  imageUrl: string;
}
```

### update-pony.dto.ts

```ts
export class UpdatePonyDto {
  name?: string;
  element?: string;
  personality?: string;
  talent?: string;
  summary?: string;
  imageUrl?: string;
}
```

---

## ⚙️ Implementar o PoniesService

Edite `src/ponies/ponies.service.ts`:

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pony } from './pony.entity';
import { CreatePonyDto } from './dto/create-pony.dto';
import { UpdatePonyDto } from './dto/update-pony.dto';

@Injectable()
export class PoniesService {
  constructor(
    @InjectRepository(Pony)
    private repository: Repository<Pony>,
  ) {}

  // Criar
  async create(dto: CreatePonyDto): Promise<Pony> {
    const pony = this.repository.create(dto);
    return this.repository.save(pony);
  }

  // Listar todos
  async findAll(): Promise<Pony[]> {
    return this.repository.find({
      order: { name: 'ASC' },
    });
  }

  // Buscar por ID
  async findOne(id: string): Promise<Pony> {
    const pony = await this.repository.findOne({ where: { id } });
    
    if (!pony) {
      throw new NotFoundException(`Pony #${id} não encontrado`);
    }
    
    return pony;
  }

  // Atualizar
  async update(id: string, dto: UpdatePonyDto): Promise<Pony> {
    const pony = await this.findOne(id);
    
    Object.assign(pony, dto);
    
    return this.repository.save(pony);
  }

  // Remover
  async remove(id: string): Promise<void> {
    const pony = await this.findOne(id);
    await this.repository.remove(pony);
  }
}
```

---

## 🌐 Implementar o PoniesController

Edite `src/ponies/ponies.controller.ts`:

```ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PoniesService } from './ponies.service';
import { CreatePonyDto } from './dto/create-pony.dto';
import { UpdatePonyDto } from './dto/update-pony.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Ponies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Todas as rotas protegidas
@Controller('ponies')
export class PoniesController {
  constructor(private readonly poniesService: PoniesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo pony' })
  create(@Body() dto: CreatePonyDto) {
    return this.poniesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os ponies' })
  findAll() {
    return this.poniesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pony por ID' })
  findOne(@Param('id') id: string) {
    return this.poniesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar pony' })
  update(@Param('id') id: string, @Body() dto: UpdatePonyDto) {
    return this.poniesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover pony' })
  remove(@Param('id') id: string) {
    return this.poniesService.remove(id);
  }
}
```

---

## 🧪 Testar no Swagger

### 1. Criar um Pony (POST /ponies)

```json
{
  "name": "Twilight Sparkle",
  "element": "Magic",
  "personality": "Inteligente e estudiosa",
  "talent": "Magia",
  "summary": "Princesa da Amizade e líder das Mane 6",
  "imageUrl": "https://example.com/twilight.png"
}
```

### 2. Listar todos (GET /ponies)

### 3. Buscar por ID (GET /ponies/:id)

### 4. Atualizar (PUT /ponies/:id)

### 5. Remover (DELETE /ponies/:id)

---

## ✅ Resultado

✔️ CRUD completo funcionando  
✔️ Rotas protegidas por JWT  
✔️ Tratamento de erros (404)  
✔️ Documentado no Swagger

---

# 📘 Aula 8 — Sistema de Favoritos

## 🎯 Objetivo

Implementar o relacionamento N:N entre User e Pony através de Favorites.

---

## 🧠 Conceitos

- **Relacionamento N:N**: Muitos usuários podem favoritar muitos ponies
- **Tabela de junção**: Favorite conecta User e Pony
- **Query com relations**: Carregar dados relacionados
- **Validação de duplicação**: Não permitir favoritar duas vezes

---

## ⚙️ Criar FavoritesService

Crie `src/favorites/favorites.service.ts`:

```ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';
import { PoniesService } from '../ponies/ponies.service';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private repository: Repository<Favorite>,
    private poniesService: PoniesService,
  ) {}

  // Favoritar um pony
  async create(userId: string, ponyId: string): Promise<Favorite> {
    // Verificar se o pony existe
    await this.poniesService.findOne(ponyId);

    // Verificar se já está favoritado
    const existing = await this.repository.findOne({
      where: { user: { id: userId }, pony: { id: ponyId } },
    });

    if (existing) {
      throw new ConflictException('Pony já está favoritado');
    }

    // Criar favorito
    const favorite = this.repository.create({
      user: { id: userId } as any,
      pony: { id: ponyId } as any,
    });

    return this.repository.save(favorite);
  }

  // Listar favoritos do usuário
  async findByUser(userId: string): Promise<Favorite[]> {
    return this.repository.find({
      where: { user: { id: userId } },
      relations: ['pony'],
      order: { createdAt: 'DESC' },
    });
  }

  // Desfavoritar
  async remove(userId: string, ponyId: string): Promise<void> {
    const favorite = await this.repository.findOne({
      where: { user: { id: userId }, pony: { id: ponyId } },
    });

    if (!favorite) {
      throw new NotFoundException('Favorito não encontrado');
    }

    await this.repository.remove(favorite);
  }

  // Verificar se um pony é favorito do usuário
  async isFavorite(userId: string, ponyId: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { user: { id: userId }, pony: { id: ponyId } },
    });

    return count > 0;
  }
}
```

---

## 🌐 Criar FavoritesController

Crie `src/favorites/favorites.controller.ts`:

```ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar meus favoritos' })
  findMyFavorites(@CurrentUser() user) {
    return this.favoritesService.findByUser(user.id);
  }

  @Post(':ponyId')
  @ApiOperation({ summary: 'Favoritar um pony' })
  create(@CurrentUser() user, @Param('ponyId') ponyId: string) {
    return this.favoritesService.create(user.id, ponyId);
  }

  @Delete(':ponyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desfavoritar um pony' })
  remove(@CurrentUser() user, @Param('ponyId') ponyId: string) {
    return this.favoritesService.remove(user.id, ponyId);
  }
}
```

---

## 🔧 Configurar FavoritesModule

Edite `src/favorites/favorites.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './favorite.entity';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { PoniesModule } from '../ponies/ponies.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Favorite]),
    PoniesModule, // Importar para validar se pony existe
  ],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
```

---

## 🔧 Exportar PoniesService

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
  exports: [PoniesService], // Adicionar export
})
export class PoniesModule {}
```

---

## 🧪 Testar Favoritos

1. **Favoritar**: POST /favorites/:ponyId
2. **Listar favoritos**: GET /favorites
3. **Desfavoritar**: DELETE /favorites/:ponyId

---

## ✅ Resultado

✔️ Sistema de favoritos funcionando  
✔️ Relacionamento N:N implementado  
✔️ Validação de duplicação  
✔️ Query otimizada com relations  
✔️ Integração pronta para o frontend

---

# 🎓 Conclusão do Backend

Parabéns! 🎉 Você completou a implementação do backend:

✅ API NestJS com SQLite  
✅ TypeORM com Migrations  
✅ Autenticação JWT  
✅ Guards e proteção de rotas  
✅ CRUD completo de Ponies  
✅ Sistema de Favoritos  
✅ Documentação Swagger

**Próximos passos:**
1. Implementar validação com class-validator
2. Adicionar testes unitários e E2E
3. Criar o frontend Angular
4. Integrar API com o frontend

🦄✨
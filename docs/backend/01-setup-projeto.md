# 📘 Aula 1 — Setup do Projeto

**Progresso do Curso Backend:** `[███░░░░░░░░░░░░░░░░░] 14% concluído`

## 🎯 Objetivo

Criar a base do projeto NestJS e subir a API rodando com documentação Swagger.

---

## 🎯 O que vamos construir

- **Projeto NestJS**: Framework backend robusto e escalável
- **TypeScript**: Linguagem tipada para maior segurança
- **Swagger/OpenAPI**: Documentação interativa automática
- **Hot Reload**: Desenvolvimento ágil com recarga automática
- **Arquitetura Modular**: Base para crescimento organizado

💡 **Próxima aula**: Configuraremos banco de dados e criaremos as entidades.

---

## 📋 Conceitos Importantes

### NestJS: Por que usar?

**NestJS** é um framework Node.js inspirado no Angular, focado em arquitetura escalável:

| Node.js Puro | Express.js | NestJS |
|--------------|------------|--------|
| ❌ Sem estrutura | ⚠️ Estrutura livre | ✅ Arquitetura opinativa |
| ❌ Sem TypeScript nativo | ⚠️ TypeScript opcional | ✅ TypeScript first-class |
| ❌ Sem DI embutido | ⚠️ DI via libs | ✅ DI nativo |
| Manual tudo | ⚠️ Manual decorators | ✅ Decorators nativos |

**Quando usar NestJS:**
- ✅ Aplicações médias/grandes
- ✅ Times que conhecem Angular
- ✅ Arquitetura enterprise
- ✅ Microserviços
- ✅ APIs REST e GraphQL

**Quando NÃO usar:**
- ❌ Scripts simples / CLIs
- ❌ Serverless functions pequenas
- ❌ Time sem experiência em OOP/TypeScript
- ❌ Projetos com poucos endpoints

### Arquitetura de Módulos

**NestJS** organiza código em **módulos** (inspirado no Angular):

```typescript
@Module({
  imports: [UsersModule, AuthModule],    // ← Módulos que esse precisa
  controllers: [AppController],          // ← Rotas HTTP
  providers: [AppService],               // ← Serviços (lógica)
  exports: [AppService],                 // ← O que outros podem usar
})
export class AppModule {}
```

**Benefícios:**
- ✅ **Encapsulamento**: Cada feature é isolada
- ✅ **Reutilização**: Módulos podem ser importados
- ✅ **Lazy loading**: Carregar sob demanda (microservices)
- ✅ **Testabilidade**: Mock de dependências fácil

**Exemplo de estrutura modular:**
```
src/
├── app.module.ts          ← Raiz
├── users/
│   ├── users.module.ts    ← Módulo de usuários
│   ├── users.controller.ts
│   └── users.service.ts
├── auth/
│   ├── auth.module.ts     ← Módulo de autenticação
│   ├── auth.controller.ts
│   └── auth.service.ts
└── ponies/
    ├── ponies.module.ts   ← Módulo de ponies
    ├── ponies.controller.ts
    └── ponies.service.ts
```

### Decorators: Metadados em Classes

**Decorators** são uma feature TypeScript para adicionar metadados:

```typescript
@Controller('users')  // ← Decorator de classe
export class UsersController {
  
  @Get()              // ← Decorator de método
  @UseGuards(AuthGuard)
  findAll() {
    return [];
  }
}
```

**Tipos de decorators NestJS:**
- `@Module()`: Define um módulo
- `@Controller()`: Define um controller (rotas)
- `@Injectable()`: Define um service (DI)
- `@Get()`, `@Post()`, etc: Define método HTTP
- `@UseGuards()`: Aplica guards (auth)

### Injeção de Dependência (DI)

**DI** é um padrão onde o framework gerencia instâncias automaticamente:

```typescript
// ❌ Sem DI (manual, acoplado)
export class UsersController {
  private service = new UsersService();
}

// ✅ Com DI (automático, desacoplado)
export class UsersController {
  constructor(private usersService: UsersService) {}
  // ↑ NestJS injeta automaticamente
}
```

**Vantagens:**
- ✅ **Singleton**: Uma instância compartilhada
- ✅ **Testável**: Fácil mockar dependências
- ✅ **Desacoplado**: Não precisa conhecer implementação
- ✅ **Lazy**: Instanciado só quando necessário

### Swagger/OpenAPI: Documentação Viva

**Swagger** gera documentação interativa automaticamente:

```typescript
@ApiTags('Users')               // ← Agrupa endpoints
@ApiBearerAuth()                // ← Requer autenticação
@Controller('users')
export class UsersController {
  
  @Get()
  @ApiOperation({ summary: 'Listar usuários' })
  @ApiResponse({ status: 200, type: [User] })
  findAll() {}
}
```

**Benefícios:**
- ✅ **Documentação sempre atualizada**: Código = docs
- ✅ **Testável**: Interface para testar APIs
- ✅ **Autodescritiva**: Contratos claros
- ✅ **Code generation**: Pode gerar clients automaticamente

**Swagger UI:**
- 📖 Lista todos os endpoints
- 🧪 Testa requisições direto no navegador
- 🔐 Suporte a autenticação Bearer Token
- 📝 Schemas de request/response

### TypeScript: Type Safety

**TypeScript** adiciona tipos ao JavaScript:

```typescript
// ❌ JavaScript (sem tipos)
function createUser(name, email) {
  return { name, email };
}

// ✅ TypeScript (tipado)
interface User {
  name: string;
  email: string;
}

function createUser(name: string, email: string): User {
  return { name, email };
}
```

**Vantagens:**
- ✅ **Erros em compile-time**: Bugs pegos antes de rodar
- ✅ **Autocomplete**: IDE ajuda com sugestões
- ✅ **Refatoração segura**: Rename sem medo
- ✅ **Documentação implícita**: Tipos = docs

---

## 💻 Passo a Passo

### 1. Instalar o NestJS CLI globalmente

```bash
npm install -g @nestjs/cli
```

**O que é a CLI?**
- Interface de linha de comando para gerar código
- Comandos: `nest new`, `nest generate`, `nest build`
- Gera boilerplate automaticamente

**Verificar instalação:**
```bash
nest --version
# Exemplo: 10.2.1
```

### 2. Criar o projeto

```bash
nest new pony-collection-api
```

Escolha o gerenciador de pacotes (npm ou yarn).

**O que esse comando faz:**
1. Cria pasta `pony-collection-api/`
2. Instala dependências do NestJS
3. Configura TypeScript (`tsconfig.json`)
4. Cria estrutura inicial de arquivos
5. Inicializa Git automaticamente

**Pacotes instalados:**
- `@nestjs/core`: Core do framework
- `@nestjs/common`: Decorators e utilities
- `@nestjs/platform-express`: Adapter HTTP (Express sob o capô)
- `reflect-metadata`: Suporte a decorators
- `rxjs`: Programação reativa

### 3. Entrar na pasta do projeto

```bash
cd pony-collection-api
```

### 4. Instalar dependência do Swagger

```bash
npm install @nestjs/swagger
```

**Por que Swagger?**
- ✅ Documentação automática da API
- ✅ Interface para testar endpoints
- ✅ Geração de tipos TypeScript para frontend
- ✅ Padrão OpenAPI 3.0

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

### 📝 Explicação do main.ts

**1. Criar aplicação NestJS:**
```typescript
const app = await NestFactory.create(AppModule);
```
- `NestFactory`: Factory para criar instância do app
- `AppModule`: Módulo raiz da aplicação
- Retorna instância configurável do NestJS

**2. Configurar Swagger:**
```typescript
const config = new DocumentBuilder()
  .setTitle('Pony Collection API')        // ← Título no Swagger UI
  .setDescription('API para gerenciar...') // ← Descrição
  .setVersion('1.0')                       // ← Versionamento
  .addBearerAuth()                         // ← Campo para token JWT
  .build();
```
- **`DocumentBuilder`**: Builder pattern para configuração
- **`addBearerAuth()`**: Adiciona botão "Authorize" no Swagger UI
- **`build()`**: Gera objeto de configuração

**3. Gerar documento OpenAPI:**
```typescript
const document = SwaggerModule.createDocument(app, config);
```
- Lê todos os decorators (`@ApiTags`, `@ApiResponse`, etc)
- Gera JSON no formato OpenAPI 3.0
- Esse JSON alimenta o Swagger UI

**4. Montar UI do Swagger:**
```typescript
SwaggerModule.setup('swagger', app, document);
```
- **Primeiro argumento**: Rota onde Swagger ficará (`/swagger`)
- Alternativas: `/api-docs`, `/docs`, `/api`
- Gera interface interativa automaticamente

**5. Iniciar servidor:**
```typescript
await app.listen(process.env.PORT ?? 3000);
```
- **`process.env.PORT`**: Variável de ambiente (para deploy)
- **`?? 3000`**: Nullish coalescing - usa 3000 se `PORT` for undefined
- Servidor escuta na porta especificada

**Fluxo completo:**
```
1. NestFactory cria app
2. Swagger lê metadados dos decorators
3. Gera documentação OpenAPI
4. Monta UI em /swagger
5. Servidor sobe na porta 3000
6. Acessa http://localhost:3000/swagger
```

### 6. Iniciar o servidor em modo desenvolvimento

```bash
npm run start:dev
```

**Modos de execução:**

| Comando | Modo | Descrição | Hot Reload |
|---------|------|-----------|------------|
| `npm run start` | Produção | Executa build + inicia | ❌ Não |
| `npm run start:dev` | Desenvolvimento | Watch mode + reload automático | ✅ Sim |
| `npm run start:debug` | Debug | Dev mode + debugger | ✅ Sim |

**O que acontece no `start:dev`:**
1. Compila TypeScript → JavaScript
2. Inicia servidor
3. Observa mudanças nos arquivos
4. Recompila automaticamente
5. Reinicia servidor

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
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

**Função**: Inicializa a aplicação NestJS  
**Responsabilidade**:
- Criar instância da aplicação
- Configurar middleware, CORS
- Configurar Swagger
- Definir porta de escuta

**Por que `async/await`?**
- Criação do app é assíncrona
- Permite configurações antes de ouvir requisições

---

### `app.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],      // ← Outros módulos
  controllers: [AppController],  // ← Controllers deste módulo
  providers: [AppService],       // ← Services/providers
})
export class AppModule {}
```

**Função**: Módulo raiz da aplicação  
**Responsabilidade**:
- Centralizar imports de outros módulos (ex: `UsersModule`, `AuthModule`)
- Registrar controllers e providers globais
- Ponto de partida da aplicação

**Anatomia do `@Module()`:**
- **`imports`**: Módulos externos ou criados por você
- **`controllers`**: Classes que definem rotas
- **`providers`**: Services injetáveis (DI)
- **`exports`**: O que o módulo expõe para outros módulos

---

### `app.controller.ts`
```typescript
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
```

**Função**: Controller de exemplo com rota raiz  
**Responsabilidade**:
- Definir rotas HTTP
- Receber requisições
- Delegar lógica para services
- Retornar respostas

**Fluxo da requisição:**
```
GET http://localhost:3000/
   ↓
AppController.getHello()
   ↓
AppService.getHello()
   ↓
Retorna "Hello World!"
```

**Por que injetar `AppService`?**
- **Separação de responsabilidades**: Controller cuida de rotas, Service de lógica
- **Testabilidade**: Pode mockar o service em testes
- **Reutilização**: Vários controllers podem usar o mesmo service

---

### `app.service.ts`
```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
```

**Função**: Service com lógica de negócio  
**Responsabilidade**:
- Implementar lógica de negócio
- Acessar banco de dados
- Chamar APIs externas
- Processar dados

**`@Injectable()`**: Marca a classe como disponível para Dependency Injection

**Diferença Controller vs Service:**

| Aspecto | Controller | Service |
|---------|-----------|---------|
| Responsabilidade | Roteamento HTTP | Lógica de negócio |
| Decorators | `@Get()`, `@Post()` | Nenhum (só `@Injectable`) |
| Retorna | Response HTTP | Dados processados |
| Acessa DB | ❌ Não | ✅ Sim |
| Testável | Depende de HTTP | ✅ Facilmente |

---

### `app.controller.spec.ts`
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
```

**Função**: Testes unitários do controller  
**Framework**: Jest (incluído no NestJS)

**Anatomia do teste:**
1. **`describe()`**: Agrupa testes relacionados
2. **`beforeEach()`**: Setup antes de cada teste
3. **`Test.createTestingModule()`**: Cria módulo isolado para teste
4. **`it()`**: Define um teste individual
5. **`expect()`**: Asserção do Jest

**Por que testar?**
- ✅ Garantir comportamento esperado
- ✅ Detectar bugs antes de produção
- ✅ Documentar comportamento do código
- ✅ Facilitar refatoração

---

## ✅ Resultado

✔️ API rodando em http://localhost:3000  
✔️ Swagger disponível em http://localhost:3000/swagger  
✔️ Hot reload funcionando (mudanças refletem automaticamente)  
✔️ Estrutura modular pronta para crescer

# 📘 Aula 6 — CRUD de Ponies

## 🎯 Objetivo

Implementar o CRUD completo de personagens (Ponies) com rotas protegidas por JWT.

---

## 🎯 O que vamos construir

- **CreatePonyDto / UpdatePonyDto**: DTOs com documentação Swagger
- **PonySummary Type**: Interface otimizada para listagem
- **PoniesController**: Endpoints REST (POST, GET, PUT, DELETE)
- **PoniesService**: Lógica de negócio e acesso ao banco
- **Repository Pattern**: TypeORM para queries
- **Rotas protegidas**: Todas as rotas requerem autenticação JWT
- **HTTP Status Codes**: 200, 201, 204, 404
- **Swagger completo**: `@ApiResponse`, `@ApiBody`, `@ApiParam`

💡 **Com isso**: Aplicação completa com backend funcional e documentado!

---

## 📋 Conceitos Importantes

### CRUD: As 4 Operações Fundamentais

**CRUD** é um acrônimo para as operações básicas em qualquer sistema:

| Operação | HTTP Verb | Endpoint | Descrição |
|----------|-----------|----------|-----------|
| **C**reate | POST | `/ponies` | Criar novo recurso |
| **R**ead | GET | `/ponies` | Listar todos |
| **R**ead | GET | `/ponies/:id` | Buscar por ID |
| **U**pdate | PUT / PATCH | `/ponies/:id` | Atualizar existente |
| **D**elete | DELETE | `/ponies/:id` | Remover |

### REST: Princípios de API

**RESTful APIs** seguem convenções para URLs e métodos HTTP:

```typescript
// ✅ RESTful (substantivos, plurais)
GET  /ponies       // Listar
POST /ponies       // Criar
GET  /ponies/{id}  // Detalhe
PUT  /ponies/{id}  // Atualizar
DELETE /ponies/{id} // Remover

// ❌ Não RESTful (verbos no URL)
GET  /getPonies
POST /createPony
POST /updatePony
POST /deletePony
```

**Princípios REST:**
- ✅ **Stateless**: Cada request é independente
- ✅ **Recursos** identificados por URLs
- ✅ **Métodos HTTP** semânticos
- ✅ **Status codes** apropriados

### HTTP Status Codes

| Code | Significado | Quando usar |
|------|-------------|-------------|
| 200 OK | Sucesso geral | GET, PUT com retorno |
| 201 Created | Recurso criado | POST |
| 204 No Content | Sucesso sem corpo | DELETE |
| 400 Bad Request | Dados inválidos | Validação falhou |
| 401 Unauthorized | Não autenticado | Token ausente/inválido |
| 404 Not Found | Recurso não existe | GET/PUT/DELETE de ID inexistente |
| 500 Internal Error | Erro do servidor | Exception não tratada |

### DTOs: Create vs. Update

**CreatePonyDto** (campos obrigatórios):
```typescript
export class CreatePonyDto {
  name: string;       // ✅ Sempre obrigatório
  element: string;    // ✅ Sempre obrigatório
  // ... todos obrigatórios
}
```

**UpdatePonyDto** (todos opcionais):
```typescript
export class UpdatePonyDto {
  name?: string;      // ⚠️ Opcional (partial update)
  element?: string;   // ⚠️ Opcional
  isFavorite?: boolean;
  // ... todos opcionais
}
```

**Por que diferentes?**
- **Create**: Precisa de todos os dados para criar
- **Update**: Permite atualizar só 1 campo (PATCH semântico)

> **💡 Nota sobre `isFavorite`:**  
> No `CreatePonyDto`, `isFavorite` é **opcional** porque:  
> - ✅ Tem default `false` na entidade: `@Column({ default: false })`  
> - ✅ Banco aplica o default se não enviado  
> - ✅ Melhora UX: usuário não precisa sempre enviar `false`

### PonySummary: Otimização de Performance

**Problema**: Retornar entidade completa na listagem desperdiça banda:

```typescript
// ❌ Listagem retorna TUDO (ineficiente)
GET /ponies → [
  {
    id, name, isFavorite, element, personality,
    talent, summary, imageUrl, createdAt  // ← 9 campos!
  }
]
```

**Solução**: Interface enxuta só com campos necessários:

```typescript
// ✅ Listagem retorna só essencial
GET /ponies → [
  { id, name, isFavorite, imageUrl }  // ← 4 campos!
]

// ✅ Detalhe retorna completo
GET /ponies/:id → {
  id, name, isFavorite, element, personality,
  talent, summary, imageUrl, createdAt
}
```

**Benefícios:**
- ✅ **Menor payload**: ~60% menor em bytes
- ✅ **Mais rápido**: Menos parsing JSON
- ✅ **Escalável**: Importante com 1000+ registros

---

## 📁 Criar DTOs

Crie a pasta `src/ponies/dto` e os arquivos:

### create-pony.dto.ts

```ts
import { ApiProperty } from '@nestjs/swagger';

export class CreatePonyDto {
  @ApiProperty({
    description: 'Nome do pony',
    example: 'Rainbow Dash',
  })
  name: string;

  @ApiProperty({
    description: 'Elemento de harmonia do pony',
    example: 'Loyalty',
  })
  element: string;

  @ApiProperty({
    description: 'Personalidade do pony',
    example: 'Brave and loyal',
  })
  personality: string;

  @ApiProperty({
    description: 'Talento especial do pony',
    example: 'Flying at supersonic speeds',
  })
  talent: string;

  @ApiProperty({
    description: 'Resumo sobre o pony',
    example:
      'Rainbow Dash is a brave pegasus pony who represents the element of loyalty.',
  })
  summary: string;

  @ApiProperty({
    description: 'URL da imagem do pony',
    example: 'https://example.com/rainbow-dash.png',
  })
  imageUrl: string;

  @ApiProperty({
    description: 'Se o pony é favorito (opcional, padrão: false)',
    example: false,
    required: false,
    default: false,
  })
  isFavorite?: boolean;
}
```

### update-pony.dto.ts

```ts
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePonyDto {
  @ApiPropertyOptional({
    description: 'Nome do pony',
    example: 'Rainbow Dash',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Elemento de harmonia do pony',
    example: 'Loyalty',
  })
  element?: string;

  @ApiPropertyOptional({
    description: 'Se o pony é favorito',
    example: true,
  })
  isFavorite?: boolean;

  @ApiPropertyOptional({
    description: 'Personalidade do pony',
    example: 'Brave and loyal',
  })
  personality?: string;

  @ApiPropertyOptional({
    description: 'Talento especial do pony',
    example: 'Flying at supersonic speeds',
  })
  talent?: string;

  @ApiPropertyOptional({
    description: 'Resumo sobre o pony',
    example: 'Rainbow Dash is a brave pegasus pony who represents the element of loyalty.',
  })
  summary?: string;

  @ApiPropertyOptional({
    description: 'URL da imagem do pony',
    example: 'https://example.com/rainbow-dash.png',
  })
  imageUrl?: string;
}
```

---

## 📦 Criar Tipo PonySummary

Para otimizar a listagem, vamos criar um tipo que retorna apenas os campos essenciais.

Crie a pasta `src/ponies/types` e o arquivo `pony-summary.ts`:

```ts
export interface PonySummary {
  id: string;
  name: string;
  isFavorite: boolean;
  imageUrl: string;
}
```

> **💡 Por quê?** Na listagem não precisamos de todos os campos (element, personality, summary, etc.). Isso reduz o tamanho da resposta e melhora a performance.

---

## 🌐 Implementar o PoniesController

Edite `src/ponies/ponies.controller.ts`:

```ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PoniesService } from './ponies.service';
import { UpdatePonyDto } from './dto/update-pony.dto';
import { CreatePonyDto } from './dto/create-pony.dto';
import { Pony } from './pony.entity';

@ApiTags('Ponies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ponies')
export class PoniesController {
  constructor(private readonly poniesService: PoniesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo pony' })
  @ApiBody({ type: CreatePonyDto })
  @ApiResponse({
    status: 201,
    description: 'Pony criado com sucesso',
    type: Pony,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  create(@Body() dto: CreatePonyDto) {
    return this.poniesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os ponies' })
  @ApiResponse({
    status: 200,
    description: 'Lista de ponies retornada com sucesso',
    type: [Pony],
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  findAll() {
    return this.poniesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pony por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID do pony (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Pony encontrado',
    type: Pony,
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Pony não encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.poniesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar pony' })
  @ApiParam({
    name: 'id',
    description: 'ID do pony (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdatePonyDto })
  @ApiResponse({
    status: 200,
    description: 'Pony atualizado com sucesso',
    type: Pony,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Pony não encontrado',
  })
  update(@Param('id') id: string, @Body() dto: UpdatePonyDto) {
    return this.poniesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover pony' })
  @ApiParam({
    name: 'id',
    description: 'ID do pony (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Pony removido com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Pony não encontrado',
  })
  remove(@Param('id') id: string) {
    return this.poniesService.remove(id);
  }
}
```

### 📝 Explicação do Controller

**1. Decorators de Classe:**
```typescript
@ApiTags('Ponies')         // ← Agrupa no Swagger
@ApiBearerAuth()           // ← Indica que requer token Bearer
@UseGuards(JwtAuthGuard)   // ← Protege TODAS as rotas
@Controller('ponies')       // ← Prefixo /ponies
```
- **`@ApiTags`**: Organiza endpoints no Swagger UI
- **`@ApiBearerAuth`**: Mostra campo de autenticação no Swagger
- **`@UseGuards(JwtAuthGuard)`**: Aplica guard em todas as rotas do controller
- **`@Controller('ponies')`**: Base URL = `/ponies`

**2. Decorators de Rota:**
```typescript
@Post()                    // → POST /ponies
@Get()                     // → GET /ponies
@Get(':id')                // → GET /ponies/{id}
@Put(':id')                // → PUT /ponies/{id}
@Delete(':id')             // → DELETE /ponies/{id}
```

**3. Decorators Swagger:**
```typescript
@ApiOperation({ summary: 'Criar novo pony' })
@ApiBody({ type: CreatePonyDto })
@ApiParam({ name: 'id', description: '...', example: '...' })
@ApiResponse({ status: 201, description: '...', type: Pony })
```
- **`@ApiOperation`**: Descrição do endpoint
- **`@ApiBody`**: Documenta corpo da requisição
- **`@ApiParam`**: Documenta parâmetro de URL
- **`@ApiResponse`**: Documenta possíveis respostas (200, 404, etc)

**4. Status Code Customizado:**
```typescript
@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)  // ← Força 204 ao invés de 200
```
- Por padrão, NestJS retorna `200 OK` em todos os métodos
- DELETE semântico deve retornar `204 No Content` (sem corpo)

**5. Extração de Parâmetros:**
```typescript
@Param('id') id: string        // ← Extrai {id} da URL
@Body() dto: CreatePonyDto     // ← Extrai corpo da requisição
```
- `@Param()`: Parâmetros de rota (`:id`)
- `@Body()`: Corpo JSON da requisição
- `@Query()`: Query params (`?page=1`)

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
import { PonySummary } from './types/pony-summary';

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
  async findAll(): Promise<PonySummary[]> {
    const list = await this.repository.find({
      order: { name: 'ASC' },
    });

    return list.map((pony) => ({
      id: pony.id,
      isFavorite: pony.isFavorite,
      name: pony.name,
      imageUrl: pony.imageUrl,
    }));
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

### 📝 Explicação do Service

**1. Método Create:**
```typescript
async create(dto: CreatePonyDto): Promise<Pony> {
  const pony = this.repository.create(dto);  // ← Instancia (não salva)
  return this.repository.save(pony);         // ← Persiste no banco
}
```
- **`create()`**: Apenas instancia um objeto `Pony` (em memória)
- **`save()`**: Executa INSERT e retorna entidade com ID gerado
- ✅ **Simples e direto**: Não precisa setar propriedade por propriedade

**2. Método FindAll (otimizado):**
```typescript
async findAll(): Promise<PonySummary[]> {
  const list = await this.repository.find({
    order: { name: 'ASC' },  // ← Ordena alfabeticamente
  });

  return list.map((pony) => ({  // ← Projeta só campos necessários
    id: pony.id,
    isFavorite: pony.isFavorite,
    name: pony.name,
    imageUrl: pony.imageUrl,
  }));
}
```
- **`find()`**: Busca todos os registros
- **`order: { name: 'ASC' }`**: Ordena por nome (A-Z)
- **`map()`**: Transforma array de `Pony` em `PonySummary[]`
- ✅ **Performance**: Retorna só 4 campos ao invés de 9

**Alternativa com TypeORM Select (ainda mais otimizado):**
```typescript
// ✅ Melhor: Banco só retorna campos necessários
return this.repository.find({
  select: ['id', 'name', 'isFavorite', 'imageUrl'],
  order: { name: 'ASC' },
});
```

**3. Método FindOne (com validação):**
```typescript
async findOne(id: string): Promise<Pony> {
  const pony = await this.repository.findOne({ where: { id } });
  
  if (!pony) {
    throw new NotFoundException(`Pony #${id} não encontrado`);
  }
  
  return pony;
}
```
- **`findOne()`**: Retorna `null` se não encontrar (não lança erro)
- **Validação manual**: Checamos e lançamos `NotFoundException`
- **`NotFoundException`**: HTTP 404 automaticamente
- ✅ **Reutilizável**: Usado por `update()` e `remove()`

**4. Método Update (partial update):**
```typescript
async update(id: string, dto: UpdatePonyDto): Promise<Pony> {
  const pony = await this.findOne(id);  // ← Busca (404 se não existir)
  
  Object.assign(pony, dto);  // ← Sobrescreve propriedades
  
  return this.repository.save(pony);  // ← UPDATE no banco
}
```
- **`Object.assign()`**: Copia propriedades de `dto` para `pony`
- ✅ **Partial update**: Só atualiza campos enviados
- **Exemplo**:
  ```typescript
  // DTO com só 1 campo
  { "name": "Novo Nome" }
  
  // Atualiza só o nome, mantém resto
  ```

**5. Método Remove:**
```typescript
async remove(id: string): Promise<void> {
  const pony = await this.findOne(id);  // ← Busca (404 se não existir)
  await this.repository.remove(pony);   // ← DELETE no banco
}
```
- **`remove(pony)`**: Executa DELETE
- **`Promise<void>`**: Não retorna nada (204 No Content no controller)
- ✅ **Validação garantida**: `findOne()` lança 404 antes de tentar remover

**Repository vs. Manager:**
| Repository | EntityManager |
|------------|---------------|
| ✅ Tipado por entidade | ❌ Genérico |
| `repository.findOne()` | `manager.findOne(Pony)` |
| ✅ Menos verboso | ❌ Mais verboso |
| ✅ Recomendado | ⚠️ Para casos específicos |

---

## 🧪 Testar no Swagger

### 1. Autenticar

- Faça login e copie o `access_token`
- Clique em **🔓 Authorize** no Swagger
- Cole o token

### 2. Criar um Pony (POST /ponies)

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

### 3. Listar todos (GET /ponies)

### 4. Buscar por ID (GET /ponies/:id)

### 5. Atualizar (PUT /ponies/:id)

```json
{
  "personality": "Líder, inteligente e dedicada"
}
```

### 6. Remover (DELETE /ponies/:id)

---

## ✅ Resultado

✔️ CRUD completo funcionando  
✔️ Rotas protegidas por JWT  
✔️ Tratamento de erros (404)  
✔️ Documentado no Swagger

---

# 🎓 Conclusão do Backend

Parabéns! 🎉 Você completou a implementação do backend:

✅ API NestJS com SQLite  
✅ TypeORM com Migrations  
✅ Cadastro de usuários com bcrypt  
✅ Autenticação JWT  
✅ Guards e proteção de rotas  
✅ CRUD completo de Ponies  
✅ Documentação Swagger  

**Próximos passos:**
1. Adicionar validação com class-validator
2. Adicionar testes unitários e E2E
3. Criar e integrar o frontend Angular

🦄✨

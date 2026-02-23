# 📘 Aula 6 — CRUD de Ponies

## 🎯 Objetivo

Implementar o CRUD completo de personagens (Ponies) com rotas protegidas.

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

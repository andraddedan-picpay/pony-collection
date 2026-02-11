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

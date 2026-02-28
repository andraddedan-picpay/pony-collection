# 📘 Aula 7A — Upload de Imagens (Parte 1: Multer e Configuração)

> 📌 **Parte 2:** [07b-upload-imagens.md](07b-upload-imagens.md) — Static Assets, Testes e Melhorias

**Progresso do Curso Backend:** `[███████████████████░] 95% concluído`

## 🎯 Objetivo

Implementar upload de imagens com validação, armazenamento local e acesso via URL pública.

---

## 🎯 O que vamos construir

- **Multer Configuration**: Configuração isolada de upload (storage, validação, limites)
- **UploadFileDto**: DTO para documentar upload multipart/form-data
- **UploadResponseDto**: Resposta com URL pública da imagem
- **POST /ponies/upload**: Endpoint protegido para upload
- **Static Assets**: Servir arquivos da pasta `uploads/`
- **Validações**: Tipo de arquivo (imagens) e tamanho máximo (2MB)

💡 **Com isso**: Frontend pode fazer upload e receber URL para usar no cadastro de ponies!

---

## 📋 Conceitos Importantes

### Upload de Arquivos em APIs REST

**Multer** é o middleware padrão do NestJS para processar uploads `multipart/form-data`:

```typescript
// ❌ JSON não funciona para arquivos
POST /upload
Content-Type: application/json
{ "file": "..." } // 🚫 Como enviar bytes?

// ✅ Multipart/form-data é o padrão
POST /upload
Content-Type: multipart/form-data; boundary=----...
------boundary
Content-Disposition: form-data; name="file"; filename="pony.png"
Content-Type: image/png

[BINARY DATA]
------boundary--
```

**Fluxo de Upload:**
```
1. Frontend seleciona arquivo (input type="file")
2. Envia via FormData (multipart/form-data)
3. NestJS/Multer intercepta e processa
4. Salva em disco com nome único
5. Retorna URL pública
```

### FileInterceptor vs. FilesInterceptor

| Interceptor | Uso | Parâmetro Controller |
|-------------|-----|---------------------|
| `FileInterceptor('file')` | Upload de **1 arquivo** | `@UploadedFile()` |
| `FilesInterceptor('files', 10)` | Upload de **múltiplos** (máx 10) | `@UploadedFiles()` |
| `FileFieldsInterceptor([...])` | Upload de **campos múltiplos** | `@UploadedFiles()` |

> 💡 **Nosso caso**: Usamos `FileInterceptor` porque cada pony tem apenas 1 imagem.

### Storage: Disk vs. Memory

**Disk Storage** (padrão recomendado):
```typescript
storage: diskStorage({
  destination: './uploads',  // ← Salva em disco
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random()}.png`;
    cb(null, uniqueName);
  }
})
```
- ✅ Persiste após restart do servidor
- ✅ Não consome RAM
- ✅ Pode servir via CDN/nginx depois
- ⚠️ Precisa de acesso ao sistema de arquivos

**Memory Storage** (temporário):
```typescript
storage: memoryStorage()
```
- ⚠️ Arquivo fica em `file.buffer` (RAM)
- ⚠️ Perdido ao reiniciar servidor
- ✅ Útil para processar e enviar para S3/Cloud
- ✅ Não cria arquivos temporários

> 🎯 **Nossa escolha**: Disk storage para persistência local.

### Validações de Arquivo

**1. Tipo de Arquivo (MIME Type):**
```typescript
fileFilter: (req, file, callback) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
    return callback(new BadRequestException('Apenas imagens'), false);
  }
  callback(null, true);  // ← Aceita
}
```

**MIMETypes comuns:**
| Extensão | MIME Type |
|----------|-----------|
| `.jpg` | `image/jpeg` |
| `.png` | `image/png` |
| `.gif` | `image/gif` |
| `.webp` | `image/webp` |
| `.pdf` | `application/pdf` |

**2. Tamanho Máximo:**
```typescript
limits: {
  fileSize: 2 * 1024 * 1024  // 2MB em bytes
}
```
- ✅ Evita uploads gigantes
- ✅ Protege espaço em disco
- ✅ Melhora performance

**Por que 2MB?**
- Imagens otimizadas para web: 100-500KB
- 2MB permite fotos de alta qualidade
- Suficiente para 95% dos casos de uso

### Nome Único de Arquivo

**Problema**: Conflito de nomes
```typescript
// ❌ Múltiplos usuários enviando "photo.jpg"
uploads/
  photo.jpg      // ← Sobrescreve!
  photo.jpg      // ← Perdido!
```

**Solução**: Timestamp + Random
```typescript
filename: (req, file, callback) => {
  const timestamp = Date.now();               // 1234567890
  const random = Math.round(Math.random() * 1e9);  // 987654321
  const ext = extname(file.originalname);     // .png
  
  const uniqueName = `${timestamp}-${random}${ext}`;
  callback(null, uniqueName);  // → 1234567890-987654321.png
}
```

**Resultado:**
```
uploads/
  1234567890-987654321.png
  1234567891-123456789.jpg
  1234567892-555555555.webp
```

### Static Assets no NestJS

Para acessar arquivos via HTTP (`http://localhost:3000/uploads/file.png`):

```typescript
// main.ts
app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  prefix: '/uploads/',
});
```

**Mapeamento:**
| Sistema de Arquivos | URL Pública |
|---------------------|-------------|
| `./uploads/123.png` | `http://localhost:3000/uploads/123.png` |
| `./uploads/abc.jpg` | `http://localhost:3000/uploads/abc.jpg` |

> ⚠️ **Produção**: Use CDN (CloudFront, Cloudflare) ou Object Storage (S3) para melhor performance.

---

## 📦 Instalar Dependências

```bash
npm install --save-dev @types/multer
```

> 💡 **Por quê?** TypeScript precisa das tipagens de `Express.Multer.File`.

---

## ⚙️ Criar Configuração do Multer

Crie a pasta `src/ponies/config/` e o arquivo `multer.config.ts`:

```ts
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { MulterModuleOptions } from '@nestjs/platform-express';

export const multerConfig: MulterModuleOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (
      _req: Express.Request,
      file: Express.Multer.File,
      callback: (error: Error | null, filename: string) => void,
    ) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      callback(null, `${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (
    _req: Express.Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      return callback(
        new BadRequestException('Apenas imagens são permitidas'),
        false,
      );
    }
    callback(null, true);
  },
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
};
```

### 📝 Explicação da Configuração

**1. Storage (diskStorage):**
```typescript
storage: diskStorage({
  destination: './uploads',  // ← Pasta onde salvar
  filename: (req, file, callback) => {
    // Gerar nome único
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);  // .png, .jpg, etc
    callback(null, `${uniqueSuffix}${ext}`);
  }
})
```
- **`destination`**: Pasta relativa à raiz do projeto
- **`filename`**: Função que gera nome único
  - `Date.now()`: Timestamp em milissegundos
  - `Math.random() * 1e9`: Número aleatório (0-999999999)
  - `extname()`: Extrai extensão do arquivo original

**Exemplo de geração:**
```typescript
// Arquivo original: "minha-foto.png"
const timestamp = 1234567890;
const random = 555555555;
const ext = ".png";

// Resultado: "1234567890-555555555.png"
```

**2. FileFilter (validação):**
```typescript
fileFilter: (req, file, callback) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
    return callback(
      new BadRequestException('Apenas imagens são permitidas'),
      false  // ← Rejeita arquivo
    );
  }
  callback(null, true);  // ← Aceita arquivo
}
```
- **`file.mimetype`**: Ex: `"image/png"`, `"image/jpeg"`
- **Regex**: Valida se termina com `/jpg`, `/jpeg`, `/png`, etc
- **BadRequestException**: Lança erro 400 se inválido

**Tipos aceitos:**
| MIME Type | Extensão |
|-----------|----------|
| `image/jpeg` | `.jpg`, `.jpeg` |
| `image/png` | `.png` |
| `image/gif` | `.gif` |
| `image/webp` | `.webp` |

**3. Limits (tamanho):**
```typescript
limits: {
  fileSize: 2 * 1024 * 1024  // 2MB
}
```
- **Cálculo**: 2 × 1024 × 1024 = 2,097,152 bytes
- ✅ Bloqueia arquivos maiores que 2MB
- 🚫 Lança erro automático se exceder

**Conversão de tamanhos:**
| Unidade | Bytes | Cálculo |
|---------|-------|---------|
| 1 KB | 1,024 | `1024` |
| 1 MB | 1,048,576 | `1024 * 1024` |
| 2 MB | 2,097,152 | `2 * 1024 * 1024` |
| 5 MB | 5,242,880 | `5 * 1024 * 1024` |

---

## 📁 Criar DTOs de Upload

### upload-file.dto.ts

Crie em `src/ponies/dto/upload-file.dto.ts`:

```ts
import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Arquivo de imagem (jpg, jpeg, png, gif, webp)',
  })
  file: Express.Multer.File;
}
```

> 💡 **Swagger**: `format: 'binary'` mostra campo de upload de arquivo na UI.

### upload-response.dto.ts

Crie em `src/ponies/dto/upload-response.dto.ts`:

```ts
import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({
    description: 'URL pública da imagem enviada',
    example: 'http://localhost:3000/uploads/1234567890-pony.png',
  })
  imageUrl: string;
}
```

**📝 Explicação dos DTOs:**

**UploadFileDto** (Request):
- **`type: 'string'`**: Swagger interpreta como string
- **`format: 'binary'`**: Indica que é arquivo binário
- **Campo `file`**: Nome deve corresponder ao `FileInterceptor('file')`

**UploadResponseDto** (Response):
- **`imageUrl`**: URL completa para acesso público
- **`example`**: Ajuda na documentação Swagger

---

## 🌐 Adicionar Endpoint de Upload no Controller

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
  UseInterceptors,  // ← Adicionar
  UploadedFile,     // ← Adicionar
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';  // ← Adicionar
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiConsumes,  // ← Adicionar
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PoniesService } from './ponies.service';
import { UpdatePonyDto } from './dto/update-pony.dto';
import { CreatePonyDto } from './dto/create-pony.dto';
import { UploadFileDto } from './dto/upload-file.dto';        // ← Adicionar
import { UploadResponseDto } from './dto/upload-response.dto'; // ← Adicionar
import { Pony } from './pony.entity';

@ApiTags('Ponies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ponies')
export class PoniesController {
  constructor(private readonly poniesService: PoniesService) {}

  // ✅ NOVO: Endpoint de Upload
  @Post('upload')
  @ApiOperation({ summary: 'Upload de imagem do pony' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadFileDto })
  @ApiResponse({
    status: 201,
    description: 'Imagem enviada com sucesso',
    type: UploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Arquivo inválido',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file: Express.Multer.File): UploadResponseDto {
    return this.poniesService.processImageUpload(file);
  }

  // ... resto dos endpoints (create, findAll, etc)
}
```

### 📝 Explicação do Endpoint

**1. Decorators de Rota:**
```typescript
@Post('upload')  // → POST /ponies/upload
```
- **Ordem importa**: Declarar **antes** de `@Post()` (sem path)
- **Por quê?** NestJS processa rotas na ordem declarada
  - ✅ `/ponies/upload` → Pega primeiro
  - ❌ `/ponies/:id` → Pegaria "upload" como ID se viesse antes

**2. Decorators Swagger:**
```typescript
@ApiConsumes('multipart/form-data')  // ← Indica tipo de conteúdo
@ApiBody({ type: UploadFileDto })    // ← Documenta input
```
- **`@ApiConsumes`**: Muda UI do Swagger para mostrar upload
- **`@ApiBody`**: Define schema do body (file)

**Comparação:**
| Content-Type | Swagger UI |
|--------------|-----------|
| `application/json` | Editor JSON |
| `multipart/form-data` | **Botão "Choose File"** |

**3. FileInterceptor:**
```typescript
@UseInterceptors(FileInterceptor('file'))
```
- **`'file'`**: Nome do campo no FormData
- **Intercepta** a requisição antes de chegar no handler
- **Processa** o arquivo via Multer
- **Injeta** resultado em `@UploadedFile()`

**Frontend correspondente (Angular):**
```typescript
const formData = new FormData();
formData.append('file', selectedFile);  // ← Nome deve ser 'file'
```

**4. @UploadedFile Decorator:**
```typescript
uploadImage(@UploadedFile() file: Express.Multer.File)
```
- **Extrai** o arquivo processado pelo Multer
- **Tipo**: `Express.Multer.File`

**Estrutura de `Express.Multer.File`:**
```typescript
{
  fieldname: 'file',
  originalname: 'rainbow-dash.png',
  encoding: '7bit',
  mimetype: 'image/png',
  destination: './uploads',
  filename: '1234567890-987654321.png',  // ← Nome único gerado
  path: './uploads/1234567890-987654321.png',
  size: 45678  // bytes
}
```

**5. Fluxo Completo:**
```
1. Request chega: POST /ponies/upload (multipart/form-data)
2. JwtAuthGuard: Valida token JWT
3. FileInterceptor: Processa arquivo via Multer config
   3.1. fileFilter: Valida tipo de imagem
   3.2. storage: Salva em ./uploads/ com nome único
   3.3. limits: Checa tamanho < 2MB
4. @UploadedFile: Injeta objeto file
5. Controller: Chama service.processImageUpload(file)
6. Service: Retorna { imageUrl: '...' }
7. Response: 201 Created com UploadResponseDto
```

---

## ⚙️ Implementar Lógica no Service

Edite `src/ponies/ponies.service.ts`:

```ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,  // ← Adicionar
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pony } from './pony.entity';
import { CreatePonyDto } from './dto/create-pony.dto';
import { UpdatePonyDto } from './dto/update-pony.dto';
import { UploadResponseDto } from './dto/upload-response.dto';  // ← Adicionar
import { PonySummary } from './types/pony-summary';

@Injectable()
export class PoniesService {
  constructor(
    @InjectRepository(Pony)
    private repository: Repository<Pony>,
  ) {}

  // ... métodos existentes (create, findAll, etc)

  // ✅ NOVO: Processar upload de imagem
  processImageUpload(file: Express.Multer.File): UploadResponseDto {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo foi enviado');
    }

    // TODO: Mover para variável de ambiente
    const baseUrl = 'http://localhost:3000';
    const imageUrl = `${baseUrl}/uploads/${file.filename}`;

    return { imageUrl };
  }
}
```

### 📝 Explicação do Método

**1. Validação de Arquivo:**
```typescript
if (!file) {
  throw new BadRequestException('Nenhum arquivo foi enviado');
}
```
- **Cenário**: Frontend esqueceu de enviar arquivo
- **BadRequestException**: HTTP 400
- **Mensagem clara**: Facilita debug

**2. Construção da URL:**
```typescript
const baseUrl = 'http://localhost:3000';
const imageUrl = `${baseUrl}/uploads/${file.filename}`;
```

**Exemplo:**
```typescript
// Input
file.filename = "1234567890-987654321.png"

// Output
imageUrl = "http://localhost:3000/uploads/1234567890-987654321.png"
```

**3. Retorno:**
```typescript
return { imageUrl };  // UploadResponseDto
```

**JSON Response:**
```json
{
  "imageUrl": "http://localhost:3000/uploads/1234567890-987654321.png"
}
```

**⚠️ TODO: Variável de Ambiente**

Hardcoded `http://localhost:3000` é ruim para produção:

```typescript
// ❌ Ruim: hardcoded
const baseUrl = 'http://localhost:3000';

// ✅ Bom: variável de ambiente
const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
```

**`.env` (desenvolvimento):**
```
BASE_URL=http://localhost:3000
```

**`.env` (produção):**
```
BASE_URL=https://api.meuapp.com
```

---

## 📦 Registrar Multer no Módulo

Edite `src/ponies/ponies.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { MulterModule } from '@nestjs/platform-express';  // ← Adicionar
import { Pony } from './pony.entity';
import { PoniesController } from './ponies.controller';
import { PoniesService } from './ponies.service';
import { multerConfig } from './config/multer.config';  // ← Adicionar

@Module({
  imports: [
    TypeOrmModule.forFeature([Pony]),
    MulterModule.register(multerConfig),  // ← Adicionar
  ],
  controllers: [PoniesController],
  providers: [PoniesService],
})
export class PoniesModule {}
```

### 📝 Explicação do Registro

**MulterModule.register():**
```typescript
MulterModule.register(multerConfig)
```
- **Registra** configuração globalmente no módulo
- **Aplica** configurações de storage, fileFilter e limits
- **Disponibiliza** FileInterceptor com as configs

**Por que registrar?**
- ✅ **DRY**: Evita repetir config em cada endpoint
- ✅ **Centralizado**: Uma fonte de verdade
- ✅ **Testável**: Fácil mockar em testes

**Alternativa (inline):**
```typescript
// ❌ Não recomendado: repetitivo
@UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({ ... }),
  fileFilter: () => { ... },
  limits: { ... }
}))
```

---

## 🎯 Próximos Passos

Continue para a [Parte 2 (07b-upload-imagens.md)](07b-upload-imagens.md) para:

- ✅ Configurar Static Assets no main.ts
- ✅ Testar upload via Swagger, cURL e Postman
- ✅ Validar erros (arquivo inválido, tamanho, auth)
- ✅ Integrar com Create Pony
- ✅ Aprender melhorias (env, otimização, cloud)
- ✅ Conclusão e checklist final

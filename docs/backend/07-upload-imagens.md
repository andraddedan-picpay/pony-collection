# 📘 Aula 7 — Upload de Imagens

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

## 🌐 Servir Arquivos Estáticos

Edite `src/main.ts`:

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';  // ← Adicionar
import { join } from 'path';  // ← Adicionar

async function bootstrap() {
  // ✅ Mudar tipo para NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ✅ NOVO: Servir arquivos estáticos da pasta uploads
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Habilitar CORS para permitir requisições do frontend
  app.enableCors({
    origin: 'http://localhost:4200',
    credentials: true,
  });

  // Configuração Swagger
  const config = new DocumentBuilder()
    .setTitle('Pony Collection API')
    .setDescription('API para gerenciar coleção de ponies')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log('🦄 API rodando em http://localhost:3000');
  console.log('📚 Swagger em http://localhost:3000/api');
}
bootstrap();
```

### 📝 Explicação de Static Assets

**1. NestExpressApplication:**
```typescript
const app = await NestFactory.create<NestExpressApplication>(AppModule);
```
- **Generic type**: Adiciona métodos específicos do Express
- **`useStaticAssets()`**: Método exclusivo de `NestExpressApplication`

**2. useStaticAssets():**
```typescript
app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  prefix: '/uploads/',
});
```

**Parâmetros:**
- **Caminho**: `join(__dirname, '..', 'uploads')`
  - `__dirname`: `/dist` (após build)
  - `'..'`: Sobe 1 nível (raiz do projeto)
  - `'uploads'`: Pasta de destino
  - **Resultado**: `/projeto/uploads/`

- **Prefix**: `/uploads/`
  - URL base para acessar arquivos
  - Ex: `http://localhost:3000/uploads/file.png`

**Mapeamento visual:**
```
Estrutura de arquivos:
projeto/
├── dist/           ← __dirname (após build)
├── uploads/        ← join(__dirname, '..', 'uploads')
│   ├── 123.png
│   └── 456.jpg
└── src/

URLs públicas:
http://localhost:3000/uploads/123.png
http://localhost:3000/uploads/456.jpg
```

**3. Por que é necessário?**

Por padrão, NestJS **não serve arquivos estáticos**:

```typescript
// ❌ Sem useStaticAssets
GET http://localhost:3000/uploads/123.png
→ 404 Not Found

// ✅ Com useStaticAssets
GET http://localhost:3000/uploads/123.png
→ 200 OK (retorna imagem)
```

**4. Alternativas para Produção:**

| Solução | Prós | Contras |
|---------|------|---------|
| **NestJS Static** | Simples, zero config | Não escalável |
| **nginx/Apache** | Performance, cache | Infraestrutura extra |
| **CDN (CloudFront)** | Global, rápido | Custo, complexidade |
| **S3 + CloudFront** | Escalável, durável | Migração necessária |

> 💡 **Recomendação**: Desenvolvimento local OK, produção use CDN.

---

## 🧪 Testar Upload

### 1. Via Swagger UI

1. **Autenticar:**
   - Faça login: `POST /auth/login`
   - Copie o `access_token`
   - Clique em **🔓 Authorize**
   - Cole o token no campo **Value**
   - Clique em **Authorize** e **Close**

2. **Fazer Upload:**
   - Abra **POST /ponies/upload**
   - Clique em **Try it out**
   - Clique em **Choose File**
   - Selecione uma imagem (PNG, JPG, etc)
   - Clique em **Execute**

3. **Resultado Esperado:**
```json
{
  "imageUrl": "http://localhost:3000/uploads/1234567890-987654321.png"
}
```

4. **Acessar Imagem:**
   - Copie a URL retornada
   - Abra em nova aba do navegador
   - ✅ Deve exibir a imagem

### 2. Via cURL

```bash
# 1. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "senha123"}'

# Resposta:
# { "access_token": "eyJhbGc..." }

# 2. Upload (substituir TOKEN)
curl -X POST http://localhost:3000/ponies/upload \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -F "file=@./caminho/para/imagem.png"

# Resposta:
# { "imageUrl": "http://localhost:3000/uploads/..." }
```

### 3. Via Postman

1. **Criar Request:**
   - Method: `POST`
   - URL: `http://localhost:3000/ponies/upload`

2. **Headers:**
   - `Authorization`: `Bearer SEU_TOKEN`

3. **Body:**
   - Selecione **form-data**
   - Key: `file` (tipo **File**)
   - Value: Selecione imagem do disco

4. **Send** → Copiar `imageUrl` da resposta

### 4. Testar Validações

**a) Arquivo inválido (PDF):**
```bash
curl -X POST http://localhost:3000/ponies/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@documento.pdf"

# ❌ Resposta:
# {
#   "statusCode": 400,
#   "message": "Apenas imagens são permitidas"
# }
```

**b) Arquivo muito grande (> 2MB):**
```bash
curl -X POST http://localhost:3000/ponies/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@imagem-gigante.png"

# ❌ Resposta:
# {
#   "statusCode": 400,
#   "message": "File too large"
# }
```

**c) Sem arquivo:**
```bash
curl -X POST http://localhost:3000/ponies/upload \
  -H "Authorization: Bearer TOKEN"

# ❌ Resposta:
# {
#   "statusCode": 400,
#   "message": "Nenhum arquivo foi enviado"
# }
```

**d) Sem autenticação:**
```bash
curl -X POST http://localhost:3000/ponies/upload \
  -F "file=@imagem.png"

# ❌ Resposta:
# {
#   "statusCode": 401,
#   "message": "Unauthorized"
# }
```

---

## 🔗 Integração com Create Pony

**Fluxo completo no Frontend:**

```typescript
// 1. Upload da imagem
const uploadResponse = await fetch('http://localhost:3000/ponies/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData  // FormData com file
});

const { imageUrl } = await uploadResponse.json();
// → imageUrl = "http://localhost:3000/uploads/123.png"

// 2. Criar pony com a imageUrl
const createResponse = await fetch('http://localhost:3000/ponies', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: "Rainbow Dash",
    element: "Loyalty",
    personality: "Brave",
    talent: "Flying",
    summary: "Fast pegasus",
    imageUrl: imageUrl  // ← URL da imagem
  })
});
```

**Sequência:**
```
1. Frontend: Seleciona arquivo
2. Frontend → API: POST /ponies/upload (multipart/form-data)
3. API: Salva em ./uploads/, retorna URL
4. Frontend: Recebe { imageUrl: "http://..." }
5. Frontend: Preenche form com imageUrl
6. Frontend → API: POST /ponies (JSON com imageUrl)
7. API: Salva pony no banco com imageUrl
8. Frontend: Exibe pony com imagem
```

---

## ✅ Resultado

✔️ Upload de imagens funcionando  
✔️ Validação de tipo (apenas imagens)  
✔️ Validação de tamanho (máx 2MB)  
✔️ Nomes únicos (sem conflitos)  
✔️ URLs públicas acessíveis  
✔️ Documentado no Swagger  
✔️ Rotas protegidas por JWT  

---

## 🎯 Próximos Passos

**✅ Melhorias Recomendadas:**

1. **Variáveis de Ambiente:**
```typescript
// ✅ .env
BASE_URL=http://localhost:3000
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=2097152

// ✅ ConfigService
@Injectable()
export class PoniesService {
  constructor(
    private configService: ConfigService
  ) {}

  processImageUpload(file: Express.Multer.File) {
    const baseUrl = this.configService.get('BASE_URL');
    const imageUrl = `${baseUrl}/uploads/${file.filename}`;
    return { imageUrl };
  }
}
```

2. **Otimização de Imagens:**
```bash
npm install sharp
```

```typescript
import * as sharp from 'sharp';

async processImageUpload(file: Express.Multer.File) {
  // Redimensionar para máx 800px
  await sharp(file.path)
    .resize(800, 800, { fit: 'inside' })
    .toFile(`${file.path}-optimized.jpg`);
  
  // Usar versão otimizada
}
```

3. **Limpeza de Arquivos Órfãos:**
```typescript
// Cron job para remover arquivos não usados
@Cron('0 0 * * *')  // Todo dia à meia-noite
async cleanupUnusedFiles() {
  const filesInDisk = await fs.readdir('./uploads');
  const filesInDB = await this.repository.find({ select: ['imageUrl'] });
  
  const usedFiles = filesInDB.map(p => extractFilename(p.imageUrl));
  const orphans = filesInDisk.filter(f => !usedFiles.includes(f));
  
  for (const file of orphans) {
    await fs.unlink(`./uploads/${file}`);
  }
}
```

4. **Migração para Cloud Storage:**
```typescript
// AWS S3
import { S3 } from 'aws-sdk';

async uploadToS3(file: Express.Multer.File) {
  const s3 = new S3();
  const result = await s3.upload({
    Bucket: 'my-bucket',
    Key: file.filename,
    Body: file.buffer,
    ContentType: file.mimetype,
  }).promise();
  
  return { imageUrl: result.Location };
}
```

---

## 🎓 Conclusão

Parabéns! 🎉 Você implementou upload de imagens com todas as validações e boas práticas:

✅ **Multer** configurado com storage, validação e limites  
✅ **DTOs tipados** para request e response  
✅ **Endpoint protegido** por JWT  
✅ **Static assets** para servir imagens  
✅ **Validações** de tipo e tamanho  
✅ **Nomes únicos** sem conflitos  
✅ **Documentação Swagger** completa  

**Arquitetura limpa:**
- **Controller**: Orquestra upload (FileInterceptor)
- **Service**: Processa arquivo e retorna URL
- **Config**: Configuração isolada e reutilizável
- **DTOs**: Contratos tipados e documentados

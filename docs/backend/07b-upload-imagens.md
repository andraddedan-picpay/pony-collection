# 📘 Aula 7B — Upload de Imagens (Parte 2: Static Assets e Testes)

> 📌 **Parte 1:** [07a-upload-imagens.md](07a-upload-imagens.md) — Multer e Configuração

**Progresso do Curso Backend:** `[████████████████████] 100% concluído`

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

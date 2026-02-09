# 📘 Aula 5 — Login e JWT

## 🎯 Objetivo

Autenticar usuários e gerar token JWT.

---

## 🧠 Conceitos

- JWT
- Payload
- Validação de credenciais

---

## 📦 Dependências

```bash
npm install @nestjs/jwt passport-jwt passport
npm install -D @types/passport-jwt
```

---

## 🔐 Auth Service

```ts
async login(email: string, password: string) {
  const user = await this.usersService.findByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new UnauthorizedException();
  }

  const payload = { sub: user.id, email: user.email };

  return {
    access_token: this.jwtService.sign(payload),
  };
}
```

---

## ✅ Resultado

✔️ Login gera JWT
✔️ Credenciais validadas

---

# 📘 Aula 6 — Guards e Rotas Protegidas

## 🎯 Objetivo

Proteger endpoints.

---

## 🧠 Conceitos

- Strategy
- Guard
- Request User

---

## 🔐 JWT Strategy

```ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: "secret",
    });
  }

  validate(payload: any) {
    return payload;
  }
}
```

---

## 🛡️ Guard

```ts
@UseGuards(JwtAuthGuard)
@Get()
findAll() {
  return this.poniesService.findAll();
}
```

---

## ✅ Resultado

✔️ API protegida
✔️ Usuário disponível no request

---

# 📘 Aula 7 — CRUD de Poneys

## 🎯 Objetivo

Criar o CRUD completo.

---

## Endpoints

- `POST /ponies`
- `GET /ponies`
- `GET /ponies/:id`
- `DELETE /ponies/:id`

---

## 🧠 Conceitos

- Repository
- DTO
- REST

---

## ✅ Resultado

✔️ CRUD funcional
✔️ Integração com frontend preparada

---

# 📘 Aula 8 — Favoritos

## 🎯 Objetivo

Relacionar User x Pony.

---

## Exemplos de endpoints

- `POST /favorites/:ponyId`
- `DELETE /favorites/:ponyId`
- `GET /favorites`

---

## 🧠 Conceitos

- N:N
- Query otimizada
- Contexto do usuário

---

## ✅ Resultado

✔️ Favoritar funcionando
✔️ Relação persistida

---

# 📘 Aula 9 — Logout com JWT

## 🎯 Objetivo

Explicar logout stateless.

---

## 🧠 Conceitos

- JWT é stateless
- Logout no frontend
- Blacklist (conceito)

---

## Implementação didática

- Frontend remove token
- Backend apenas valida token

---

## ✅ Resultado

✔️ Fluxo de autenticação completo

---

Perfeito 📄✨
Vamos **definir o contrato completo da API**, já pensando em **Swagger/OpenAPI**, integração fácil com o Angular e clareza didática para o workshop.

Vou organizar em:

1. 🌐 Visão geral da API
2. 🔐 Autenticação
3. 🧑 Usuários
4. 🦄 Poneys
5. ⭐ Favoritos
6. 📘 Swagger no NestJS
7. 📑 Resumo do contrato (tabela)

Tudo já no **formato que você pode virar documentação oficial do curso**.

---

# 📄 Contrato da API — My Little Pony API 🦄

## 🌐 Visão Geral

- **Base URL:** `http://localhost:3000`
- **Autenticação:** JWT Bearer Token
- **Formato:** JSON
- **Proteção:** Rotas privadas usam `Authorization: Bearer <token>`

---

## 🔐 Autenticação

### 🟢 Registro de Usuário

**POST** `/auth/register`

📥 Request

```json
{
  "name": "Twilight Sparkle",
  "email": "twilight@pony.com",
  "password": "123456"
}
```

📤 Response `201`

```json
{
  "id": "uuid",
  "name": "Twilight Sparkle",
  "email": "twilight@pony.com",
  "createdAt": "2026-01-01T10:00:00Z"
}
```

---

### 🟢 Login

**POST** `/auth/login`

📥 Request

```json
{
  "email": "twilight@pony.com",
  "password": "123456"
}
```

📤 Response `200`

```json
{
  "access_token": "jwt-token"
}
```

---

### 🔴 Logout (conceitual)

**POST** `/auth/logout`

🔐 Header

```
Authorization: Bearer <token>
```

📤 Response `200`

```json
{
  "message": "Logout realizado com sucesso"
}
```

> ℹ️ No workshop explicamos que o logout real é feito no frontend (remoção do token).

---

## 🧑 Usuários

### 🟢 Buscar usuário logado

**GET** `/users/me`

🔐 Header

```
Authorization: Bearer <token>
```

📤 Response

```json
{
  "id": "uuid",
  "name": "Twilight Sparkle",
  "email": "twilight@pony.com"
}
```

---

## 🦄 Poneys

### 🟢 Criar Pony

**POST** `/ponies`

🔐 Header

```
Authorization: Bearer <token>
```

📥 Request

```json
{
  "name": "Rainbow Dash",
  "description": "A poney mais rápida de Equestria",
  "imageUrl": "https://..."
}
```

📤 Response `201`

```json
{
  "id": "uuid",
  "name": "Rainbow Dash",
  "description": "A poney mais rápida de Equestria",
  "imageUrl": "https://...",
  "createdAt": "2026-01-01T10:00:00Z"
}
```

---

### 🟢 Listar Poneys

**GET** `/ponies`

🔐 Header

```
Authorization: Bearer <token>
```

📤 Response

```json
[
  {
    "id": "uuid",
    "name": "Pinkie Pie",
    "imageUrl": "https://...",
    "isFavorite": true
  }
]
```

> 💡 `isFavorite` já facilita MUITO o frontend

---

### 🟢 Detalhar Pony

**GET** `/ponies/:id`

📤 Response

```json
{
  "id": "uuid",
  "name": "Applejack",
  "description": "Trabalhadora e honesta",
  "imageUrl": "https://...",
  "isFavorite": false,
  "createdAt": "2026-01-01T10:00:00Z"
}
```

---

### 🔴 Remover Pony

**DELETE** `/ponies/:id`

📤 Response `204 No Content`

---

## ⭐ Favoritos

### ⭐ Favoritar Pony

**POST** `/favorites/:ponyId`

🔐 Header

```
Authorization: Bearer <token>
```

📤 Response

```json
{
  "message": "Pony favoritado"
}
```

---

### ❌ Desfavoritar Pony

**DELETE** `/favorites/:ponyId`

📤 Response

```json
{
  "message": "Pony removido dos favoritos"
}
```

---

### ⭐ Listar Favoritos do Usuário

**GET** `/favorites`

📤 Response

```json
[
  {
    "id": "uuid",
    "pony": {
      "id": "uuid",
      "name": "Fluttershy",
      "imageUrl": "https://..."
    }
  }
]
```

---

## 📘 Swagger no NestJS

### 📦 Dependência

```bash
npm install @nestjs/swagger swagger-ui-express
```

---

### ⚙️ Configuração no `main.ts`

```ts
const config = new DocumentBuilder()
  .setTitle("My Little Pony API")
  .setDescription("API de coleção de poneys")
  .setVersion("1.0")
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup("api", app, document);
```

Acessar:

```
http://localhost:3000/api
```

---

### 🧩 Exemplo de Decorators

```ts
@ApiBearerAuth()
@ApiTags('Poneys')
@Controller('ponies')
export class PoniesController {
```

```ts
@ApiOperation({ summary: 'Listar poneys' })
@ApiResponse({ status: 200, description: 'Lista de poneys' })
```

---

## 📑 Resumo do Contrato

| Método | Endpoint           | Protegido | Descrição        |
| ------ | ------------------ | --------- | ---------------- |
| POST   | /auth/register     | ❌        | Cadastro         |
| POST   | /auth/login        | ❌        | Login            |
| POST   | /auth/logout       | ✅        | Logout           |
| GET    | /users/me          | ✅        | Usuário logado   |
| POST   | /ponies            | ✅        | Criar pony       |
| GET    | /ponies            | ✅        | Listar           |
| GET    | /ponies/:id        | ✅        | Detalhes         |
| DELETE | /ponies/:id        | ✅        | Remover          |
| POST   | /favorites/:ponyId | ✅        | Favoritar        |
| DELETE | /favorites/:ponyId | ✅        | Desfavoritar     |
| GET    | /favorites         | ✅        | Listar favoritos |

---

## 🧠 Dica Didática pro Workshop

💡 **Antes do Angular**, peça para os alunos:

- Testarem tudo no Swagger
- Simularem erro (401, 404)
- Entenderem o fluxo JWT

Isso reduz MUITO bugs no frontend.

---

## 🚀 Próximo passo sugerido

Agora faz muito sentido seguir para:

1. 🧱 **DTOs + validação (`class-validator`)**
2. 🔍 **Queries otimizadas (isFavorite)**
3. 🎨 **Início do Frontend Angular**
4. 🗂️ **Contrato de models compartilhado (API ↔ FE)**

Qual deles você quer puxar agora? 🦄✨
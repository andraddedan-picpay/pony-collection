# 📘 Aula 4B — Autenticação e Integração com Backend (Parte 2: Conceitos Avançados)

> 📌 **Parte 1:** [04a-autenticacao.md](04a-autenticacao.md) — Setup, Services e Integração

**Progresso do Curso Frontend:** `[█████░░░░░░░░░░░░░░░] 26% concluído`

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

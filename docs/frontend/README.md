# Apresentação da Arquitetura Frontend 🎨

## Índice

1. 🏗️ Arquitetura geral do frontend
2. 📐 Estrutura de componentes e features
3. 🧱 Estrutura de pastas (Frontend)
4. 🎯 Fluxo de navegação e autenticação
5. 📚 Sumário do Curso de Frontend

---

## 1️⃣ Arquitetura Geral do Frontend

```text
    [ Angular SPA ]
          |
          ├── Auth Module (Login/Logout)
          ├── Ponies Module (Lista/Detalhes/Edição)
          ├── Core (Guards, Interceptors, Services)
          └── Shared (Componentes reutilizáveis)
          |
          | HTTP + JWT Bearer Token
          v
    [ NestJS API ]
```

### Responsabilidades

#### Angular SPA

* **Autenticação**
  - Tela de login
  - Gerenciamento de token JWT
  - Logout e limpeza de sessão
  
* **Guards de Rota**
  - Proteção de rotas privadas
  - Redirecionamento para login
  - Verificação de token

* **Listagem de Pôneis**
  - Grid layout
  - Loading states
  - Empty states
  - Integração com API

* **Sidesheet de Detalhes**
  - Visualização completa
  - Design system do Figma
  - Animações suaves

* **Sidesheet de Cadastro/Edição**
  - Formulários reativos
  - Validação
  - Feedback de erro/sucesso

* **State Management**
  - Gerenciamento de estado do usuário
  - Estado da lista de ponies
  - Loading e error states

---

## 2️⃣ Estrutura de Componentes e Features

### 🔐 Auth Feature

```ts
Auth
├── Login Component
├── Auth Service (login, logout, isAuthenticated)
├── Auth Guard (proteção de rotas)
└── Auth Interceptor (adiciona JWT)
```

### 🦄 Ponies Feature

```ts
Ponies
├── Ponies List Component
├── Pony Details Sidesheet
├── Pony Form Sidesheet (Create/Edit)
├── Ponies Service (CRUD operations)
└── States (loading, error, empty)
```

### 🧩 Shared Components

```ts
Shared
├── Button Component
├── Input Component
├── Card Component
├── Sidesheet Component
├── Loading Spinner
└── Empty State Component
```

---

## 3️⃣ Estrutura de Pastas — Frontend (Angular)

```text
web/
├── src/
│   ├── app/
│   │   ├── app.component.ts          # Componente raiz
│   │   ├── app.routes.ts             # Configuração de rotas
│   │   ├── app.config.ts             # Configuração da aplicação
│   │   │
│   │   ├── core/                     # Serviços e configurações core
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts     # Guard de autenticação
│   │   │   ├── interceptors/
│   │   │   │   └── jwt.interceptor.ts # Interceptor JWT
│   │   │   └── services/
│   │   │       └── api.service.ts    # Serviço base para HTTP
│   │   │
│   │   ├── shared/                   # Componentes compartilhados
│   │   │   ├── components/
│   │   │   │   ├── button/
│   │   │   │   ├── input/
│   │   │   │   ├── card/
│   │   │   │   ├── sidesheet/
│   │   │   │   ├── loading/
│   │   │   │   └── empty-state/
│   │   │   └── models/               # Interfaces e tipos
│   │   │       ├── user.model.ts
│   │   │       └── pony.model.ts
│   │   │
│   │   ├── features/                 # Funcionalidades principais
│   │   │   │
│   │   │   ├── auth/                 # Módulo de autenticação
│   │   │   │   ├── pages/
│   │   │   │   │   └── login/
│   │   │   │   │       ├── login.component.ts
│   │   │   │   │       ├── login.component.html
│   │   │   │   │       └── login.component.scss
│   │   │   │   ├── services/
│   │   │   │   │   └── auth.service.ts
│   │   │   │   └── auth.routes.ts
│   │   │   │
│   │   │   └── ponies/               # Módulo de ponies
│   │   │       ├── pages/
│   │   │       │   └── list/
│   │   │       │       ├── list.component.ts
│   │   │       │       ├── list.component.html
│   │   │       │       └── list.component.scss
│   │   │       ├── components/
│   │   │       │   ├── pony-card/
│   │   │       │   ├── pony-details-sidesheet/
│   │   │       │   └── pony-form-sidesheet/
│   │   │       ├── services/
│   │   │       │   └── ponies.service.ts
│   │   │       └── ponies.routes.ts
│   │   │
│   │   └── layouts/                  # Layouts da aplicação
│   │       └── main-layout/
│   │           ├── main-layout.component.ts
│   │           └── sidebar/
│   │
│   ├── assets/                       # Arquivos estáticos
│   │   ├── fonts/
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── styles/                       # Estilos globais
│   │   ├── _variables.scss           # Variáveis do theme.md
│   │   ├── _mixins.scss
│   │   └── styles.scss
│   │
│   ├── environments/                 # Configurações de ambiente
│   │   ├── environment.ts
│   │   └── environment.development.ts
│   │
│   ├── index.html
│   └── main.ts
│
├── angular.json
├── package.json
├── tsconfig.json
└── tsconfig.app.json
```

---

## 4️⃣ Fluxo de Navegação e Autenticação

### Fluxo de Login

```text
1. Usuário acessa /login
2. Preenche credenciais
3. AuthService.login() chama API
4. Recebe JWT
5. Armazena token no localStorage
6. Redireciona para /ponies
```

### Fluxo de Proteção de Rotas

```text
1. Usuário tenta acessar /ponies
2. AuthGuard intercepta
3. Verifica token no localStorage
4. Se válido: permite acesso
5. Se inválido: redireciona para /login
```

### Fluxo de Requisições HTTP

```text
1. Componente chama Service
2. JwtInterceptor adiciona token no header
3. Requisição é enviada para API
4. API valida JWT
5. Resposta retorna ao componente
6. Atualiza UI com loading/error/success states
```

---

## 5️⃣ Tecnologias e Bibliotecas

### Core

- **Angular 21+** - Framework frontend
- **RxJS** - Programação reativa
- **TypeScript** - Tipagem estática

### Roteamento e Segurança

- **Angular Router** - Navegação
- **Auth Guards** - Proteção de rotas
- **HTTP Interceptors** - Manipulação de requisições

### Estilo

- **SCSS** - Pré-processador CSS
- **Design System** - Baseado no Figma
- **Theme Variables** - Variáveis do theme.md

### State Management

- **Signals** (Angular 17+) - Estado reativo
- **RxJS BehaviorSubject** - Estado compartilhado
- **Services** - Gerenciamento de estado

### 📦 Versão do Node.js

> **⚠️ Importante:** Este projeto requer Node.js **v24.13.1** (ou compatível).
> 
> **Recomendação:** Crie um arquivo `.nvmrc` na raiz do projeto `/web` com o conteúdo:
> ```
> v24.13.1
> ```
> 
> Se você usa [nvm](https://github.com/nvm-sh/nvm), execute:
> ```bash
> cd web
> nvm use
> ```

---

## 6️⃣ Páginas e Rotas

### Rotas Públicas

```
/login              - Tela de login
```

### Rotas Protegidas (requer autenticação)

```
/ponies             - Listagem de ponies
/ponies/:id         - Detalhes do pony (sidesheet)
/ponies/new         - Criar novo pony (sidesheet)
/ponies/:id/edit    - Editar pony (sidesheet)
```

---

## 7️⃣ Design System (Figma Integration)

### Cores (theme.md)

- Todas as cores do `theme.md` serão variáveis SCSS
- Uso de `$primary-color`, `$base-dark-1`, etc.

### Tipografia

- Fonte principal: **Barlow**
- Fonte da logo: **BigShouldersInlineDisplay**
- Escalas de tamanho: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl

### Componentes

- Buttons com variantes (primary, secondary, critical)
- Inputs com validação visual
- Cards com shadows
- Sidesheets com animações
- Loading states
- Empty states

---

# Frontend com Angular (Sumário)

### 📘 Aula 1 — Setup do Projeto Angular

**Objetivo:** Criar a base do frontend

**Parte A: Setup Inicial**
* Criar projeto Angular (última versão)
* Configurar SCSS básico
* Estrutura de pastas (core, shared, features)
* Importar fontes (Barlow e BigShouldersInlineDisplay)

**Arquivo:** [01a-setup-projeto.md](01a-setup-projeto.md)

**Parte B: Design System**
* Configurar variáveis do theme.md
* Sistema de cores e tipografia
* Mixins e utilities SCSS
* Padronização visual

**Arquivo:** [01b-setup-projeto.md](01b-setup-projeto.md)

✔️ Resultado: Projeto Angular estruturado e rodando com design system

---

### 📘 Aula 2 — Componentes Reutilizáveis [Button & Input]

**Objetivo:** Implementar componentes compartilhados base

* Instalar angular-svg-icon
* Criar componente pony-button com variantes
* Criar componente pony-input com ControlValueAccessor
* Implementar estados (loading, disabled, focus)
* Aplicar design system do theme.md
* Criar ícones SVG (loading, info)

✔️ Resultado: Biblioteca de componentes reutilizáveis

**Arquivo:** [02-login.md](02-login.md)

---

### 📘 Aula 3 — Layout da Tela de Login

**Objetivo:** Criar a interface visual da tela de login

* Criar estrutura de features/auth
* Implementar LoginComponent com Signals API
* Criar layout com background e card
* Usar componentes pony-button e pony-input
* Implementar validação básica de formulário
* Configurar rotas

✔️ Resultado: Tela de login visualmente completa

**Arquivo:** [03-layout-tela-login.md](03-layout-tela-login.md)

---

### 📘 Aula 4 — Autenticação e Integração com Backend

**Objetivo:** Integrar login com API real

**Parte A: Lógica de Autenticação**
* Configurar CORS no backend NestJS
* Criar models (User, LoginRequest, LoginResponse)
* Implementar LocalStorage helper
* Criar AuthService (login, logout, tokens)
* Integrar login com backend real
* Tratamento básico de erros (alert temporário)

**Arquivo:** [04a-autenticacao.md](04a-autenticacao.md)

**Parte B: Guards e Interceptors**
* Criar AuthGuard para proteção de rotas
* Criar HTTP Interceptor para JWT
* Conceitos avançados de segurança
* Fluxo completo de autenticação

**Arquivo:** [04b-autenticacao.md](04b-autenticacao.md)

✔️ Resultado: Sistema de autenticação completo

---

### 📘 Aula 5 — Sistema de Feedback com Snackbar

**Objetivo:** Implementar notificações toast elegantes

**Parte A: Service e Componente**
* Criar SnackbarService com Signals
* Implementar componente Snackbar visual
* Tipos de mensagens (success, error, warning, info)
* Auto-dismiss configurável
* Animações de entrada/saída

**Arquivo:** [05a-snackbar.md](05a-snackbar.md)

**Parte B: Integração e Testes**
* Integração global no app
* Substituir alerts do login por snackbars
* Testes de todos os cenários
* Conceitos de state management

**Arquivo:** [05b-snackbar.md](05b-snackbar.md)

✔️ Resultado: Sistema de notificações completo e reutilizável

---

### 📘 Aula 6 — Layout Base da Aplicação

**Objetivo:** Criar estrutura principal com navegação

**Parte A: Componentes Base**
* Criar MainLayoutComponent
* Implementar SidebarComponent
* Implementar HeaderComponent
* Content projection com ng-content
* SCSS modular e responsivo

**Arquivo:** [06a-layout-base.md](06a-layout-base.md)

**Parte B: Integração e Rotas**
* Integrar layout com rotas
* Criar smart components
* Navegação entre páginas
* Teste completo do layout

**Arquivo:** [06b-layout-base.md](06b-layout-base.md)

✔️ Resultado: Layout base funcional com navegação

---

### 📘 Aula 7 — Sidesheet de Detalhes

**Objetivo:** Exibir detalhes do pony

* Criar componente Sidesheet reutilizável
* Criar PonyDetailsSidesheet
* Navegação com parâmetros de rota
* Animações de entrada/saída
* Fechar sidesheet (overlay e botão)

✔️ Resultado: Visualização de detalhes

---

### 📘 Aula 8 — Sidesheet de Cadastro/Edição

**Objetivo:** Criar e editar ponies

* Criar PonyFormSidesheet
* Formulários reativos com validação
* Modo create vs edit
* Integrar com API (POST/PUT)
* Feedback de sucesso/erro
* Atualizar lista após operação

✔️ Resultado: CRUD completo no frontend

---

### 📘 Aula 9 — State Management e Boas Práticas

**Objetivo:** Gerenciar estado da aplicação

* Conceitos de estado no frontend
* Uso de Signals (Angular 17+)
* BehaviorSubject para estado compartilhado
* Pattern de Service com estado
* Loading, error e success states
* Otimização de performance

✔️ Resultado: Estado gerenciado de forma eficiente

---

### 📘 Aula 10 — Componente Sidesheet Reutilizável

**Objetivo:** Criar componente de painel lateral

**Parte A: Criação do Componente**
* Criar componente Sidesheet reutilizável
* Two-way binding com model()
* Renderer2 para manipulação DOM
* Content projection com ng-content
* Animações (fadeIn, slideIn)
* Acessibilidade (ARIA, focus trap)

**Arquivo:** [10a-sidesheet-componente.md](10a-sidesheet-componente.md)

**Parte B: Integração e Testes**
* Integrar Sidesheet na lista
* 6 cenários de teste detalhados
* Conceitos avançados (signals, effects, Renderer2)
* Comparações técnicas (model vs Input/Output)
* Checklist completo de verificação

**Arquivo:** [10b-sidesheet-integracao.md](10b-sidesheet-integracao.md)

✔️ Resultado: Componente Sidesheet completo e testado

---

## 8️⃣ Conceitos Importantes

### Signals (Angular 17+)

```ts
// Estado reativo com Signals
const ponies = signal<Pony[]>([]);
const loading = signal<boolean>(false);

// Computados
const hasPonies = computed(() => ponies().length > 0);
```

### Services com Estado

```ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser$ = new BehaviorSubject<User | null>(null);
  
  get user$() {
    return this.currentUser$.asObservable();
  }
}
```

### Guards

```ts
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true;
  }
  
  return router.createUrlTree(['/login']);
};
```

### Interceptors

```ts
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  
  return next(req);
};
```

---

## 9️⃣ Boas Práticas

### Estrutura de Componentes

✅ **Smart Components** (Container)
- Fazem requisições
- Gerenciam estado
- Lógica de negócio

✅ **Dump Components** (Presentational)
- Recebem dados via @Input
- Emitem eventos via @Output
- Apenas apresentação

### Gerenciamento de Subscriptions

```ts
// Use takeUntilDestroyed (Angular 16+)
constructor() {
  this.service.data$
    .pipe(takeUntilDestroyed())
    .subscribe(data => {
      // handle data
    });
}
```

### Error Handling

```ts
this.poniesService.getPonies()
  .pipe(
    catchError(error => {
      this.errorMessage.set('Erro ao carregar ponies');
      return of([]);
    })
  )
  .subscribe(ponies => {
    this.ponies.set(ponies);
  });
```

---

## 🎨 Referências de Design

- **Theme:** `/design/theme.md`
- **Figma:** `/design/figma.md`
- **Fontes:** `/design/fonts/`
- **Ícones:** `/design/icons/`
- **Imagens:** `/design/images/`

# 📘 Aula 7 — Guard de Rotas e Logout

## Objetivo

Implementar a proteção de rotas com **guards funcionais** (padrão moderno do Angular 15+) e adicionar funcionalidade de logout na aplicação. Ao final desta aula, o sistema estará protegido contra acessos não autorizados, redirecionando usuários conforme seu estado de autenticação.

---

## 🎯 O que vamos construir

- **Guard de autenticação** (`authGuard`) usando `CanActivateFn` (funcional)
- **Proteção de rotas públicas** (login) e privadas (listagem de ponies)
- **Funcionalidade de logout** no `MainLayoutComponent`
- **Redirecionamentos inteligentes** usando `Router.createUrlTree()`

---

## 📋 Conceitos Importantes

### Guards Funcionais vs. Guards de Classe

Desde o **Angular 15**, a abordagem recomendada é usar **guards funcionais** (`CanActivateFn`) ao invés de classes que implementam interfaces como `CanActivate`.

**Vantagens:**
- ✅ Mais simples e conciso
- ✅ Melhor para composição de lógica
- ✅ Usa função `inject()` para injeção de dependências
- ✅ Mais fácil de testar

### UrlTree vs. navigate()

Retornar `UrlTree` de um guard é preferível a chamar `router.navigate()`:

- ✅ **Sem efeitos colaterais**: A navegação é tratada pelo próprio Angular
- ✅ **Mais testável**: Não há chamadas imperativas dentro do guard
- ✅ **Composição melhor**: Guards podem ser combinados facilmente
- ✅ **Padrão oficial**: Recomendado pela documentação do Angular

---

## 📂 Estrutura de Arquivos

```
web/src/app/
├── core/
│   ├── guards/
│   │   └── auth.guard.ts         ← NOVO
│   └── layout/
│       └── main-layout/
│           ├── main-layout.component.ts     ← MODIFICAR
│           └── main-layout.component.html   ← MODIFICAR
└── app.routes.ts                 ← MODIFICAR
```

---

## 🛠️ Passo 1: Criar o Auth Guard

Crie o arquivo `web/src/app/core/guards/auth.guard.ts`:

```typescript
import { inject } from '@angular/core';
import { Router, CanActivateFn, UrlTree, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

export const authGuard: CanActivateFn = (route): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const isAuthenticated = authService.isAuthenticated();
    const isPublicRoute = Boolean(route.data?.['public']);

    if (isPublicRoute) {
        return allowPublicAccess(isAuthenticated, router);
    }

    return requireAuthentication(isAuthenticated, router);
};

function allowPublicAccess(isAuthenticated: boolean, router: Router): boolean | UrlTree {
    if (isAuthenticated) {
        return router.createUrlTree(['/']);
    }

    return true;
}

function requireAuthentication(isAuthenticated: boolean, router: Router): boolean | UrlTree {
    if (!isAuthenticated) {
        return router.createUrlTree(['/login']);
    }
    return true;
}
```

### 📝 Explicação do Código

**1. authGuard (função principal)**
```typescript
export const authGuard: CanActivateFn = (route): boolean | UrlTree => {
```
- **`CanActivateFn`**: Tipo funcional para guards (Angular 15+)
- **Parâmetro `route`**: Do tipo `ActivatedRouteSnapshot`, contém dados da rota
- **Retorno**: `boolean` (permite/bloqueia) ou `UrlTree` (redireciona)

**2. Injeção de Dependências**
```typescript
const authService = inject(AuthService);
const router = inject(Router);
```
- **`inject()`**: Função para DI em contextos funcionais (guards, funções auxiliares)
- Substitui o `constructor()` das classes

**3. Verificação de Rota Pública**
```typescript
const isPublicRoute = Boolean(route.data?.['public']);
```
- Lê metadados da rota: `data: { public: true }`
- Permite marcar rotas como públicas de forma declarativa

**4. Lógica de Decisão**
```typescript
if (isPublicRoute) {
    return allowPublicAccess(isAuthenticated, router);
}
return requireAuthentication(isAuthenticated, router);
```
- **Rota pública**: Chama `allowPublicAccess()` (redireciona se já logado)
- **Rota privada**: Chama `requireAuthentication()` (redireciona se não logado)

**5. Funções Auxiliares**

**`allowPublicAccess()`**: Para rotas públicas (ex: `/login`)
```typescript
function allowPublicAccess(isAuthenticated: boolean, router: Router): boolean | UrlTree {
    if (isAuthenticated) {
        return router.createUrlTree(['/']);  // Já logado → vai para home
    }
    return true;  // Não logado → acessa login normalmente
}
```

**`requireAuthentication()`**: Para rotas privadas (ex: `/`)
```typescript
function requireAuthentication(isAuthenticated: boolean, router: Router): boolean | UrlTree {
    if (!isAuthenticated) {
        return router.createUrlTree(['/login']);  // Não logado → vai para login
    }
    return true;  // Logado → acessa rota normalmente
}
```

### 🎭 Comportamento do Guard

| Rota | Autenticado | Resultado |
|------|-------------|-----------|
| `/login` (pública) | ❌ Não | ✅ Permite acesso |
| `/login` (pública) | ✅ Sim | ↪️ Redireciona para `/` |
| `/` (privada) | ❌ Não | ↪️ Redireciona para `/login` |
| `/` (privada) | ✅ Sim | ✅ Permite acesso |

---

## 🛠️ Passo 2: Configurar as Rotas

Modifique `web/src/app/app.routes.ts`:

```typescript
import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';  // ← IMPORTAR

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () =>
            import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent),
        canActivate: [authGuard],      // ← ADICIONAR
        data: { public: true },        // ← ADICIONAR
    },
    {
        path: '',
        loadComponent: () =>
            import('./features/ponies/pages/list/ponies-list.component').then(
                (m) => m.PoniesListComponent,
            ),
        canActivate: [authGuard],      // ← ADICIONAR
    },
];
```

### 📝 Explicação

**1. Import do Guard**
```typescript
import { authGuard } from '@core/guards/auth.guard';
```

**2. Aplicação nas Rotas**
```typescript
canActivate: [authGuard]
```
- **`canActivate`**: Array de guards que controlam o acesso à rota
- Executado ANTES da rota ser ativada

**3. Metadados de Rota Pública**
```typescript
data: { public: true }
```
- Define que a rota `/login` é de acesso público
- O guard usa essa informação para decidir o comportamento

**4. Rota Privada (sem `data.public`)**
```typescript
{
    path: '',
    canActivate: [authGuard],
    // Sem data → private por padrão
}
```

---

## 🛠️ Passo 3: Adicionar Funcionalidade de Logout

### 3.1. Modificar o TypeScript

Atualize `web/src/app/core/layout/main-layout/main-layout.component.ts`:

```typescript
import { Component, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';                        // ← ADICIONAR
import { SvgIconComponent } from 'angular-svg-icon';
import { PonyInputComponent } from '@app/shared/components/pony-input/pony-input.component';
import { AuthService } from '@core/services/auth.service';      // ← ADICIONAR

@Component({
    selector: 'main-layout',
    standalone: true,
    imports: [CommonModule, FormsModule, SvgIconComponent, PonyInputComponent],
    templateUrl: './main-layout.component.html',
    styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
    onSearchEvent = output<string>();

    currentDate = signal(this.formatDate());

    private authService = inject(AuthService);                  // ← ADICIONAR
    private router = inject(Router);                            // ← ADICIONAR

    private formatDate(): string {
        const now = new Date();

        const days = [
            'Domingo',
            'Segunda-Feira',
            'Terça-Feira',
            'Quarta-Feira',
            'Quinta-Feira',
            'Sexta-Feira',
            'Sábado',
        ];

        const months = [
            'Janeiro',
            'Fevereiro',
            'Março',
            'Abril',
            'Maio',
            'Junho',
            'Julho',
            'Agosto',
            'Setembro',
            'Outubro',
            'Novembro',
            'Dezembro',
        ];

        const dayName = days[now.getDay()];
        const day = now.getDate();
        const monthName = months[now.getMonth()];
        const year = now.getFullYear();

        return `${dayName}, ${day} ${monthName} ${year}`;
    }

    onSearchChange(value: string): void {
        this.onSearchEvent.emit(value);
    }

    onLogout(): void {                                          // ← ADICIONAR
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
```

### 📝 Explicação das Mudanças

**1. Imports**
```typescript
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
```
- **Router**: Para redirecionar após logout
- **AuthService**: Para limpar o token de autenticação

**2. Injeção de Dependências**
```typescript
private authService = inject(AuthService);
private router = inject(Router);
```
- Usa `inject()` ao invés do constructor
- São propriedades privadas do componente

**3. Método onLogout()**
```typescript
onLogout(): void {
    this.authService.logout();          // 1. Limpa token do LocalStorage
    this.router.navigate(['/login']);   // 2. Redireciona para login
}
```
- **Passo 1**: Remove o JWT do `localStorage`
- **Passo 2**: Navega para a tela de login

> 🔍 **Nota**: Aqui usamos `navigate()` ao invés de `createUrlTree()` porque:
> - Estamos em um componente (não em um guard)
> - É uma ação explícita do usuário (clique no botão)
> - Não há problema com efeitos colaterais nesse contexto

---

### 3.2. Modificar o Template

Atualize `web/src/app/core/layout/main-layout/main-layout.component.html`:

Localize o botão de logout e adicione o evento `(click)`:

```html
<button class="sidebar-logout" (click)="onLogout()">
    <svg-icon src="assets/icons/logout.svg" class="icon" [svgStyle]="{ 'width.px': 20 }" />
</button>
```

**Antes:**
```html
<button class="sidebar-logout">
```

**Depois:**
```html
<button class="sidebar-logout" (click)="onLogout()">
```

---

## ✅ Testando a Implementação

### Cenário 1: Usuário Não Autenticado

1. Navegue para `http://localhost:4200`
2. **Resultado esperado**: Redirecionado automaticamente para `/login`

### Cenário 2: Tentar Acessar Login Já Logado

1. Faça login normalmente
2. Tente acessar `http://localhost:4200/login` manualmente
3. **Resultado esperado**: Redirecionado automaticamente para `/` (home)

### Cenário 3: Logout Funcional

1. Estando logado, clique no botão de logout (ícone na sidebar)
2. **Resultado esperado**: 
   - Token removido do LocalStorage
   - Redirecionado para `/login`
   - Não consegue mais acessar rotas privadas

### Cenário 4: Proteção de Rota Privada

1. Faça logout (limpa autenticação)
2. Tente acessar `http://localhost:4200` diretamente
3. **Resultado esperado**: Redirecionado para `/login`

---

## 🎓 Conceitos Avançados

### 1. Por que usar `UrlTree` ao invés de `navigate()`?

| Aspecto | UrlTree (✅ Melhor) | navigate() |
|---------|---------------------|------------|
| **Testabilidade** | Retorna valor testável | Efeito colateral dificulta teste |
| **Composição** | Guards podem ser combinados | Dificulta composição |
| **Separação de responsabilidades** | Guard decide, Router navega | Guard decide E navega |
| **Recomendação Angular** | Oficial desde v7.1 | Legado |

**Exemplo de teste:**
```typescript
it('should redirect to login', () => {
    const result = authGuard(mockRoute);
    expect(result).toEqual(router.createUrlTree(['/login']));
});
```

### 2. Guards Funcionais vs. Classes

**❌ Abordagem antiga (Angular < 15):**
```typescript
@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {}
    
    canActivate(): boolean {
        // lógica...
    }
}
```

**✅ Abordagem moderna (Angular 15+):**
```typescript
export const authGuard: CanActivateFn = (route) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    // lógica...
};
```

**Vantagens:**
- Menos boilerplate
- Mais funcional (sem estado)
- Mais fácil de testar
- Melhor para tree-shaking

### 3. Metadata de Rotas (`data`)

```typescript
{
    path: 'login',
    data: { public: true, title: 'Login', requiresAdmin: false }
}
```

- **`route.data`**: Objeto com metadados customizados
- Acessível em guards, resolvers e componentes
- Útil para configurações declarativas

---

## 🔒 Segurança: Boas Práticas

### ✅ O que estamos fazendo bem:

1. **Token no LocalStorage**: Simples para aplicação SPA
2. **Verificação no Guard**: Toda navegação é protegida
3. **Logout limpa token**: Remove autenticação completamente
4. **Redirecionamentos corretos**: UX fluída

### ⚠️ Para produção, considere:

1. **HttpOnly Cookies**: Mais seguro contra XSS
2. **Refresh Tokens**: Para sessões longas sem re-login
3. **Token Expiration**: Validar se o JWT ainda é válido
4. **Logout backend**: Invalidar token no servidor também

---

## 📦 Resumo dos Arquivos Modificados

| Arquivo | Ação | O que faz |
|---------|------|-----------|
| `auth.guard.ts` | ✨ CRIADO | Guard funcional que protege rotas |
| `app.routes.ts` | ✏️ MODIFICADO | Aplica guard em todas as rotas |
| `main-layout.component.ts` | ✏️ MODIFICADO | Adiciona método `onLogout()` |
| `main-layout.component.html` | ✏️ MODIFICADO | Conecta botão ao método de logout |

---

## 🎯 Checklist

- ✅ Guard funcional criado com `CanActivateFn`
- ✅ Rotas protegidas com `canActivate: [authGuard]`
- ✅ Rota pública marcada com `data: { public: true }`
- ✅ Logout funcional no `MainLayoutComponent`
- ✅ Redirecionamentos usando `createUrlTree()`
- ✅ Testado: usuário não autenticado → `/login`
- ✅ Testado: usuário autenticado → `/` (home)
- ✅ Testado: logout remove token e redireciona

---

## 📚 Referências

- [Angular Guards - Documentação Oficial](https://angular.io/guide/router#preventing-unauthorized-access)
- [Functional Guards (Angular 15+)](https://angular.io/api/router/CanActivateFn)
- [Router.createUrlTree()](https://angular.io/api/router/Router#createUrlTree)
- [inject() Function](https://angular.io/api/core/inject)

# 📘 Aula 3 — Layout da Tela de Login

**Progresso do Curso Frontend:** `[████░░░░░░░░░░░░░░░░] 21% concluído`

## Objetivo

Criar a interface visual completa da tela de login usando os componentes reutilizáveis (pony-button e pony-input), aplicando o design system e criando um layout atraente.

---

## 📋 Pré-requisitos

- Aula 1 concluída (Setup do projeto)
- Aula 2 concluída (Componentes reutilizáveis)
- Imagens de design prontas (logo.png e background.jpg)

---

## 🎯 1. Preparar Assets

### 1.1 Adicionar Imagens

Copie as imagens para a pasta **public/assets/images/**:

- `logo.png` - Logo do projeto
- `background.jpg` - Imagem de fundo da tela de login

---

## 📁 2. Criar Estrutura de Pastas

```bash
# Criar estrutura de features
mkdir -p src/app/features/auth/pages/login

# Criar o componente de login
ng generate component features/auth/pages/login --skip-tests
```

---

## 🛠️ 3. Implementar o Componente de Login

### 3.1 TypeScript (Lógica Básica)

**src/app/features/auth/pages/login/login.component.ts**

```typescript
import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { PonyButtonComponent } from "@app/shared/components/pony-button/pony-button.component";
import { PonyInputComponent } from "@app/shared/components/pony-input/pony-input.component";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, FormsModule, PonyButtonComponent, PonyInputComponent],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent {
  email = signal("");
  password = signal("");
  isLoading = signal(false);

  onSubmit(): void {
    if (!this.email() || !this.password()) {
      alert("Por favor, preencha todos os campos");
      return;
    }

    this.isLoading.set(true);

    // Simulação temporária
    setTimeout(() => {
      console.log("Login:", this.email(), this.password());
      this.isLoading.set(false);
      alert("Login simulado com sucesso!");
    }, 2000);
  }

  updateEmail(value: string): void {
    this.email.set(value);
  }

  updatePassword(value: string): void {
    this.password.set(value);
  }
}
```

**💡 Explicação:**

- Usamos **signals** para gerenciar estado reativo (introduzidos no Angular 17+)
- `FormsModule` importado para usar `ngModel` com template-driven forms
- Métodos `updateEmail()` e `updatePassword()` conectam o `ngModel` com signals
- `isLoading` signal controla o estado de carregamento do botão
- Por enquanto, fazemos apenas validação básica e simulação
- Na próxima aula integraremos com o backend real

### 📊 Comparação: Template-Driven Forms vs Reactive Forms

| Aspecto           | Template-Driven (nossa escolha)  | Reactive Forms                    |
| ----------------- | -------------------------------- | --------------------------------- |
| **Configuração**  | Mais simples, lógica no template | Mais código, lógica no TypeScript |
| **ngModel**       | ✅ Usa `ngModel`                 | ❌ Usa `formControl`              |
| **Validação**     | Diretivas no template            | Validators no código              |
| **Testabilidade** | Mais difícil (requer DOM)        | Mais fácil (puro TypeScript)      |
| **Use case**      | Formulários simples              | Formulários complexos             |
| **Complexidade**  | Baixa                            | Alta                              |
| **Melhor para**   | Login, busca, contato            | Cadastros multistepp, wizards     |

**Por que Template-Driven para Login?**

- Apenas 2 campos (email e senha)
- Validação simples (campos obrigatórios)
- Menos boilerplate code
- Mais direto para formulários pequenos

### 🔍 Conceitos Importantes

**FormsModule vs ReactiveFormsModule:**

- `FormsModule`: Habilita template-driven forms (`ngModel`, `ngForm`)
- `ReactiveFormsModule`: Habilita reactive forms (`FormControl`, `FormGroup`)
- Não podem ser misturados no mesmo formulário
- Nossa escolha: `FormsModule` pela simplicidade

**Signals com ngModel:**

```typescript
// Template
[ngModel]="email()"              // Lê do signal
(ngModelChange)="updateEmail($event)"  // Atualiza o signal

// TypeScript
email = signal('');              // Cria signal
updateEmail(value: string) {     // Método para atualizar
    this.email.set(value);
}
```

**Fluxo de dados:**

```
┌────────────────────────────────────────────┐
│ 1. Usuário digita no <input>              │
├────────────────────────────────────────────┤
│ 2. (ngModelChange) emite valor            │
├────────────────────────────────────────────┤
│ 3. updateEmail($event) é chamado          │
├────────────────────────────────────────────┤
│ 4. email.set(value) atualiza o signal     │
├────────────────────────────────────────────┤
│ 5. Template lê email() automaticamente     │
└────────────────────────────────────────────┘
```

### 3.2 Template HTML

**src/app/features/auth/pages/login/login.component.html**

```html
<div class="login-page">
  <div class="login-content">
    <div class="login-card">
      <div class="logo-container">
        <h1>DEAR PONY</h1>
        <img src="assets/images/logo.png" alt="Pony Collection" class="logo" />
      </div>

      <form class="login-form" (ngSubmit)="onSubmit()">
        <div class="login-form__group">
          <pony-input
            type="email"
            placeholder="Email"
            name="email"
            [ngModel]="email()"
            (ngModelChange)="updateEmail($event)"
            [disabled]="isLoading()"
            [required]="true"
          >
          </pony-input>
        </div>

        <div class="login-form__group">
          <pony-input
            type="password"
            placeholder="Senha"
            name="password"
            [ngModel]="password()"
            (ngModelChange)="updatePassword($event)"
            [disabled]="isLoading()"
            [required]="true"
          >
          </pony-input>
        </div>

        <pony-button
          width="100%"
          type="submit"
          [loading]="isLoading()"
          variant="primary"
        >
          Login
        </pony-button>
      </form>
    </div>
  </div>
</div>
```

**💡 Explicação:**

- **login-page**: Container principal com background fullscreen
- **login-content**: Camada de overlay semi-transparente (darkens background)
- **login-card**: Card centralizado com formulário
- **logo-container**: Header com logo e título usando flexbox
- **form**: Campos de email/senha + botão submit com validação
- `(ngSubmit)`: Event binding que captura submit do formulário
- `[ngModel]` e `(ngModelChange)`: Two-way data binding com signals

### 📊 Comparação: Técnicas de Background Overlay

| Técnica                          | Implementação                             | Vantagens      | Desvantagens          |
| -------------------------------- | ----------------------------------------- | -------------- | --------------------- |
| **Pseudo-elemento ::before**     | `.page::before { background: rgba(...) }` | CSS puro       | Z-index complicado    |
| **Div separada (nossa escolha)** | `<div class="overlay">`                   | Controle total | HTML extra            |
| **background-blend-mode**        | `background-blend-mode: darken`           | 1 elemento     | Compatibilidade       |
| **filter**                       | `filter: brightness(0.5)`                 | Simples        | Afeta todos os filhos |

**Nossa escolha:**

```html
<div class="login-page">
  <!-- Background image -->
  <div class="login-content">
    <!-- Dark overlay (75% opacity) -->
    <div class="login-card"><!-- White card with form --></div>
  </div>
</div>
```

### 🎯 Conceitos Avançados

**1. ngModel com Signals (Angular 17+)**

Como signals são somente leitura fora do componente, precisamos de métodos para atualizar:

```typescript
// ❌ Não funciona - Signal não tem two-way binding direto
[ngModel] =
  // ✅ Funciona - Separa leitura e escrita
  "email"[ngModel] = // ERRO: email é um signal, não uma string
  "email()"(
    // Lê o valor
    ngModelChange,
  ) =
    "updateEmail($event)"; // Atualiza via método
```

**2. Validação no Template vs Component**

```typescript
// Opção 1: Validação no componente (nossa escolha)
if (!this.email() || !this.password()) {
    alert('...');
    return;
}

// Opção 2: Validação com Template Reference
<form #loginForm="ngForm" (ngSubmit)="onSubmit(loginForm)">
  <input required email name="email" [(ngModel)]="email">
</form>
// Acessa: loginForm.valid, loginForm.errors
```

**3. Estados de Loading**

Patrão importante para UX:

```typescript
// 1. Inicia carregamento
this.isLoading.set(true);

// 2. Desabilita inputs/botão
[disabled] = "isLoading()"[loading] = "isLoading()";

// 3. Finaliza após operação
this.isLoading.set(false);
```

Previne:

- Double-submit (usuário clicar 2x no botão)
- Edição durante salvamento
- Múltiplas requisições simultâneas

### 3.3 Estilos SCSS

**src/app/features/auth/pages/login/login.component.scss**

```scss
@use "styles/variables" as *;
@use "styles/mixins" as *;

.login-page {
  height: 100vh;
  width: 100vw;
  background-color: $base-dark-2;
  background-image: url("/assets/images/background.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.login-content {
  width: 100%;
  height: 100%;
  background: rgba($base-shadow, 0.75);
  @include flex-center;
  padding: 1rem;
}

.login-card {
  background-color: $base-dark-1;
  border-radius: 53px;
  padding: 64px 50px;
  width: 100%;
  max-width: 390px;
  @include box-shadow-primary;
}

.logo-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;

  h1 {
    color: $text-color;
    font-family: $logo-family;
    font-size: $logo-size;
    font-weight: 400;
    line-height: 100%;
    letter-spacing: 11px;
    vertical-align: middle;
  }

  .logo {
    max-width: 140px;
    width: 100%;
    height: auto;
  }
}

.login-form {
  @include flex-column;
  gap: 20px;

  &__group {
    width: 100%;
  }
}
```

**💡 Explicação dos Estilos:**

1. **login-page**: Background fullscreen com imagem (`100vh` e `100vw`)
2. **login-content**: Overlay escuro com 75% de opacidade usando `rgba()`
3. **login-card**: Card arredondado (`border-radius: 53px`) com sombra rosa
4. **logo-container**: Flexbox com `space-between` para alinhar título e logo

### 📊 Comparação: Unidades de Viewport

| Unidade | Significado                | Quando Usar              | Exemplo         |
| ------- | -------------------------- | ------------------------ | --------------- |
| **vh**  | 1% da altura da viewport   | Altura fullscreen        | `height: 100vh` |
| **vw**  | 1% da largura da viewport  | Largura fullscreen       | `width: 100vw`  |
| **%**   | Relativo ao pai            | Elementos aninhados      | `width: 50%`    |
| **rem** | Relativo ao root font-size | Texto e spacing          | `padding: 2rem` |
| **px**  | Pixels absolutos           | Bordas, pequenos valores | `border: 1px`   |

**Nossa escolha para login-page:**

```scss
height: 100vh; // 100% da altura da tela
width: 100vw; // 100% da largura da tela
```

Garante que o background cubra toda a tela, independente do tamanho.

### 📊 Comparação: Background Image vs Background Color

| Aspecto            | Background Image                  | Background Color |
| ------------------ | --------------------------------- | ---------------- |
| **Performance**    | Mais pesado (carrega imagem)      | Mais leve        |
| **Visual**         | Rico, imersivo                    | Simples, flat    |
| **Fallback**       | Precisa de cor de fallback        | Já é fallback    |
| **Acessibilidade** | Precisa de overlay para contraste | Controle direto  |

**Nossa implementação:**

```scss
background-color: $base-dark-2; // Fallback se imagem não carregar
background-image: url("/assets/images/background.jpg");
background-size: cover; // Cobre toda área
background-position: center; // Centraliza a imagem
background-repeat: no-repeat; // Não repete
```

### 🎯 Conceitos Avançados

**1. SCSS @use vs @import**

Nosso projeto usa o sistema moderno de imports:

```scss
@use "styles/variables" as *; // Importa tudo sem namespace
@use "styles/mixins" as *; // Angular 21 recomenda @use

// Alternativa com namespace:
@use "styles/variables" as vars;
color: vars.$primary-color;
```

**2. Mixins para Reutilização**

```scss
// Definição
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

// Uso
.login-content {
  @include flex-center; // Expande para as 3 propriedades
}
```

**Vantagens:**

- DRY (Don't Repeat Yourself)
- Manutenção centralizada
- Reduz código duplicado
- Facilita mudanças globais

**3. RGBA para Overlays**

```scss
background: rgba($base-shadow, 0.75);
//               ↑ variável    ↑ opacidade 75%
```

**Como funciona:**

- `$base-shadow` é uma cor (ex: `#000000`)
- SCSS converte para RGB: `0, 0, 0`
- Adiciona alpha: `rgba(0, 0, 0, 0.75)`
- Resultado: preto com 75% de opacidade

**Alternativa moderna (CSS Variables):**

```scss
// Não funciona com variáveis SCSS:
background: rgba($base-shadow, 0.75); // ✅ OK

// Com CSS variables:
background: rgb(from var(--base-shadow) r g b / 75%); // ❌ Mais complexo
```

**4. Border-Radius e Design System**

```scss
border-radius: 53px; // Valor específico do design
```

**Design tokens:**

```scss
// Ideal seria ter:
$border-radius-xl: 53px;
$border-radius-lg: 24px;
$border-radius-md: 12px;
$border-radius-sm: 8px;

// Uso:
border-radius: $border-radius-xl;
```

Benefícios:

- Consistência visual
- Fácil ajuste global
- Segue design system

---

## 🛣️ 4. Configurar Rota

### 4.1 Atualizar app.routes.ts

**src/app/app.routes.ts**

```typescript
import { Routes } from "@angular/router";
import { LoginComponent } from "./features/auth/pages/login/login.component";

export const routes: Routes = [
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full",
  },
  {
    path: "login",
    component: LoginComponent,
  },
];
```

---

## 🎨 5. Verificar Estilos Globais

Certifique-se de que os mixins estão definidos:

**src/styles/\_mixins.scss**

```scss
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-column {
  display: flex;
  flex-direction: column;
}

@mixin transition($property, $duration, $timing) {
  transition: $property $duration $timing;
}

@mixin box-shadow-primary {
  box-shadow: 0 8px 32px rgba($primary-shadow, 0.4);
}
```

**src/styles/\_variables.scss** (já criado na aula 1)

---

## 🧪 6. Testar a Aplicação

```bash
# Iniciar o servidor de desenvolvimento
npm start
```

Abra o navegador em `http://localhost:4200`

### ✅ Checklist de Testes:

- [ ] A página de login aparece corretamente
- [ ] O background e logo são exibidos
- [ ] Os inputs funcionam (digitação)
- [ ] O botão muda para estado "loading" ao submeter
- [ ] O formulário só envia se os campos estiverem preenchidos

---

## � Comparação: Estruturas de Roteamento

| Abordagem                         | Configuração                                   | Vantagens               | Desvantagens        |
| --------------------------------- | ---------------------------------------------- | ----------------------- | ------------------- |
| **Rotas simples (nossa escolha)** | `{ path: 'login', component: LoginComponent }` | Direto, fácil debug     | Carrega tudo junto  |
| **Lazy loading**                  | `loadComponent: () => import('...')`           | Otimiza inicial load    | Setup mais complexo |
| **Feature modules**               | `loadChildren: () => import('...')`            | Organização de features | Requer NgModules    |

**Nossa implementação:**

```typescript
export const routes: Routes = [
  { path: "", redirectTo: "login", pathMatch: "full" }, // Rota padrão
  { path: "login", component: LoginComponent }, // Rota específica
];
```

**Quando usar lazy loading:**

- App com muitas páginas (>10)
- Páginas grandes ou pesadas
- Otimização de performance crítica
- Diferentes áreas da aplicação (admin, user, public)

## 🎯 Conceitos Avançados: Rotas no Angular

**1. PathMatch: 'full' vs 'prefix'**

```typescript
// 'full' - Match exato
{ path: '', redirectTo: 'login', pathMatch: 'full' }
// '' → '/login' ✅
// 'home' → não redireciona ✅

// 'prefix' - Match por prefixo (padrão)
{ path: '', redirectTo: 'login', pathMatch: 'prefix' }
// '' → '/login' ✅
// 'home' → '/login' ❌ (redireciona tudo!)
```

**Regra:** Sempre use `pathMatch: 'full'` com path vazio.

**2. Standalone Components e Rotas**

Antes (Angular <14):

```typescript
// Precisava de NgModule
@NgModule({
  declarations: [LoginComponent],
  imports: [CommonModule],
})
export class AuthModule {}
```

Agora (Angular 14+):

```typescript
// Component diretamente na rota
{ path: 'login', component: LoginComponent }
```

**3. Redirect vs Navigate**

```typescript
// Opção 1: Redirect na rota (configuração)
{ path: '', redirectTo: 'login', pathMatch: 'full' }

// Opção 2: Navigate no código (programático)
this.router.navigate(['/home']);
```

**Quando usar cada um:**

- **redirectTo**: Rotas padrão, aliases, rotas deprecated
- **navigate()**: Após ações do usuário, lógica condicional

## 📚 Resumo

Nesta aula você aprendeu:

✅ Criar a estrutura de features/auth seguindo convenções do Angular  
✅ Implementar um componente de login standalone (Angular 14+)  
✅ Usar `ngModel` com signals personalizados (Angular 17+)  
✅ Aplicar background com overlay usando técnica de múltiplas camadas  
✅ Criar um card de login centralizado  
✅ Configurar rotas no Angular com redirectTo e pathMatch  
✅ Trabalhar com formulários template-driven (FormsModule)  
✅ Adicionar estados de loading nos botões para melhor UX  
✅ Entender viewport units (vh, vw) para layouts fullscreen  
✅ Usar mixins SCSS para reutilização de estilos  
✅ Aplicar design system com variáveis e border-radius consistente

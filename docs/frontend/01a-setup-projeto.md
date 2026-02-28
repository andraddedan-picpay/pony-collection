# 📘 Aula 1A — Setup do Projeto Angular (Parte 1: Instalação e Configuração)

> 📌 **Parte 2:** [01b-setup-projeto.md](01b-setup-projeto.md) — Conceitos Avançados

## Objetivo

Criar a estrutura base do projeto Angular com SCSS, organização de pastas profissional e integração das variáveis do Design System.

---

## 🎯 O que vamos construir

- **Projeto Angular 21** com arquitetura moderna (standalone components)
- **Sistema de Design**: Variáveis SCSS reutilizáveis
- **Fontes customizadas**: Barlow e BigShouldersDisplay
- **Estrutura de estilos**: Mixins e reset CSS
- **SPA (Single Page Application)**: Client-side rendering

💡 **Nas próximas aulas**, criaremos componentes compartilhados, layouts e integração com API.

---

## 📋 Conceitos Importantes

### Por que Angular?

| Framework | Vantagens | Desvantagens | Ideal para |
|-----------|-----------|--------------|------------|
| **Angular** | ✅ Framework completo (baterias inclusas)<br>✅ TypeScript nativo<br>✅ RxJS para reatividade<br>✅ CLI poderoso | ❌ Curva de aprendizado<br>❌ Bundle maior | Apps corporativos, projetos grandes |
| **React** | ✅ Simples e flexível<br>✅ Ecossistema gigante<br>✅ Virtual DOM otimizado | ❌ Precisa bibliotecas extras<br>❌ Decisões de arquitetura | SPAs, dashboards, MVPs |
| **Vue** | ✅ Fácil aprendizado<br>✅ Documentação excelente<br>✅ Performance | ❌ Menor no mercado corporativo<br>❌ Menos TypeScript-first | Projetos pequenos/médios |

**Nossa escolha**: Angular pela **tipagem forte**, **arquitetura opinada** e **ferramentas integradas**.

---

### CSR vs SSR vs SSG

| Estratégia | Como funciona | Vantagens | Desvantagens | Quando usar |
|------------|---------------|-----------|--------------|-------------|
| **CSR** (Client-Side Rendering) | JavaScript renderiza no navegador | ✅ Interativo<br>✅ SPA fluído<br>✅ Menos carga no servidor | ❌ SEO limitado<br>❌ First paint lento | Apps autenticados, dashboards |
| **SSR** (Server-Side Rendering) | HTML gerado no servidor | ✅ SEO otimizado<br>✅ First paint rápido | ❌ Carga no servidor<br>❌ Complexidade | E-commerce, blogs |
| **SSG** (Static Site Generation) | HTML gerado no build | ✅ Performance máxima<br>✅ SEO perfeito | ❌ Requer rebuild<br>❌ Dados estáticos | Documentação, landing pages |

**Nossa escolha**: **CSR (SPA)** porque:
- App requer autenticação (não precisa SEO)
- UX fluída e interativa é prioridade
- Menos complexidade de infraestrutura

---

### Standalone Components vs NgModules

**Evolução do Angular:**

| NgModules (Angular < 14) | Standalone Components (Angular 14+) |
|--------------------------|-------------------------------------|
| ❌ Precisa declarar em `@NgModule` | ✅ Componente independente |
| ❌ Imports indiretos (confuso) | ✅ Imports explícitos |
| ❌ Boilerplate excessivo | ✅ Código limpo |
| ❌ Difícil tree-shaking | ✅ Bundle menor |

**Sintaxe antiga:**
```typescript
// app.module.ts
@NgModule({
  declarations: [App, OtherComponent],
  imports: [CommonModule, RouterModule],
  bootstrap: [App]
})
export class AppModule {}
```

**Sintaxe moderna (nossa escolha):**
```typescript
// app.ts
@Component({
  selector: 'app-root',
  standalone: true,  // ✨ Não precisa de NgModule
  imports: [RouterOutlet],  // Imports explícitos
  templateUrl: './app.html'
})
export class App {}
```

**Vantagens dos Standalone:**
- ✅ Menos arquivos (sem `app.module.ts`)
- ✅ Mais fácil testar (componentes isolados)
- ✅ Lazy loading simplificado

---

### Por que SCSS?

| Tecnologia | Vantagens | Desvantagens | Ideal para |
|------------|-----------|--------------|------------|
| **CSS Puro** | ✅ Nativo<br>✅ Sem build step | ❌ Sem variáveis (CSS custom properties limitadas)<br>❌ Sem nesting<br>❌ Sem mixins | Projetos simples |
| **SCSS** | ✅ Variáveis<br>✅ Nesting<br>✅ Mixins/Functions<br>✅ Import de partials | ❌ Precisa compilar | **Apps médios/grandes** |
| **CSS-in-JS** | ✅ Scoped por padrão<br>✅ TypeScript integration | ❌ Runtime overhead<br>❌ CSS no bundle JS | React apps |
| **Tailwind** | ✅ Rápido<br>✅ Utilitários prontos | ❌ HTML verboso<br>❌ Design opinionado | Prototipação rápida |

**Nossa escolha**: **SCSS** porque:
- ✅ **Variáveis reutilizáveis** (theme completo em `_variables.scss`)
- ✅ **Mixins** para padrões repetidos (flexbox, shadows)
- ✅ **Nesting** para organização (BEM simplificado)
- ✅ **Compatível com Angular** (suporte nativo)

---

## Passos

### 1. Criar o Projeto Angular

```bash
# Navegar para a raiz do projeto
cd pony-collection

# Criar projeto Angular
npx @angular/cli@latest new web --routing --style=scss --ssr=false --skip-git

# Entrar na pasta do projeto
cd web
```

### 📝 Explicação dos Flags

| Flag | Valor | Significado |
|------|-------|-------------|
| `--routing` | ✅ | Cria `app.routes.ts` para navegação entre páginas |
| `--style=scss` | `scss` | Define SCSS como pré-processador (ao invés de CSS) |
| `--ssr=false` | `false` | Desabilita Server-Side Rendering (CSR/SPA puro) |
| `--skip-git` | ✅ | Não inicializa Git (já temos na raiz do monorepo) |

**Prompts interativos do CLI:**

Ao executar o comando, o Angular CLI perguntará:

```
? Which stylesheet format would you like to use? 
  CSS
❯ SCSS   [ https://sass-lang.com/documentation/syntax#scss ]
  Sass   [ https://sass-lang.com/documentation/syntax#the-indented-syntax ]
  Less   [ http://lesscss.org ]
```

**Resposta**: `SCSS` (já definido via flag)

```
? Do you want to enable Server-Side Rendering (SSR) and Static Site Generation (SSG/Prerendering)? 
  Yes
❯ No
```

**Resposta**: `No` (já definido via `--ssr=false`)

**Opções finais selecionadas:**
- ✅ Standalone components (arquitetura moderna, padrão no Angular 21)
- ✅ SCSS como pré-processador
- ✅ Routing habilitado
- ❌ SSR desabilitado (SPA puro)

---

### 📂 Entendendo os Arquivos Gerados

O Angular CLI criou diversos arquivos de configuração importantes:

#### **angular.json** - Configuração do Workspace

Arquivo principal que define como o projeto é compilado, servido e testado:

```json
{
  "projects": {
    "web": {
      "architect": {
        "build": {
          "options": {
            "outputPath": "dist/web",        // Onde o build é gerado
            "index": "src/index.html",       // HTML principal
            "main": "src/main.ts",           // Entry point da aplicação
            "styles": ["src/styles.scss"],   // Estilos globais
            "scripts": []                    // Scripts externos (jQuery, etc)
          }
        },
        "serve": {
          "options": {
            "port": 4200                     // Porta do dev server
          }
        }
      }
    }
  }
}
```

**Seções importantes:**
- **`build`**: Configurações de produção (otimização, minificação)
- **`serve`**: Dev server (hot reload, porta, proxy)
- **`test`**: Jest/Karma para testes unitários

#### **tsconfig.json** - Configuração do TypeScript

Define como o TypeScript compila o código:

```json
{
  "compilerOptions": {
    "target": "ES2022",              // JavaScript moderno
    "module": "ES2022",              // Módulos nativos
    "lib": ["ES2022", "dom"],        // APIs disponíveis
    "strict": true,                  // ✅ Modo estrito (type-safety)
    "esModuleInterop": true,         // Compatibilidade com CommonJS
    "skipLibCheck": true,            // Performance (ignora .d.ts de node_modules)
    "paths": {
      "@app/*": ["src/app/*"]        // Alias para imports (próximas aulas)
    }
  }
}
```

**Por que `strict: true` é importante?**
- ✅ Detecta erros de `null`/`undefined` em compile-time
- ✅ Força tipagem explícita (menos `any`)
- ✅ Melhora refatoração (IDE ajuda mais)

#### **package.json** - Scripts Disponíveis

```json
{
  "scripts": {
    "start": "ng serve",             // Dev server
    "build": "ng build",             // Build de produção
    "watch": "ng build --watch",     // Build contínuo
    "test": "ng test"                // Testes unitários
  }
}
```

---

### 2. Limpar o Projeto Base

Remover conteúdo padrão do Angular:

**src/app/app.html**
```html
<router-outlet />
```

**src/app/app.scss**
```scss
// Arquivo vazio por enquanto
```

**src/app/app.ts**
```typescript
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Pony Collection 🦄');
}
```

### 📝 Explicação do Component

**1. Standalone Component:**
```typescript
@Component({
  standalone: true,  // Implícito no Angular 21 (não precisa declarar)
  imports: [RouterOutlet]  // Imports explícitos (sem NgModule)
})
```

**2. Signals API (Angular 17+):**
```typescript
protected readonly title = signal('Pony Collection 🦄');
```
- **`signal()`**: Valor reativo (como `ref()` do Vue ou `useState()` do React)
- **`protected`**: Acessível no template, mas não fora do componente
- **`readonly`**: Não pode reatribuir a variável (pode usar `.set()` internamente)

**Vantagens dos Signals:**
- ✅ **Performance**: Change detection mais eficiente
- ✅ **Simplicidade**: Menos boilerplate que RxJS
- ✅ **Tracking automático**: Sabe exatamente o que mudou

**Comparação Signal vs RxJS:**

| Feature | Signals | RxJS (BehaviorSubject) |
|---------|---------|------------------------|
| Sintaxe | `title()` | `title$ \| async` |
| Performance | ✅ Melhor | ⚠️ Overhead de streams |
| Curva de aprendizado | ✅ Simples | ❌ Complexo (operators) |
| Quando usar | Estado local/UI | Streams complexos, HTTP |

---

### 3. Criar Pasta de Estilos Globais

```bash
# Criar pasta de estilos globais
mkdir -p src/styles
```

> **Nota:** A estrutura de pastas para features (core, shared, features, layouts) será criada conforme necessário nas próximas aulas.

---

### 4. Configurar Variáveis SCSS do Theme

**src/styles/_variables.scss**
```scss
// 🎨 Pony Collection Theme Variables
// Baseado em: /design/theme.md

// ========================================
// Cores Principais
// ========================================
$primary-color: #E669EA;
$secondary-color: #3B5162;
$text-color: #FFFFFF;

// ========================================
// Cores de Feedback
// ========================================
$critical-color: #FF7CA3;
$success-color: #B9D29B;

// ========================================
// Grayscale
// ========================================
$grayscale-03: #828282;

// ========================================
// Backgrounds
// ========================================
$base-dark-1: #1F1D2B;
$base-dark-2: #252836;
$base-dark-3: #393C49;
$base-form: #2D303E;

// ========================================
// Sombras
// ========================================
$primary-shadow: #E669EA80;
$base-shadow: #00000040;

// ========================================
// Opacidade
// ========================================
$opacity-60: 0.60;
$opacity-50: 0.50;

// ========================================
// Tipografia - Famílias
// ========================================
$text-family: 'Barlow', sans-serif;
$heading-family: 'BigShouldersDisplay', sans-serif;
$logo-family: 'BigShouldersInlineDisplay', cursive;

// ========================================
// Tipografia - Tamanhos
// ========================================
$logo-size: 4.688rem;
$heading-size: 4rem;
$font-size-7xl: 2.375rem;
$font-size-6xl: 2.125rem;
$font-size-5xl: 1.875rem;
$font-size-4xl: 1.75rem;
$font-size-3xl: 1.5rem;
$font-size-2xl: 1.375rem;
$font-size-xl: 1.25rem;
$font-size-lg: 1.125rem;
$font-size-base: 1rem;
$font-size-sm: 0.875rem;
$font-size-xs: 0.75rem;
```

### 📝 Explicação das Variáveis

**Por que usar variáveis SCSS?**

```scss
// ❌ Sem variáveis (difícil manter)
.button {
  background: #E669EA;
}
.header {
  background: #E669EA;  // Se mudar a cor, precisa alterar em vários lugares
}

// ✅ Com variáveis (manutenção fácil)
.button {
  background: $primary-color;
}
.header {
  background: $primary-color;  // Muda automaticamente
}
```

**Vantagens:**
- ✅ **Single source of truth**: Cor definida em um único lugar
- ✅ **Consistência**: Design System uniforme
- ✅ **Manutenção**: Mudança de cor afeta toda a aplicação
- ✅ **Autocomplete**: IDE sugere variáveis disponíveis

**Nomenclatura semântica:**
```scss
// ✅ Bom (semântico)
$primary-color: #E669EA;
$critical-color: #FF7CA3;

// ❌ Ruim (não semântico)
$purple: #E669EA;
$pink: #FF7CA3;
```

**Por que semântico é melhor?**
- Se mudarmos `$primary-color` para azul, o nome ainda faz sentido
- `$purple` viraria uma mentira se a cor mudasse

---

### 5. Adicionar Fontes Locais

Baixar as fontes do diretório `/design/fonts/` e copiar para `src/assets/fonts/`:

```bash
# Copiar fontes Barlow
cp ../../design/fonts/Barlow/Barlow-Regular.ttf src/assets/fonts/
cp ../../design/fonts/Barlow/Barlow-Medium.ttf src/assets/fonts/
cp ../../design/fonts/Barlow/Barlow-SemiBold.ttf src/assets/fonts/
cp ../../design/fonts/Barlow/Barlow-Bold.ttf src/assets/fonts/

# Copiar fontes BigShouldersInlineDisplay
cp ../../design/fonts/BigShouldersInlineDisplay/BigShouldersInlineDisplay-Regular.ttf src/assets/fonts/
cp ../../design/fonts/BigShouldersInlineDisplay/BigShouldersInlineDisplay-Bold.ttf src/assets/fonts/

# Copiar fontes BigShouldersDisplay
cp ../../design/fonts/BigShouldersDisplay/BigShoulders-Regular.ttf src/assets/fonts/
cp ../../design/fonts/BigShouldersDisplay/BigShoulders-Bold.ttf src/assets/fonts/
cp ../../design/fonts/BigShouldersDisplay/BigShoulders-ExtraBold.ttf src/assets/fonts/
```

---

### 6. Criar Arquivo de Mixins

**src/styles/_mixins.scss**
```scss
// ========================================
// Mixins Utilitários
// ========================================

// Flexbox center
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

// Flexbox column
@mixin flex-column {
  display: flex;
  flex-direction: column;
}

// Sombra padrão
@mixin box-shadow-base {
  box-shadow: 0 4px 12px $base-shadow;
}

// Sombra primária
@mixin box-shadow-primary {
  box-shadow: 0 4px 12px $primary-shadow;
}

// Transição suave
@mixin transition($property: all, $duration: 0.3s, $timing: ease) {
  transition: $property $duration $timing;
}

// Truncate text
@mixin text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

### 📝 Explicação dos Mixins

**O que são mixins?**

Mixins são **funções SCSS reutilizáveis** que geram código CSS:

```scss
// ❌ Sem mixin (código duplicado)
.card {
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal {
  display: flex;
  justify-content: center;
  align-items: center;
}

// ✅ Com mixin (DRY)
.card {
  @include flex-center;
}
.modal {
  @include flex-center;
}
```

**Mixins com parâmetros:**

```scss
@mixin transition($property: all, $duration: 0.3s, $timing: ease) {
  transition: $property $duration $timing;
}

// Uso
.button {
  @include transition(background, 0.2s, ease-in-out);
  // Gera: transition: background 0.2s ease-in-out;
}
```

**Quando usar mixins vs. variáveis?**

| Use Mixins | Use Variáveis |
|------------|---------------|
| ✅ Bloco de CSS repetido | ✅ Valores únicos (cores, tamanhos) |
| ✅ Precisa lógica/parâmetros | ✅ Design tokens |
| ✅ Media queries | ✅ Sem lógica |

---

### 7. Configurar Estilos Globais

**src/styles.scss**
```scss
// ========================================
// Importações
// ========================================
@use './styles/variables' as *;
@use './styles/mixins' as *;

// ========================================
// Fontes
// ========================================
@font-face {
    font-family: 'Barlow';
    src: url('/assets/fonts/Barlow-Regular.ttf') format('truetype');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'Barlow';
    src: url('/assets/fonts/Barlow-Medium.ttf') format('truetype');
    font-weight: 500;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'Barlow';
    src: url('/assets/fonts/Barlow-SemiBold.ttf') format('truetype');
    font-weight: 600;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'Barlow';
    src: url('/assets/fonts/Barlow-Bold.ttf') format('truetype');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'BigShouldersInlineDisplay';
    src: url('/assets/fonts/BigShouldersInlineDisplay-Regular.ttf') format('truetype');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'BigShouldersInlineDisplay';
    src: url('/assets/fonts/BigShouldersInlineDisplay-Bold.ttf') format('truetype');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'BigShouldersDisplay';
    src: url('/assets/fonts/BigShouldersDisplay-Regular.ttf') format('truetype');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'BigShouldersDisplay';
    src: url('/assets/fonts/BigShouldersDisplay-Bold.ttf') format('truetype');
    font-weight: 700;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'BigShouldersDisplay';
    src: url('/assets/fonts/BigShouldersDisplay-ExtraBold.ttf') format('truetype');
    font-weight: 900;
    font-style: normal;
    font-display: swap;
}

// ========================================
// Reset Global
// ========================================
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

// ========================================
// Estilos Base
// ========================================
body {
  font-family: $text-family;
  font-size: $font-size-base;
  color: $text-color;
  background-color: $base-dark-2;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  margin: 0;
}

a {
  text-decoration: none;
  color: inherit;
}

button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  outline: none;
}

input, textarea, select {
  font-family: inherit;
  outline: none;
}

// ========================================
// Utilitários
// ========================================
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.text-center {
  text-align: center;
}

.text-primary {
  color: $primary-color;
}

.text-critical {
  color: $critical-color;
}

.text-success {
  color: $success-color;
}
```

---

### 8. Criar Favicon

**public/favicon.svg**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <text y="0.9em" font-size="90">🦄</text>
</svg>
```

---

### 9. Configurar HTML Base

**src/index.html**
```html
<!doctype html>
<html lang="pt-BR">

<head>
  <meta charset="utf-8">
  <title>Pony Collection</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <link rel="icon" type="image/svg+xml" href="favicon.svg">

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&family=Big+Shoulders+Inline+Display:wght@400;700&family=Big+Shoulders:opsz,wght@10..72,100..900&display=swap"
    rel="stylesheet">
</head>

<body>
  <app-root></app-root>
</body>

</html>
```

> **Nota:** Os links do Google Fonts servem como fallback. As fontes principais são carregadas localmente via `@font-face` no `styles.scss`.

---

### 10. Testar o Projeto

```bash
npm start
```

Acesse: **http://localhost:4200**

Deve aparecer uma página em branco com fundo escuro (`$base-dark-1`).

---

## 🎯 Próximos Passos

Continue para a [Parte 2 (01b-setup-projeto.md)](01b-setup-projeto.md) para:

- ✅ Aprender conceitos avançados de SCSS (@use vs @import)
- ✅ Entender font-display: swap
- ✅ Configurar Path Alias no TypeScript
- ✅ Compreender CSS Reset vs Normalize
- ✅ Fontes locais vs Google Fonts CDN
- ✅ SCSS Partials e ViewEncapsulation
- ✅ Checklist de conclusão completo

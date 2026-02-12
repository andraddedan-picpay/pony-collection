# 📘 Aula 1 — Setup do Projeto Angular

## Objetivo

Criar a estrutura base do projeto Angular com SCSS, organização de pastas profissional e integração das variáveis do Design System.

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

**Opções selecionadas:**
- ✅ Standalone components (arquitetura moderna)
- ✅ SCSS como pré-processador
- ✅ Routing habilitado
- ❌ SSR desabilitado (SPA)

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
$logo-family: 'BigShouldersInlineDisplay', cursive;

// ========================================
// Tipografia - Tamanhos
// ========================================
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

// Responsive breakpoints
@mixin mobile {
  @media (max-width: 768px) {
    @content;
  }
}

@mixin tablet {
  @media (min-width: 769px) and (max-width: 1024px) {
    @content;
  }
}

@mixin desktop {
  @media (min-width: 1025px) {
    @content;
  }
}
```

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
  background-color: $base-dark-1;
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
    href="https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&family=Big+Shoulders+Inline+Display:wght@400;700&display=swap"
    rel="stylesheet">
</head>

<body>
  <app-root></app-root>
</body>

</html>
```

> **Nota:** Os links do Google Fonts servem como fallback. As fontes principais são carregadas localmente via `@font-face` no `styles.scss`.

---

---

### 10. Testar o Projeto

```bash
npm start
```

Acesse: **http://localhost:4200**

Deve aparecer uma página em branco com fundo escuro (`$base-dark-1`).

---

## ✅ Resultado Esperado

- ✅ Projeto Angular criado e rodando
- ✅ SCSS configurado com variáveis e mixins
- ✅ Pasta de estilos globais criada (`src/styles/`)
- ✅ Variáveis do theme.md configuradas
- ✅ Fontes locais configuradas (Barlow e BigShouldersInlineDisplay)
- ✅ Estilos globais aplicados
- ✅ Favicon unicórnio configurado
- ✅ Componente App com sintaxe moderna (signals)

---

## 📝 Próximos Passos

- Criar a tela de login
# 📘 Aula 1B — Setup do Projeto Angular (Parte 2: Conceitos Avançados)

> 📌 **Parte 1:** [01a-setup-projeto.md](01a-setup-projeto.md) — Instalação e Configuração

**Progresso do Curso Frontend:** `[█░░░░░░░░░░░░░░░░░░░] 5% concluído`

---

## 🎓 Conceitos Avançados

### 1. `@use` vs `@import` (SCSS Modules)

**Sintaxe antiga (`@import`):**
```scss
// ❌ Deprecated (será removido)
@import 'variables';
@import 'mixins';

.button {
  background: $primary-color;  // Variável global
}
```

**Problemas do `@import`:**
- ❌ Namespace global (conflitos de nomes)
- ❌ Importa tudo (mesmo o que não usa)
- ❌ Múltiplos imports duplicam código

**Sintaxe moderna (`@use`):**
```scss
// ✅ Recomendado (SCSS Modules)
@use 'variables' as *;  // * = sem namespace
@use 'mixins' as *;

.button {
  background: $primary-color;
  @include flex-center;
}
```

**Com namespace explícito:**
```scss
@use 'variables' as vars;
@use 'mixins' as mix;

.button {
  background: vars.$primary-color;  // Namespace explícito
  @include mix.flex-center;
}
```

**Comparação:**

| Aspecto | `@import` | `@use` |
|---------|-----------|--------|
| **Status** | ❌ Deprecated | ✅ Recomendado |
| **Namespace** | Global (conflitos) | Encapsulado |
| **Performance** | Duplica código | Cache automático |
| **Organização** | Difícil rastrear | Imports explícitos |

---

### 2. `font-display: swap`

```scss
@font-face {
    font-family: 'Barlow';
    src: url('/assets/fonts/Barlow-Regular.ttf') format('truetype');
    font-display: swap;  // ← Estratégia de carregamento
}
```

**O que faz?**

Controla como o navegador exibe texto enquanto a fonte customizada carrega:

| Valor | Comportamento | Impacto UX |
|-------|---------------|------------|
| **block** | Texto invisível até fonte carregar (FOIT) | ❌ UX ruim (tela branca) |
| **swap** | Mostra fonte fallback → troca quando carregar | ✅ Melhor UX (texto visível) |
| **fallback** | 100ms invisível → fallback → troca (se rápido) | ⚠️ Compromisso |
| **optional** | Usa fallback se fonte não carregar rápido | ⚠️ Fonte pode não aparecer |

**Nossa escolha**: `swap` porque:
- ✅ Usuário vê texto imediatamente (fallback)
- ✅ Fonte customizada aplica quando carregar
- ✅ Evita FOIT (Flash of Invisible Text)

**Trade-off:**
- ⚠️ FOUT (Flash of Unstyled Text) acontece
- ⚠️ Layout shift se fonte tiver métricas diferentes

**Como minimizar layout shift:**
```scss
// Use fontes fallback com métricas similares
$text-family: 'Barlow', 'Arial', sans-serif;  // Arial tem métricas próximas
```

---

### 3. Path Alias no TypeScript

**Sem alias:**
```typescript
// ❌ Import relativo confuso
import { User } from '../../../core/models/user.model';
```

**Com alias:**
```typescript
// ✅ Import limpo
import { User } from '@app/core/models/user.model';
```

**Configuração (`tsconfig.json`):**
```json
{
  "compilerOptions": {
    "paths": {
      "@app/*": ["src/app/*"],
      "@core/*": ["src/app/core/*"],
      "@shared/*": ["src/app/shared/*"]
    }
  }
}
```

**Vantagens:**
- ✅ Independente da profundidade do arquivo
- ✅ Fácil mover arquivos (não quebra imports)
- ✅ Mais legível

---

### 4. CSS Reset vs Normalize

**CSS Reset (nossa escolha):**
```scss
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;  // Facilita cálculos de layout
}
```

**O que faz?**
- Remove margens/paddings padrão do navegador
- `box-sizing: border-box` inclui padding/border no tamanho do elemento

**Alternativa: Normalize.css**
```scss
// Biblioteca que "normaliza" estilos entre navegadores
// Não remove tudo, só padroniza
@import 'normalize.css';
```

**Comparação:**

| Abordagem | O que faz | Quando usar |
|-----------|-----------|-------------|
| **Reset** | Remove todos os estilos padrão | ✅ Design system próprio |
| **Normalize** | Padroniza estilos entre navegadores | ⚠️ Precisa estilos nativos |

**Nossa escolha**: Reset porque temos Design System completo (não precisamos dos estilos nativos).

---

### 5. Fontes Locais vs Google Fonts CDN

**Google Fonts CDN (online):**
```html
<link href="https://fonts.googleapis.com/css2?family=Barlow" rel="stylesheet">
```

**Vantagens:**
- ✅ Simples (um link)
- ✅ Cache compartilhado (pode já estar no navegador do usuário)

**Desvantagens:**
- ❌ Requisição externa (GDPR, latência)
- ❌ Depende da disponibilidade do Google
- ❌ Não funciona offline

**Fontes Locais (nossa escolha):**
```scss
@font-face {
    font-family: 'Barlow';
    src: url('/assets/fonts/Barlow-Regular.ttf') format('truetype');
}
```

**Vantagens:**
- ✅ **Performance**: Sem requisição externa
- ✅ **Privacidade**: Sem dependência do Google (GDPR compliant)
- ✅ **Offline**: Funciona sem internet
- ✅ **Controle total**: Versão específica da fonte

**Desvantagens:**
- ❌ Bundle maior (~100KB por peso de fonte)
- ❌ Precisa gerenciar arquivos manualmente

**Trade-off aceitável porque:**
- App não tem SEO crítico (autenticado)
- Performance importa mais que tamanho inicial (carrega 1x, usa sempre)

---

### 6. SCSS Partials (Arquivos com `_`)

```
styles/
├── _variables.scss  ← Partial (não compila sozinho)
├── _mixins.scss     ← Partial
└── styles.scss      ← Main (importa os partials)
```

**Por que usar `_` no nome?**
- SCSS não compila `_variables.scss` em CSS
- Só compila quando importado via `@use` ou `@import`
- Evita gerar arquivos CSS desnecessários

**Sem partial:**
```
styles/
├── variables.css  ← ❌ Gerado (não queremos)
├── mixins.css     ← ❌ Gerado (não queremos)
└── styles.css     ← ✅ Único que precisamos
```

---

### 7. ViewEncapsulation (Component Styles)

O Angular isola estilos de componentes por padrão:

```typescript
@Component({
  selector: 'app-button',
  styleUrl: './button.component.scss',
  encapsulation: ViewEncapsulation.Emulated  // Padrão
})
```

**Opções:**

| Modo | Como funciona | Quando usar |
|------|---------------|-------------|
| **Emulated** (padrão) | Adiciona atributos únicos (`_ngcontent-xxx`) | ✅ Maioria dos componentes |
| **None** | Estilos vazam globalmente | ⚠️ Shared components (próxima aula) |
| **ShadowDom** | Usa Shadow DOM nativo | ⚠️ Web Components |

**Exemplo (Emulated):**
```html
<!-- Renderizado no DOM -->
<button _ngcontent-ng-c123>Click</button>

<style>
button[_ngcontent-ng-c123] { ... }  /* Escopo isolado */
</style>
```

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

## 📦 Resumo dos Arquivos Criados

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/styles/_variables.scss` | Design tokens (cores, fontes, tamanhos) |
| `src/styles/_mixins.scss` | Mixins reutilizáveis (flexbox, media queries) |
| `src/styles.scss` | Estilos globais (reset, @font-face, utilitários) |
| `src/app/app.ts` | Componente raiz (standalone, signals) |
| `src/app/app.html` | Template minimalista (router-outlet) |
| `src/assets/fonts/` | Fontes locais (Barlow, BigShoulders) |
| `public/favicon.svg` | Ícone do app (unicórnio) |

---

## 🎯 Checklist de Conclusão

- ✅ Angular CLI instalado globalmente
- ✅ Projeto criado com standalone components
- ✅ SCSS configurado como pré-processador
- ✅ Variáveis do Design System criadas
- ✅ Mixins utilitários criados
- ✅ Fontes locais instaladas e configuradas
- ✅ Reset CSS aplicado
- ✅ Dev server rodando (`npm start`)
- ✅ Página acessível em `http://localhost:4200`

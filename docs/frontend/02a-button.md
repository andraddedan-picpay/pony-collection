# 📘 Aula 2a — Componente Button Reutilizável

**Progresso do Curso Frontend:** `[██░░░░░░░░░░░░░░░░░░] 11% concluído`

## Objetivo

Implementar o primeiro componente compartilhado da aplicação: o **PonyButton**, aplicando conceitos de Signal Inputs, design tokens e componentização.

---

## 🎯 O que vamos construir

- **`PonyButtonComponent`**: Botão reutilizável com variantes (primary/secondary), estados (loading/disabled) e ícones SVG
- **Design System**: Componentes consistentes usando variáveis SCSS
- **Signal Inputs**: Nova API de reatividade do Angular 17+

💡 **Na próxima aula**, criaremos os componentes de Input e Textarea com integração a formulários.

<!-- 💡 Screenshot sugerido: Exemplo visual dos botões primary e secondary, com estados normal, hover, disabled e loading lado a lado -->

---

## 📋 Conceitos Importantes

### Componentes Reutilizáveis vs Componentes de Página

| Tipo                   | Responsabilidade                   | Onde fica                    | Exemplo              |
| ---------------------- | ---------------------------------- | ---------------------------- | -------------------- |
| **Shared Components**  | UI genérica, sem lógica de negócio | `app/shared/components/`     | Button, Input, Card  |
| **Feature Components** | Lógica específica de feature       | `app/features/ponies/`       | PonyCard, PonyForm   |
| **Page Components**    | Orquestra múltiplos componentes    | `app/features/ponies/pages/` | ListPage, DetailPage |

**Características de componentes reutilizáveis:**

- ✅ **Agnósticos**: Não sabem onde/como são usados
- ✅ **Configuráveis**: Inputs para personalização
- ✅ **Standalone**: Não dependem de contexto externo
- ✅ **Documentados**: Props claras e bem definidas

---

### Signal Inputs vs @Input() Decorator

| Feature         | `@Input()` (Angular < 17) | `input()` (Angular 17+)      |
| --------------- | ------------------------- | ---------------------------- |
| **Sintaxe**     | `@Input() name: string;`  | `name = input<string>();`    |
| **Reatividade** | Change Detection manual   | Signals (automático)         |
| **Type-safety** | ⚠️ Precisa inicializar    | ✅ Type-safe por padrão      |
| **Performance** | ⚠️ Verifica sempre        | ✅ Granular (só o que mudou) |
| **Boilerplate** | ❌ Decorators, imports    | ✅ Funções simples           |
| **Composição**  | ❌ Limitada               | ✅ Computed signals          |

**Sintaxe antiga:**

```typescript
import { Component, Input, Output, EventEmitter } from "@angular/core";

export class ButtonComponent {
  @Input() variant: "primary" | "secondary" = "primary";
  @Input() disabled: boolean = false;
  @Output() click = new EventEmitter<MouseEvent>();
}
```

**Sintaxe moderna (nossa escolha):**

```typescript
import { Component, input, output } from "@angular/core";

export class ButtonComponent {
  variant = input<"primary" | "secondary">("primary");
  disabled = input<boolean>(false);
  click = output<MouseEvent>();
}
```

**Vantagens dos Signal Inputs:**

- ✅ **Performance**: Change detection só executa quando signal muda
- ✅ **Composição**: Pode usar em `computed()` signals
- ✅ **Type-safe**: Erros detectados em compile-time

---

### Design Tokens vs Hardcoded Values

**❌ Hardcoded (difícil manter):**

```scss
.button {
  background: #e669ea;
  padding: 16px 32px;
  border-radius: 12px;
}
.input {
  background: #2d303e;
  border-radius: 12px; // Duplicado
}
```

**✅ Design Tokens (single source of truth):**

```scss
.button {
  background: $primary-color;
  padding: 1rem 2rem;
  border-radius: $border-radius-md;
}
.input {
  background: $base-form;
  border-radius: $border-radius-md; // Consistente
}
```

**Vantagens:**

- ✅ **Consistência**: Mesmos valores em toda aplicação
- ✅ **Manutenção**: Muda em um lugar, afeta tudo
- ✅ **Escalabilidade**: Fácil adicionar dark mode, temas

---

### Fluxo de Dados Unidirecional

```
┌──────────────┐
│ Parent (Page)│
└───────┬──────┘
        │ Props (input)
        ▼
┌─────────────────┐
│ Child (Button)  │
│                 │
│  [variant]      │◄── Recebe dados do pai
│  [disabled]     │
│  (click)        │──► Emite eventos para o pai
└─────────────────┘
```

**Regra de ouro:**

- 📥 **Props down**: Pai passa dados via `@Input`/`input()`
- 📤 **Events up**: Filho emite eventos via `@Output`/`output()`
- ❌ **Nunca**: Filho modifica props diretamente

<!-- 💡 Screenshot sugerido: Diagrama ilustrando o fluxo de dados entre componente pai e filho (dados descendo, eventos subindo) -->

---

## 📦 Instalação de Dependências

Vamos instalar a biblioteca para trabalhar com ícones SVG:

```bash
npm install angular-svg-icon
```

**Configurar no app.config.ts:**

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { provideAngularSvgIcon } from "angular-svg-icon";

import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAngularSvgIcon(),
  ],
};
```

### 📝 Explicação dos Providers

**1. `provideHttpClient()`:**

- Necessário para buscar SVGs via HTTP
- Usado pela biblioteca `angular-svg-icon`
- Também será usado para chamadas à API REST (próximas aulas)

**2. `provideAngularSvgIcon()`:**

- Configura a biblioteca de ícones SVG
- Permite carregar SVGs dinamicamente
- Cacheia SVGs para melhor performance

**3. `provideZoneChangeDetection({ eventCoalescing: true })`:**

- **eventCoalescing**: Agrupa múltiplas mudanças em uma única detecção
- Melhora performance (menos ciclos de change detection)

---

## 🎨 Implementando o Pony Button

### 1. Criar o Componente

```bash
ng generate component shared/components/pony-button --skip-tests
```

### 2. Implementar o TypeScript

**src/app/shared/components/pony-button/pony-button.component.ts**

```typescript
import { Component, input, output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SvgIconComponent } from "angular-svg-icon";

export type ButtonVariant = "primary" | "secondary";

@Component({
  selector: "pony-button",
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: "./pony-button.component.html",
  styleUrl: "./pony-button.component.scss",
})
export class PonyButtonComponent {
  width = input<string>("auto");
  variant = input<ButtonVariant>("primary");
  type = input<"button" | "submit" | "reset">("button");
  disabled = input<boolean>(false);
  loading = input<boolean>(false);

  click = output<MouseEvent>();

  handleClick(event: MouseEvent): void {
    event.stopPropagation();
    const canClick = !this.disabled() && !this.loading();
    if (canClick) this.click.emit(event);
  }
}
```

### 📝 Explicação Detalhada do TypeScript

**1. Type Safety com Union Types:**

```typescript
export type ButtonVariant = "primary" | "secondary";
```

- Define os valores possíveis para `variant`
- TypeScript acusa erro se usar valor inválido
- IDE oferece autocomplete

**2. Signal Inputs:**

```typescript
width = input<string>("auto");
variant = input<ButtonVariant>("primary");
disabled = input<boolean>(false);
```

- **`input<T>(defaultValue)`**: Cria signal input com valor padrão
- **Generic `<T>`**: Define o tipo esperado
- **Acesso no template**: `width()`, `variant()`, `disabled()`

**3. Signal Outputs:**

```typescript
click = output<MouseEvent>();
```

- **`output<T>()`**: Cria emitter tipado
- **Generic `<MouseEvent>`**: Especifica tipo do evento
- **Uso**: `this.click.emit(event)` no TypeScript, `(click)="handler($event)"` no template

**4. Lógica de Click Condicional:**

```typescript
handleClick(event: MouseEvent): void {
  event.stopPropagation();
  const canClick = !this.disabled() && !this.loading();
  if (canClick) this.click.emit(event);
}
```

- **`event.stopPropagation()`**: Impede que o evento se propague para elementos pais (evita cliques duplicados)
- **Guarda**: Só emite evento se não estiver `disabled` ou `loading`
- **Por quê?**: Evita ações indesejadas durante requisições HTTP
- **Segurança**: Lógica no componente, não apenas CSS

<!-- 💡 Screenshot sugerido: Código do TypeScript no VS Code mostrando autocomplete do TypeScript para ButtonVariant -->

---

### 3. Criar o Template

**src/app/shared/components/pony-button/pony-button.component.html**

```html
<button
  [style.width]="width()"
  [type]="type()"
  class="btn"
  [class]="[
    'btn',
    'btn-' + variant(),
    loading() && 'btn-loading'
  ]"
  [disabled]="disabled() || loading()"
  (click)="handleClick($event)"
>
  @if (loading()) {
  <svg-icon
    src="assets/icons/loading.svg"
    class="btn-loading-icon"
    [svgStyle]="{ 'width.px': 20, 'height.px': 20 }"
  ></svg-icon>
  } @else {
  <ng-content></ng-content>
  }
</button>
```

### 📝 Explicação Detalhada do Template

**1. Control Flow Syntax (Angular 17+):**

```html
@if (loading()) {
<svg-icon ... />
} @else {
<ng-content></ng-content>
}
```

- **`@if`**: Nova sintaxe (substitui `*ngIf`)
- **Loading**: Mostra spinner animado
- **Else**: Mostra conteúdo projetado

**2. Class Binding Dinâmico:**

```html
[class]="[ 'btn', 'btn-' + variant(), loading() && 'btn-loading' ]"
```

- **Array de classes**: Angular junta automaticamente
- **`'btn-' + variant()`**: Gera `btn-primary` ou `btn-secondary`
- **`loading() && 'btn-loading'`**: Adiciona classe se `loading` for true

**3. Content Projection (`<ng-content>`):**

```html
<ng-content></ng-content>
```

- **O que é?**: Slot para conteúdo do pai
- **Uso no pai**: `<pony-button>Texto aqui</pony-button>`
- **Renderiza**: "Texto aqui" dentro do botão

**Comparação: Slot vs Prop**

| Abordagem | Sintaxe                            | Quando usar              |
| --------- | ---------------------------------- | ------------------------ |
| **Prop**  | `<button [text]="'Enviar'">`       | Texto simples            |
| **Slot**  | `<button>Enviar <icon /></button>` | ✅ HTML complexo, ícones |

---

### 4. Criar os Estilos

**src/app/shared/components/pony-button/pony-button.component.scss**

```scss
@use "styles/variables" as *;
@use "styles/mixins" as *;

.btn {
  display: inline-flex;
  height: 48px;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-family: $text-family;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  @include transition(all, 0.3s, ease);

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
}

// Variants
.btn-primary {
  background: linear-gradient(135deg, $primary-color 0%, #c850d0 100%);
  color: $text-color;

  &:hover:not(:disabled) {
    box-shadow: 0px 4px 12px 0px rgba($primary-shadow, 0.6);
  }
}

.btn-secondary {
  background-color: $secondary-color;
  color: $text-color;
  border: 1px solid rgba($grayscale-03, 0.3);
  box-shadow: none;

  &:hover:not(:disabled) {
    border-color: $primary-color;
    background-color: rgba($primary-color, 0.1);
  }
}

.btn-loading {
  position: relative;
  pointer-events: none;

  .btn-loading-icon {
    color: $text-color;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
```

### 📝 Explicação dos Estilos

**1. Estados do Botão:**

- **Primary**: Gradiente roxo/rosa com sombra no hover
- **Secondary**: Fundo sólido com borda sutil
- **Loading**: Animação de rotação infinita
- **Disabled**: Opacidade reduzida, cursor bloqueado

**2. Animação CSS:**

```scss
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

- **`spin`**: Nome da animação
- **`1s`**: Duração
- **`linear`**: Velocidade constante (ideal para rotação)
- **`infinite`**: Loop contínuo

<!-- 💡 Screenshot sugerido: Demonstração dos estados do botão (normal, hover, loading, disabled) para ambas as variantes -->

---

### 5. Criar o Ícone de Loading

Crie o arquivo **public/assets/icons/loading.svg**:

```svg
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75"/>
</svg>
```

---

## 🎓 Conceitos Avançados

### 1. ng-content - Content Projection

**Projeção simples (nossa escolha):**

```html
<!-- PonyButton template -->
<button>
  <ng-content></ng-content>
</button>

<!-- Uso -->
<pony-button>
  Enviar <span class="icon">→</span>
</pony-button>
```

**Projeção com múltiplos slots:**

```html
<!-- CardComponent template -->
<div class="card">
  <header>
    <ng-content select="[card-header]"></ng-content>
  </header>
  <main>
    <ng-content select="[card-body]"></ng-content>
  </main>
</div>

<!-- Uso -->
<app-card>
  <h1 card-header>Título</h1>
  <p card-body>Conteúdo</p>
</app-card>
```

**Comparação: Angular vs React/Vue**

| Framework   | Sintaxe                     | Múltiplos slots     |
| ----------- | --------------------------- | ------------------- |
| **Angular** | `<ng-content select="...">` | ✅ Sim              |
| **React**   | `{props.children}`          | ⚠️ Via props extras |
| **Vue**     | `<slot name="...">`         | ✅ Sim              |

---

### 2. SVG Icons: Inline vs External

**Inline (embutido):**

```html
<svg xmlns="..." viewBox="...">
  <circle cx="12" cy="12" r="10" ... />
</svg>
```

- ✅ Sem requisição HTTP
- ❌ HTML verboso
- ❌ Difícil reusar

**External via `angular-svg-icon` (nossa escolha):**

```html
<svg-icon src="assets/icons/loading.svg"></svg-icon>
```

- ✅ **Cache**: Busca 1x, reutiliza sempre
- ✅ **Organizável**: Pasta de ícones centralizada
- ✅ **Dinâmico**: `[src]="iconPath"`
- ⚠️ Requisição HTTP inicial (mitigada por cache)

---

### 3. @Input() vs input() - Migração

| Feature         | `@Input()` (Antigo)                       | `input()` (Novo)                    |
| --------------- | ----------------------------------------- | ----------------------------------- |
| **Sintaxe**     | `@Input() name: string = '';`             | `name = input<string>('');`         |
| **Required**    | `@Input({ required: true })`              | `name = input.required<string>();`  |
| **Alias**       | `@Input('userName')`                      | `input({ alias: 'userName' })`      |
| **Transform**   | `@Input({ transform: booleanAttribute })` | Mesma sintaxe com transform         |
| **Reatividade** | Change Detection                          | Signals (granular)                  |

**Exemplo completo:**

```typescript
// ❌ Sintaxe antiga
export class OldComponent {
  @Input({ required: true, alias: "userName" })
  name!: string;

  @Input({ transform: booleanAttribute })
  disabled: boolean = false;
}

// ✅ Sintaxe moderna
export class NewComponent {
  name = input.required<string>({ alias: "userName" });
  disabled = input<boolean, string | boolean>(false, {
    transform: booleanAttribute,
  });
}
```

---

## 🧪 Como Usar o Componente

**Exemplo básico:**

```html
<pony-button [variant]="'primary'" (click)="handleSubmit()">
  Enviar
</pony-button>
```

**Com loading:**

```html
<pony-button 
  [variant]="'primary'" 
  [loading]="isSubmitting"
  (click)="handleSubmit()"
>
  Salvar
</pony-button>
```

**Botão secundário desabilitado:**

```html
<pony-button 
  [variant]="'secondary'" 
  [disabled]="true"
>
  Cancelar
</pony-button>
```

<!-- 💡 Screenshot sugerido: Exemplo de uso do botão em um formulário real da aplicação -->

---

## 🎯 Checklist de Conclusão

- ✅ `angular-svg-icon` instalado e configurado
- ✅ `PonyButtonComponent` criado com variantes
- ✅ Estados de loading e disabled implementados
- ✅ Signal Inputs e Outputs funcionando
- ✅ Componente usa design tokens (variáveis SCSS)
- ✅ Animações CSS (loading spinner)
- ✅ Content projection com `ng-content`
- ✅ Ícone de loading SVG criado

---

## 📚 Resumo

Nesta aula você aprendeu:

✅ Como criar componentes reutilizáveis usando Signals API  
✅ Diferenças entre Signal Inputs e @Input() decorator  
✅ Trabalhar com `angular-svg-icon` para ícones SVG  
✅ Aplicar variáveis do design system (theme.md)  
✅ Criar animações CSS (loading, hover, focus)  
✅ Usar `ng-content` para projeção de conteúdo  
✅ Conceitos de fluxo de dados unidirecional  
✅ Design tokens vs valores hardcoded

---

## 📚 Referências

- [Angular Signals](https://angular.io/guide/signals)
- [Angular SVG Icon](https://www.npmjs.com/package/angular-svg-icon)
- [Content Projection](https://angular.io/guide/content-projection)
- [CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)

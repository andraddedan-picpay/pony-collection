# 📘 Aula 2 — Componentes Reutilizáveis [Button, Input & Textarea]

## Objetivo

Implementar componentes compartilhados base [Button, Input e Textarea] com o tema, permitindo que sejam reutilizáveis para toda a aplicação.

---

## 🎯 O que vamos construir

- **`PonyButtonComponent`**: Botão reutilizável com variantes (primary/secondary), estados (loading/disabled) e ícones SVG
- **`PonyInputComponent`**: Input customizado compatível com Reactive Forms e Template-driven Forms
- **`PonyTextareaComponent`**: Textarea com suporte a redimensionamento vertical e maxLength
- **Design System**: Componentes consistentes usando variáveis SCSS
- **ControlValueAccessor**: Integração nativa com formulários Angular

💡 **Na próxima aula**, usaremos esses componentes para construir a tela de login.

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

### ViewEncapsulation: None vs Emulated

Quando criamos componentes compartilhados que precisam ser estilizados externamente, usamos `ViewEncapsulation.None`:

| Modo                  | Como funciona                                | Estilos            | Quando usar                       |
| --------------------- | -------------------------------------------- | ------------------ | --------------------------------- |
| **Emulated** (padrão) | Adiciona atributos únicos (`_ngcontent-xxx`) | ✅ Isolados        | Componentes normais               |
| **None**              | Estilos globais                              | ❌ Vazam           | Shared components (button, input) |
| **ShadowDom**         | Shadow DOM nativo                            | ✅ Isolados (real) | Web Components                    |

**Exemplo com Emulated:**

```typescript
@Component({
  selector: 'app-card',
  styleUrl: './card.component.scss',
  encapsulation: ViewEncapsulation.Emulated  // Padrão
})
```

```html
<!-- Renderizado -->
<div _ngcontent-ng-c123 class="card">...</div>

<style>
  .card[_ngcontent-ng-c123] { ... }  /* Escopo isolado */
</style>
```

**Nosso caso (PonyButton usa encapsulation padrão):**

- Estilos isolados dentro do componente
- Não vaza para outros componentes
- Pode ser sobrescrito via `::ng-deep` (não recomendado)

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

**Exemplo:**

```html
<!-- Pai -->
<pony-button
  [variant]="'primary'"
  ←
  Props
  down
  [disabled]="isLoading"
  ←
  Props
  down
  (click)="handleClick($event)"
  ←
  Events
  up
>
  Enviar
</pony-button>
```

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

## 🎨 1. Componente Pony Button

### 1.1 Criar o Componente

```bash
ng generate component shared/components/pony-button --skip-tests
```

### 1.2 Implementar o TypeScript

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

**💡 Explicação:**

- Usamos `input()` e `output()` da nova **Signals API** do Angular
- Suporta estados de `loading` e `disabled`
- Emite eventos de click apenas quando habilitado

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

---

### 1.3 Criar o Template

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

**💡 Explicação:**

- Quando `loading` é true, exibe o ícone de loading
- Caso contrário, exibe o conteúdo passado via `<ng-content>`
- Classes dinâmicas aplicadas baseadas no estado

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

### 1.4 Criar os Estilos

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

**💡 Explicação:**

- **Primary**: Gradiente roxo/rosa com sombra no hover
- **Secondary**: Fundo sólido com borda sutil
- **Loading**: Animação de rotação infinita
- **Hover**: Sombra intensificada no botão primary

### 1.5 Criar o Ícone de Loading

Crie o arquivo **public/assets/icons/loading.svg**:

```svg
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75"/>
</svg>
```

---

## 📝 2. Componente Pony Input

### 2.1 Criar o Componente

```bash
ng generate component shared/components/pony-input --skip-tests
```

### 2.2 Implementar o TypeScript

**src/app/shared/components/pony-input/pony-input.component.ts**

```typescript
import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { SvgIconComponent } from "angular-svg-icon";

@Component({
  selector: "pony-input",
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: "./pony-input.component.html",
  styleUrl: "./pony-input.component.scss",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PonyInputComponent),
      multi: true,
    },
  ],
})
export class PonyInputComponent implements ControlValueAccessor {
  @Input() icon?: string;
  @Input() borderless?: boolean = false;
  @Input() type: string = "text";
  @Input() placeholder: string = "";
  @Input() disabled: boolean = false;
  @Input() name: string = "";
  @Input() required: boolean = false;

  @Output() inputChange = new EventEmitter<string>();
  @Output() fileChange = new EventEmitter<Event>();

  value: string = "";
  fileName: string = "";

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value || "";
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;

    const isFileInput = this.type === "file" && input.files?.length;

    if (isFileInput) {
      this.fileName = input.files?.[0]?.name || "";
      this.fileChange.emit(event);
    }

    this.onChange(this.value);
    this.inputChange.emit(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }

  triggerFileInput(fileInput: HTMLInputElement): void {
    fileInput.click();
  }
}
```

**💡 Explicação:**

- Implementa `ControlValueAccessor` para funcionar com `ngModel`
- Compatível com formulários reativos e template-driven
- Gerencia estado interno do valor

### 2.3 Criar o Template

**src/app/shared/components/pony-input/pony-input.component.html**

```html
<div
  [class]="[
    'pony-box',
    borderless && 'pony-box--borderless',
    type === 'file' && 'pony-box--file',
  ]"
>
  @switch (type) { @case ('file') {
  <!-- Input file oculto -->
  <input
    #fileInput
    type="file"
    [disabled]="disabled"
    [name]="name"
    [required]="required"
    (change)="onInput($event)"
    (blur)="onBlur()"
    class="pony-box__input--hidden"
  />

  <!-- Área de upload customizada -->
  <div
    class="pony-box__upload-area"
    (click)="triggerFileInput(fileInput)"
    [class.disabled]="disabled"
  >
    <span class="pony-box__upload-text">
      {{ fileName || placeholder || 'Escolher arquivo' }}
    </span>
    <svg-icon
      src="assets/icons/upload.svg"
      class="pony-box__icon"
      [svgStyle]="{ 'width.px': 20, 'height.px': 20 }"
    />
  </div>
  } @default {
  <!-- Ícone opcional -->
  @if (icon) {
  <svg-icon
    src="assets/icons/{{ icon }}.svg"
    class="pony-box__icon"
    [svgStyle]="{ 'width.px': 20, 'height.px': 20 }"
  />
  }

  <!-- Input padrão -->
  <input
    [type]="type"
    [placeholder]="placeholder"
    [disabled]="disabled"
    [name]="name"
    [required]="required"
    [value]="value"
    (input)="onInput($event)"
    (blur)="onBlur()"
    class="pony-box__input"
  />
  } }
</div>
```

### 2.4 Criar os Estilos

**src/app/shared/components/pony-input/pony-input.component.scss**

```scss
@use "styles/variables" as *;
@use "styles/mixins" as *;

.pony-box {
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: $base-form;
  border: 1px solid rgba($grayscale-03, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  @include transition(all, 0.3s, ease);

  &:focus-within {
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-shadow, 0.2);
  }

  &__icon {
    color: $grayscale-03;
    flex-shrink: 0;
    display: flex;
  }

  &__input {
    background: none;
    border: none;
    outline: none;
    color: $text-color;
    font-family: $text-family;
    font-size: $font-size-base;
    width: 100%;

    &::placeholder {
      color: $grayscale-03;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &--borderless {
    border: none;
  }

  &--file {
    cursor: pointer;
    padding: 0;
    overflow: hidden;
  }

  &__input--hidden {
    display: none;
  }

  &__upload-area {
    width: 100%;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px;
    cursor: pointer;
    @include transition(all, 0.2s, ease);

    &.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__upload-text {
    color: $grayscale-03;
    font-family: $text-family;
    font-size: $font-size-base;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    user-select: none;
  }
}
```

**💡 Explicação:**

- **Focus**: Borda roxa com sombra externa
- **Hover**: Borda semi-transparente roxa
- **Disabled**: Opacidade reduzida

### 2.5 Criar o Ícone de Upload

Crie o arquivo **public/assets/icons/upload.svg**:

```svg
<svg width="18" height="20" viewBox="0 0 18 20" fill="currentColor"
    xmlns="http://www.w3.org/2000/svg">
    <path
        d="M6.0787 19.8647C6.03564 19.8647 5.99343 19.8611 5.95236 19.8541L5.816 19.853C5.61181 19.853 5.41644 19.7698 5.27501 19.6225L0.209017 14.3465C0.0749002 14.2068 4.3256e-06 14.0207 4.34253e-06 13.827L5.14595e-06 4.63705C5.36406e-06 2.14207 2.02432 4.44626e-05 4.48001 4.46773e-05L12.468 4.53756e-05C15.0512 4.56014e-05 17.052 2.03951 17.052 4.63705L17.052 15.374C17.052 17.8352 14.9553 19.853 12.468 19.853L6.2048 19.8542C6.1638 19.8611 6.12167 19.8647 6.0787 19.8647ZM6.829 18.3547L12.468 18.353C14.1395 18.353 15.552 16.9936 15.552 15.374L15.552 4.63705C15.552 2.86159 14.2162 1.50005 12.468 1.50005L4.48 1.50004C2.87229 1.50004 1.50001 2.95213 1.50001 4.63705L1.501 12.8817L2.37683 12.8787C2.7103 12.8791 3.08961 12.8798 3.51129 12.8807C5.2816 12.8845 6.72595 14.2713 6.82346 16.0173L6.8287 16.2057L6.829 18.3547ZM8.9117 13.1741C8.53201 13.1741 8.21821 12.892 8.16855 12.5259L8.1617 12.4241L8.162 7.66975L6.60455 9.23096C6.31228 9.52447 5.8374 9.52547 5.54389 9.23319C5.27707 8.96749 5.25198 8.55088 5.46922 8.25681L5.54166 8.17253L8.38066 5.32154L8.42442 5.28099C8.43479 5.27212 8.44541 5.26352 8.45626 5.25522L8.38066 5.32154C8.41745 5.28459 8.45713 5.25228 8.49898 5.2246C8.5135 5.21521 8.529 5.20574 8.54486 5.19683C8.55831 5.18904 8.57152 5.18214 8.58488 5.17566C8.60128 5.16795 8.61813 5.16053 8.63529 5.15372C8.65226 5.14675 8.66998 5.14048 8.68786 5.13489C8.70148 5.13087 8.71521 5.12701 8.72909 5.12353C8.74913 5.11828 8.76924 5.11411 8.78947 5.11078C8.80141 5.1091 8.81349 5.10742 8.82564 5.10603C8.84916 5.103 8.87291 5.10139 8.89667 5.1009C8.90156 5.1012 8.90663 5.10115 8.9117 5.10115L8.92667 5.10089C8.9511 5.10136 8.97552 5.10302 8.99982 5.10586L8.9117 5.10115C8.95256 5.10115 8.99266 5.10441 9.03174 5.1107C9.0537 5.11383 9.0754 5.1183 9.09691 5.12375C9.10795 5.12698 9.11936 5.13017 9.13064 5.13361C9.15246 5.13976 9.17381 5.14732 9.19486 5.15588C9.20608 5.16101 9.21719 5.16587 9.22816 5.17098C9.24574 5.17853 9.26306 5.18741 9.28008 5.197C9.29513 5.20618 9.31026 5.21545 9.32503 5.22522C9.33687 5.2323 9.34824 5.24028 9.35942 5.24862L9.36715 5.25522C9.378 5.26352 9.38861 5.27212 9.39899 5.28099L9.44364 5.32163L12.2816 8.17263C12.5739 8.46619 12.5728 8.94106 12.2792 9.23329C12.0123 9.49894 11.5956 9.5222 11.3025 9.30367L11.2186 9.23086L9.662 7.66675L9.6617 12.4241C9.6617 12.8384 9.32592 13.1741 8.9117 13.1741ZM5.329 17.5137L5.3287 16.2057C5.3287 15.1992 4.51436 14.3829 3.50799 14.3807L2.321 14.3807L5.329 17.5137Z"
        fill="currentColor" />
</svg>

```

**💡 Explicação:**

- **currentColor**: Herda a cor do texto (CSS property)
- **Usado no input file**: Exibido na área de upload customizada
- **Design**: Ícone de documento com seta para cima (upload)

---

## 📝 3. Componente Pony Textarea

### 3.1 Criar o Componente

```bash
ng generate component shared/components/pony-textarea --skip-tests
```

### 3.2 Implementar o TypeScript

**src/app/shared/components/pony-textarea/pony-textarea.component.ts**

```typescript
import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'pony-textarea',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './pony-textarea.component.html',
    styleUrl: './pony-textarea.component.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PonyTextareaComponent),
            multi: true,
        },
    ],
})
export class PonyTextareaComponent implements ControlValueAccessor {
    @Input() borderless?: boolean = false;
    @Input() placeholder: string = '';
    @Input() disabled: boolean = false;
    @Input() name: string = '';
    @Input() required: boolean = false;
    @Input() rows: number = 4;
    @Input() maxLength?: number;

    @Output() textareaChange = new EventEmitter<string>();

    value: string = '';

    private onChange: (value: string) => void = () => {};
    private onTouched: () => void = () => {};

    writeValue(value: string): void {
        this.value = value || '';
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    onInput(event: Event): void {
        const textarea = event.target as HTMLTextAreaElement;
        this.value = textarea.value;
        this.onChange(this.value);
        this.textareaChange.emit(this.value);
    }

    onBlur(): void {
        this.onTouched();
    }
}
```

**💡 Explicação:**

- Implementa `ControlValueAccessor` para integração com formulários
- Suporta variante `borderless` (sem borda)
- Input `rows` controla altura inicial do textarea
- Input `maxLength` limita caracteres (opcional)
- Emite evento `textareaChange` a cada alteração

### 📝 Explicação Detalhada do TypeScript

**1. Inputs Específicos do Textarea:**

```typescript
@Input() rows: number = 4;
@Input() maxLength?: number;
```

- **`rows`**: Define número de linhas visíveis (altura padrão)
- **`maxLength`**: Limite de caracteres (opcional)
- **`borderless`**: Remove bordas (útil para UIs minimalistas)

**2. Output para Tracking de Mudanças:**

```typescript
@Output() textareaChange = new EventEmitter<string>();
```

- **Uso**: Monitorar mudanças em tempo real
- **Diferença de ngModel**: Pode usar ambos simultaneamente
- **Exemplo**: `(textareaChange)="onDescriptionChange($event)"`

**3. Método onInput com Type Assertion:**

```typescript
onInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.value = textarea.value;
    this.onChange(this.value);
    this.textareaChange.emit(this.value);
}
```

- **Type Assertion**: `as HTMLTextAreaElement` garante acesso a `.value`
- **Duplo Emit**: Atualiza `ngModel` E emite evento customizado
- **Por quê?**: Flexibilidade para usar qualquer um dos dois

---

### 3.3 Criar o Template

**src/app/shared/components/pony-textarea/pony-textarea.component.html**

```html
<div [class]="['pony-box', 'pony-box--textarea', borderless && 'pony-box--borderless']">
    <textarea
        [placeholder]="placeholder"
        [disabled]="disabled"
        [name]="name"
        [required]="required"
        [rows]="rows"
        [attr.maxlength]="maxLength"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onBlur()"
        class="pony-box__textarea"
    ></textarea>
</div>
```

**💡 Explicação:**

- Usa estrutura `.pony-box` consistente com `pony-input`
- `[attr.maxlength]` define atributo HTML nativo
- Modificador `--textarea` para estilos específicos
- Textarea permite redimensionamento vertical (CSS)

### 📝 Explicação Detalhada do Template

**1. Class Binding Array:**

```html
[class]="['pony-box', 'pony-box--textarea', borderless && 'pony-box--borderless']"
```

- **Base**: `pony-box` (estilos compartilhados)
- **Modificador**: `--textarea` (altura específica)
- **Condicional**: `--borderless` (só se `borderless=true`)

**2. Attribute Binding vs Property Binding:**

```html
[rows]="rows"              <!-- Property binding (JS property) -->
[attr.maxlength]="maxLength"  <!-- Attribute binding (HTML attribute) -->
```

**Por que `attr.maxlength`?**

- Textarea nativo usa atributo HTML `maxlength`, não property JS
- `[maxlength]="5"` não funciona corretamente
- `[attr.maxlength]="5"` renderiza `<textarea maxlength="5">`

**3. Resize Vertical:**

- CSS `resize: vertical` permite redimensionar altura
- Disabled tem `resize: none` (bloqueia redimensionamento)

---

### 3.4 Criar os Estilos

**src/app/shared/components/pony-textarea/pony-textarea.component.scss**

```scss
@use 'styles/variables' as *;
@use 'styles/mixins' as *;

.pony-box {
    width: 100%;
    min-height: 48px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    background-color: $base-form;
    border: 1px solid rgba($grayscale-03, 0.3);
    border-radius: 12px;
    padding: 12px 16px;
    @include transition(all, 0.3s, ease);

    &:focus-within {
        border-color: $primary-color;
        box-shadow: 0 0 0 3px rgba($primary-shadow, 0.2);
    }

    &__textarea {
        background: none;
        border: none;
        outline: none;
        color: $text-color;
        font-family: $text-family;
        font-size: $font-size-base;
        width: 100%;
        resize: vertical;
        line-height: 1.5;

        &::placeholder {
            color: $grayscale-03;
        }

        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            resize: none;
        }
    }

    &--textarea {
        height: 70px;

        textarea {
            height: 100%;
        }
    }

    &--borderless {
        border: none;
    }
}
```

**💡 Explicação:**

- **`resize: vertical`**: Permite redimensionar apenas verticalmente
- **`line-height: 1.5`**: Espaçamento legível entre linhas
- **`align-items: flex-start`**: Alinha conteúdo no topo (importante para textarea)
- **Disabled**: Remove resize e reduz opacidade

### 📝 Explicação Detalhada dos Estilos

**1. Altura Mínima vs Altura Fixa:**

```scss
.pony-box {
    min-height: 48px;  // ✅ Permite crescer

    &--textarea {
        height: 70px;   // Altura padrão para textarea
    }
}
```

**Por que altura fixa em textarea?**

- Define tamanho padrão consistente
- `rows` do HTML controla isso também
- Usuário pode redimensionar com `resize: vertical`

**2. Resize Control:**

```scss
resize: vertical;      // ✅ Só vertical (UX melhor)
resize: both;         // ❌ Quebra layout
resize: none;         // ❌ Inflexível (exceto disabled)
```

**3. Line Height:**

```scss
line-height: 1.5;  // 150% do font-size
```

- **Por quê?**: Melhora legibilidade em textos longos
- **WCAG guideline**: Mínimo 1.5 para parágrafos
- **Comparação**: Default é ~1.2 (apertado demais)

**4. Focus-within:**

```scss
&:focus-within {
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-shadow, 0.2);
}
```

- **`:focus-within`**: Estiliza parent quando child tem focus
- **Vantagem**: Borda no container, não no textarea
- **UX**: Feedback visual consistente

---

## 🎓 Conceitos Avançados

### 1. ControlValueAccessor Interface

**O que é?**

Interface que permite que componentes customizados funcionem com formulários Angular (Reactive e Template-driven):

```typescript
interface ControlValueAccessor {
  writeValue(value: any): void; // Angular → Component
  registerOnChange(fn: any): void; // Component → Angular
  registerOnTouched(fn: any): void; // Tracking blur event
  setDisabledState?(isDisabled: boolean): void; // Disabled state
}
```

**Fluxo de dados:**

```
┌─────────────────┐
│ Angular Forms   │
│ (ngModel/FormControl)
└────────┬────────┘
         │ writeValue(value)
         ▼
┌─────────────────┐
│ Custom Input    │
│ (PonyInput)     │
└────────┬────────┘
         │ onChange(newValue)
         ▼
┌─────────────────┐
│ Angular Forms   │
│ (atualiza valor)│
└─────────────────┘
```

**Por que implementar?**

```html
<!-- ✅ Com ControlValueAccessor -->
<pony-input [(ngModel)]="username" />
<!-- Funciona! -->

<!-- ❌ Sem ControlValueAccessor -->
<pony-input [(ngModel)]="username" />
<!-- Erro! -->
```

---

### 2. forwardRef() - Resolvendo Dependências Circulares

**O que é?**

Função que permite referenciar uma classe antes dela ser definida:

```typescript
providers: [
  {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PonyInputComponent), // ← Referência futura
    multi: true,
  },
];
```

**Por que precisa?**

```typescript
// Sem forwardRef (ERRO!)
providers: [
  {
    provide: NG_VALUE_ACCESSOR,
    useExisting: PonyInputComponent,  // ❌ Referência antes da definição
    multi: true,
  },
]

export class PonyInputComponent { ... }  // Definido depois
```

**O problema:**

- JavaScript executa linha por linha
- `@Component()` decorator executa **antes** da classe ser definida
- `useExisting: PonyInputComponent` falha (classe não existe ainda)

**Solução com forwardRef:**

```typescript
useExisting: forwardRef(() => PonyInputComponent);
```

- **`() =>`**: Arrow function adia a resolução
- Angular resolve a referência quando precisar (não imediatamente)

---

### 3. `multi: true` em Providers

**O que significa?**

Permite que múltiplos providers forneçam o mesmo token:

```typescript
providers: [
  {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PonyInputComponent),
    multi: true, // ← Permite múltiplos NG_VALUE_ACCESSOR
  },
];
```

**Por que precisa?**

Angular usa `NG_VALUE_ACCESSOR` para encontrar **todos** os controles de formulário na página:

```html
<!-- Múltiplos NG_VALUE_ACCESSOR na mesma página -->
<pony-input [(ngModel)]="username" />
<!-- NG_VALUE_ACCESSOR #1 -->
<pony-input [(ngModel)]="password" />
<!-- NG_VALUE_ACCESSOR #2 -->
<pony-input [(ngModel)]="email" />
<!-- NG_VALUE_ACCESSOR #3 -->
```

**Sem `multi: true`:**

- ❌ Só o último provider seria usado
- ❌ Inputs anteriores não funcionariam

**Com `multi: true`:**

- ✅ Angular mantém array de providers
- ✅ Cada input tem seu próprio NG_VALUE_ACCESSOR

---

### 4. @Input() vs input() - Migração

| Feature         | `@Input()` (Antigo)                       | `input()` (Novo)                         |
| --------------- | ----------------------------------------- | ---------------------------------------- |
| **Sintaxe**     | `@Input() name: string = '';`             | `name = input<string>('');`              |
| **Required**    | `@Input({ required: true })`              | `name = input.required<string>();`       |
| **Alias**       | `@Input('userName')`                      | `input({ alias: 'userName' })`           |
| **Transform**   | `@Input({ transform: booleanAttribute })` | `input({ transform: booleanAttribute })` |
| **Reatividade** | Change Detection                          | Signals (granular)                       |

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

### 5. ng-content - Content Projection Avançado

**Projeção simples (nossa escolha):**

```html
<!-- PonyButton template -->
<button>
  <ng-content></ng-content>
  <!-- Projeta tudo -->
</button>

<!-- Uso -->
<pony-button> Enviar <span class="icon">→</span> </pony-button>
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
  <footer>
    <ng-content select="[card-footer]"></ng-content>
  </footer>
</div>

<!-- Uso -->
<app-card>
  <h1 card-header>Título</h1>
  <p card-body>Conteúdo</p>
  <button card-footer>Ação</button>
</app-card>
```

**Comparação: Angular vs React/Vue**

| Framework   | Sintaxe                     | Múltiplos slots     |
| ----------- | --------------------------- | ------------------- |
| **Angular** | `<ng-content select="...">` | ✅ Sim              |
| **React**   | `{props.children}`          | ⚠️ Via props extras |
| **Vue**     | `<slot name="...">`         | ✅ Sim              |

---

### 6. SVG Icons: Inline vs External

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
- ⚠️ Requisição HTTP inicial

**Trade-off aceitável porque:**

- Cache agressivo (carreg 1x por sessão)
- Manutenção mais fácil (ícones em arquivos separados)
- Pode otimizar com sprite sheets posteriormente

---

### 7. CSS Animations: @keyframes

**Nossa animação de loading:**

```scss
.btn-loading-icon {
  animation: spin 1s linear infinite;
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

**Anatomia:**

- **`spin`**: Nome da animação
- **`1s`**: Duração
- **`linear`**: Timing function (velocidade constante)
- **`infinite`**: Loop infinito

**Timing functions:**

| Valor         | Curva                | Quando usar                |
| ------------- | -------------------- | -------------------------- |
| `linear`      | Constante            | ✅ Rotações, progress bars |
| `ease`        | Começa/termina suave | Transições gerais          |
| `ease-in`     | Começa devagar       | Saída de tela              |
| `ease-out`    | Termina devagar      | ✅ Entrada de tela         |
| `ease-in-out` | Ambos                | Movimentos suaves          |

---

### 8. BEM com SCSS Aninhado Moderado

**Nossa escolha (aninhamento até 3 níveis):**

```scss
// Nível 1: Bloco base
.btn {
  padding: 1rem;

  // Nível 2: Pseudo-classes do bloco
  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.7;
  }
}

// Nível 1: Variantes (separadas, não aninhadas)
.btn-primary {
  background: $primary-color;

  // Nível 2: Pseudo-classes da variante
  &:hover:not(:disabled) {
    box-shadow: 0 4px 12px rgba($primary-shadow, 0.6);
  }
}

// Nível 1: Modificadores de estado
.btn-loading {
  pointer-events: none;

  // Nível 2: Elementos filhos
  .btn-loading-icon {
    animation: spin 1s linear infinite;

    // Nível 3: Estados do elemento filho (limite!)
    &:hover {
      opacity: 0.8;
    }
  }
}
```

**Alternativa não recomendada (aninhamento profundo sem limite):**

```scss
.btn {
  padding: 1rem;

  &-primary {
    // Nível 2
    background: $primary-color;

    &-large {
      // Nível 3
      padding: 2rem;

      &:hover {
        // Nível 4
        .icon {
          // Nível 5 ⚠️ Muito profundo!
          &::before {
            // Nível 6 ❌ Muito complexo!
            opacity: 1;
          }
        }
      }
    }
  }
}
```

**Comparação:**

| Aspecto                | BEM + SCSS Moderado (≤ 3 níveis)  | SCSS Nesting Profundo (> 3 níveis)  |
| ---------------------- | --------------------------------- | ----------------------------------- |
| **Especificidade**     | ✅ Controlada                     | ❌ Cresce exponencialmente          |
| **Legibilidade**       | ✅ Hierarquia clara e limitada    | ⚠️ Difícil rastrear profundidade    |
| **Manutenção**         | ⚠️ Razoável em localizar classes  | ❌ Difícil refatorar contexto de &  |
| **Performance CSS**    | ✅ Seletores otimizados           | ⚠️ Seletores complexos (mais lento) |
| **DevTools debugging** | ✅ Caminho claro até elemento     | ⚠️ Cadeia longa de seletores        |
| **Organização código** | ✅ Equilíbrio entre flat e nested | ⚠️ Nesting excessivo esconde lógica |

**Por que limitamos a 3 níveis?**

1. **Especificidade previsível**: Máximo de 3 classes = `0,0,3,0`
2. **Fácil debugging**: Caminho curto no DevTools
3. **CSS compilado legível**: Não gera seletores gigantes tipo `.a .b .c .d .e`
4. **Manutenção sustentável**: Fácil de encontrar e refatorar

---

## 📦 Resumo dos Arquivos Criados

| Arquivo                         | Responsabilidade                         |
| ------------------------------- | ---------------------------------------- |
| `pony-button.component.ts`      | Lógica do botão (signals, outputs)       |
| `pony-button.component.html`    | Template (ng-content, @if)               |
| `pony-button.component.scss`    | Estilos (variantes, animações)           |
| `pony-input.component.ts`       | Input customizado (ControlValueAccessor) |
| `pony-input.component.html`     | Template com suporte a file upload       |
| `pony-input.component.scss`     | Estilos (focus, hover, disabled)         |
| `pony-textarea.component.ts`    | Textarea com ControlValueAccessor        |
| `pony-textarea.component.html`  | Template com resize vertical             |
| `pony-textarea.component.scss`  | Estilos (line-height, resize)            |
| `assets/icons/loading.svg`      | Ícone de loading animado                 |
| `assets/icons/upload.svg`       | Ícone de upload para input file          |

---

## 🎯 Checklist de Conclusão

- ✅ `angular-svg-icon` instalado e configurado
- ✅ `PonyButtonComponent` criado com variantes
- ✅ Estados de loading e disabled implementados
- ✅ `PonyInputComponent` criado com ControlValueAccessor
- ✅ `PonyTextareaComponent` criado com resize vertical
- ✅ Componentes usam design tokens (variáveis SCSS)
- ✅ Animações CSS (loading spinner)
- ✅ Signal Inputs e Outputs funcionando
- ✅ Content projection com `ng-content`
- ✅ Compatível com formulários Angular

---

## 📚 Resumo

Nesta aula você aprendeu:

✅ Como criar componentes reutilizáveis usando Signals API  
✅ Implementar `ControlValueAccessor` para inputs e textareas customizados  
✅ Trabalhar com `angular-svg-icon` para ícones SVG  
✅ Aplicar variáveis do design system (theme.md)  
✅ Criar animações CSS (loading, hover, focus)  
✅ Usar `ng-content` para projeção de conteúdo  
✅ Diferenças entre Signal Inputs e @Input() decorator  
✅ Conceitos de Content Projection e ControlValueAccessor  
✅ CSS `resize` e `line-height` para textareas  
✅ Diferenças entre Property Binding e Attribute Binding

---

## 📚 Referências

- [Angular Signals](https://angular.io/guide/signals)
- [ControlValueAccessor](https://angular.io/api/forms/ControlValueAccessor)
- [Angular SVG Icon](https://www.npmjs.com/package/angular-svg-icon)
- [Content Projection](https://angular.io/guide/content-projection)
- [CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)

---

## 📝 Próximos Passos

Na próxima aula, vamos criar a tela de login utilizando esses componentes reutilizáveis!

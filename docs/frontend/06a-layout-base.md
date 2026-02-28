# 📘 Aula 6A — Layout Base da Aplicação (Parte 1: Estrutura e Components)

> 📌 **Parte 2:** [06b-layout-base.md](06b-layout-base.md) — Integração, Rotas e Testes

**Progresso do Curso Frontend:** `[██████░░░░░░░░░░░░░░] 32% concluído`

## Objetivo

Criar a estrutura de layout principal da aplicação após o login, com menu lateral, header com busca e área de listagem de ponies, inspirada na arquitetura do dashboard.

---

## 📋 Pré-requisitos

- Aula 5 concluída (Sistema de Snackbar implementado)
- Autenticação funcionando

---

## 🎯 1. Visão Geral da Estrutura

O layout base segue uma arquitetura modular com **componentes reutilizáveis**:

```text
┌─────────────────────────────────────────┐
│                                         │
│  main-layout (Dumb Component)           │
│  ├─ Sidebar (navegação)                 │
│  ├─ Header (info + busca)               │
│  └─ ng-content (conteúdo dinâmico)      │
│                                         │
└─────────────────────────────────────────┘
             ↓ (onSearchEvent)
┌─────────────────────────────────────────┐
│                                         │
│  list (Smart Component)                 │
│  ├─ Gerencia estado (filter signal)     │
│  └─ Conteúdo projetado no main-layout   │
│                                         │
└─────────────────────────────────────────┘
```

**Características:**

- **Arquitetura Smart/Dumb**: Separação clara de responsabilidades
- **Content Projection**: Reutilização via `ng-content`
- **Event-driven**: Comunicação via `output()` events
- **Single Source of Truth**: Estado gerenciado apenas no smart component
- **Sidebar**: Menu lateral fixo (104px) com efeitos visuais
- **Header**: Título, data e campo de busca integrado

### 📊 Comparação: Smart vs Dumb Components

| Aspecto              | Smart Component (List)    | Dumb Component (MainLayout) |
| -------------------- | ------------------------- | --------------------------- |
| **Responsabilidade** | Lógica de negócio, estado | Apenas apresentação         |
| **Estado**           | Gerencia signals, dados   | Não possui estado próprio   |
| **Dependências**     | Services, APIs            | Apenas inputs/outputs       |
| **Comunicação**      | Recebe eventos            | Emite eventos (output)      |
| **Reutilização**     | Específico do contexto    | Altamente reutilizável      |
| **Testabilidade**    | Requer mocks de services  | Testa apenas I/O            |
| **Exemplo**          | `filter = signal('')`     | `onSearchEvent = output()`  |

**Nossa implementação:**

- **MainLayout (Dumb)**: Renderiza UI, emite `onSearchEvent`
- **List (Smart)**: Recebe evento, atualiza `filter` signal, aplica lógica

### 📊 Comparação: ng-content vs Template Outlet

| Aspecto             | ng-content (nossa escolha)     | ng-template + Outlet               |
| ------------------- | ------------------------------ | ---------------------------------- |
| **Simplicidade**    | Muito simples                  | Mais complexo                      |
| **Uso**             | `<ng-content></ng-content>`    | `<ng-container *ngTemplateOutlet>` |
| **Contexto**        | Não passa dados                | Pode passar contexto               |
| **Múltiplos slots** | `<ng-content select=".class">` | Vários outlets nomeados            |
| **Performance**     | Melhor (menos overhead)        | Ligeiramente mais lento            |
| **Quando usar**     | Conteúdo simples, wrapper      | Conteúdo dinâmico com dados        |

**Por que ng-content?**

```html
<!-- MainLayout (wrapper) -->
<main-layout>
  <h2>Conteúdo aqui</h2>
  <!-- Projetado via ng-content -->
</main-layout>

<!-- Mais simples que: -->
<main-layout [contentTemplate]="myTemplate"></main-layout>
<ng-template #myTemplate>...</ng-template>
```

---

## 📦 1.1 Atualizar o componente `pony-input`

> 💡 **Evolução do Componente**: O `pony-input` foi criado na **Aula 2** com uma estrutura simples, focada apenas em formulários com `ControlValueAccessor`. Agora vamos **refatorar e adicionar novas funcionalidades** para atender às necessidades do layout base.

Vamos adicionar:

- **Suporte a ícones** (para o ícone de busca no header)
- **Evento `inputChange`** (para comunicação direta sem ngModel)
- **Estrutura com wrapper** (para alinhar ícone + input)

### 1.1.1 Atualizar TypeScript

**src/app/shared/components/pony-input/pony-input.component.ts**

Atualize a classe completa com as novas funcionalidades:

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
  @Input() icon?: string; // ✅ NOVO - Suporte a ícones
  @Input() type: string = "text";
  @Input() placeholder: string = "";
  @Input() disabled: boolean = false;
  @Input() name: string = "";
  @Input() required: boolean = false;

  @Output() inputChange = new EventEmitter<string>(); // ✅ NOVO - Evento customizado

  value: string = "";

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
    this.onChange(this.value); // Para ControlValueAccessor (ngModel)
    this.inputChange.emit(this.value); // ✅ NOVO - Para eventos customizados
  }

  onBlur(): void {
    this.onTouched();
  }
}
```

**💡 Mudanças:**

- `@Input() icon`: Aceita nome do ícone SVG (opcional)
- `@Output() inputChange`: Emite valor digitado para comunicação direta
- `SvgIconComponent` nos imports para renderizar ícones
- `onInput()` agora emite dois eventos: `onChange()` (ControlValueAccessor) e `inputChange.emit()` (Output)

### 🔍 Conceitos Importantes: Dual-Purpose Component

**Por que dois eventos?**

O `pony-input` agora suporta **dois padrões de uso**:

```typescript
// Padrão 1: ControlValueAccessor (Forms)
this.onChange(this.value); // Para ngModel/FormControl

// Padrão 2: Event Emitter (Direct Communication)
this.inputChange.emit(this.value); // Para (inputChange)="..."
```

**Vantagens:**

- **Versátil**: Um componente, múltiplos casos de uso
- **Sem conflito**: Os dois padrões coexistem harmoniosamente
- **Flexível**: Desenvolvedor escolhe qual usar

### 📊 Comparação: Event Patterns

| Pattern             | Formulários (ngModel)            | Eventos Diretos (inputChange)      |
| ------------------- | -------------------------------- | ---------------------------------- |
| **Interface**       | `ControlValueAccessor`           | `@Output() EventEmitter`           |
| **Uso**             | `[(ngModel)]="email"`            | `(inputChange)="onSearch($event)"` |
| **Validação**       | Nativa do Angular Forms          | Manual no componente               |
| **Two-way binding** | ✅ Sim (`[(ngModel)]`)           | ❌ Não (apenas output)             |
| **Complexidade**    | Mais setup (4 métodos)           | Mais simples (1 método)            |
| **Quando usar**     | Login, cadastro, forms completos | Busca, filtros, inputs simples     |

**Nosso uso:**

- **Login**: `[(ngModel)]="email"` → Usa ControlValueAccessor
- **Search**: `(inputChange)="onSearch($event)"` → Usa Output direto

---

### 1.1.2 Atualizar Template HTML

**src/app/shared/components/pony-input/pony-input.component.html**

Substitua o conteúdo completo:

```html
<div class="pony-box">
  @if (icon) {
  <svg-icon
    src="assets/icons/{{icon}}.svg"
    class="pony-box__icon"
    [svgStyle]="{ 'width.px': 20, 'height.px': 20 }"
  />
  }

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
</div>
```

**💡 Mudanças:**

- Wrapper `.pony-box` para alinhar ícone + input
- Ícone condicional com `@if (icon)`
- Input agora usa classe `.pony-box__input`

---

### 1.1.3 Atualizar estilos SCSS

**src/app/shared/components/pony-input/pony-input.component.scss**

Substitua o conteúdo completo:

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
}
```

**💡 Mudanças:**

- `.pony-box`: Container flexbox para alinhar ícone e input horizontalmente
- `&__icon`: Estilo do ícone SVG (cor cinza, `flex-shrink: 0` evita encolhimento)
- `&__input`: Estilos movidos para dentro do wrapper (background none, sem border)
- `:focus-within`: Efeito de foco no container (borda azul + shadow)

### 🎯 Conceitos Avançados: :focus-within

**O que é `:focus-within`?**

Pseudo-classe CSS que aplica estilos quando qualquer elemento filho recebe foco.

```scss
.pony-box {
  border: 1px solid gray;

  &:focus-within {
    // Ativa quando <input> dentro recebe foco
    border-color: blue;
    box-shadow: 0 0 0 3px rgba(blue, 0.2);
  }
}
```

**Por que não `:focus` no input?**

```scss
// ❌ Problema: Não consegue estilizar o container pai
.pony-box__input:focus {
  border-color: blue; // Só afeta o input
}

// ✅ Solução: :focus-within estiliza o container
.pony-box:focus-within {
  border-color: blue; // Afeta todo o container
  box-shadow: ...; // Pode adicionar shadow ao redor
}
```

**Benefícios:**

- Efeito visual unificado (ícone + input)
- Border e shadow envolvem todo o componente
- Melhor feedback visual para o usuário

---

### 1.1.4 Como Usar

Agora o componente suporta **dois modos**:

**Modo 1: Form Control (Login) - Com ngModel**

```html
<pony-input [(ngModel)]="email" type="email" placeholder="Email"> </pony-input>
```

**Modo 2: Event Emitter (Search) - Com evento customizado**

```html
<pony-input
  icon="search"
  placeholder="Filtre pelo nome"
  (inputChange)="onSearchChange($event)"
>
</pony-input>
```

**💡 Por que dois modos?**

- **Login**: Usa `ControlValueAccessor` + `ngModel` para formulários com validação
- **Search**: Usa `(inputChange)` para comunicação direta e simples
- **Versátil**: Um único componente, múltiplos casos de uso

---

## 🏗️ 2. Criar Componente Main Layout

### 2.1 Gerar o Componente

```bash
cd web
ng generate component core/layout/main-layout --skip-tests
```

---

### 2.2 Implementar TypeScript

**src/app/core/layout/main-layout/main-layout.component.ts**

```typescript
import { Component, output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SvgIconComponent } from "angular-svg-icon";
import { PonyInputComponent } from "@app/shared/components/pony-input/pony-input.component";

@Component({
  selector: "main-layout",
  standalone: true,
  imports: [CommonModule, FormsModule, SvgIconComponent, PonyInputComponent],
  templateUrl: "./main-layout.component.html",
  styleUrl: "./main-layout.component.scss",
})
export class MainLayoutComponent {
  onSearchEvent = output<string>();

  currentDate = signal(this.formatDate());

  private formatDate(): string {
    const now = new Date();

    const days = [
      "Domingo",
      "Segunda-Feira",
      "Terça-Feira",
      "Quarta-Feira",
      "Quinta-Feira",
      "Sexta-Feira",
      "Sábado",
    ];

    const months = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
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
}
```

**💡 Explicação:**

- **Dumb Component**: Apenas apresentação, sem lógica de negócio (não sabe o que fazer com o search, apenas repassa)
- **output()**: Nova API do Angular 17+ para criar outputs (substitui `@Output()` decorators)
- **formatDate()**: Formata data em português (ex: "Segunda-Feira, 20 Fevereiro 2026")
- **currentDate signal**: Armazena data formatada (poderia ser atualizado periodicamente)
- **onSearchChange()**: Método que repassa o evento do pony-input para o componente pai (list)

### 🔍 Conceitos Importantes: output() API

**output() vs @Output():**

```typescript
// ❌ Abordagem antiga (ainda funciona)
@Output() onSearchEvent = new EventEmitter<string>();

// ✅ Abordagem moderna (Angular 17+)
onSearchEvent = output<string>();
```

**Vantagens de output():**

- Mais simples (sem decorator)
- Melhor type inference
- Alinhado com signals
- Melhor performance (otimizações internas)

### 📊 Comparação: Event Communication Patterns

| Pattern                                  | Uso                 | Vantagem                           | Desvantagem                              |
| ---------------------------------------- | ------------------- | ---------------------------------- | ---------------------------------------- |
| **Output Events (nossa escolha)**        | Parent-child direto | Simples, declarativo               | Não funciona entre componentes distantes |
| **Services com Subjects**                | Comunicação global  | Funciona entre qualquer componente | Mais complexo, precisa unsubscribe       |
| **State Management (NgRx/Signal Store)** | Apps grandes        | Centralizado, previsível           | Overhead grande para apps pequenos       |
| **Route Query Params**                   | Estado na URL       | Compartilhável via link            | Limitado a strings                       |

**Por que Output Events aqui?**

- MainLayout e List têm relação parent-child direta
- Comunicação simples (apenas string de search)
- Não precisa persistir estado globalmente

### 🎯 Conceitos Avançados: Date Formatting

**Por que não usar Intl.DateTimeFormat?**

```typescript
// Alternativa moderna (mas mais verbosa)
const formatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
formatter.format(new Date()); // "segunda-feira, 20 de fevereiro de 2026"
```

**Nossa solução customizada:**

- Controle total sobre formato (sem "de" entre palavras)
- Arrays de dias/meses em português
- Mais leve (sem i18n library)
- Suficiente para nosso caso de uso

**Para produção com múltiplos idiomas:**
Considere usar `Intl.DateTimeFormat` ou bibliotecas como `date-fns` com i18n.

---

### 2.3 Criar Template HTML

**src/app/core/layout/main-layout/main-layout.component.html**

```html
<div class="ponies-layout">
  <!-- Menu Lateral -->
  <nav class="sidebar">
    <div class="sidebar__logo">
      <img src="assets/images/logo.png" alt="Pony Collection" class="logo" />
    </div>

    <div class="sidebar__menu">
      <div class="sidebar__item active">
        <button>
          <svg-icon
            src="assets/icons/home.svg"
            class="icon"
            [svgStyle]="{ 'width.px': 20 }"
          />
        </button>
      </div>
    </div>

    <button class="sidebar__logout">
      <svg-icon
        src="assets/icons/logout.svg"
        class="icon"
        [svgStyle]="{ 'width.px': 20 }"
      />
    </button>
  </nav>

  <!-- Conteúdo Principal -->
  <main class="content">
    <!-- Header -->
    <header class="header">
      <div class="header__info">
        <h1 class="header__title">DEAR PONY</h1>
        <p class="header__date">{{ currentDate() }}</p>
      </div>

      <div class="header__filter">
        <pony-input
          icon="search"
          placeholder="Filtre pelo nome"
          (inputChange)="onSearchChange($event)"
        />
      </div>
    </header>

    <!-- Conteúdo Projetado -->
    <ng-content></ng-content>
  </main>
</div>
```

**💡 Explicação:**

- **Sidebar**: Navegação lateral com logo, menu e logout
- **Header**: Informações contextuais (título + data) + campo de busca
- **ng-content**: Projeção de conteúdo dinâmico
- **pony-input**: Usa `(inputChange)` para emitir valores digitados
- **svg-icon**: Ícones SVG com tamanho customizado

---

### 2.4 Implementar Estilos SCSS

**src/app/core/layout/main-layout/main-layout.component.scss**

```scss
@use "styles/variables" as *;
@use "styles/mixins" as *;

.ponies-layout {
  display: grid;
  grid-template-columns: 104px 1fr;
  height: 100vh;
  overflow: hidden;
}

// ========================================
// SIDEBAR
// ========================================

.sidebar {
  background-color: $base-dark-1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  width: 104px;
  border-top-right-radius: 16px;
  border-bottom-right-radius: 16px;

  &__logo {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 18px;

    .logo {
      width: 56px;
      height: auto;
    }
  }

  &__menu {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: center;
    width: 104px;
    position: relative;
  }

  &__item {
    height: 80px;
    width: calc(100% - 15px);
    border-radius: 16px 0 0 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 15px;
    position: relative;

    &.active {
      color: $text-color;
      background-color: $base-dark-2;

      button {
        background-color: $primary-color;
        box-shadow: 0 8px 24px 0px rgba($primary-shadow, 0.4);
        color: $text-color;
      }

      &:before {
        content: "";
        position: absolute;
        background-color: transparent;
        height: 50px;
        right: 0;
        width: calc(100% - 15px);
        bottom: -50px;
        border-top-right-radius: 25px;
        box-shadow: 0 -25px 0 0 $base-dark-2;
        z-index: 0;
        top: -50px;
        transform: scaleY(-1);
      }

      &:after {
        content: "";
        position: absolute;
        background-color: transparent;
        height: 50px;
        right: 0;
        width: calc(100% - 15px);
        bottom: -50px;
        border-top-right-radius: 25px;
        box-shadow: 0 -25px 0 0 $base-dark-2;
        z-index: 0;
      }
    }
  }

  &__button {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    border-radius: 12px;
    color: $primary-color;
    cursor: pointer;
    @include transition(all, 0.3s, ease);
    z-index: 1;

    &:hover {
      background-color: rgba($primary-color, 0.1);
      color: $primary-color;
    }
  }

  &__logout {
    width: 56px;
    height: 56px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    border-radius: 12px;
    color: $primary-color;
    cursor: pointer;
    @include transition(all, 0.3s, ease);

    &:hover {
      background-color: rgba($primary-color, 0.1);
    }
  }
}

// ========================================
// CONTENT
// ========================================

.content {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 15px 25px 0 25px;
  overflow: scroll;
}

// ========================================
// HEADER
// ========================================

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 24px;
  background-color: $base-dark-2;

  &__info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__filter {
    width: 100%;
    max-width: 259px;
  }

  &__title {
    font-family: $logo-family;
    font-size: $font-size-4xl;
    font-weight: 700;
    color: $text-color;
    letter-spacing: 2px;
    margin: 0;
  }

  &__date {
    font-family: $text-family;
    font-size: $font-size-sm;
    color: $text-color;
    margin: 0;
  }
}
```

**💡 Destaques dos Estilos:**

- **Grid Layout**: Sidebar fixa (104px) + conteúdo fluido (1fr)
- **BEM Aninhado**: Todos elementos (`&__logo`, `&__menu`, `&__item`, `&__logout`) dentro do bloco `.sidebar`
- **Efeitos arredondados**: Pseudo-elementos `:before` e `:after` no `.sidebar__item.active`
- **Transform scaleY(-1)**: Inverte o efeito arredondado para o topo
- **Transitions**: Animações suaves em hover
- **Shadow effects**: Sombras com cor primária

---

## 🎯 Próximos Passos

Continue para a [Parte 2 (06b-layout-base.md)](06b-layout-base.md) para:

- ✅ Criar Componente Ponies List (Smart Component)
- ✅ Criar Ícones SVG
- ✅ Configurar Rotas
- ✅ Testar o Layout completo
- ✅ Resumo e Conceitos Avançados

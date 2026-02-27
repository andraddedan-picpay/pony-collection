# 📘 Aula 6 — Layout Base da Aplicação

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
- **3 níveis máximo**: `.sidebar` → `&__item` (padrão BEM)
  |-----------|-------------------------|---------|---------------------------|
  | **Uso** | `grid-template-columns: 104px 1fr` | `display: flex` | `position: fixed; left: 0` |
  | **Alinhamento** | Bidimensional (linhas + colunas) | Unidimensional | Manual |
  | **Performance** | Excelente | Excelente | Boa |
  | **Melhor para** | Layouts principais | Componentes internos | Overlays, modals |

**Nossa escolha (CSS Grid):**

```scss
.ponies-layout {
  display: grid;
  grid-template-columns: 104px 1fr; // Sidebar fixa + Content flexível
  height: 100vh; // Fullscreen
}
```

**Alternativa (Flexbox):**

```scss
.ponies-layout {
  display: flex;
  .sidebar {
    width: 104px;
    flex-shrink: 0;
  }
  .content {
    flex: 1;
  }
}
```

### 🎯 Conceitos Avançados: Pseudo-elements para Efeitos Visuais

**O que fazem os `:before` e `:after`?**

Criam "cantos arredondados invertidos" ao redor do item ativo:

```scss
.sidebar__item.active {
  background-color: $base-dark-2; // Fundo do item

  // Canto superior arredondado
  &:before {
    content: "";
    position: absolute;
    top: -50px;
    border-top-right-radius: 25px;
    box-shadow: 0 -25px 0 0 $base-dark-2; // Shadow "preenche" área
    transform: scaleY(-1); // Inverte verticalmente
  }

  // Canto inferior arredondado
  &:after {
    content: "";
    position: absolute;
    bottom: -50px;
    border-top-right-radius: 25px;
    box-shadow: 0 -25px 0 0 $base-dark-2; // Shadow "preenche" área
  }
}
```

**Resultado visual:**

```
┌─────────┐     ← Pseudo-element :before
│         │
│  ATIVO  │     ← Item .active
│         │
└─────────┘     ← Pseudo-element :after
```

**Técnica avançada:**

- Usa `box-shadow` grande para "preencher" área ao invés de background
- `transform: scaleY(-1)` reutiliza mesmo estilo para ambos os lados
- `border-radius` + `transparent background` cria efeito de "recorte"

### 📊 Comparação: CSS Grid fr Unit vs Outros

| Unit                   | Comportamento               | Exemplo                      | Quando Usar                    |
| ---------------------- | --------------------------- | ---------------------------- | ------------------------------ |
| **fr (nossa escolha)** | Fração do espaço disponível | `1fr` = 100% disponível      | Layouts fluidos                |
| **%**                  | Porcentagem do container    | `80%` = 80% do pai           | Quando precisa de % específica |
| **px**                 | Pixels fixos                | `300px` = sempre 300px       | Elementos de tamanho fixo      |
| **auto**               | Baseado no conteúdo         | `auto` = tamanho do conteúdo | Colunas que se ajustam         |

**Nossa implementação:**

```scss
grid-template-columns: 104px 1fr;
//                      ↑      ↑
//                   fixo  flexível
```

- `104px`: Sidebar sempre 104px
- `1fr`: Content pega todo espaço restante
- Resultado: `calc(100vw - 104px)` de largura para content

---

## 🧩 3. Criar Componente Ponies List (Smart Component)

### 3.1 Gerar o Componente

```bash
ng generate component features/ponies/pages/list --name=list --skip-tests
```

---

### 3.2 Implementar TypeScript

**src/app/features/ponies/pages/list/list.component.ts**

```typescript
import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MainLayoutComponent } from "@app/core/layout/main-layout/main-layout.component";

@Component({
  selector: "app-list",
  standalone: true,
  imports: [CommonModule, FormsModule, MainLayoutComponent],
  templateUrl: "./list.component.html",
})
export class ListComponent {
  filter = signal("");

  updateFilter(value: string): void {
    console.log("Filtro atualizado:", value);
    this.filter.set(value);
  }
}
```

**💡 Explicação:**

- **Smart Component**: Gerencia estado e lógica de negócio (aqui, apenas o filtro; futuramente, chamadas de API)
- **Single Source of Truth**: Apenas este componente guarda o estado do filtro
- **filter signal**: Armazena o termo de busca do usuário
- **updateFilter()**: Recebe evento do main-layout e atualiza o signal

### 🔍 Conceitos Importantes: Single Source of Truth

**Problema comum: Estado duplicado**

```typescript
// ❌ RUIM - Estado em dois lugares
// MainLayout
filter = signal("");

// List
filter = signal(""); // Duplicado! Pode dessincronizar
```

**Solução: Estado apenas no Smart Component**

```typescript
// ✅ BOM - Estado apenas no List (Smart)
// MainLayout (Dumb)
onSearchEvent = output<string>();  // Apenas emite

// List (Smart)
filter = signal('');  // Única fonte de verdade
updateFilter(value: string) {
  this.filter.set(value);  // Único lugar que atualiza
}
```

**Fluxo de dados unidirecional:**

```
┌─────────────────────────────────────────┐
│  List (Smart Component)                 │
│  - filter = signal('')                  │
│  - Recebe: (onSearchEvent)="update()"   │
└─────────────────┬───────────────────────┘
                  │
                  ↓ (state down)
┌─────────────────────────────────────────┐
│  MainLayout (Dumb Component)            │
│  - Renderiza: <pony-input>              │
│  - Emite: onSearchEvent.emit(value)     │
└─────────────────────────────────────────┘
                  │
                  ↑ (events up)
```

### 📊 Comparação: State Management Approaches

| Abordagem                        | Exemplo                  | Complexidade | Melhor Para                                   |
| -------------------------------- | ------------------------ | ------------ | --------------------------------------------- |
| **Local Signal (nossa escolha)** | `filter = signal('')`    | Baixa        | Estado de um componente                       |
| **Service com Signal**           | `filterService.filter()` | Média        | Estado compartilhado entre poucos componentes |
| **Signal Store**                 | `@ngrx/signals`          | Média-Alta   | Estado de feature (ex: ponies list + details) |
| **NgRx Store**                   | `@ngrx/store`            | Alta         | Apps grandes, estado complexo                 |

**Nossa escolha atual:**

- Filtro é local à página de listagem
- Não precisa ser compartilhado com outras features
- Signal local é suficiente

**Quando escalar:**

- Se precisar compartilhar filtro entre múltiplas páginas → Service
- Se adicionar sorting, paginação, seleção → Signal Store
- Se app crescer muito → NgRx Store

---

### 3.3 Implementar Template HTML

**src/app/features/ponies/pages/list/list.component.html**

```html
<main-layout (onSearchEvent)="updateFilter($event)">
  <h2>Ponies List</h2>
  <p>Filtro atual: <strong>{{ filter() }}</strong></p>
</main-layout>
```

**💡 Explicação:**

- **main-layout**: Wrapper que fornece estrutura visual (sidebar + header)
- **onSearchEvent**: Escuta evento de busca emitido pelo main-layout
- **Conteúdo projetado**: Todo conteúdo dentro de `<main-layout>` é renderizado via `ng-content`
- **filter()**: Exibe valor do signal para debug/validação

---

## 🔗 4. Criar Ícones SVG

**src/assets/icons/search.svg**

```svg
<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"
    xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd"
        d="M4.16667 9.16667C4.16667 6.40917 6.40917 4.16667 9.16667 4.16667C11.9242 4.16667 14.1667 6.40917 14.1667 9.16667C14.1667 11.9242 11.9242 14.1667 9.16667 14.1667C6.40917 14.1667 4.16667 11.9242 4.16667 9.16667ZM17.2558 16.0775L14.4267 13.2475C15.3042 12.1192 15.8333 10.705 15.8333 9.16667C15.8333 5.49083 12.8425 2.5 9.16667 2.5C5.49083 2.5 2.5 5.49083 2.5 9.16667C2.5 12.8425 5.49083 15.8333 9.16667 15.8333C10.705 15.8333 12.1192 15.3042 13.2475 14.4267L16.0775 17.2558C16.24 17.4183 16.4533 17.5 16.6667 17.5C16.88 17.5 17.0933 17.4183 17.2558 17.2558C17.5817 16.93 17.5817 16.4033 17.2558 16.0775Z"
        fill="currentColor" />
    <mask id="mask0_4950_488" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="2" y="2"
        width="16" height="16">
        <path fill-rule="evenodd" clip-rule="evenodd"
            d="M4.16667 9.16667C4.16667 6.40917 6.40917 4.16667 9.16667 4.16667C11.9242 4.16667 14.1667 6.40917 14.1667 9.16667C14.1667 11.9242 11.9242 14.1667 9.16667 14.1667C6.40917 14.1667 4.16667 11.9242 4.16667 9.16667ZM17.2558 16.0775L14.4267 13.2475C15.3042 12.1192 15.8333 10.705 15.8333 9.16667C15.8333 5.49083 12.8425 2.5 9.16667 2.5C5.49083 2.5 2.5 5.49083 2.5 9.16667C2.5 12.8425 5.49083 15.8333 9.16667 15.8333C10.705 15.8333 12.1192 15.3042 13.2475 14.4267L16.0775 17.2558C16.24 17.4183 16.4533 17.5 16.6667 17.5C16.88 17.5 17.0933 17.4183 17.2558 17.2558C17.5817 16.93 17.5817 16.4033 17.2558 16.0775Z"
            fill="currentColor" />
    </mask>
    <g mask="url(#mask0_4950_488)">
        <rect width="20" height="20" fill="currentColor" />
    </g>
</svg>

```

**src/assets/icons/home.svg**

```svg
<svg width="19" height="20" viewBox="0 0 19 20" fill="currentColor"
    xmlns="http://www.w3.org/2000/svg">
    <path
        d="M7.23 0.787988C8.5 -0.221012 10.28 -0.261012 11.589 0.667988L11.75 0.787988L17.839 5.65899C18.509 6.17799 18.92 6.94899 18.99 7.78799L19 7.98899V16.098C19 18.188 17.349 19.888 15.28 19.998H13.29C12.339 19.979 11.57 19.239 11.5 18.309L11.49 18.168V15.309C11.49 14.998 11.259 14.739 10.95 14.688L10.86 14.678H8.189C7.87 14.688 7.61 14.918 7.57 15.218L7.56 15.309V18.159C7.56 18.218 7.549 18.288 7.54 18.338L7.53 18.359L7.519 18.428C7.4 19.279 6.7 19.928 5.83 19.989L5.7 19.998H3.91C1.82 19.998 0.11 18.359 0 16.298V7.98899C0.009 7.13799 0.38 6.34799 1 5.79799L7.23 0.787988ZM10.88 1.87799C10.12 1.26799 9.04 1.23899 8.24 1.76799L8.089 1.87799L2.009 6.77899C1.66 7.03799 1.45 7.42799 1.4 7.83799L1.389 7.99799V16.098C1.389 17.428 2.429 18.518 3.75 18.598H5.7C5.92 18.598 6.11 18.449 6.139 18.239L6.16 18.059L6.17 18.008V15.309C6.17 14.239 6.99 13.369 8.04 13.288H10.86C11.929 13.288 12.799 14.109 12.88 15.159V18.168C12.88 18.378 13.03 18.559 13.23 18.598H15.089C16.429 18.598 17.519 17.569 17.599 16.258L17.61 16.098V7.99799C17.599 7.56899 17.42 7.16799 17.11 6.86899L16.98 6.75799L10.88 1.87799Z"
        fill="currentColor" />
</svg>

```

**src/assets/icons/logout.svg**

```svg
<svg width="21" height="20" viewBox="0 0 21 20" fill="currentColor"
    xmlns="http://www.w3.org/2000/svg">
    <path
        d="M9.309 0C11.6882 0 13.6301 1.87393 13.7392 4.22624L13.744 4.435V5.368C13.744 5.78221 13.4082 6.118 12.994 6.118C12.6143 6.118 12.3005 5.83585 12.2508 5.46977L12.244 5.368V4.435C12.244 2.8721 11.022 1.59426 9.48144 1.50498L9.309 1.5H4.434C2.87194 1.5 1.59425 2.72213 1.50498 4.26258L1.5 4.435V15.565C1.5 17.1278 2.7219 18.4057 4.26165 18.495L4.434 18.5H9.319C10.8764 18.5 12.15 17.2824 12.239 15.7478L12.244 15.576V14.633C12.244 14.2188 12.5798 13.883 12.994 13.883C13.3737 13.883 13.6875 14.1652 13.7372 14.5312L13.744 14.633V15.576C13.744 17.9472 11.8772 19.8831 9.53335 19.9949L9.319 20H4.434C2.05555 20 0.113841 18.1259 0.00482718 15.7737L0 15.565V4.435C0 2.05594 1.87376 0.113862 4.22531 0.00482809L4.434 0H9.309ZM17.3041 6.48086L17.3884 6.55329L20.3164 9.46829C20.3427 9.49445 20.3659 9.52108 20.3871 9.54924L20.3164 9.46829C20.3469 9.4987 20.3743 9.53109 20.3985 9.56505C20.4156 9.5888 20.4314 9.6139 20.4456 9.63994C20.4482 9.645 20.4509 9.64997 20.4535 9.65496C20.4661 9.67894 20.4773 9.70381 20.4872 9.72936C20.4913 9.74054 20.4953 9.75186 20.4991 9.76324C20.5064 9.78427 20.5125 9.80591 20.5177 9.82793C20.5201 9.8397 20.5225 9.85137 20.5247 9.86309C20.5288 9.88353 20.5318 9.90462 20.5339 9.92596C20.535 9.94082 20.536 9.95553 20.5366 9.97025C20.5373 9.98012 20.5375 9.98999 20.5375 9.9999L20.5367 10.0282C20.5361 10.0436 20.535 10.059 20.5335 10.0743L20.5375 9.9999C20.5375 10.0467 20.5332 10.0926 20.525 10.1371C20.5226 10.1482 20.5201 10.1599 20.5174 10.1715C20.5123 10.1947 20.5059 10.2172 20.4985 10.2392C20.4947 10.2494 20.491 10.2598 20.487 10.27C20.4778 10.2949 20.4669 10.319 20.4549 10.3424C20.4519 10.3477 20.4488 10.3536 20.4456 10.3595C20.4111 10.4228 20.368 10.48 20.3178 10.5302L20.3164 10.5312L17.3884 13.4472C17.0949 13.7395 16.6201 13.7385 16.3278 13.445C16.0621 13.1782 16.0387 12.7615 16.2572 12.4684L16.33 12.3844L17.969 10.749L7.7465 10.7499C7.33229 10.7499 6.9965 10.4141 6.9965 9.9999C6.9965 9.6202 7.27866 9.30641 7.64473 9.25675L7.7465 9.2499L17.971 9.249L16.3301 7.61631C16.0632 7.35064 16.0381 6.93403 16.2553 6.63993L16.3277 6.55565C16.5934 6.28879 17.01 6.26366 17.3041 6.48086Z"
        fill="currentColor" />
</svg>

```

---

## 🛣️ 5. Configurar Rotas

### 5.1 Adicionar Rota de Ponies

**src/app/app.routes.ts**

```typescript
import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "login",
    loadComponent: () =>
      import("./features/auth/pages/login/login.component").then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: "ponies",
    loadComponent: () =>
      import("./features/ponies/pages/list/list.component").then(
        (m) => m.ListComponent,
      ),
  },
];
```

**💡 Explicação:**

- **Lazy Loading**: Carrega componentes sob demanda

### 4.2 Atualizar Redirecionamento do Login

**src/app/features/auth/pages/login/login.component.ts**

```typescript
// Após login bem-sucedido
if (hasUserData) {
  this.snackbarService.success("Login realizado com sucesso!");
  this.router.navigate(["/"]); // ✅ Navega para listagem
}
```

---

## 🧪 5. Testar o Layout

### 5.1 Executar Aplicação

```bash
cd web
npm start
```

### 5.2 Verificar Funcionalidades

1. **Login**: Faça login e verifique redirecionamento para `/ponies`
2. **Layout**: Confirme estrutura (sidebar + header + ng-content)
3. **Busca**:
   - Digite no campo de busca
   - Verifique no console: "Filtro atualizado: [valor]"
   - Veja o signal `filter()` atualizar no template
4. **Comunicação**: Main layout emite evento → Ponies list recebe

---

## 📚 Resumo

Nesta aula você aprendeu:

✅ Criar componente de layout reutilizável (main-layout)  
✅ Arquitetura Smart vs Dumb Components (separação de responsabilidades)  
✅ Implementar sidebar de navegação com efeitos arredondados (pseudo-elements)  
✅ Header contextual com busca integrada  
✅ Projeção de conteúdo com `ng-content` (content projection)  
✅ Comunicação de componentes via `output()` (Angular 17+)  
✅ Single Source of Truth para estado (evitar duplicação)  
✅ Integração com pony-input usando `(inputChange)` (dual-purpose component)  
✅ Formatação de datas em português (custom formatter)  
✅ Lazy loading de componentes (loadComponent)  
✅ Animações e transitions suaves  
✅ CSS Grid para layouts bidimensionais  
✅ :focus-within para efeitos de foco em containers  
✅ Pseudo-elements (:before/:after) para efeitos visuais complexos  
✅ Fr units no CSS Grid para layouts fluidos

---

## 🎓 Conceitos Aprendidos

- **CSS Grid Layout**: Estrutura bidimensional para layout
- **Flexbox**: Alinhamento de elementos
- **Smart vs Dumb Components**: Separação de responsabilidades
  - **Dumb (main-layout)**: Apenas apresentação, emite eventos
  - **Smart (list)**: Gerencia estado e lógica
- **Content Projection**: `ng-content` para conteúdo dinâmico
- **Signals**: Estado reativo com `signal()`
- **Output Events**: Comunicação child → parent com `output()`
- **Single Source of Truth**: Estado em um único lugar
- **Lazy Loading**: Carregamento sob demanda
- **CSS Pseudo-elements**: `:before` e `:after` para efeitos visuais

---

## 📝 Próximos Passos

Na próxima aula, vamos:

- Criar o serviço de Ponies para integrar com a API
- Implementar a listagem real de ponies com computed signals
- Adicionar estados de Loading, Empty e Error
- Criar o componente de card do pony
- Implementar filtro de busca funcional

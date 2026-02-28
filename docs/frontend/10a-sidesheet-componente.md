# 📘 Aula 10a — Componente Sidesheet: Criação

**Progresso do Curso Frontend:** `[███████████░░░░░░░░░] 53% concluído`

---

> 💡 **Esta aula está dividida em duas partes:**
> - **Parte A (esta)**: Criar o componente Sidesheet reutilizável
> - **[Parte B](10b-sidesheet-integracao.md)**: Integrar na página e testar

---

## Objetivo

Criar um **componente Sidesheet reutilizável** usando **`model()` do Angular 17+** para two-way binding, permitindo que o componente gerencie seu próprio estado enquanto ainda pode ser controlado externamente pelo componente pai. Implementar acessibilidade, animações CSS e best practices para manipulação DOM segura com **Renderer2**.

---

## 🎯 O que vamos construir

- **Componente Sidesheet**: Painel lateral deslizante com animações
- **Two-way binding com `model()`**: Estado gerenciado internamente com controle externo
- **Content Projection**: Slots para header, content e footer
- **Acessibilidade**: ARIA attributes, ESC key, focus management
- **Manipulação DOM segura**: Renderer2 para SSR compatibility
- **Animações CSS**: Slide-in e fade-in com keyframes
- **Scroll lock**: Previne scroll da página quando sidesheet está aberto

---

## 📋 Conceitos Importantes

### `model()` vs `input()` vs `output()`

| Tipo | Direção | Sintaxe | Uso |
|------|---------|---------|-----|
| **`input()`** | Pai → Filho | `[prop]="value"` | Apenas leitura |
| **`output()`** | Filho → Pai | `(event)="handler()"` | Apenas eventos |
| **`model()`** | Pai ⇄ Filho | `[(prop)]="value"` | Two-way binding |

**Exemplo prático:**

```typescript
// ❌ Abordagem antiga (verbosa)
export class OldComponent {
    @Input() isOpen = false;
    @Output() isOpenChange = new EventEmitter<boolean>();
    
    close() {
        this.isOpen = false;
        this.isOpenChange.emit(false);  // Precisa emitir manualmente
    }
}

// ✅ Abordagem moderna (model)
export class NewComponent {
    isOpen = model<boolean>(false);
    
    close() {
        this.isOpen.set(false);  // Automaticamente sincroniza com o pai
    }
}
```

### Renderer2 para Manipulação DOM

**Por que usar Renderer2 ao invés de `document.body.style`?**

| Abordagem | SSR Safe? | Plataforma Agnóstica? | Angular Best Practice? |
|-----------|-----------|----------------------|------------------------|
| `document.body.style` | ❌ Quebra SSR | ❌ Só browser | ❌ Não recomendado |
| **`Renderer2`** | ✅ Funciona | ✅ Cross-platform | ✅ Recomendado |

**Exemplo:**

```typescript
// ❌ Direct DOM manipulation (quebra SSR)
document.body.style.overflow = 'hidden';

// ✅ Renderer2 (funciona em SSR, Web Workers, etc)
renderer.setStyle(document.body, 'overflow', 'hidden');
```

### Effect() para Side Effects

**Effect** executa código quando signals dependentes mudam:

```typescript
effect(() => {
    // Reexecutado quando isOpen() muda
    if (this.isOpen()) {
        console.log('Sidesheet abriu');
    }
});
```

**Características:**
- ✅ **Reativo**: Executa quando dependências mudam
- ✅ **Automático**: Detecta signals usados internamente
- ⚠️ **Side effects only**: Não deve retornar valores (use `computed()` para isso)

### Content Projection (ng-content)

**Permite injetar conteúdo customizado no componente:**

```html
<!-- Componente -->
<div class="header">
    <ng-content select="[header]"></ng-content>
</div>
<div class="content">
    <ng-content></ng-content>  <!-- Conteúdo padrão -->
</div>
<div class="footer">
    <ng-content select="[footer]"></ng-content>
</div>

<!-- Uso -->
<my-component>
    <h1 header>Título</h1>
    <p>Conteúdo principal</p>
    <button footer>OK</button>
</my-component>
```

---

## 📂 Estrutura de Arquivos

```
web/src/app/
├── shared/
│   └── components/
│       └── sidesheet/
│           ├── sidesheet.component.ts       ← NOVO
│           ├── sidesheet.component.html     ← NOVO
│           └── sidesheet.component.scss     ← NOVO
└── features/
    └── ponies/
        └── pages/
            └── list/
                ├── list.component.ts         ← MODIFICAR (Parte B)
                └── list.component.html       ← MODIFICAR (Parte B)
```

---

## 🛠️ Passo 1: Criar o Componente TypeScript

Crie `web/src/app/shared/components/sidesheet/sidesheet.component.ts`:

```typescript
import {
    Component,
    input,
    model,
    output,
    effect,
    inject,
    Renderer2,
    DOCUMENT,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
    selector: 'sidesheet',
    standalone: true,
    imports: [CommonModule, SvgIconComponent],
    templateUrl: './sidesheet.component.html',
    styleUrl: './sidesheet.component.scss',
})
export class PonySidesheetComponent {
    // Two-way binding com model()
    isOpen = model<boolean>(false);
    title = input<string>('');

    // Eventos opcionais para reagir a mudanças
    opened = output<void>();
    closed = output<void>();

    private renderer = inject(Renderer2);
    private document = inject(DOCUMENT);

    constructor() {
        // Previne scroll do body quando sidesheet está aberto
        effect(() => this.handleOpenStateChange());
    }

    // Métodos públicos para controle programático
    open(): void {
        this.isOpen.set(true);
    }

    handleClose(): void {
        this.isOpen.set(false);
    }

    handleBackdropClick(event: MouseEvent): void {
        // Fecha apenas se clicar no backdrop, não no conteúdo
        if (event.target === event.currentTarget) {
            this.handleClose();
        }
    }

    handleKeyDown(event: KeyboardEvent): void {
        // Fecha ao pressionar ESC
        if (event.key === 'Escape' && this.isOpen()) {
            this.handleClose();
        }
    }

    private handleOpenStateChange(): void {
        if (this.isOpen()) {
            this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
            this.opened.emit();
            return;
        }

        this.renderer.removeStyle(this.document.body, 'overflow');
        this.closed.emit();
    }
}
```

### 📝 Explicação Detalhada do TypeScript

**1. Imports:**

```typescript
import {
    Component,
    input,      // ← Property binding unidirecional
    model,      // ← Two-way binding (novo Angular 17+)
    output,     // ← Event binding
    effect,     // ← Side effects com signals
    inject,     // ← Dependency injection moderna
    Renderer2,  // ← Manipulação DOM segura
    DOCUMENT,   // ← Token para injetar document (SSR safe)
} from '@angular/core';
```

**2. Propriedades do Componente:**

```typescript
// Two-way binding: pai pode controlar E componente também controla
isOpen = model<boolean>(false);

// One-way binding: apenas pai passa valor
title = input<string>('');

// Events: notifica pai quando abre/fecha
opened = output<void>();
closed = output<void>();
```

**Por que `model()` ao invés de `input()` + `output()`?**

```typescript
// ❌ Abordagem antiga (2 propriedades, verbosa)
@Input() isOpen = false;
@Output() isOpenChange = new EventEmitter<boolean>();

close() {
    this.isOpen = false;
    this.isOpenChange.emit(false);  // Precisa sincronizar manualmente
}

// ✅ Abordagem moderna (1 propriedade, automática)
isOpen = model<boolean>(false);

close() {
    this.isOpen.set(false);  // Pai recebe automaticamente via [(isOpen)]
}
```

**3. Injeção de Dependências:**

```typescript
private renderer = inject(Renderer2);
private document = inject(DOCUMENT);
```

**Por que `inject(DOCUMENT)` e não `document` global?**

| Abordagem | SSR | Web Workers | Testável |
|-----------|-----|-------------|----------|
| `document` global | ❌ Quebra | ❌ Não existe | ❌ Difícil |
| `inject(DOCUMENT)` | ✅ Mock | ✅ Funciona | ✅ Fácil |

**4. Effect para Scroll Lock:**

```typescript
constructor() {
    effect(() => this.handleOpenStateChange());
}

private handleOpenStateChange(): void {
    if (this.isOpen()) {
        // Bloqueia scroll da página
        this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
        this.opened.emit();  // Notifica pai
    } else {
        // Restaura scroll
        this.renderer.removeStyle(this.document.body, 'overflow');
        this.closed.emit();  // Notifica pai
    }
}
```

**Fluxo de execução:**
1. `isOpen()` muda de `false` → `true`
2. Effect detecta mudança e chama `handleOpenStateChange()`
3. Body recebe `overflow: hidden` (scroll bloqueado)
4. Evento `opened` é emitido para o pai
5. Quando fecha, processo inverso acontece

**5. Métodos Públicos:**

```typescript
// Controle programático pelo pai (via @ViewChild)
open(): void {
    this.isOpen.set(true);
}

// Controle interno (botão X, ESC, backdrop)
handleClose(): void {
    this.isOpen.set(false);
}
```

**6. Event Handlers:**

```typescript
handleBackdropClick(event: MouseEvent): void {
    // Fecha APENAS se clicar no backdrop (fundo escuro)
    // NÃO fecha se clicar no conteúdo do sidesheet
    if (event.target === event.currentTarget) {
        this.handleClose();
    }
}

handleKeyDown(event: KeyboardEvent): void {
    // Fecha ao pressionar ESC (acessibilidade)
    if (event.key === 'Escape' && this.isOpen()) {
        this.handleClose();
    }
}
```

**Diferença entre `target` e `currentTarget`:**

```html
<div class="backdrop" (click)="handler($event)">  ← currentTarget
    <div class="sidesheet">                        ← target (se clicar aqui)
        <button>X</button>                         ← target (se clicar aqui)
    </div>
</div>
```

- **`event.target`**: Elemento que recebeu o clique (pode ser filho)
- **`event.currentTarget`**: Elemento que tem o listener (backdrop)

---

## 🛠️ Passo 2: Criar o Template HTML

Crie `web/src/app/shared/components/sidesheet/sidesheet.component.html`:

```html
@if (isOpen()) {
    <div
        class="backdrop"
        (click)="handleBackdropClick($event)"
        (keydown)="handleKeyDown($event)"
        tabindex="-1"
    >
        <div
            class="sidesheet"
            role="dialog"
            aria-modal="true"
            [attr.aria-label]="title()"
        >
            <!-- Header -->
            <div class="sidesheet__header">
                <h2 class="sidesheet__title">{{ title() }}</h2>
                <button
                    class="sidesheet__close"
                    (click)="handleClose()"
                    aria-label="Fechar"
                    type="button"
                >
                    <svg-icon
                        src="assets/icons/close.svg"
                        class="icon"
                        [svgStyle]="{ 'width.px': 15, 'height.px': 15 }"
                    ></svg-icon>
                </button>
            </div>

            <!-- Content -->
            <div class="sidesheet__content">
                <ng-content></ng-content>
            </div>

            <div class="sidesheet__footer">
                <ng-content select="[sidesheet-footer]"></ng-content>
            </div>
        </div>
    </div>
}
```

### 📝 Explicação do Template

**1. Renderização Condicional:**

```html
@if (isOpen()) {
    <!-- Sidesheet só é renderizado quando isOpen = true -->
}
```

**2. Accessibility Attributes:**

```html
<div
    class="backdrop"
    tabindex="-1"              ← Permite receber focus (para keydown)
>
    <div
        class="sidesheet"
        role="dialog"            ← Screen reader: "isso é um diálogo"
        aria-modal="true"        ← Screen reader: "modal, bloqueia interação"
        [attr.aria-label]="title()"  ← Nome do diálogo para screen reader
    >
```

**Por que `[attr.aria-label]` e não `aria-label`?**

```html
<!-- ❌ Não funciona (Angular tenta binding em property) -->
<div [aria-label]="title()">

<!-- ✅ Funciona (Angular sabe que é atributo HTML) -->
<div [attr.aria-label]="title()">
```

**3. Event Handlers:**

```html
<div
    (click)="handleBackdropClick($event)"   ← Fecha ao clicar fora
    (keydown)="handleKeyDown($event)"       ← Fecha ao pressionar ESC
>
```

**4. Content Projection:**

```html
<!-- Conteúdo padrão (tudo que não tem atributo) -->
<div class="sidesheet__content">
    <ng-content></ng-content>
</div>

<!-- Conteúdo com seletor (só elementos com [sidesheet-footer]) -->
<div class="sidesheet__footer">
    <ng-content select="[sidesheet-footer]"></ng-content>
</div>
```

**Uso prático:**

```html
<sidesheet [title]="'Detalhes'">
    <!-- Vai para <ng-content></ng-content> -->
    <p>Conteúdo principal</p>
    
    <!-- Vai para <ng-content select="[sidesheet-footer]"></ng-content> -->
    <div sidesheet-footer>
        <button>Fechar</button>
    </div>
</sidesheet>
```

---

## 🛠️ Passo 3: Criar os Estilos SCSS

Crie `web/src/app/shared/components/sidesheet/sidesheet.component.scss`:

```scss
@use 'styles/variables' as *;
@use 'styles/mixins' as *;

.backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba($base-shadow, $opacity-50);
    backdrop-filter: blur(3px);
    z-index: 1000;
    display: flex;
    justify-content: flex-end;
    animation: fadeIn 0.3s ease;

    &:focus {
        outline: none;
    }
}

.sidesheet {
    background: $base-dark-1;
    width: 407px;
    height: 100%;
    display: flex;
    flex-direction: column;
    animation: slideIn 0.3s ease;
    border-top-left-radius: 16px;
    border-bottom-left-radius: 16px;

    &__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 15px 20px;
    }

    &__title {
        font-family: $text-family;
        font-size: $font-size-4xl;
        font-weight: 600;
        color: $text-color;
        margin: 0;
        line-height: 140%;
        letter-spacing: 0;

    }

    &__close {
        width: 48px;
        height: 48px;
        background: none;
        border: 1px solid $primary-color;
        color: $primary-color;
        cursor: pointer;
        padding: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        @include transition(all, 0.2s, ease);

        .icon {
            transform: translateY(1px);
        }

        &:hover {
            color: $text-color;
            border-color: $text-color;
        }

        &:active {
            transform: scale(0.95);
        }

        svg {
            width: 24px;
            height: 24px;
        }
    }

    &__content {
        flex: 1;
        padding: 0 20px;
        overflow-y: auto;

        // Custom scrollbar
        &::-webkit-scrollbar {
            width: 8px;
        }

        &::-webkit-scrollbar-track {
            background: rgba($grayscale-03, 0.1);
        }

        &::-webkit-scrollbar-thumb {
            background: rgba($grayscale-03, 0.3);
            border-radius: 4px;

            &:hover {
                background: rgba($grayscale-03, 0.5);
            }
        }
    }

    &__footer {
        padding: 15px 20px;
    }
}

// Animações
@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
    }

    to {
        transform: translateX(0);
    }
}
```

### 📝 Explicação dos Estilos

**1. Backdrop (Fundo Escurecido):**

```scss
.backdrop {
    position: fixed;           // Cobre toda a viewport
    backdrop-filter: blur(3px);  // Efeito de desfoque no fundo
    z-index: 1000;            // Acima de outros elementos
    display: flex;
    justify-content: flex-end; // Sidesheet alinhado à direita
    animation: fadeIn 0.3s;    // Fade suave ao aparecer
}
```

**2. Sidesheet Layout:**

```scss
.sidesheet {
    width: 407px;
    display: flex;
    flex-direction: column;   // Header, content, footer empilhados
    animation: slideIn 0.3s;  // Desliza da direita para esquerda
    
    &__content {
        flex: 1;              // Ocupa espaço disponível
        overflow-y: auto;     // Scroll se conteúdo for maior
    }
}
```

**Estrutura vertical:**
```
┌─────────────────┐
│  Header (fixo)  │ ← padding fixo
├─────────────────┤
│                 │
│  Content (flex) │ ← flex: 1 (cresce)
│                 │
├─────────────────┤
│  Footer (fixo)  │ ← padding fixo
└─────────────────┘
```

**3. BEM com SCSS Aninhado Moderado (≤ 3 níveis):**

```scss
.sidesheet {                    // Nível 1: Bloco
    &__header {                 // Nível 2: Elemento
        // ...
    }
    
    &__close {                  // Nível 2: Elemento
        &:hover {               // Nível 3: Modificador (pseudo-classe)
            // ...
        }
    }
}
```

**Resultado CSS compilado:**
```css
.sidesheet { }
.sidesheet__header { }
.sidesheet__close { }
.sidesheet__close:hover { }
```

**4. Custom Scrollbar:**

```scss
&__content {
    &::-webkit-scrollbar {
        width: 8px;  // Scrollbar mais fina
    }
    
    &::-webkit-scrollbar-thumb {
        background: rgba($grayscale-03, 0.3);  // Cor customizada
        border-radius: 4px;
        
        &:hover {
            background: rgba($grayscale-03, 0.5);  // Mais escuro no hover
        }
    }
}
```

**5. Animações:**

```scss
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideIn {
    from { transform: translateX(100%); }  // Começa fora da tela (direita)
    to { transform: translateX(0); }       // Termina na posição final
}
```

**Aplicadas em:**
```scss
.backdrop { animation: fadeIn 0.3s ease; }
.sidesheet { animation: slideIn 0.3s ease; }
```

---

## 🎯 Próximos Passos

O componente Sidesheet está **completo e funcional**! 🎉

Na **[Parte B](10b-sidesheet-integracao.md)** você aprenderá:

✅ Integrar o sidesheet na página de listagem  
✅ Usar two-way binding `[(isOpen)]`  
✅ Testar todos os cenários (botão, ESC, backdrop)  
✅ Conceitos avançados (model(), Renderer2, effect())  
✅ Checklist completo de validação

**Continue para:** [Aula 10b — Componente Sidesheet: Integração](10b-sidesheet-integracao.md)

---

## 📚 Referências

- [Angular Signals](https://angular.io/guide/signals)
- [Model Inputs](https://angular.io/guide/signal-inputs#model-inputs)
- [Renderer2 API](https://angular.io/api/core/Renderer2)
- [Content Projection](https://angular.io/guide/content-projection)
- [Effect Function](https://angular.io/guide/signals#effects)
- [ARIA Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)

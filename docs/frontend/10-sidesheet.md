# 📘 Aula 10 — Componente Sidesheet com Two-Way Binding

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
                ├── list.component.ts         ← MODIFICAR
                └── list.component.html       ← MODIFICAR
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

            <!-- Footer -->
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
        padding: 1.5rem 2rem;
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
            transform: translateY(2px);
        }

        &:hover {
            color: $text-color;
            border-color: $text-color;
        }

        &:active {
            transform: scale(0.95);
        }
    }

    &__content {
        flex: 1;
        padding: 0 2rem;
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
        padding: 30px 20px 40px 20px;
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

## 🛠️ Passo 4: Integrar na Página de Listagem

### 4.1. Modificar o TypeScript

Atualize `web/src/app/features/ponies/pages/list/list.component.ts`:

```typescript
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainLayoutComponent } from '@core/layout/main-layout/main-layout.component';
import { FeedbackComponent } from '@shared/components/feedback/feedback.component';
import { PonySidesheetComponent } from '@shared/components/sidesheet/sidesheet.component';
import { PonyButtonComponent } from '@shared/components/pony-button/pony-button.component';
import { PonyService } from '../../services/pony.service';
import { Pony } from '../../models/pony.model';
import { DataStateEnum } from '@core/models/data-state.enum';

@Component({
    selector: 'app-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MainLayoutComponent,
        FeedbackComponent,
        PonySidesheetComponent,  // ← ADICIONAR
        PonyButtonComponent,
    ],
    templateUrl: './list.component.html',
    styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit {
    filter = signal('');

    isLoading = signal(false);
    hasError = signal(false);
    ponyList = signal<Pony[]>([]);

    public readonly DataStateEnum = DataStateEnum;

    // Controle da sidesheet via signal
    showDetails = signal<boolean>(false);

    state = computed<DataStateEnum>(() => {
        if (this.isLoading()) return DataStateEnum.LOADING;
        if (this.hasError()) return DataStateEnum.ERROR;
        if (this.ponyList().length === 0) return DataStateEnum.EMPTY;
        return DataStateEnum.SUCCESS;
    });

    private ponyService = inject(PonyService);

    ngOnInit(): void {
        this.getData();
    }

    updateFilter(value: string): void {
        this.filter.set(value);
    }

    getData(): void {
        this.isLoading.set(true);

        this.ponyService.getPonyList().subscribe({
            next: (ponies: Pony[]) => {
                this.ponyList.set(ponies);
                this.isLoading.set(false);
            },
            error: () => {
                this.hasError.set(true);
                this.isLoading.set(false);
            },
        });
    }

    openDetails(): void {
        this.showDetails.set(true);
    }

    closeDetails(): void {
        this.showDetails.set(false);
    }
}
```

### 📝 Explicação das Mudanças

**1. Import do Componente:**

```typescript
import { PonySidesheetComponent } from '@shared/components/sidesheet/sidesheet.component';
```

**2. Adicionar nos Imports do @Component:**

```typescript
imports: [
    // ...
    PonySidesheetComponent,  // Componente standalone
],
```

**3. Signal para Controle de Estado:**

```typescript
showDetails = signal<boolean>(false);
```

**Por que signal ao invés de variável comum?**

```typescript
// ❌ Variável comum (sem reatividade)
showDetails = false;  // Precisa change detection manual

// ✅ Signal (reativo)
showDetails = signal(false);  // Template atualiza automaticamente
```

**4. Métodos de Controle:**

```typescript
openDetails(): void {
    this.showDetails.set(true);   // Abre sidesheet
}

closeDetails(): void {
    this.showDetails.set(false);  // Fecha sidesheet
}
```

---

### 4.2. Modificar o Template

Atualize `web/src/app/features/ponies/pages/list/list.component.html`:

```html
<main-layout (onSearchEvent)="updateFilter($event)">
    <div class="breadcrumb">
        <span>Poneis</span>
    </div>

    <!-- Botão de teste -->
    <br />
    <div style="display: flex; gap: 1rem; margin-bottom: 2rem">
        <pony-button
            variant="secondary"
            (click)="openDetails()"
        >
            Abrir Sidesheet
        </pony-button>
    </div>

    <div class="container">
        @switch (state()) {
            @case (DataStateEnum.LOADING) {
                <p>Carregando...</p>
            }
            @case (DataStateEnum.SUCCESS) {
                <p>Dados</p>
            }
            @case (DataStateEnum.EMPTY) {
                <feedback
                    (onRetry)="getData()"
                    imageName="empty"
                    [title]="'SEM\nDADOS PARA EXIBIR.'"
                    buttonText="Tentar novamente"
                />
            }
            @case (DataStateEnum.ERROR) {
                <feedback
                    (onRetry)="getData()"
                    imageName="error"
                    [title]="'OPA!\nALGO DEU ERRADO.'"
                    buttonText="Tentar novamente"
                    message="Não foi possível carregar as informações esperadas. Aguarde alguns instantes e tente novamente."
                />
            }
        }
    </div>
</main-layout>

<!-- Sidesheet de Detalhes -->
<sidesheet
    [(isOpen)]="showDetails"
    [title]="'Detalhes do Pony'"
>
    <!-- Conteúdo principal -->
    <div>
        <p>Detalhes aparecerão aqui</p>
        <p>Nome: Rainbow Dash</p>
        <p>Elemento: Lealdade</p>
    </div>

    <!-- Footer com botões -->
    <div
        sidesheet-footer
        style="display: flex; justify-content: space-between"
    >
        <pony-button
            variant="secondary"
            (click)="closeDetails()"
            width="172px"
        >
            Fechar
        </pony-button>
        <pony-button
            variant="primary"
            width="172px"
        >
            Entendi
        </pony-button>
    </div>
</sidesheet>
```

### 📝 Explicação do Template

**1. Two-Way Binding:**

```html
<sidesheet
    [(isOpen)]="showDetails"   ← Banana in a box: [( )]
    [title]="'Detalhes do Pony'"
>
```

**Como funciona:**
```typescript
// Componente filho tem: isOpen = model<boolean>(false)
// Componente pai tem: showDetails = signal<boolean>(false)

// Quando sidesheet fecha internamente:
this.isOpen.set(false);  // → Automaticamente: showDetails.set(false) no pai

// Quando pai abre externamente:
this.showDetails.set(true);  // → Automaticamente: isOpen.set(true) no filho
```

**2. Content Projection:**

```html
<sidesheet>
    <!-- Vai para <ng-content></ng-content> -->
    <div>
        <p>Conteúdo principal</p>
    </div>

    <!-- Vai para <ng-content select="[sidesheet-footer]"></ng-content> -->
    <div sidesheet-footer>
        <button>Fechar</button>
    </div>
</sidesheet>
```

**3. Botão de Abertura:**

```html
<pony-button
    variant="secondary"
    (click)="openDetails()"   ← Chama método que faz showDetails.set(true)
>
    Abrir Sidesheet
</pony-button>
```

**4. Botão de Fechamento:**

```html
<pony-button
    (click)="closeDetails()"   ← Chama método que faz showDetails.set(false)
>
    Fechar
</pony-button>
```

---

## ✅ Testando a Implementação

### Cenário 1: Abertura pelo Botão

**Passos:**
1. Acesse `http://localhost:4200`
2. Clique em "Abrir Sidesheet"

**Resultado esperado:**
- ✅ Sidesheet desliza da direita
- ✅ Backdrop escuro com blur aparece
- ✅ Scroll da página é bloqueado
- ✅ Conteúdo "Detalhes aparecerão aqui" visível

### Cenário 2: Fechamento pelo Botão

**Passos:**
1. Com sidesheet aberto, clique em "Fechar"

**Resultado esperado:**
- ✅ Sidesheet fecha com animação
- ✅ Backdrop desaparece
- ✅ Scroll da página é restaurado
- ✅ `showDetails()` retorna `false`

### Cenário 3: Fechamento pelo X

**Passos:**
1. Abra sidesheet
2. Clique no ícone X no header

**Resultado esperado:**
- ✅ Sidesheet fecha
- ✅ Mesmo comportamento do botão "Fechar"

### Cenário 4: Fechamento pelo Backdrop

**Passos:**
1. Abra sidesheet
2. Clique na área escura (backdrop), **não** no conteúdo do sidesheet

**Resultado esperado:**
- ✅ Sidesheet fecha ao clicar no backdrop
- ❌ NÃO fecha ao clicar no conteúdo interno

### Cenário 5: Fechamento pelo ESC

**Passos:**
1. Abra sidesheet
2. Pressione a tecla **ESC**

**Resultado esperado:**
- ✅ Sidesheet fecha
- ✅ Acessibilidade funcionando

### Cenário 6: Scroll Lock

**Passos:**
1. Abra o console do navegador (F12)
2. Digite: `document.body.style.overflow`
3. Abra sidesheet
4. Digite novamente: `document.body.style.overflow`

**Resultado esperado:**
- **Antes de abrir**: `""` (vazio ou undefined)
- **Depois de abrir**: `"hidden"`
- **Depois de fechar**: `""` (restaurado)

---

## 🎓 Conceitos Avançados

### 1. Por que `model()` é Melhor que `@Input()` + `@Output()`?

**Abordagem antiga (Angular ≤ 16):**

```typescript
export class SidesheetComponent {
    @Input() isOpen = false;
    @Output() isOpenChange = new EventEmitter<boolean>();
    
    close() {
        this.isOpen = false;
        this.isOpenChange.emit(false);  // Sincronização manual
    }
}

// Template pai
<sidesheet 
    [isOpen]="showDetails()"
    (isOpenChange)="showDetails.set($event)"
>
```

**Problemas:**
- ❌ Verboso (2 propriedades)
- ❌ Sincronização manual (fácil esquecer)
- ❌ Convention over configuration (`Change` suffix obrigatório)

**Abordagem moderna (Angular 17+):**

```typescript
export class SidesheetComponent {
    isOpen = model<boolean>(false);
    
    close() {
        this.isOpen.set(false);  // Sincroniza automaticamente
    }
}

// Template pai
<sidesheet [(isOpen)]="showDetails">  // Banana in a box syntax
```

**Vantagens:**
- ✅ Conciso (1 propriedade)
- ✅ Sincronização automática
- ✅ Type-safe com signals

### 2. `Renderer2` vs Direct DOM Manipulation

**Por que Renderer2 é importante?**

| Cenário | Direct DOM | Renderer2 |
|---------|-----------|-----------|
| **Browser** | ✅ Funciona | ✅ Funciona |
| **SSR (Server-Side Rendering)** | ❌ `document` não existe | ✅ Usa abstração |
| **Web Workers** | ❌ Sem acesso ao DOM | ✅ Funciona |
| **Testing** | ⚠️ Precisa mock global | ✅ Injeta mock |
| **Security** | ⚠️ XSS vulnerabilities | ✅ Sanitização automática |

**Exemplo prático:**

```typescript
// ❌ Quebra SSR
document.body.style.overflow = 'hidden';

// ✅ Funciona em SSR
renderer.setStyle(document.body, 'overflow', 'hidden');

// ✅ Ainda melhor: remove ao invés de setar para ''
renderer.removeStyle(document.body, 'overflow');
```

### 3. Effect() vs computed()

**Quando usar cada um?**

| Feature | `effect()` | `computed()` |
|---------|-----------|--------------|
| **Retorna valor** | ❌ Void | ✅ Sim |
| **Side effects** | ✅ Permitido | ❌ Não recomendado |
| **Uso** | Logging, API calls, DOM manipulation | Valores derivados |

**Exemplos:**

```typescript
// ✅ Effect para side effect (DOM manipulation)
effect(() => {
    if (this.isOpen()) {
        renderer.setStyle(document.body, 'overflow', 'hidden');
    }
});

// ✅ Computed para valor derivado
fullName = computed(() => `${this.firstName()} ${this.lastName()}`);

// ❌ Não faça isso (side effect em computed)
computed(() => {
    console.log('mudou');  // Evite side effects
    return this.value();
});
```

### 4. Content Projection: Single vs Multi-slot

**Single-slot (sem seletor):**

```html
<!-- Componente -->
<div class="wrapper">
    <ng-content></ng-content>  <!-- Todo o conteúdo vai aqui -->
</div>

<!-- Uso -->
<my-component>
    <p>Parágrafo 1</p>
    <p>Parágrafo 2</p>
    <!-- Ambos vão para o mesmo slot -->
</my-component>
```

**Multi-slot (com seletores):**

```html
<!-- Componente -->
<div class="header">
    <ng-content select="[header]"></ng-content>
</div>
<div class="content">
    <ng-content></ng-content>  <!-- Padrão (sem atributo específico) -->
</div>
<div class="footer">
    <ng-content select="[footer]"></ng-content>
</div>

<!-- Uso -->
<my-component>
    <h1 header>Título</h1>        ← Vai para select="[header]"
    <p>Conteúdo principal</p>     ← Vai para ng-content padrão
    <button footer>OK</button>    ← Vai para select="[footer]"
</my-component>
```

**Seletores possíveis:**

```html
<ng-content select="tag-name"></ng-content>          <!-- Por tag -->
<ng-content select=".class-name"></ng-content>       <!-- Por classe -->
<ng-content select="[attribute]"></ng-content>       <!-- Por atributo ✅ Recomendado -->
<ng-content select="#id"></ng-content>               <!-- Por ID -->
```

### 5. Event Bubbling: `target` vs `currentTarget`

```html
<div class="backdrop" (click)="handler($event)">  ← currentTarget
    <div class="sidesheet">                        ← Pode ser target
        <button>X</button>                         ← Pode ser target
    </div>
</div>
```

**Comportamento:**

| Clicou em | `event.target` | `event.currentTarget` | Fecha? |
|-----------|----------------|-----------------------|--------|
| Backdrop | `.backdrop` | `.backdrop` | ✅ Sim |
| Sidesheet | `.sidesheet` | `.backdrop` | ❌ Não |
| Botão X | `<button>` | `.backdrop` | ❌ Não |

**Código para fechar apenas no backdrop:**

```typescript
handleBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {  // Só fecha se clicou no backdrop
        this.handleClose();
    }
}
```

---

## 📦 Resumo dos Arquivos Criados/Modificados

| Arquivo | Ação | Responsabilidade |
|---------|------|------------------|
| `sidesheet.component.ts` | ✨ CRIADO | Lógica do componente, two-way binding, effects |
| `sidesheet.component.html` | ✨ CRIADO | Template com accessibility, content projection |
| `sidesheet.component.scss` | ✨ CRIADO | Estilos BEM, animações, custom scrollbar |
| `list.component.ts` | ✏️ MODIFICADO | Importa e usa sidesheet, controla estado |
| `list.component.html` | ✏️ MODIFICADO | Integra sidesheet com two-way binding |

---

## 🎯 Checklist de Conclusão

### Componente Sidesheet
- ✅ Componente standalone criado
- ✅ `model()` para two-way binding implementado
- ✅ `input()` para título implementado
- ✅ `output()` para eventos `opened` e `closed`
- ✅ `Renderer2` para manipulação DOM segura
- ✅ `inject(DOCUMENT)` para SSR compatibility
- ✅ `effect()` para scroll lock automático
- ✅ Método `open()` público para controle programático
- ✅ Método `handleClose()` para fechamento

### Template e Acessibilidade
- ✅ `@if` para renderização condicional
- ✅ `role="dialog"` para screen readers
- ✅ `aria-modal="true"` para indicar modal
- ✅ `[attr.aria-label]` com título dinâmico
- ✅ `tabindex="-1"` para keyboard navigation
- ✅ ESC key handler implementado
- ✅ Backdrop click handler (fecha apenas no fundo)
- ✅ Content projection com `<ng-content>`
- ✅ Multi-slot com `select="[sidesheet-footer]"`

### Estilos e Animações
- ✅ BEM com SCSS aninhado moderado (≤ 3 níveis)
- ✅ `position: fixed` para backdrop full-screen
- ✅ `backdrop-filter: blur()` para efeito visual
- ✅ `z-index: 1000` para sobreposição
- ✅ Animação `fadeIn` para backdrop
- ✅ Animação `slideIn` para sidesheet
- ✅ `flex-direction: column` para layout
- ✅ `flex: 1` para content expansível
- ✅ Custom scrollbar estilizado
- ✅ Hover e active states no botão close

### Integração com Página
- ✅ Import do `PonySidesheetComponent`
- ✅ Signal `showDetails` criado
- ✅ Métodos `openDetails()` e `closeDetails()`
- ✅ Two-way binding `[(isOpen)]="showDetails"`
- ✅ Botão de teste funcional
- ✅ Footer com botões funcionando

### Testes Funcionais
- ✅ Abre pelo botão
- ✅ Fecha pelo botão "Fechar"
- ✅ Fecha pelo ícone X
- ✅ Fecha pelo backdrop (clicando fora)
- ✅ Fecha pela tecla ESC
- ✅ Scroll da página é bloqueado quando aberto
- ✅ Scroll é restaurado quando fechado
- ✅ Animações funcionando (fade + slide)

---

## 📚 Referências

- [Angular Signals](https://angular.io/guide/signals)
- [Model Inputs](https://angular.io/guide/signal-inputs#model-inputs)
- [Renderer2 API](https://angular.io/api/core/Renderer2)
- [Content Projection](https://angular.io/guide/content-projection)
- [Effect Function](https://angular.io/guide/signals#effects)
- [ARIA Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)


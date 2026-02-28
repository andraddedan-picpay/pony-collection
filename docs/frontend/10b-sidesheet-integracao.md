# 📘 Aula 10b — Componente Sidesheet: Integração

**Progresso do Curso Frontend:** `[████████████░░░░░░░░] 58% concluído`

---

> 💡 **Esta aula está dividida em duas partes:**
> - **[Parte A](10a-sidesheet-componente.md)**: Criar o componente Sidesheet reutilizável
> - **Parte B (esta)**: Integrar na página e testar

---

## Objetivo

Integrar o **componente Sidesheet** criado na Parte A na página de listagem, implementar two-way binding com `[(isOpen)]`, testar todos os cenários de abertura/fechamento, e explorar conceitos avançados como `model()`, `Renderer2`, `effect()` e content projection.

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

# 📘 Aula 5A — Sistema de Feedback com Snackbar (Parte 1: Service e Component)

> 📌 **Parte 2:** [05b-snackbar.md](05b-snackbar.md) — Integração, Testes e Customizações

**Progresso do Curso Frontend:** `[█████░░░░░░░░░░░░░░░] 27% concluído`

## Objetivo

Implementar um sistema completo de notificações toast (snackbar) para fornecer feedback visual ao usuário em ações importantes da aplicação, como sucesso em operações, erros e avisos.

---

## 📋 Pré-requisitos

- Aula 4 concluída (autenticação implementada)
- angular-svg-icon instalado

---

## 🎯 1. O que é Snackbar?

Snackbar (ou Toast Notification) é um componente de UI que exibe mensagens temporárias ao usuário, geralmente na parte inferior da tela. É usado para:

- ✅ Confirmações de sucesso
- ❌ Mensagens de erro
- ℹ️ Informações gerais

**Características:**
- Aparece temporariamente (auto-dismiss)
- Não bloqueia a interface
- Pode ser fechado manualmente
- Suporta múltiplas mensagens empilhadas

### 📊 Comparação: Toast vs Modal vs Alert

| Aspecto | Toast/Snackbar (nossa escolha) | Modal/Dialog | Alert Nativo |
|---------|-------------------------------|--------------|-------------|
| **Bloqueante** | ❌ Não bloqueia | ✅ Bloqueia interação | ✅ Bloqueia tudo |
| **Auto-dismiss** | ✅ Sim (configurável) | ❌ Precisa fechar | ❌ Precisa clicar OK |
| **Múltiplas simultâneas** | ✅ Empilha várias | ❌ Uma por vez | ❌ Uma por vez |
| **Customização** | ✅ Total controle CSS | ✅ CSS customizado | ❌ Estilo do browser |
| **UX** | Sutil, não intrusivo | Exige atenção | Intrusivo |
| **Acessibilidade** | Requer ARIA | Nativa | Nativa |
| **Quando usar** | Feedback rápido | Decisões importantes | Nunca em produção |

**Por que Snackbar?**
- Feedback de sucesso/erro sem interromper fluxo
- Melhor UX que `alert()` nativo
- Consistente com Material Design / design systems modernos
- Permite múltiplas notificações simultâneas

### 🔍 Conceitos Importantes

**Posicionamento Fixed:**
```scss
position: fixed;  // Fixo na viewport
bottom: 24px;     // 24px do fundo da tela
left: 124px;      // 124px da esquerda
z-index: 9999;    // Acima de tudo
```

**Auto-dismiss Pattern:**
```typescript
show(message, duration = 5000) {
    const id = this.idCounter++;
    this.messages.update(m => [...m, { id, message }]);
    
    setTimeout(() => this.remove(id), duration);  // Remove após 5s
}
```

---

## 🛠️ 2. Criar Snackbar Service

### 2.1 Snackbar Service

**src/app/core/services/snackbar.service.ts**

```typescript
import { Injectable, signal } from '@angular/core';

export type SnackbarType = 'success' | 'error' | 'info';

export interface SnackbarMessage {
    id: number;
    message: string;
    type: SnackbarType;
}

@Injectable({
    providedIn: 'root',
})
export class SnackbarService {
    private messages = signal<SnackbarMessage[]>([]);
    private idCounter = 1;

    get messages$() {
        return this.messages();
    }

    show(message: string, type: SnackbarType = 'info', duration: number = 5000): void {
        const id = this.idCounter++;
        const snackbar: SnackbarMessage = { id, message, type };

        this.messages.update((current) => [...current, snackbar]);

        if (duration > 0) {
            setTimeout(() => this.remove(id), duration);
        }
    }

    success(message: string, duration?: number): void {
        this.show(message, 'success', duration);
    }

    error(message: string, duration?: number): void {
        this.show(message, 'error', duration);
    }

    info(message: string, duration?: number): void {
        this.show(message, 'info', duration);
    }

    remove(id: number): void {
        this.messages.update((current) => current.filter((msg) => msg.id !== id));
    }

    clear(): void {
        this.messages.set([]);
    }
}
```

**💡 Explicação:**
- Usa **signals** para gerenciar estado reativo (Angular 17+)
- `SnackbarMessage` interface define estrutura de cada mensagem
- `SnackbarType` define 3 tipos: success, error, info
- Cada mensagem tem um ID único para tracking e remoção
- `messages` signal armazena array de mensagens ativas
- `show()` método genérico para todas as mensagens
- Métodos específicos: `success()`, `error()`, `info()` são atalhos
- Auto-dismiss após duração configurável (padrão 5 segundos)
- `remove()` para fechar manualmente (botão X)
- `clear()` para limpar todas as mensagens de uma vez
- `providedIn: 'root'` torna o serviço singleton (mesma instância em toda app)

### 📊 Comparação: Signals vs BehaviorSubject

| Aspecto | Signals (nossa escolha) | BehaviorSubject (RxJS) |
|---------|------------------------|------------------------|
| **Sintaxe de leitura** | `messages()` | `messages$.value` |
| **Sintaxe de escrita** | `messages.set([...])` | `messages$.next([...])` |
| **Reatividade** | Automática | Precisa `async` pipe ou `subscribe` |
| **Performance** | Otimizado, granular | Pode causar re-renders desnecessários |
| **Imutabilidade** | `update()` incentiva | Precisa manualmente |
| **Curva de aprendizado** | Mais simples | Requer conhecimento de RxJS |
| **Composição** | `computed()` | `combineLatest`, `map` |
| **Angular** | Nativo (17+) | Via RxJS (biblioteca externa) |

**Nossa implementação com Signals:**
```typescript
// Criação
private messages = signal<SnackbarMessage[]>([]);

// Leitura
get messages$() {
    return this.messages();  // Template reactive automaticamente
}

// Escrita (adiciona mensagem)
this.messages.update(current => [...current, snackbar]);

// Escrita (remove mensagem)
this.messages.update(current => current.filter(msg => msg.id !== id));
```

**Alternativa com BehaviorSubject:**
```typescript
private messages$ = new BehaviorSubject<SnackbarMessage[]>([]);

get messages() {
    return this.messages$.asObservable();
}

this.messages$.next([...this.messages$.value, snackbar]);
```

### 🔍 Conceitos Importantes

**1. Fluxo de Mensagens:**

```
┌─────────────────────────────────────────────┐
│ 1. Component chama service.error(...)        │
├─────────────────────────────────────────────┤
│ 2. show() cria mensagem com ID único         │
├─────────────────────────────────────────────┤
│ 3. messages.update() adiciona ao array       │
├─────────────────────────────────────────────┤
│ 4. SnackbarComponent detecta mudança        │
├─────────────────────────────────────────────┤
│ 5. Template renderiza nova mensagem          │
├─────────────────────────────────────────────┤
│ 6. setTimeout() agenda remoção (5s)         │
├─────────────────────────────────────────────┤
│ 7. remove(id) filtra mensagem do array      │
├─────────────────────────────────────────────┤
│ 8. Component re-renderiza (mensagem some)   │
└─────────────────────────────────────────────┘
```

**2. Imutabilidade com update():**

```typescript
// ❌ Mutabilidade - NÃO faça isso
const current = this.messages();
current.push(newMessage);
this.messages.set(current);  // Referência não mudou!

// ✅ Imutabilidade - Cria novo array
this.messages.update(current => [...current, newMessage]);
//                                ↑ spread operator cria cópia
```

**3. ID Generation Strategy:**

```typescript
private idCounter = 1;  // Contador simples

show() {
    const id = this.idCounter++;  // Incrementa a cada mensagem
    // ...
}
```

**Alternativas:**
```typescript
// UUID (mais robusto)
import { v4 as uuidv4 } from 'uuid';
const id = uuidv4();  // '110ec58a-a0f2-4ac4-8393-c866d813b8d1'

// Timestamp (simples)
const id = Date.now();  // 1703251876543

// Crypto (nativo)
const id = crypto.randomUUID();  // Requer HTTPS em produção
```

### 🎯 Conceitos Avançados

**1. setTimeout vs RxJS timer**

```typescript
// Opção 1: setTimeout (nossa escolha - mais simples)
setTimeout(() => this.remove(id), duration);

// Opção 2: RxJS timer (mais controlável)
import { timer } from 'rxjs';
timer(duration).subscribe(() => this.remove(id));
```

**Vantagens do setTimeout:**
- Mais simples
- Não precisa RxJS
- Não precisa unsubscribe
- Suficiente para este caso

**Quando usar RxJS timer:**
- Precisa cancelar antes do tempo
- Combinar com outros observables
- Repetir periodicamente (`interval`)

**2. Padrão Facade Service**

O SnackbarService usa o padrão Facade:
```typescript
// Interface pública simplificada
success(message: string) { this.show(message, 'success'); }
error(message: string) { this.show(message, 'error'); }
info(message: string) { this.show(message, 'info'); }

// Lógica complexa encapsulada
private show(message: string, type: SnackbarType) { /* ... */ }
```

Benefícios:
- API mais fácil de usar
- Encapsula complexidade
- Permite mudanças internas sem quebrar código

**3. Singleton Service Pattern**

```typescript
@Injectable({ providedIn: 'root' })
```

Garante:
- Única instância do serviço em toda a aplicação
- Estado compartilhado entre componentes
- Todas as mensagens visíveis em um lugar
- Gerenciamento centralizado

---

## 🎨 3. Criar Snackbar Component

### 3.1 Gerar Componente

```bash
ng generate component shared/components/snackbar --skip-tests
```

### 3.2 TypeScript

**src/app/shared/components/snackbar/snackbar.component.ts**

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnackbarService } from '@core/services/snackbar.service';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
    selector: 'pony-snackbar',
    standalone: true,
    imports: [CommonModule, SvgIconComponent],
    templateUrl: './snackbar.component.html',
    styleUrl: './snackbar.component.scss',
})
export class SnackbarComponent {
    private snackbarService = inject(SnackbarService);

    get messages() {
        return this.snackbarService.messages$;
    }

    removeMessage(id: number): void {
        this.snackbarService.remove(id);
    }
}
```

**💡 Explicação:**
- Injeta o `SnackbarService` usando `inject()` (Angular 14+)
- Expõe `messages` como getter para o template ter acesso reativo
- `removeMessage()` permite fechar manualmente ao clicar no X
- Componente standalone com imports mínimas
- `SvgIconComponent` do angular-svg-icon para ícones

### 📊 Comparação: Injeção de Dependência

| Método | Sintaxe | Disponível | Vantagens |
|--------|---------|------------|----------|
| **inject() (nossa escolha)** | `inject(SnackbarService)` | Angular 14+ | Mais limpo, funcional |
| **Constructor injection** | `constructor(private service: Service)` | Sempre | Clássico, bem conhecido |

```typescript
// Opção 1: inject() - Moderno (Angular 14+)
private snackbarService = inject(SnackbarService);

// Opção 2: Constructor - Tradicional
constructor(private snackbarService: SnackbarService) {}
```

### 🔍 Conceitos Importantes

**Getter vs Property:**

```typescript
// Opção 1: Getter (nossa escolha)
get messages() {
    return this.snackbarService.messages$;  // Sempre atualizado
}

// Opção 2: Property
messages = this.snackbarService.messages$;  // Valor inicial apenas
```

**Por que getter?**
- Sempre retorna valor atual do signal
- Garante reatividade no template
- Sem necessidade de atualizações manuais

### 3.3 Template HTML

**src/app/shared/components/snackbar/snackbar.component.html**

```html
<div class="snackbar-container">
    @for (message of messages; track message.id) {
    <div class="snackbar" [class]="'snackbar-' + message.type">
        <div class="snackbar-icon">
            <svg-icon src="assets/icons/info.svg"
                [svgStyle]="{ 'width.px': 24, 'height.px': 24 }"></svg-icon>
        </div>
        <div class="snackbar-message">{{ message.message }}</div>
        <button class="snackbar-close" (click)="removeMessage(message.id)" aria-label="Fechar">
            ✕
        </button>
    </div>
    }
</div>
```

**💡 Explicação:**
- Loop `@for` sobre as mensagens (Angular 17+ Control Flow)
- `track message.id` para performance (Angular sabe qual item mudou)
- Classes dinâmicas baseadas no tipo: `snackbar-success`, `snackbar-error`, `snackbar-info`
- Usa o ícone `info.svg` para todos os tipos (a cor muda via CSS)
- Botão de fechar com acessibilidade (`aria-label` para screen readers)
- Interpolation `{{ message.message }}` exibe o texto
- `(click)="removeMessage(message.id)"` fecha a mensagem ao clicar no X

### 📊 Comparação: @for vs *ngFor

| Aspecto | @for (Angular 17+) | *ngFor (legado) |
|---------|-------------------|----------------|
| **Sintaxe** | `@for (item of items; track item.id)` | `*ngFor="let item of items; trackBy: fn"` |
| **Track** | Inline direto | Precisa de função separada |
| **Performance** | Otimizado | Boa |
| **Legibilidade** | Mais clara | Mais verbosa |
| **Empty state** | `@empty { ... }` built-in | Precisa de `*ngIf` separado |

**Nossa implementação:**
```html
@for (message of messages; track message.id) {
    <div class="snackbar">...</div>
}
```

**Versão antiga (Angular <17):**
```html
<div *ngFor="let message of messages; trackBy: trackById">
    <div class="snackbar">...</div>
</div>

// Component
trackById(index: number, item: SnackbarMessage): number {
    return item.id;
}
```

### 🎯 Conceitos Avançados

**1. Track Function e Performance**

O `track` é crucial para performance:

```html
<!-- ❌ SEM track - Re-renderiza tudo -->
@for (message of messages) {
    <div>{{ message.text }}</div>
}

<!-- ✅ COM track - Re-renderiza apenas o que mudou -->
@for (message of messages; track message.id) {
    <div>{{ message.text }}</div>
}
```

**Como funciona:**
```typescript
// Estado inicial: [{ id: 1, text: 'A' }, { id: 2, text: 'B' }]
// Novo estado:    [{ id: 1, text: 'A' }, { id: 3, text: 'C' }]

// Sem track:
// Angular: "Tudo mudou, re-renderiza tudo"

// Com track message.id:
// Angular: "id:1 ainda existe (reutiliza DOM)
//           id:2 sumiu (remove DOM)
//           id:3 é novo (cria DOM)"
```

**2. Classes Dinâmicas**

```html
[class]="'snackbar-' + message.type"
```

Resulta em:
```html
<!-- type = 'success' -->
<div class="snackbar snackbar-success">...</div>

<!-- type = 'error' -->
<div class="snackbar snackbar-error">...</div>
```

**Alternativas:**
```html
<!-- Opção 1: String literal (nossa escolha) -->
[class]="'snackbar-' + message.type"

<!-- Opção 2: ngClass -->
[ngClass]="'snackbar-' + message.type"

<!-- Opção 3: Objeto condicional -->
[ngClass]="{
    'snackbar-success': message.type === 'success',
    'snackbar-error': message.type === 'error',
    'snackbar-info': message.type === 'info'
}"
```

**3. Acessibilidade (ARIA)**

```html
<button aria-label="Fechar">×</button>
```

**Por que é importante:**
- Screen readers leem "Fechar" ao invés de "×"
- Usuários com deficiência visual entendem a ação
- Melhora acessibilidade do app

**Melhores práticas:**
```html
<!-- ❌ Ruim - Sem contexto -->
<button>×</button>

<!-- ✅ Bom - Com aria-label -->
<button aria-label="Fechar">×</button>

<!-- ✅ Melhor ainda - Com role e descrição -->
<div role="alert" aria-live="polite">
    <button aria-label="Fechar notificação de sucesso">×</button>
</div>
```

### 3.4 Estilos SCSS

**src/app/shared/components/snackbar/snackbar.component.scss**

```scss
@use 'styles/variables' as *;
@use 'styles/mixins' as *;

.snackbar-container {
    position: fixed;
    bottom: 24px;
    left: 124px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 400px;
}

.snackbar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-radius: 12px;
    background-color: $base-dark-3;
    color: $text-color;
    box-shadow: 0 4px 12px rgba($base-shadow, 0.3);
    animation: slideIn 0.3s ease-out;
    min-width: 300px;
    border-left: 4px solid transparent;
}

.snackbar-icon {
    font-size: $font-size-xl;
    font-weight: bold;
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: start;
    justify-content: center;
    color: $text-color;
}

.snackbar-message {
    flex: 1;
    font-family: $text-family;
    font-size: $font-size-base;
    line-height: 1.4;
}

.snackbar-close {
    background: none;
    border: none;
    color: $text-color;
    font-size: $font-size-lg;
    cursor: pointer;
    padding: 4px;
    line-height: 1;
    opacity: 0.7;
    @include transition(opacity, 0.2s, ease);
    flex-shrink: 0;

    &:hover {
        opacity: 1;
    }
}

// Variações de tipo
.snackbar-success {
    border-left-color: $success-color;
    background-color: rgba($success-color, 0.25);

    .snackbar-icon {
        color: $success-color;
    }
}

.snackbar-error {
    border-left-color: $critical-color;
    background-color: rgba($critical-color, 0.25);

    .snackbar-icon {
        color: $critical-color;
    }
}

.snackbar-info {
    border-left-color: $primary-color;

    .snackbar-icon {
        color: $primary-color;
    }
}

// Animações
@keyframes slideIn {
    from {
        transform: translateX(-100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
```

**💡 Explicação dos Estilos:**

1. **Container**: Fixed position, canto inferior esquerdo, z-index alto para sobrepor outros elementos
2. **Snackbar**: Card com border-left colorido (4px) e fundo semi-transparente usando `rgba()`
3. **Tipos**: Cores diferentes por tipo (success verde, error vermelho, info azul/rosa)
4. **Animação**: `slideIn` com slide da esquerda e fade-in para entrada suave
5. **Ícone**: `flex-shrink: 0` garante que o ícone não encolhe
6. **Mensagem**: `flex: 1` faz texto ocupar espaço disponível
7. **Botão**: Sem borda/fundo, apenas símbolo X com hover opacity

---

## 🎨 4. Ícone SVG

O projeto utiliza um único ícone (`info.svg`) para todos os tipos de snackbar. A diferenciação visual é feita através das cores aplicadas via CSS.

**src/assets/icons/info.svg**

```svg
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>
```

**💡 Por que um único ícone?**
- **Simplicidade**: Menos arquivos para gerenciar
- **Consistência**: Mesmo ícone, cores diferentes
- **Performance**: Apenas um SVG carregado e cacheado
- O `currentColor` no SVG permite herdar a cor definida no CSS
- Diferenciação visual feita via cores nos tipos (verde, vermelho, rosa)

---

## 🎯 Próximos Passos

Continue para a [Parte 2 (05b-snackbar.md)](05b-snackbar.md) para:

- ✅ Integrar Snackbar no App Principal
- ✅ Usar no Login Component
- ✅ Testar todas as funcionalidades
- ✅ Customizações avançadas
- ✅ Resumo e melhorias futuras

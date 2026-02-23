# 📘 Aula 8 — Sistema de Feedbacks e Integração com API

## Objetivo

Criar um **componente de feedback reutilizável** para exibir estados de erro e lista vazia, implementar o **serviço de ponies** para consumir a API, e integrar tudo na página de listagem usando **computed signals** e **enums** para gerenciar estados de forma profissional.

---

## 🎯 O que vamos construir

- **Componente `FeedbackComponent`**: Feedback visual reutilizável
- **Enum `DataStateEnum`**: Estados da aplicação (loading, error, empty, success)
- **Model `Pony`**: Interface TypeScript para tipagem dos dados
- **Service `PonyService`**: Serviço para consumir API REST
- **Integração completa**: Lista de ponies com estados gerenciados

---

## 📋 Conceitos Importantes

### Computed Signals

**Computed Signals** são signals derivados que recalculam automaticamente quando suas dependências mudam:

```typescript
state = computed(() => {
    if (this.isLoading()) return DataStateEnum.LOADING;
    // ... recalcula quando isLoading, hasError ou ponyList mudam
});
```

**Vantagens:**
- ✅ Reativo: Atualiza automaticamente
- ✅ Performático: Só recalcula quando necessário
- ✅ Memoizado: Cache do resultado
- ✅ Type-safe: TypeScript garante tipos corretos

### Enums vs. String Literals

| String Literals | Enums |
|----------------|-------|
| ❌ `'loading'` pode ter typo | ✅ `DataStateEnum.LOADING` autocomplete |
| ❌ Refatorar é difícil | ✅ Refatorar é seguro |
| ❌ Sem intellisense | ✅ IDE ajuda |
| ❌ Runtime errors | ✅ Compile-time errors |

---

## 📂 Estrutura de Arquivos

```
web/src/app/
├── core/
│   └── models/
│       ├── index.ts                    ← MODIFICAR (export enum)
│       └── data-state.enum.ts          ← NOVO
├── features/
│   └── ponies/
│       ├── models/
│       │   └── pony.model.ts           ← NOVO
│       ├── services/
│       │   └── pony.service.ts         ← NOVO
│       └── pages/
│           └── list/
│               ├── list.component.ts    ← MODIFICAR
│               └── list.component.html  ← MODIFICAR
└── shared/
    └── components/
        └── feedback/
            ├── feedback.component.ts    ← NOVO
            ├── feedback.component.html  ← NOVO
            └── feedback.component.scss  ← NOVO
```

---

## 🛠️ Passo 1: Criar o Enum de Estados

### 1.1. Criar o Enum

Crie `web/src/app/core/models/data-state.enum.ts`:

```typescript
export enum DataStateEnum {
    LOADING = 'loading',
    ERROR = 'error',
    EMPTY = 'empty',
    SUCCESS = 'success',
}
```

### 📝 Explicação

**Cada estado representa:**
- **LOADING**: Requisição em andamento
- **ERROR**: Falha na requisição
- **EMPTY**: Requisição OK, mas sem dados
- **SUCCESS**: Requisição OK com dados

**Por que usar enum?**
```typescript
// ❌ String literal (erro em runtime)
if (state === 'loadding') // typo não detectado

// ✅ Enum (erro em compile time)
if (state === DataStateEnum.LOADDING) // ❌ IDE acusa erro
```

### 1.2. Exportar no Index

Atualize `web/src/app/core/models/index.ts`:

```typescript
export * from './user.model';
export * from './data-state.enum';  // ← ADICIONAR
```

---

## 🛠️ Passo 2: Criar o Model de Pony

Crie `web/src/app/features/ponies/models/pony.model.ts`:

```typescript
export interface Pony {
    id: string;
    name: string;
    element: string;
    personality: string;
    talent: string;
    summary: string;
    imageUrl?: string;
}
```

### 📝 Explicação

**Interface vs. Class:**
- ✅ **Interface**: Apenas tipagem (sem custo em runtime)
- ❌ **Class**: Gera código JavaScript (maior bundle)

**Propriedade opcional:**
```typescript
imageUrl?: string;  // Pode ser undefined
```

---

## 🛠️ Passo 3: Criar o Componente de Feedback

### 3.1. Criar o TypeScript

Crie `web/src/app/shared/components/feedback/feedback.component.ts`:

```typescript
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PonyButtonComponent } from "../pony-button/pony-button.component";

@Component({
    selector: 'feedback',
    standalone: true,
    imports: [CommonModule, PonyButtonComponent],
    templateUrl: './feedback.component.html',
    styleUrl: './feedback.component.scss',
})
export class FeedbackComponent {
    title = input<string>('');
    message = input<string>('');
    buttonText = input<string>('');
    imageName = input<string>('');

    onRetry = output<void>();

    handleRetry(): void {
        this.onRetry.emit();
    }
}
```

### 📝 Explicação das Propriedades

**Inputs (dados do pai para o filho):**
```typescript
title = input<string>('');  // Título do feedback
message = input<string>(''); // Mensagem opcional
buttonText = input<string>(''); // Texto do botão
imageName = input<string>(''); // Nome da imagem (sem extensão)
```

**Output (evento do filho para o pai):**
```typescript
onRetry = output<void>();  // Emite evento quando clica no botão
```

---

### 3.2. Criar o Template

Crie `web/src/app/shared/components/feedback/feedback.component.html`:

```html
<div class="feedback">
    @if (imageName()) {
    <img [src]="`assets/images/${imageName()}.png`" [alt]="title()" class="feedback__image" />
    }

    <h1 class="feedback__title">{{ title() }}</h1>

    @if (message()) {
    <p class="feedback__message">{{ message() }}</p>
    }

    <pony-button class="feedback__button" (click)="handleRetry()">
        {{ buttonText() }}
    </pony-button>
</div>
```

### 📝 Explicação do Template

**1. Imagem condicional:**
```html
@if (imageName()) {
    <img [src]="`assets/images/${imageName()}.png`" />
}
```
- Só renderiza se `imageName` foi fornecido
- Interpolação de string: `` `assets/images/${imageName()}.png` ``

**2. Mensagem opcional:**
```html
@if (message()) {
    <p>{{ message() }}</p>
}
```

**3. Evento de retry:**
```html
<pony-button (click)="handleRetry()">
```
- Clique → `handleRetry()` → emite `onRetry`

---

### 3.3. Criar os Estilos

Crie `web/src/app/shared/components/feedback/feedback.component.scss`:

```scss
@use 'styles/variables' as *;
@use 'styles/mixins' as *;

.feedback {
    display: flex;
    flex-direction: column;
    padding-top: 182px;
    padding-left: 87px;
    width: 651px;
    height: 484px;
    background: $base-dark-1;
    border-radius: 42px;
    position: relative;

    &__image {
        position: absolute;
        top: 26px;
        left: 302px;
        width: 144px;
        height: auto;
        object-fit: contain;
    }

    &__title {
        font-family: $heading-family;
        font-size: $heading-size;
        font-weight: 700;
        color: $text-color;
        line-height: 100%;
        margin: 0 0 21px 0;
        text-transform: uppercase;
        letter-spacing: 2px;
        white-space: pre-line;  // Permite quebras de linha com \n
    }

    &__message {
        font-family: $heading-family;
        font-size: $font-size-base;
        font-weight: 400;
        color: $text-color;
        line-height: 1.6;
        margin-bottom: 25px;
        max-width: 405px;
        text-align: left;
        opacity: 0.9;
    }

    &__button {
        align-self: start;
    }
}
```

### 📝 Explicação dos Estilos

**1. Layout com posicionamento absoluto:**
```scss
position: relative;  // Container
&__image {
    position: absolute;  // Imagem fixa no topo direito
    top: 26px;
    left: 302px;
}
```

**2. Quebra de linha no título:**
```scss
white-space: pre-line;  // Respeita \n no texto
```

**Uso:**
```typescript
title="OPA!\nALGO DEU ERRADO."  // \n vira quebra de linha
```

---

## 🛠️ Passo 4: Criar o Service de Ponies

Crie `web/src/app/features/ponies/services/pony.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Pony } from '../models/pony.model';
import { LocalStorageHelper, LocalStorageKeys } from '@app/core/helpers';

@Injectable({
    providedIn: 'root',
})
export class PonyService {
    private apiUrl = 'http://localhost:3000';

    constructor(private http: HttpClient) {}

    getPonyList(): Observable<Pony[]> {
        const endpoint = `${this.apiUrl}/ponies`;
        const token = LocalStorageHelper.get<string>(LocalStorageKeys.TOKEN);

        const options = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        return this.http.get<Pony[]>(endpoint, options).pipe(
            catchError((error) => {
                return throwError(() => error);
            }),
        );
    }
}
```

### 📝 Explicação do Service

**1. Injectable:**
```typescript
@Injectable({ providedIn: 'root' })
```
- **`providedIn: 'root'`**: Singleton global (uma única instância)

**2. HttpClient:**
```typescript
constructor(private http: HttpClient) {}
```
- Injetado automaticamente pelo Angular

**3. Header de Autenticação:**
```typescript
const options = {
    headers: {
        Authorization: `Bearer ${token}`,
    },
};
```
- Envia token JWT no header `Authorization`
- Backend valida o token para autorizar acesso

**4. Observable e Tipagem:**
```typescript
return this.http.get<Pony[]>(endpoint, options)
```
- **`<Pony[]>`**: TypeScript sabe que retorna array de Pony
- **Observable**: Stream de dados assíncrono

**5. Tratamento de Erro:**
```typescript
.pipe(
    catchError((error) => {
        return throwError(() => error);
    }),
)
```
- Captura erros HTTP (401, 404, 500, etc)
- Repassa o erro para o subscriber

---

## 🛠️ Passo 5: Integrar na Página de Listagem

### 5.1. Modificar o TypeScript

Atualize `web/src/app/features/ponies/pages/list/list.component.ts`:

```typescript
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainLayoutComponent } from '@app/core/layout/main-layout/main-layout.component';
import { FeedbackComponent } from '@app/shared/components/feedback/feedback.component';
import { PonyService } from '../../services/pony.service';
import { Pony } from '../../models/pony.model';
import { DataStateEnum } from '@app/core/models/data-state.enum';

@Component({
    selector: 'app-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MainLayoutComponent, FeedbackComponent],
    templateUrl: './list.component.html',
    styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit {
    filter = signal('');

    isLoading = signal(false);
    hasError = signal(false);
    ponyList = signal<Pony[]>([]);

    public readonly DataStateEnum = DataStateEnum;

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
        this.hasError.set(false);

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
}
```

### 📝 Explicação do Código

**1. Import do Enum:**
```typescript
import { DataStateEnum } from '@app/core/models/data-state.enum';
```

**2. Expor Enum para o Template:**
```typescript
public readonly DataStateEnum = DataStateEnum;
```
- **`public`**: Acessível no template
- **`readonly`**: Não pode ser modificado

**3. Computed Signal:**
```typescript
state = computed<DataStateEnum>(() => {
    if (this.isLoading()) return DataStateEnum.LOADING;
    if (this.hasError()) return DataStateEnum.ERROR;
    if (this.ponyList().length === 0) return DataStateEnum.EMPTY;
    return DataStateEnum.SUCCESS;
});
```

**Lógica de prioridade (ordem importa!):**
1. **LOADING**: Mais prioritário (sobrescreve tudo)
2. **ERROR**: Segunda prioridade
3. **EMPTY**: Se não tem erro, mas lista vazia
4. **SUCCESS**: Caso padrão (tem dados)

**4. Subscribe da API:**
```typescript
this.ponyService.getPonyList().subscribe({
    next: (ponies: Pony[]) => {
        this.ponyList.set(ponies);  // Sucesso
        this.isLoading.set(false);
    },
    error: () => {
        this.hasError.set(true);    // Erro
        this.isLoading.set(false);
    },
});
```

**5. Reset de Estado:**
```typescript
this.hasError.set(false);  // Limpa erro ao tentar novamente
```

---

### 5.2. Modificar o Template

Atualize `web/src/app/features/ponies/pages/list/list.component.html`:

```html
<main-layout (onSearchEvent)="updateFilter($event)">

    <div class="breadcrumb">
        <span>Poneis</span>
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
```

### 📝 Explicação do Template

**1. Switch com Enum:**
```html
@switch (state()) {
    @case (DataStateEnum.LOADING) { ... }
}
```
- **`state()`**: Acessa o computed signal
- **`DataStateEnum.LOADING`**: Usa o enum (type-safe)

**2. Feedback de Lista Vazia:**
```html
<feedback 
    (onRetry)="getData()" 
    imageName="empty" 
    [title]="'SEM\nDADOS PARA EXIBIR.'"
    buttonText="Tentar novamente" 
/>
```

**Propriedades:**
- **`(onRetry)`**: Event binding → chama `getData()`
- **`imageName="empty"`**: Carrega `assets/images/empty.png`
- **`[title]`**: Usa `\n` para quebra de linha
- **`buttonText`**: Texto do botão

**3. Feedback de Erro:**
```html
<feedback 
    imageName="error" 
    [title]="'OPA!\nALGO DEU ERRADO.'"
    message="Não foi possível carregar..."
/>
```
- **`message`**: Propriedade opcional (só aparece se fornecida)

---

## ✅ Testando a Implementação

### Cenário 1: Estado de Loading

1. Abra a aplicação
2. **Resultado esperado**: "Carregando..." aparece brevemente

### Cenário 2: Lista Vazia

1. Certifique-se de que o backend não tem ponies cadastrados
2. **Resultado esperado**:
   - Imagem "empty.png"
   - Título "SEM DADOS PARA EXIBIR."
   - Botão "Tentar novamente"

### Cenário 3: Erro de API

1. Desligue o backend (`npm start` no `/api`)
2. Clique em "Tentar novamente"
3. **Resultado esperado**:
   - Imagem "error.png"
   - Título "OPA! ALGO DEU ERRADO."
   - Mensagem explicativa
   - Botão "Tentar novamente"

### Cenário 4: Sucesso com Dados

1. Ligue o backend
2. Cadastre alguns ponies
3. **Resultado esperado**: "Dados" (futuramente será a lista)

---

## 🎓 Conceitos Avançados

### 1. Por que Computed Signal ao invés de Métodos?

**❌ Método (reavaliado sempre):**
```typescript
getState(): DataStateEnum {
    if (this.isLoading()) return DataStateEnum.LOADING;
    // ... executado em CADA change detection
}
```

**✅ Computed Signal (memoizado):**
```typescript
state = computed(() => {
    // ... só recalcula quando dependências mudam
});
```

**Vantagens:**
- ✅ **Performance**: Resultado é cacheado
- ✅ **Reatividade**: Atualiza automaticamente
- ✅ **Composição**: Pode ser usado em outros computed

### 2. Padrão State Machine

O enum representa uma **máquina de estados**:

```
[LOADING] → sucesso → [SUCCESS]
           ↘ vazio → [EMPTY]
           ↘ erro → [ERROR]
```

**Estados são mutuamente exclusivos** (só pode estar em um por vez).

### 3. Observable Subscribe vs. Async Pipe

**Subscribe (atual):**
```typescript
this.service.getData().subscribe({
    next: (data) => this.data.set(data)
});
```

**Async Pipe (alternativa):**
```typescript
data$ = this.service.getData();  // Observable
```
```html
@if (data$ | async; as data) {
    {{ data }}
}
```

**Trade-offs:**
- Subscribe = Mais controle sobre estados
- Async Pipe = Menos código, mas menos flexível

---

## 🎨 Assets Necessários

Crie/adicione as imagens em `web/src/assets/images/`:

```
assets/images/
├── error.png    ← Pony triste/confuso
└── empty.png    ← Pony surpreso/vazio
```

**Dica de design:**
- Imagens com fundo transparente (PNG)
- Tamanho recomendado: 200x200px
- Estilo consistente com o tema do app

---

## 📦 Resumo dos Arquivos Criados/Modificados

| Arquivo | Ação | Responsabilidade |
|---------|------|------------------|
| `data-state.enum.ts` | ✨ CRIADO | Define estados da aplicação |
| `pony.model.ts` | ✨ CRIADO | Interface de tipagem do Pony |
| `pony.service.ts` | ✨ CRIADO | Comunicação com API |
| `feedback.component.ts` | ✨ CRIADO | Lógica do componente de feedback |
| `feedback.component.html` | ✨ CRIADO | Template do feedback |
| `feedback.component.scss` | ✨ CRIADO | Estilos do feedback |
| `list.component.ts` | ✏️ MODIFICADO | Integra service e estados |
| `list.component.html` | ✏️ MODIFICADO | UI com estados |
| `core/models/index.ts` | ✏️ MODIFICADO | Exporta enum |

---

## 🎯 Checklist de Conclusão

- ✅ Enum `DataStateEnum` criado e exportado
- ✅ Model `Pony` com interface TypeScript
- ✅ Componente `FeedbackComponent` reutilizável
- ✅ Service `PonyService` com autenticação JWT
- ✅ Computed signal `state` gerencia estados
- ✅ Template usa `@switch` com enum
- ✅ Feedback de erro exibido corretamente
- ✅ Feedback de lista vazia exibido corretamente
- ✅ Botão "Tentar novamente" funciona
- ✅ Assets (error.png, empty.png) adicionados

---

## 📚 Referências

- [Angular Signals](https://angular.io/guide/signals)
- [Computed Signals](https://angular.io/guide/signals#computed-signals)
- [TypeScript Enums](https://www.typescriptlang.org/docs/handbook/enums.html)
- [RxJS Observable](https://rxjs.dev/guide/observable)
- [HttpClient](https://angular.io/guide/http)

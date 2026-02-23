# 📘 Aula 9 — Integração com API e Gerenciamento de Estado

## Objetivo

Implementar o **serviço de ponies** para consumir a API REST, integrar com a página de listagem usando **computed signals** para gerenciar estados de forma profissional, e utilizar o componente de feedback criado na aula anterior.

---

## 🎯 O que vamos construir

- **Enum `DataStateEnum`**: Estados da aplicação (loading, error, empty, success)
- **Model `Pony`**: Interface TypeScript para tipagem dos dados
- **Service `PonyService`**: Comunicação com API REST
- **Computed Signals**: Gerenciamento de estado reativo
- **Integração completa**: Lista de ponies com feedbacks funcionais
- **Tratamento de erros**: HTTP errors e retry

---

## 📋 Conceitos Importantes

### Enums vs. String Literals

| String Literals | Enums |
|----------------|-------|
| ❌ `'loading'` | ✅ `DataStateEnum.LOADING` autocomplete |
| ❌ Refatorar é difícil | ✅ Refatorar é seguro |
| ❌ Sem intellisense | ✅ IDE ajuda |
| ❌ Runtime errors | ✅ Compile-time errors |

### Computed Signals

**Computed Signals** são signals derivados que recalculam automaticamente quando suas dependências mudam:

```typescript
state = computed(() => {
    if (this.isLoading()) return DataStateEnum.LOADING;
    // ... recalcula quando isLoading, hasError ou ponyList mudam
});
```

**Vantagens:**
- ✅ **Reativo**: Atualiza automaticamente
- ✅ **Performático**: Só recalcula quando necessário
- ✅ **Memoizado**: Cache do resultado
- ✅ **Type-safe**: TypeScript garante tipos corretos

### Padrão State Machine

O enum representa uma **máquina de estados**:

```
             ↗  Sucesso  →  [SUCCESS]
 [LOADING]   →  Vazio    →  [EMPTY]
             ↘  Erro     →  [ERROR]
```

**Estados são mutuamente exclusivos** (só pode estar em um por vez).

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
            └── feedback.component.ts    ← JÁ EXISTE
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

## 🛠️ Passo 3: Criar o Service de Ponies

⚠️ **IMPORTANTE**: Certifique-se de que o backend está rodando antes de continuar.

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
- Disponível em toda a aplicação sem precisar declarar em `providers`

**2. HttpClient:**
```typescript
constructor(private http: HttpClient) {}
```
- Injetado automaticamente pelo Angular
- Gerencia requisições HTTP (GET, POST, PUT, DELETE)

**3. Header de Autenticação:**
```typescript
const options = {
    headers: {
        Authorization: `Bearer ${token}`,
    },
};
```
- **Token JWT** recuperado do LocalStorage
- Enviado no header `Authorization`
- Backend valida o token para autorizar acesso

**4. Observable e Tipagem:**
```typescript
return this.http.get<Pony[]>(endpoint, options)
```
- **`<Pony[]>`**: TypeScript sabe que retorna array de Pony
- **Observable**: Stream de dados assíncrono (padrão RxJS)
- Permite operadores como `map`, `filter`, `catchError`

**5. Tratamento de Erro:**
```typescript
.pipe(
    catchError((error) => {
        return throwError(() => error);
    }),
)
```
- **`catchError`**: Intercepta erros HTTP (401, 404, 500, etc)
- **`throwError`**: Repassa o erro para o subscriber
- Subscriber pode decidir como tratar (mostrar feedback, retry, etc)

---

## 🛠️ Passo 4: Integrar na Página de Listagem

### 4.1. Modificar o TypeScript

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

**1. Imports Necessários:**
```typescript
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { PonyService } from '../../services/pony.service';
import { Pony } from '../../models/pony.model';
import { DataStateEnum } from '@app/core/models/data-state.enum';
```
- **`computed`**: Para criar signals derivados
- **`PonyService`**: Service de comunicação com API
- **`Pony`**: Interface de tipagem
- **`DataStateEnum`**: Enum de estados

**2. Signals de Estado:**
```typescript
isLoading = signal(false);
hasError = signal(false);
ponyList = signal<Pony[]>([]);
```
- **`isLoading`**: Indica se há requisição em andamento
- **`hasError`**: Indica se houve erro na requisição
- **`ponyList`**: Armazena a lista de ponies

**3. Expor Enum para o Template:**
```typescript
public readonly DataStateEnum = DataStateEnum;
```
- **`public`**: Acessível no template HTML
- **`readonly`**: Não pode ser modificado (segurança)

**4. Computed Signal (Gerenciamento de Estado):**
```typescript
state = computed<DataStateEnum>(() => {
    if (this.isLoading()) return DataStateEnum.LOADING;
    if (this.hasError()) return DataStateEnum.ERROR;
    if (this.ponyList().length === 0) return DataStateEnum.EMPTY;
    return DataStateEnum.SUCCESS;
});
```

**Lógica de prioridade (ordem importa!):**
1. **LOADING**: Sobrescreve tudo (requisição em andamento)
2. **ERROR**: Segunda prioridade (falha na requisição)
3. **EMPTY**: Lista vazia (requisição OK, mas sem dados)
4. **SUCCESS**: Caso padrão (tem dados para exibir)

**Por que computed signal?**
- ✅ Recalcula automaticamente quando dependências mudam
- ✅ Resultado é cacheado (performance)
- ✅ Não precisa chamar manualmente

**5. Injeção de Dependência:**
```typescript
private ponyService = inject(PonyService);
```
- **`inject()`**: Função moderna de DI (Angular 14+)
- Alternativa ao `constructor(private service: Service)`

**6. Lifecycle Hook:**
```typescript
ngOnInit(): void {
    this.getData();
}
```
- Executado quando o componente é inicializado
- Chama `getData()` para buscar os ponies

**7. Método getData():**
```typescript
getData(): void {
    this.isLoading.set(true);        // 1. Inicia loading
    this.hasError.set(false);        // 2. Limpa erro anterior

    this.ponyService.getPonyList().subscribe({
        next: (ponies: Pony[]) => {
            this.ponyList.set(ponies);     // 3. Sucesso: armazena dados
            this.isLoading.set(false);     // 4. Finaliza loading
        },
        error: () => {
            this.hasError.set(true);       // 3. Erro: marca erro
            this.isLoading.set(false);     // 4. Finaliza loading
        },
    });
}
```

**Fluxo de execução:**
1. **Início**: `isLoading = true`, `hasError = false`
2. **Requisição HTTP**: `getPonyList()` é chamado
3. **Sucesso**: Armazena dados, `isLoading = false`
4. **Erro**: Marca erro, `isLoading = false`

**Por que `hasError.set(false)` no início?**
- Limpa erros de tentativas anteriores
- Permite que o retry funcione corretamente

---

### 4.2. Modificar o Template

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

**1. Switch com Enum (Angular 17+):**
```html
@switch (state()) {
    @case (DataStateEnum.LOADING) { ... }
    @case (DataStateEnum.SUCCESS) { ... }
    @case (DataStateEnum.EMPTY) { ... }
    @case (DataStateEnum.ERROR) { ... }
}
```
- **`state()`**: Acessa o computed signal
- **`DataStateEnum.LOADING`**: Usa o enum (type-safe, sem typos)
- Mais limpo que múltiplos `@if / @else if`

**2. Estado de Loading:**
```html
@case (DataStateEnum.LOADING) {
    <p>Carregando...</p>
}
```
- Placeholder temporário
- Futuramente pode ser um skeleton loader

**3. Estado de Sucesso:**
```html
@case (DataStateEnum.SUCCESS) {
    <p>Dados</p>
}
```
- Placeholder temporário
- Na próxima aula, será a lista de cards

**4. Feedback de Lista Vazia:**
```html
<feedback 
    (onRetry)="getData()" 
    imageName="empty" 
    [title]="'SEM\nDADOS PARA EXIBIR.'"
    buttonText="Tentar novamente" 
/>
```

**Propriedades:**
- **`(onRetry)`**: Event binding → chama `getData()` no clique
- **`imageName="empty"`**: Carrega `assets/images/empty.png`
- **`[title]`**: Usa `\n` para quebra de linha
- **`buttonText`**: Texto do botão (sem `message`)

**5. Feedback de Erro:**
```html
<feedback 
    (onRetry)="getData()" 
    imageName="error" 
    [title]="'OPA!\nALGO DEU ERRADO.'"
    buttonText="Tentar novamente"
    message="Não foi possível carregar as informações esperadas. Aguarde alguns instantes e tente novamente." 
/>
```

**Diferenças do feedback de empty:**
- **`message`**: Mensagem explicativa adicional
- **`imageName="error"`**: Imagem diferente

---

## ✅ Testando a Implementação

### Cenário 1: Estado de Loading

1. Abra a aplicação em `http://localhost:4200`
2. **Resultado esperado**: 
   - "Carregando..." aparece brevemente
   - Transição automática para SUCCESS ou EMPTY

### Cenário 2: Lista Vazia

**Requisitos:**
- Backend rodando
- Nenhum pony cadastrado

**Passos:**
1. Acesse a aplicação
2. **Resultado esperado**:
   - Imagem "empty.png" aparece
   - Título "SEM DADOS PARA EXIBIR."
   - Botão "Tentar novamente"
   - Clique no botão chama `getData()` novamente

### Cenário 3: Erro de API

**Passos:**
1. **Desligue o backend** (Ctrl+C no terminal da API)
2. Recarregue a página ou clique em "Tentar novamente"
3. **Resultado esperado**:
   - Imagem "error.png" aparece
   - Título "OPA! ALGO DEU ERRADO."
   - Mensagem explicativa
   - Botão "Tentar novamente"

**Teste do Retry:**
4. **Ligue o backend novamente** (`npm start` na API)
5. Clique em "Tentar novamente"
6. **Resultado esperado**:
   - Loading → SUCCESS ou EMPTY (dependendo se tem dados)

### Cenário 4: Sucesso com Dados

**Requisitos:**
- Backend rodando
- Pelo menos 1 pony cadastrado

**Passos:**
1. Cadastre ponies via Postman ou Insomnia:
   ```http
   POST http://localhost:3000/ponies
   Authorization: Bearer SEU_TOKEN

   {
       "name": "Rainbow Dash",
       "element": "Loyalty",
       "personality": "Brave",
       "talent": "Flying",
       "summary": "Fast flyer"
   }
   ```
2. Acesse a aplicação
3. **Resultado esperado**: 
   - Texto "Dados" aparece
   - (Na próxima aula, será a lista de cards)

---

## 🎓 Conceitos Avançados

### 1. Por que Computed Signal ao invés de Métodos?

**❌ Método (reavaliado sempre):**
```typescript
getState(): DataStateEnum {
    if (this.isLoading()) return DataStateEnum.LOADING;
    if (this.hasError()) return DataStateEnum.ERROR;
    if (this.ponyList().length === 0) return DataStateEnum.EMPTY;
    return DataStateEnum.SUCCESS;
}

// No template
{{ getState() }}  // Executado em CADA change detection
```

**Problemas:**
- ❌ Executado múltiplas vezes por ciclo
- ❌ Sem memoização (recalcula sempre)
- ❌ Impacto na performance

**✅ Computed Signal (memoizado):**
```typescript
state = computed(() => {
    // ... só recalcula quando dependências mudam
});

// No template
{{ state() }}  // Cache, não recalcula
```

**Vantagens:**
- ✅ **Performance**: Resultado é cacheado
- ✅ **Reatividade**: Atualiza automaticamente quando dependências mudam
- ✅ **Composição**: Pode ser usado em outros computed signals
- ✅ **Debugging**: Mais fácil rastrear mudanças

### 2. Observable Subscribe vs. Async Pipe

**Subscribe (atual - mais controle):**
```typescript
this.service.getData().subscribe({
    next: (data) => {
        this.data.set(data);
        this.isLoading.set(false);
    },
    error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
    }
});
```

**Async Pipe (alternativa - menos código):**
```typescript
// TypeScript
data$ = this.service.getData();

// Template
@if (data$ | async; as data) {
    {{ data }}
}
```

**Trade-offs:**

| Aspecto | Subscribe | Async Pipe |
|---------|-----------|------------|
| **Controle de estado** | ✅ Total (loading, error) | ❌ Limitado |
| **Código** | ❌ Mais verboso | ✅ Mais conciso |
| **Memory leaks** | ⚠️ Precisa unsubscribe | ✅ Automático |
| **Múltiplos estados** | ✅ Fácil gerenciar | ❌ Difícil |

**Quando usar cada um:**
- **Subscribe**: Quando precisa gerenciar múltiplos estados (loading, error, empty)
- **Async Pipe**: Para casos simples, sem estados complexos

### 3. Por que usar LocalStorage para o Token?

**Vantagens:**
- ✅ Simples de implementar
- ✅ Persiste entre sessões (não perde no refresh)
- ✅ Acessível em toda a aplicação

**Desvantagens (para produção):**
- ⚠️ Vulnerável a XSS (Cross-Site Scripting)
- ⚠️ Não é HttpOnly (JavaScript pode acessar)

**Alternativa mais segura (produção):**
```typescript
// HttpOnly Cookie (configurado no backend)
// JavaScript NÃO consegue acessar
// Mais seguro contra XSS
```

### 4. Padrão State Machine em Profundidade

```
          ┌─────────┐
    ┌────→│ LOADING │◄────┐
    │     └────┬────┘     │
    │          │          │
    │      (sucesso)   (retry)
    │          │          │
    │     ┌────▼────┐     │
    │  ┌──│ SUCCESS │     │
    │  │  └─────────┘     │
    │  │                  │
    │  │  ┌─────────┐     │
    │  └─►│  EMPTY  ├─────┘
    │     └─────────┘
    │
    │  (erro)             ▲
    │     ┌─────────┐     │
    └────►│  ERROR  ├─────┘
          └─────────┘
```

**Características:**
- Estados mutuamente exclusivos
- Transições bem definidas
- Previsível e testável

---

## 📦 Resumo dos Arquivos Criados/Modificados

| Arquivo | Ação | Responsabilidade |
|---------|------|------------------|
| `data-state.enum.ts` | ✨ CRIADO | Define estados da aplicação |
| `pony.model.ts` | ✨ CRIADO | Interface de tipagem do Pony |
| `pony.service.ts` | ✨ CRIADO | Comunicação com API REST |
| `list.component.ts` | ✏️ MODIFICADO | Integra service e gerencia estados |
| `list.component.html` | ✏️ MODIFICADO | UI com @switch e feedback component |
| `core/models/index.ts` | ✏️ MODIFICADO | Exporta enum |

---

## 🎯 Checklist de Conclusão

- ✅ Enum `DataStateEnum` criado e exportado
- ✅ Model `Pony` com interface TypeScript
- ✅ Service `PonyService` criado com autenticação JWT
- ✅ Computed signal `state` gerencia estados
- ✅ Template usa `@switch` com enum
- ✅ Feedback de erro exibido corretamente
- ✅ Feedback de lista vazia exibido corretamente
- ✅ Botão "Tentar novamente" funciona
- ✅ Loading state funcional
- ✅ Requisição HTTP com headers de autenticação
- ✅ Tratamento de erros implementado

---

## 📚 Referências

- [Angular Signals](https://angular.io/guide/signals)
- [Computed Signals](https://angular.io/guide/signals#computed-signals)
- [RxJS Observable](https://rxjs.dev/guide/observable)
- [HttpClient](https://angular.io/guide/http)
- [Dependency Injection](https://angular.io/guide/dependency-injection)

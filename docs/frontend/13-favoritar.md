# 📘 Aula 13 — Favoritar um Pônei

## Objetivo

Implementar a funcionalidade de **favoritar/desfavoritar pôneis**, permitindo que o usuário marque seus ponies favoritos com **feedback visual instantâneo** e persistência no backend, utilizando **atualização local otimista** para melhor experiência do usuário.

---

## 🎯 O que vamos construir

- **Interface `UpdatePony`**: Tipagem para atualizações parciais
- **Método `updatePony()`**: Service para atualizar ponies
- **Funcionalidade de Toggle**: Favoritar/desfavoritar com um clique
- **Feedback de Erro**: Snackbar quando algo dá errado
- **Atualização Local**: UI atualiza instantaneamente

---

## 📋 Conceitos Importantes

### Atualização Parcial (Partial Update)

Ao invés de enviar **todo o objeto** para atualizar, enviamos **apenas o que mudou**:

```typescript
// ❌ Update completo (desnecessário)
updatePony(pony: Pony) {
    // Envia TODOS os campos, mesmo os que não mudaram
}

// ✅ Update parcial (eficiente)
updatePony(ponyId: string, updateData: UpdatePony) {
    // Envia APENAS { isFavorite: true }
}
```

**Vantagens:**
- ✅ Menor payload (menos dados trafegados)
- ✅ Backend decide o que pode ser atualizado
- ✅ Mais seguro (não sobrescreve campos acidentalmente)

### Atualização Otimista (Optimistic Update)

Atualiza a UI **antes** de confirmar com o backend:

```typescript
// 1. Atualiza UI imediatamente
this.ponyList.set(updatedList);

// 2. Envia para backend
this.service.updatePony().subscribe({
    // 3. Se falhar, reverte (ou mostra erro)
    error: () => this.snackbarService.error('Erro!')
});
```

**Fluxo:**
```
Clique → UI atualiza → Requisição → [Sucesso ✅ | Erro ❌]
         ↑ Instantâneo          ↑ Em background
```

**Quando usar:**
- ✅ Ações frequentes (curtir, favoritar)
- ✅ Alta probabilidade de sucesso
- ❌ Operações críticas (pagamentos, exclusões)

---

## 📂 Estrutura de Arquivos

```
web/src/app/
├── core/
│   └── services/
│       └── snackbar.service.ts         ← JÁ EXISTE (Aula 5)
├── features/
│   └── ponies/
│       ├── models/
│       │   └── pony.model.ts           ← MODIFICAR (adicionar UpdatePony)
│       ├── services/
│       │   └── pony.service.ts         ← MODIFICAR (adicionar updatePony)
│       ├── components/
│       │   └── pony-card/
│       │       └── pony-card.component.ts  ← JÁ EXISTE (Aula 12)
│       └── pages/
│           └── list/
│               ├── list.component.ts    ← MODIFICAR (toggleFavorite)
│               └── list.component.html  ← MODIFICAR (event binding)
```

---

## 🛠️ Passo 1: Adicionar Interface de Update

### 1.1. Criar Interface UpdatePony

Atualize `web/src/app/features/ponies/models/pony.model.ts`:

```typescript
export interface Pony {
    id: string;
    name: string;
    element: string;
    personality: string;
    talent: string;
    summary: string;
    imageUrl: string;
    isFavorite: boolean;
}

// ← NOVO: Interface para atualizações parciais
export interface UpdatePony {
    name?: string;
    element?: string;
    personality?: string;
    talent?: string;
    summary?: string;
    imageUrl?: string;
    isFavorite?: boolean;
}
```

### 📝 Explicação

**Por que criar uma interface separada?**

```typescript
// ❌ Usar Partial<Pony>
updatePony(data: Partial<Pony>) {
    // Problema: permite enviar 'id', mas ID não deve ser editável!
}

// ✅ Interface específica
updatePony(data: UpdatePony) {
    // Sem 'id', apenas campos editáveis
}
```

**Todos os campos opcionais:**
```typescript
name?: string;  // Pode enviar ou não
```

**TypeScript garante:**
- ✅ Só pode enviar campos que existem
- ✅ Tipos corretos (string, boolean, etc)
- ❌ Não pode enviar `id` ou campos inexistentes

---

## 🛠️ Passo 2: Adicionar Método de Update no Service

### 2.1. Atualizar PonyService

Atualize `web/src/app/features/ponies/services/pony.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Pony, UpdatePony } from '../models/pony.model';  // ← Importar UpdatePony
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

    createPony(pony: Omit<Pony, 'id'>): Observable<Pony> {
        const endpoint = `${this.apiUrl}/ponies`;
        const token = LocalStorageHelper.get<string>(LocalStorageKeys.TOKEN);

        const options = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        return this.http.post<Pony>(endpoint, pony, options).pipe(
            catchError((error) => {
                return throwError(() => error);
            }),
        );
    }

    uploadImage(file: File): Observable<{ imageUrl: string }> {
        const endpoint = `${this.apiUrl}/ponies/upload`;
        const token = LocalStorageHelper.get<string>(LocalStorageKeys.TOKEN);

        const formData = new FormData();
        formData.append('file', file);

        const options = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        return this.http.post<{ imageUrl: string }>(endpoint, formData, options).pipe(
            catchError((error) => {
                return throwError(() => error);
            }),
        );
    }

    // ← NOVO: Método para atualizar pony
    updatePony(ponyId: string, updateData: UpdatePony): Observable<Pony> {
        const endpoint = `${this.apiUrl}/ponies/${ponyId}`;
        const token = LocalStorageHelper.get<string>(LocalStorageKeys.TOKEN);

        const options = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        return this.http.put<Pony>(endpoint, updateData, options).pipe(
            catchError((error) => {
                return throwError(() => error);
            }),
        );
    }
}
```

### 📝 Explicação do Método

**1. Assinatura do Método:**
```typescript
updatePony(ponyId: string, updateData: UpdatePony): Observable<Pony>
```

**Parâmetros:**
- **`ponyId`**: ID do pony a ser atualizado
- **`updateData`**: Objeto com campos a atualizar (parcial)

**Retorno:**
- **`Observable<Pony>`**: Pony completo atualizado do backend

**2. Endpoint Dinâmico:**
```typescript
const endpoint = `${this.apiUrl}/ponies/${ponyId}`;
// Exemplo: http://localhost:3000/ponies/abc123
```

**3. HTTP PUT:**
```typescript
this.http.put<Pony>(endpoint, updateData, options)
```

**PUT vs PATCH:**

| Método | Uso | Corpo da Requisição |
|--------|-----|---------------------|
| **PUT** | Substituição completa | Todos os campos (ou parcial se backend permitir) |
| **PATCH** | Atualização parcial | Apenas campos que mudam |

**Neste projeto:**
- Backend aceita **PUT com dados parciais**
- Mais comum em APIs REST modernas

**4. Autenticação:**
```typescript
headers: {
    Authorization: `Bearer ${token}`
}
```

**5. Tratamento de Erro:**
```typescript
catchError((error) => {
    return throwError(() => error);
})
```
- Repassa erro para subscriber (componente)
- Componente decide como tratar (snackbar, etc)

---

## 🛠️ Passo 3: Implementar Toggle no List Component

### 3.1. Atualizar o TypeScript

Atualize `web/src/app/features/ponies/pages/list/list.component.ts`:

```typescript
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainLayoutComponent } from '@core/layout/main-layout/main-layout.component';
import { FeedbackComponent } from '@shared/components/feedback/feedback.component';
import { PonyService } from '../../services/pony.service';
import { Pony } from '../../models/pony.model';
import { DataStateEnum } from '@core/models/data-state.enum';
import { SvgIconComponent } from 'angular-svg-icon';
import { CreatePonyComponent } from '../../components/create-pony/create-pony.component';
import { PonyCardComponent } from '../../components/pony-card/pony-card.component';
import { SnackbarService } from '@app/core/services/snackbar.service';  // ← NOVO

@Component({
    selector: 'app-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MainLayoutComponent,
        FeedbackComponent,
        SvgIconComponent,
        CreatePonyComponent,
        PonyCardComponent,
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

    filteredPonyList = computed(() => {
        const filterValue = this.filter().toLowerCase().trim();
        if (!filterValue) return this.ponyList();

        return this.ponyList().filter((pony) => 
            pony.name.toLowerCase().includes(filterValue)
        );
    });

    state = computed<DataStateEnum>(() => {
        if (this.isLoading()) return DataStateEnum.LOADING;
        if (this.hasError()) return DataStateEnum.ERROR;
        if (this.filteredPonyList().length === 0) return DataStateEnum.EMPTY;
        return DataStateEnum.SUCCESS;
    });

    private ponyService = inject(PonyService);
    private snackbarService = inject(SnackbarService);  // ← NOVO

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

    // ← NOVO: Método para favoritar/desfavoritar
    toggleFavorite(pony: Pony): void {
        const isFavorite = !pony.isFavorite;

        this.ponyService.updatePony(pony.id, { isFavorite }).subscribe({
            next: (updatedPony) => {
                const updatedList = this.ponyList().map((pony) =>
                    pony.id === updatedPony.id ? updatedPony : pony,
                );

                this.ponyList.set(updatedList);
            },
            error: () => {
                this.snackbarService.error('Erro ao favoritar pony');
            },
        });
    }
}
```

### 📝 Explicação do Código

**1. Novo Import:**
```typescript
import { SnackbarService } from '@app/core/services/snackbar.service';
```
- Service para mostrar mensagens de feedback
- Criado na Aula 5

**2. Injeção do SnackbarService:**
```typescript
private snackbarService = inject(SnackbarService);
```

**3. Método toggleFavorite():**

```typescript
toggleFavorite(pony: Pony): void {
    const isFavorite = !pony.isFavorite;  // 1. Inverte estado
    
    this.ponyService.updatePony(pony.id, { isFavorite }).subscribe({
        next: (updatedPony) => {
            // 2. Atualiza lista local
            const updatedList = this.ponyList().map((pony) =>
                pony.id === updatedPony.id ? updatedPony : pony
            );
            
            this.ponyList.set(updatedList);  // 3. Dispara reatividade
        },
        error: () => {
            // 4. Mostra erro se falhar
            this.snackbarService.error('Erro ao favoritar pony');
        },
    });
}
```

**Passo a passo:**

**1. Inverte o estado:**
```typescript
const isFavorite = !pony.isFavorite;
// Se era true (favorito) → false (não favorito)
// Se era false → true
```

**2. Chama o service:**
```typescript
this.ponyService.updatePony(pony.id, { isFavorite })
```
- Envia **apenas** `{ isFavorite: true }` ou `{ isFavorite: false }`
- Não envia name, element, etc (desnecessário)

**3. Atualiza lista local:**
```typescript
const updatedList = this.ponyList().map((pony) =>
    pony.id === updatedPony.id ? updatedPony : pony
);
```

**Como funciona o `.map()`:**
```typescript
// Array original
[
  { id: '1', name: 'Rainbow', isFavorite: true },
  { id: '2', name: 'Twilight', isFavorite: false },  ← Atualizando este
  { id: '3', name: 'Pinkie', isFavorite: false }
]

// Para cada pony:
// - Se id === updatedPony.id → substitui pelo novo
// - Senão → mantém o antigo

// Array resultante
[
  { id: '1', name: 'Rainbow', isFavorite: true },
  { id: '2', name: 'Twilight', isFavorite: true },  ← Atualizado!
  { id: '3', name: 'Pinkie', isFavorite: false }
]
```

**Por que não apenas `pony.isFavorite = true`?**
```typescript
// ❌ ERRADO: Mutação direta
pony.isFavorite = true;
// Signals não detectam mudanças em objetos mutados

// ✅ CORRETO: Novo array
this.ponyList.set(updatedList);
// Signal detecta mudança e recalcula computed signals
```

**4. Feedback de Erro:**
```typescript
error: () => {
    this.snackbarService.error('Erro ao favoritar pony');
}
```
- Mostra snackbar vermelho
- Usuário sabe que algo falhou

---

### 3.2. Atualizar o Template

Atualize `web/src/app/features/ponies/pages/list/list.component.html`:

```html
<main-layout (onSearchEvent)="updateFilter($event)">
    <div class="breadcrumb">
        <span>Poneis</span>
    </div>

    <div class="container">
        @switch (state()) {
            @case (DataStateEnum.LOADING) {
                <div class="loading">
                    <p>Carregando...</p>
                </div>
            }
            @case (DataStateEnum.SUCCESS) {
                <div class="pony-list">
                    <pony-card
                        *ngFor="let pony of filteredPonyList()"
                        [ponyName]="pony.name"
                        [imageUrl]="pony.imageUrl"
                        [isFavorite]="pony.isFavorite"
                        (onHeartClick)="toggleFavorite(pony)"
                    />
                </div>
            }
            @case (DataStateEnum.EMPTY) {
                <div class="feedback">
                    <feedback
                        (onRetry)="getData()"
                        imageName="empty"
                        [title]="'SEM\nDADOS PARA EXIBIR.'"
                        buttonText="Tentar novamente"
                    />
                </div>
            }
            @case (DataStateEnum.ERROR) {
                <div class="feedback">
                    <feedback
                        (onRetry)="getData()"
                        imageName="error"
                        [title]="'OPA!\nALGO DEU ERRADO.'"
                        buttonText="Tentar novamente"
                        message="Não foi possível carregar as informações esperadas. Aguarde alguns instantes e tente novamente."
                    />
                </div>
            }
        }
    </div>

    <button
        class="create-pony"
        (click)="createPony.openForm()"
        aria-label="Formulário de cadastro"
        type="button"
    >
        <svg-icon
            src="assets/icons/plus.svg"
            class="icon"
            [svgStyle]="{ 'width.px': 20, 'height.px': 20 }"
        ></svg-icon>
    </button>
</main-layout>

<create-pony
    #createPony
    (ponyCreated)="getData()"
/>
```

### 📝 Explicação do Template

**Event Binding no PonyCard:**
```html
<pony-card
    [ponyName]="pony.name"
    [imageUrl]="pony.imageUrl"
    [isFavorite]="pony.isFavorite"
    (onHeartClick)="toggleFavorite(pony)"
/>
```

**Fluxo de eventos:**
```
1. Usuário clica no coração
   ↓
2. PonyCard emite onHeartClick
   ↓
3. ListComponent recebe evento
   ↓
4. Chama toggleFavorite(pony)
   ↓
5. Atualiza backend e lista local
```

**Por que passar `pony` inteiro?**
```typescript
// ✅ Passa objeto completo
(onHeartClick)="toggleFavorite(pony)"

// ❌ Passar apenas ID exigiria buscar o pony
(onHeartClick)="toggleFavorite(pony.id)"
// Precisaria: const pony = this.ponyList().find(p => p.id === id)
```

---

## ✅ Testando a Implementação

### Cenário 1: Favoritar um Pony

**Passos:**
1. Acesse a listagem com ponies
2. Clique no coração vazio de um pony
3. **Resultado esperado**:
   - Coração muda para preenchido **instantaneamente**
   - Nenhum loading visível
   - Estado persiste (recarregue a página → continua favorito)

### Cenário 2: Desfavoritar um Pony

**Passos:**
1. Clique no coração preenchido
2. **Resultado esperado**:
   - Coração volta a ficar vazio
   - Mudança instantânea
   - Estado persiste

### Cenário 3: Erro de API

**Passos:**
1. **Desligue o backend** (Ctrl+C no terminal da API)
2. Clique no coração
3. **Resultado esperado**:
   - Snackbar vermelho aparece: "Erro ao favoritar pony"
   - Coração **não muda** (update não foi aplicado)
   - Após 3 segundos, snackbar desaparece

**Teste do Retry:**
4. **Ligue o backend novamente**
5. Clique no coração novamente
6. **Resultado esperado**:
   - Funciona normalmente
   - Coração muda de estado

### Cenário 4: Múltiplos Favoritos

**Passos:**
1. Favorite 3 ponies diferentes rapidamente
2. **Resultado esperado**:
   - Todos os 3 corações mudam
   - Requisições enviadas em paralelo
   - Nenhum conflito entre atualizações

### Cenário 5: Favorito com Filtro Ativo

**Passos:**
1. Digite "Rainbow" no filtro
2. Favorite o pony encontrado
3. Limpe o filtro
4. **Resultado esperado**:
   - Pony continua favorito
   - Estado mantido mesmo com filtro

---

## 🎓 Conceitos Avançados

### 1. Imutabilidade com Array.map()

**Por que não modificar direto?**

```typescript
// ❌ ERRADO: Mutação direta
toggleFavorite(pony: Pony): void {
    pony.isFavorite = !pony.isFavorite;  // Modifica objeto
    // Signal NÃO detecta mudança em objetos mutados!
}

// ✅ CORRETO: Novo array
toggleFavorite(pony: Pony): void {
    const updatedList = this.ponyList().map(/* ... */);
    this.ponyList.set(updatedList);  // Signal detecta novo array
}
```

**Como Signals funcionam:**
```typescript
// Signals comparam referências
const array1 = [1, 2, 3];
const array2 = [1, 2, 3];

array1 === array2;  // false (referências diferentes)

const array3 = array1;
array3[0] = 999;
array1 === array3;  // true (mesma referência, mudanças não detectadas)
```

### 2. Update Parcial vs. Completo

**Comparação de Payloads:**

```typescript
// ❌ Update completo (desnecessário)
{
  "id": "abc123",
  "name": "Rainbow Dash",
  "element": "Loyalty",
  "personality": "Brave",
  "talent": "Flying",
  "summary": "Fast flyer",
  "imageUrl": "https://...",
  "isFavorite": true  ← Único campo que mudou!
}

// ✅ Update parcial (eficiente)
{
  "isFavorite": true  ← Apenas o necessário
}
```

**Redução:**
- De **~200 bytes** para **~20 bytes**
- **10x menor**
- Mais rápido em redes lentas

### 3. Error Handling sem Reversão

```typescript
// Abordagem atual (simples)
error: () => {
    this.snackbarService.error('Erro ao favoritar pony');
    // UI NÃO reverte (fica no estado otimista)
}

// Abordagem com reversão (complexa)
error: () => {
    // Reverte para estado anterior
    pony.isFavorite = !pony.isFavorite;
    const revertedList = this.ponyList().map(/* ... */);
    this.ponyList.set(revertedList);
    
    this.snackbarService.error('Erro ao favoritar pony');
}
```

**Trade-offs:**

| Aspecto | Sem Reversão | Com Reversão |
|---------|--------------|--------------|
| **Código** | ✅ Simples | ❌ Complexo |
| **UX em erro** | ⚠️ Fica inconsistente | ✅ Sempre correto |
| **Recarregar página** | ✅ Corrige automaticamente | ✅ Correto |
| **Cenário comum** | ✅ Erros raros | ⚠️ Erros frequentes |

**Decisão:**
- Sem reversão é adequado quando:
  - Erros são raros
  - Usuário pode recarregar a página
  - Simplicidade é prioridade

### 4. Array.map() em Profundidade

```typescript
const updatedList = this.ponyList().map((pony) =>
    pony.id === updatedPony.id ? updatedPony : pony
);
```

**Equivalente com forEach (para entendimento):**
```typescript
const updatedList: Pony[] = [];

this.ponyList().forEach((pony) => {
    if (pony.id === updatedPony.id) {
        updatedList.push(updatedPony);  // Substitui
    } else {
        updatedList.push(pony);  // Mantém
    }
});
```

**Por que map() é melhor:**
- ✅ Funcional (sem mutação)
- ✅ Mais conciso
- ✅ Retorna novo array automaticamente
- ✅ Padrão da indústria

### 5. Observable Subscribe sem Unsubscribe

```typescript
this.ponyService.updatePony(pony.id, { isFavorite }).subscribe({
    // Sem unsubscribe... é um problema?
});
```

**Quando unsubscribe é necessário:**
```typescript
// ❌ Memory leak (observable infinito)
interval(1000).subscribe();  // Continua para sempre

// ❌ Memory leak (component destruído, observable ainda ativo)
this.longRunningService.getData().subscribe();
```

**Quando NÃO é necessário:**
```typescript
// ✅ HTTP requests completam automaticamente
this.http.get().subscribe();
this.http.put().subscribe();

// ✅ Finite observables
of([1, 2, 3]).subscribe();
```

**Nosso caso:**
- HTTP requests **completam automaticamente**
- Não precisa unsubscribe
- Angular limpa automaticamente

---

## 📦 Resumo dos Arquivos Criados/Modificados

| Arquivo | Ação | Responsabilidade |
|---------|------|------------------|
| `pony.model.ts` | ✏️ MODIFICADO | Adicionado interface `UpdatePony` |
| `pony.service.ts` | ✏️ MODIFICADO | Adicionado método `updatePony()` |
| `list.component.ts` | ✏️ MODIFICADO | Implementado `toggleFavorite()` e injetado `SnackbarService` |
| `list.component.html` | ✏️ MODIFICADO | Adicionado event binding `(onHeartClick)` |

---

## 🎯 Checklist de Conclusão

- ✅ Interface `UpdatePony` criada com campos opcionais
- ✅ Método `updatePony()` implementado no service (HTTP PUT)
- ✅ Método `toggleFavorite()` implementado no componente
- ✅ Lista local atualizada com `Array.map()` (imutável)
- ✅ SnackbarService injetado e configurado
- ✅ Feedback de erro funcional
- ✅ Event binding `(onHeartClick)` conectado
- ✅ Reatividade funcionando (computed signal recalcula)
- ✅ Estado persiste no backend

---

## 📚 Referências

- [Angular HttpClient](https://angular.io/guide/http)
- [RxJS Observable](https://rxjs.dev/guide/observable)
- [Array.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
- [TypeScript Optional Properties](https://www.typescriptlang.org/docs/handbook/2/objects.html#optional-properties)
- [REST API Best Practices](https://restfulapi.net/)


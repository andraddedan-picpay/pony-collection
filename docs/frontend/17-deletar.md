# 📘 Aula 17 — Remoção de Ponies com Confirmação e Feedback

**Progresso do Curso Frontend:** `[████████████████████] 100% concluído`

## Objetivo

Implementar a **funcionalidade de remoção** de ponies com **confirmação do usuário**, **integração com API REST**, **feedback visual** (snackbar), e **atualização automática da lista** após a operação.

---

## 🎯 O que vamos construir

- **Service Method**: `deletePony()` para requisição DELETE à API
- **Confirmação de Exclusão**: Dialog nativo antes de executar a operação
- **Loading State**: Desabilitar botões durante a requisição
- **Feedback Visual**: Snackbar de sucesso ou erro
- **Refresh Automático**: Atualizar lista após remoção
- **Event Renaming**: Padronizar eventos (`onPonyChange`)

<!-- 💡 Screenshot sugerido: Fluxo completo mostrando dialog de confirmação, loading state, snackbar de sucesso e lista atualizada -->

---

## 📋 Conceitos Importantes

### Operações Destrutivas e UX

Operações de exclusão são **irreversíveis** e exigem cuidados especiais:

| Prática | Implementação | Por quê? |
|---------|---------------|----------|
| ✅ **Confirmação** | `confirm('Tem certeza?')` | Previne exclusões acidentais |
| ✅ **Feedback claro** | Snackbar com nome do pony | Confirma que ação foi concluída |
| ✅ **Loading state** | `[disabled]="isLoading()"` | Previne cliques duplos |
| ✅ **Refresh automático** | `onPonyChange.emit()` | Mantém UI sincronizada |

**Event Communication Pattern:**

```typescript
// ❌ Nome específico demais
ponyCreated.emit(); // Em delete ❌ (contraditório)

// ✅ Nome genérico (cobre create, update, delete)
onPonyChange.emit(); // ✅ Indica mudança sem especificar tipo
```

<!-- 💡 Screenshot sugerido: Dialog nativo de confirmação do navegador com mensagem personalizada -->

---

## 📂 Estrutura de Arquivos

```
web/src/app/
├── features/
│   └── ponies/
│       ├── services/
│       │   └── pony.service.ts              ← MODIFICAR (adicionar deletePony)
│       ├── components/
│       │   ├── create-pony/
│       │   │   └── create-pony.component.ts ← MODIFICAR (renomear evento)
│       │   └── pony-details/
│       │       ├── pony-details.component.ts   ← MODIFICAR (implementar removePony)
│       │       ├── pony-details.component.html ← MODIFICAR (disabled buttons)
│       │       └── pony-details.component.scss ← MODIFICAR (disabled styles)
│       └── pages/
│           └── list/
│               └── list.component.html      ← MODIFICAR (conectar eventos)
```

---

## 🛠️ Passo 1: Adicionar Método DELETE no Service

### 1.1. Implementar `deletePony()`

Edite `web/src/app/features/ponies/services/pony.service.ts` e adicione o método ao final da classe:

```typescript
deletePony(ponyId: string): Observable<void> {
    const endpoint = `${this.apiUrl}/ponies/${ponyId}`;
    const token = LocalStorageHelper.get<string>(LocalStorageKeys.TOKEN);

    const options = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    return this.http.delete<void>(endpoint, options).pipe(
        catchError((error) => {
            return throwError(() => error);
        }),
    );
}
```

### 📝 Explicação do Código

**Assinatura e retorno:**
```typescript
deletePony(ponyId: string): Observable<void>
```
- **`Observable<void>`**: DELETE não retorna dados, apenas status HTTP (200 OK ou 204 No Content)
- **Template literal**: `${this.apiUrl}/ponies/${ponyId}` gera URL dinâmica
- **Autenticação**: Token JWT no header (padrão dos outros métodos)

---

## 🛠️ Passo 2: Implementar Remoção no Componente

### 2.1. Injetar SnackbarService

Edite `web/src/app/features/ponies/components/pony-details/pony-details.component.ts`:

**Adicionar import:**
```typescript
import { SnackbarService } from '@core/services/snackbar.service';
```

**Injetar o serviço:**
```typescript
export class PonyDetailsComponent {
    private ponyService = inject(PonyService);
    private snackbarService = inject(SnackbarService); // ← ADICIONAR
```

### 2.2. Implementar o Método `removePony()`

Substitua o método vazio por esta implementação:

```typescript
removePony(): void {
    const pony = this.ponyDetails();
    if (!pony) return;

    if (!confirm(`Tem certeza que deseja remover ${pony.name}?`)) {
        return;
    }

    this.isLoading.set(true);

    this.ponyService.deletePony(pony.id).subscribe({
        next: () => {
            this.snackbarService.success(`${pony.name} removido com sucesso!`);
            this.onPonyChange.emit();
            this.closeDetails();
        },
        error: (error) => {
            console.error('Erro ao remover pony:', error);
            this.snackbarService.error('Erro ao remover pony. Tente novamente.');
            this.isLoading.set(false);
        },
    });
}
```

### 📝 Explicação Detalhada

**1. Guard Clauses (early returns):**
```typescript
const pony = this.ponyDetails();
if (!pony) return;

if (!confirm(`Tem certeza?`)) {
    return;
}
```
- Validações primeiro, lógica principal depois
- Reduz indentação, melhora legibilidade

**2. Loading State Assimétrico:**
```typescript
// Sucesso: NÃO desabilita loading
next: () => {
    // closeDetails() já reseta o componente
}

// Erro: DEVE desabilitar loading
error: () => {
    this.isLoading.set(false); // Reabilita botões para retry
}
```

**3. Ordem de operações no sucesso:**
1. Snackbar (feedback visual)
2. Emit evento (notifica lista)
3. Fecha sidesheet (remove de tela)

<!-- 💡 Screenshot sugerido: Código no VS Code mostrando a implementação do método removePony com guard clauses destacadas -->

---

## 🛠️ Passo 3: Desabilitar Botões Durante Loading

### 3.1. Modificar o Template HTML

Edite `web/src/app/features/ponies/components/pony-details/pony-details.component.html`:

**Botão de deletar (trash):**
```html
<button
    class="details__trash-button"
    (click)="removePony()"
    aria-label="Deletar Pony"
    type="button"
    [disabled]="isLoading()" <!-- ← ADICIONAR -->
>
    <svg-icon
        src="assets/icons/trash.svg"
        [svgClass]="'details__trash-icon'"
    />
</button>
```

**Botão de fechar:**
```html
<pony-button
    variant="primary"
    type="button"
    (click)="closeDetails()"
    [disabled]="isLoading()" <!-- ← ADICIONAR -->
    width="144px"
>
    Fechar
</pony-button>
```

**Botão de atualizar:**
```html
<pony-button
    variant="primary"
    type="button"
    (click)="editPony()"
    [disabled]="isLoading()" <!-- ← VERIFICAR -->
    width="144px"
>
    Atualizar
</pony-button>
```

### 📝 Explicação

**Por que desabilitar TODOS os botões?**

Durante a requisição DELETE, usuário não pode:
- ❌ Clicar em "Deletar" novamente (double-click)
- ❌ Clicar em "Atualizar" (conflito de operações)
- ❌ Clicar em "Fechar" (operação em andamento)

---

## 🛠️ Passo 4: Estilizar Botões Desabilitados

### 4.1. Adicionar Estilos de Disabled

Edite `web/src/app/features/ponies/components/pony-details/pony-details.component.scss`:

```scss
&__trash-button {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    border: 1px solid $border-color;
    background: transparent;
    padding: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer; // ← ADICIONAR

    &:hover:not(:disabled) { // ← MODIFICAR (era só :hover)
        color: $text-color;
        border: 1px solid $text-color;
        transition: all .25s;
    }

    // ← ADICIONAR bloco disabled
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}
```

### 📝 Explicação dos Estilos

**Hover Condicional:**
```scss
&:hover:not(:disabled) // Só aplica hover se NÃO estiver disabled
```

**Estados visuais:**
- **Normal**: `opacity: 1.0`, `cursor: pointer`, hover ativo
- **Disabled**: `opacity: 0.5`, `cursor: not-allowed`, hover desabilitado

<!-- 💡 Screenshot sugerido: Botões nos estados normal e disabled lado a lado mostrando diferença visual -->

---

## 🛠️ Passo 5: Renomear Eventos para `onPonyChange`

### 5.1. Modificar CreatePonyComponent

Edite `web/src/app/features/ponies/components/create-pony/create-pony.component.ts`:

**Declaração do output:**
```typescript
export class CreatePonyComponent {
    onPonyChange = output<void>(); // ← RENOMEAR (era ponyCreated)
}
```

**Emissão no `createPony()` e `updatePony()`:**
```typescript
next: (pony) => {
    this.snackbarService.success(`${pony.name} cadastrado com sucesso!`);
    this.onPonyChange.emit(); // ← RENOMEAR
    this.closeForm();
    this.isLoading.set(false);
}
```

### 5.2. Modificar PonyDetailsComponent

Edite `web/src/app/features/ponies/components/pony-details/pony-details.component.ts`:

```typescript
export class PonyDetailsComponent {
    onPonyChange = output<void>(); // ← RENOMEAR (era ponyCreated)
}
```

### 5.3. Conectar Eventos no Template da Lista

Edite `web/src/app/features/ponies/pages/list/list.component.html`:

```html
<pony-details
    #ponyDetails
    [createPonyRef]="createPony"
    (onPonyChange)="getData()" <!-- ← ADICIONAR -->
/>

<create-pony
    #createPony
    (onPonyChange)="getData()" <!-- ← RENOMEAR (era ponyCreated) -->
/>
```

### 📝 Explicação da Arquitetura de Eventos

**Fluxo completo:**

```
┌────────────────────────────────────────┐
│         list.component.html            │
│                                        │
│  create-pony ──→ (onPonyChange) ──┐   │
│  pony-details ─→ (onPonyChange) ──┼──→ getData()
│                                   └──→ API Refresh
└────────────────────────────────────────┘
```

**Por que `onPonyChange` é melhor:**
- ✅ Create: Pony mudou (criado)
- ✅ Update: Pony mudou (atualizado)
- ✅ Delete: Pony mudou (removido)
Semântica consistente para todas as operações CRUD.

---

## ✅ Testando a Implementação

### Cenário 1: Exclusão com Sucesso

**Passos:**
1. Clique em um pony na lista
2. Clique no botão de lixeira
3. Confirme no dialog
4. Observe snackbar verde "Rainbow Dash removido com sucesso!"
5. Sidesheet fecha automaticamente
6. Lista atualiza (pony removido)

**Validações:**
- ✅ Durante requisição: botões desabilitados (`opacity: 0.5`)
- ✅ Snackbar aparece por 3 segundos
- ✅ Lista não contém mais o pony deletado

<!-- 💡 Screenshot sugerido: Sequência mostrando dialog → loading → snackbar → lista atualizada -->

---

### Cenário 2: Cancelar Exclusão

**Passos:**
1. Clique em um pony na lista
2. Clique no botão de lixeira
3. Clique em "Cancel" no dialog

**Validações:**
- ✅ Nenhuma requisição enviada à API
- ✅ Pony continua na lista
- ✅ Sidesheet permanece aberto
- ✅ Nenhum snackbar aparece

---

### Cenário 3: Erro na Exclusão

**Passos:**
1. Pare o backend (`Ctrl+C`)
2. Clique em um pony na lista
3. Clique no botão de lixeira
4. Confirme no dialog

**Validações:**
- ✅ Snackbar vermelho "Erro ao remover pony. Tente novamente."
- ✅ Console exibe `Erro ao remover pony: HttpErrorResponse`
- ✅ Botões são reabilitados
- ✅ Sidesheet **não fecha** (permite retry)

---

### Cenário 4: Double-click Prevention

**Passos:**
1. Clique no botão de lixeira
2. Confirme no dialog
3. Imediatamente tente clicar novamente

**Validações:**
- ✅ Segundo clique não tem efeito
- ✅ Botão visualmente desabilitado
- ✅ Cursor muda para `not-allowed`

---

## 🎓 Conceitos Avançados

### 1. Por que `Observable<void>` em DELETE?

DELETE não retorna dados na resposta:

```typescript
// Backend responde apenas com status HTTP
DELETE /ponies/123
Response: 200 OK (body vazio) ou 204 No Content
```

**Tipagem correta:**
```typescript
// ✅ Observable<void> (sem dados)
deletePony(id: string): Observable<void>

// ❌ Observable<Pony> (errado - não retorna Pony)
deletePony(id: string): Observable<Pony>
```

Recurso foi destruído - retornar dados de algo que não existe é contraditório.

---

### 2. Loading State: finalize Operator (Alternativa)

**Abordagem atual (assimétrica):**
```typescript
this.isLoading.set(true);

this.ponyService.deletePony(pony.id).subscribe({
    next: () => {
        // NÃO desabilita loading (closeDetails reseta)
    },
    error: () => {
        this.isLoading.set(false); // Desabilita loading
    },
});
```

**Abordagem simétrica (com finalize):**
```typescript
this.isLoading.set(true);

this.ponyService.deletePony(pony.id).pipe(
    finalize(() => {
        // Executado SEMPRE (sucesso ou erro)
        this.isLoading.set(false);
    })
).subscribe({
    next: () => {
        this.snackbarService.success(...);
        this.onPonyChange.emit();
       this.closeDetails(); // Fecha mesmo com isLoading=false
    },
    error: () => {
        this.snackbarService.error(...);
        // isLoading já foi desabilitado no finalize
    },
});
```

**Trade-off:**
- ✅ Simétrico: Mais previsível
- ✅ Menos código duplicado
- ⚠️ Requer import adicional (`finalize`)

---

### 3. Soft Delete vs Hard Delete

**Frontend não deve saber a diferença:**

```typescript
// ✅ Frontend só sabe que "removeu"
this.ponyService.deletePony(id).subscribe(...);

// ❌ Frontend NÃO deve expor implementação
this.ponyService.softDeletePony(id).subscribe(...);
```

**Por quê?**
- **Responsabilidade**: Soft vs. Hard delete é regra de negócio (backend)
- **Flexibilidade**: Backend pode mudar implementação sem quebrar frontend
- **REST**: DELETE /ponies/123 é sobre intenção, não implementação

---

## 📦 Resumo dos Arquivos Modificados

| Arquivo | Modificação |
|---------|-------------|
| `pony.service.ts` | Adicionado `deletePony()` com HTTP DELETE |
| `pony-details.component.ts` | Injetado SnackbarService, implementado `removePony()`, renomeado output |
| `pony-details.component.html` | Adicionado `[disabled]="isLoading()"` em todos os botões |
| `pony-details.component.scss` | Adicionado estilos de disabled (opacity, cursor) |
| `create-pony.component.ts` | Renomeado output `ponyCreated` para `onPonyChange` |
| `list.component.html` | Conectado evento `(onPonyChange)` em ambos componentes |

---

## 🎯 Checklist de Conclusão

**Service Layer:**
- ✅ `deletePony(id)` retorna `Observable<void>`
- ✅ Endpoint dinâmico com template literal
- ✅ Autenticação JWT no header
- ✅ Tratamento de erro com `catchError`

**Component Logic:**
- ✅ Guard clauses (validação + confirmação)
- ✅ Loading state gerenciado
- ✅ Feedback visual (snackbar)
- ✅ Evento `onPonyChange` padronizado

**Template & Styles:**
- ✅ Botões desabilitados durante loading
- ✅ Estilos de disabled (opacity, cursor)
- ✅ Hover condicional (`:not(:disabled)`)

**Event Architecture:**
- ✅ Eventos rename para `onPonyChange`
- ✅ Lista atualiza automaticamente após operações

---

## 📚 Referências

- [Angular HttpClient - DELETE](https://angular.io/guide/http#making-a-delete-request)
- [RxJS catchError](https://rxjs.dev/api/operators/catchError)
- [RxJS finalize](https://rxjs.dev/api/operators/finalize)
- [Angular Signals](https://angular.dev/guide/signals)
- [Guard Clauses (Martin Fowler)](https://refactoring.com/catalog/replaceNestedConditionalWithGuardClauses.html)

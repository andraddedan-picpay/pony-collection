# 📘 Aula 17 — Remoção de Ponies com Confirmação e Feedback

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

---

## 📋 Conceitos Importantes

### Operações Destrutivas e UX

Operações de exclusão são **irreversíveis** e exigem cuidados especiais:

| Prática | Exemplo | Por quê? |
|---------|---------|----------|
| ✅ **Confirmação** | `confirm('Tem certeza?')` | Previne exclusões acidentais |
| ✅ **Feedback claro** | "Rainbow Dash removido com sucesso!" | Confirma que ação foi concluída |
| ✅ **Loading state** | Botões desabilitados durante requisição | Previne cliques duplos |
| ✅ **Refresh automático** | Lista atualiza após exclusão | Mantém UI sincronizada |
| ❌ **Sem confirmação** | Exclusão imediata | Usuário pode excluir por engano |

### Confirm Dialog Nativo vs. Custom Modal

**Dialog Nativo (`confirm()`):**
```typescript
if (!confirm('Tem certeza?')) {
    return; // Usuário cancelou
}
// Continua com a exclusão
```

**Vantagens:**
- ✅ Simples de implementar
- ✅ Funciona em todos os navegadores
- ✅ Não requer componentes adicionais

**Desvantagens:**
- ❌ Estilo não customizável
- ❌ Visual não segue design system
- ❌ Blocking (trava navegador)

**Custom Modal (alternativa futura):**
```typescript
const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    data: { message: 'Tem certeza?' }
});

dialogRef.afterClosed().subscribe(result => {
    if (result) {
        // Exclusão confirmada
    }
});
```

**Vantagens:**
- ✅ Totalmente customizável
- ✅ Segue design system
- ✅ Não blocking

**Desvantagens:**
- ❌ Mais código
- ❌ Requer biblioteca (Angular Material, PrimeNG, etc)

### Event Communication Pattern

**Por que renomear `ponyCreated` para `onPonyChange`?**

```typescript
// ❌ Nome específico demais
ponyCreated.emit(); // Em create ✅
ponyCreated.emit(); // Em update ❓ (não "criou")
ponyCreated.emit(); // Em delete ❌ (contraditório)

// ✅ Nome genérico (cobre todos os casos)
onPonyChange.emit(); // Em create ✅
onPonyChange.emit(); // Em update ✅
onPonyChange.emit(); // Em delete ✅
```

**Padrão de nomenclatura:**
- **on + Entity + Action**: `onPonyChange`, `onUserUpdate`, `onOrderDelete`
- Indica que **algo mudou** sem especificar o tipo de mudança
- Consumidor decide como reagir (geralmente: refresh)

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
└── core/
    └── services/
        └── snackbar.service.ts              ← JÁ EXISTE
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

**1. Assinatura do método:**
```typescript
deletePony(ponyId: string): Observable<void>
```
- **`ponyId: string`**: ID do pony a ser removido
- **`Observable<void>`**: Retorna Observable vazio (operação sem retorno de dados)
- **`void`**: DELETE não retorna corpo na resposta (apenas status 200/204)

**2. Endpoint dinâmico:**
```typescript
const endpoint = `${this.apiUrl}/ponies/${ponyId}`;
```
- **Template literal**: Interpola `ponyId` na URL
- Exemplo: `http://localhost:3000/ponies/abc123`

**3. Autenticação JWT:**
```typescript
const token = LocalStorageHelper.get<string>(LocalStorageKeys.TOKEN);

const options = {
    headers: {
        Authorization: `Bearer ${token}`,
    },
};
```
- Mesmo padrão dos outros métodos (GET, POST, PUT)
- Backend valida token antes de permitir exclusão

**4. Requisição DELETE:**
```typescript
return this.http.delete<void>(endpoint, options)
```
- **`delete<void>`**: Método HTTP DELETE
- **`<void>`**: Tipagem explícita (sem corpo de resposta)
- **`options`**: Contém headers de autenticação

**5. Tratamento de erro:**
```typescript
.pipe(
    catchError((error) => {
        return throwError(() => error);
    }),
)
```
- **`catchError`**: Intercepta erros HTTP (401, 404, 500)
- **`throwError`**: Propaga erro para o subscriber
- Subscriber (`pony-details.component`) trata o erro

**Por que `Observable<void>` e não `Observable<Pony>`?**
```typescript
// DELETE não retorna dados, apenas status HTTP
// 200 OK: Sucesso (recurso deletado)
// 204 No Content: Sucesso (sem corpo)
// 404 Not Found: Pony não existe
// 401 Unauthorized: Token inválido
```

---

## 🛠️ Passo 2: Implementar Remoção no Componente

### 2.1. Injetar SnackbarService

Edite `web/src/app/features/ponies/components/pony-details/pony-details.component.ts`:

**Adicionar import:**
```typescript
import { SnackbarService } from '@core/services/snackbar.service';
```

**Injetar o serviço (após `ponyService`):**
```typescript
export class PonyDetailsComponent {
    private ponyService = inject(PonyService);
    private snackbarService = inject(SnackbarService); // ← ADICIONAR
```

### 2.2. Implementar o Método `removePony()`

Substitua o método vazio por esta implementação completa:

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
            this.onPonyChange.emit(); // Notifica lista para recarregar
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

**1. Guard Clause (Validação Inicial):**
```typescript
const pony = this.ponyDetails();
if (!pony) return;
```
- **`ponyDetails()`**: Acessa o signal (pode ser `null`)
- **Early return**: Se não há pony, não faz nada
- **Defensive programming**: Previne erros no código abaixo

**2. Confirmação do Usuário:**
```typescript
if (!confirm(`Tem certeza que deseja remover ${pony.name}?`)) {
    return;
}
```
- **`confirm()`**: Abre dialog nativo do navegador
- **Retorno**: `true` (OK) ou `false` (Cancel)
- **Early return**: Se cancelou, não continua

**Fluxo visual:**
```
┌───────────────────────────────────┐
│ Tem certeza que deseja remover    │
│ Rainbow Dash?                     │
│                                   │
│      [Cancel]      [OK]           │
└───────────────────────────────────┘
         ↓              ↓
      return      Continua
```

**3. Ativar Loading State:**
```typescript
this.isLoading.set(true);
```
- **Antes da requisição**: Desabilita botões
- Previne múltiplos cliques (double-click bug)
- Indica visualmente que operação está em andamento

**4. Requisição HTTP DELETE:**
```typescript
this.ponyService.deletePony(pony.id).subscribe({ ... })
```
- **`pony.id`**: ID do pony a ser removido
- **`subscribe()`**: Executa a requisição (Observable é lazy)
- **`next`**: Callback de sucesso
- **`error`**: Callback de erro

**5. Sucesso (`next`):**
```typescript
next: () => {
    this.snackbarService.success(`${pony.name} removido com sucesso!`);
    this.onPonyChange.emit(); // Notifica lista para recarregar
    this.closeDetails();
}
```

**Ordem importa:**
1. **Snackbar**: Feedback visual de sucesso
2. **Emit evento**: Notifica componente pai (lista) para refresh
3. **Fechar sidesheet**: Remove de tela

**Por que não precisa `isLoading.set(false)` aqui?**
- `closeDetails()` já reseta o componente
- Sidesheet fecha, estado é limpo

**6. Erro (`error`):**
```typescript
error: (error) => {
    console.error('Erro ao remover pony:', error);
    this.snackbarService.error('Erro ao remover pony. Tente novamente.');
    this.isLoading.set(false);
}
```

**Ordem importa:**
1. **Log no console**: Ajuda debug (desenvolvedor vê detalhes)
2. **Snackbar de erro**: Feedback visual para usuário
3. **Desabilitar loading**: Reabilita botões (permite retry)

**Por que `isLoading.set(false)` aqui?**
- Erro não fecha o sidesheet
- Usuário pode tentar novamente
- Botões precisam ser reabilitados

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

**Botão de atualizar (já modificado em aulas anteriores, garantir que tem):**
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

**1. Property Binding `[disabled]`:**
```html
[disabled]="isLoading()"
```
- **`[disabled]`**: Property binding (atributo DOM)
- **`isLoading()`**: Acessa signal (retorna boolean)
- **Reativo**: Quando `isLoading` muda, atributo atualiza automaticamente

**2. Estados do botão:**

| Estado | `isLoading()` | `disabled` | Comportamento |
|--------|--------------|-----------|---------------|
| **Ocioso** | `false` | `false` | Botão clicável |
| **Loading** | `true` | `true` | Botão desabilitado |

**3. Por que desabilitar TODOS os botões?**
```typescript
// Durante DELETE, usuário não pode:
// ❌ Clicar em "Deletar" novamente (double-click)
// ❌ Clicar em "Atualizar" (conflito de operações)
// ❌ Clicar em "Fechar" (operação em andamento)

// Após conclusão (sucesso ou erro):
// ✅ Sucesso: Sidesheet fecha automaticamente
// ✅ Erro: Botões são reabilitados (permite retry)
```

---

## 🛠️ Passo 4: Estilizar Botões Desabilitados

### 4.1. Adicionar Estilos de Disabled

Edite `web/src/app/features/ponies/components/pony-details/pony-details.component.scss`:

Encontre a classe `.details__trash-button` e modifique:

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

**1. Cursor Pointer:**
```scss
cursor: pointer;
```
- **Feedback visual**: Indica que elemento é clicável
- Aparece a "mãozinha" ao passar o mouse

**2. Hover Condicional:**
```scss
&:hover:not(:disabled)
```

**Antes:**
```scss
&:hover { ... } // Aplicava hover mesmo quando disabled
```

**Depois:**
```scss
&:hover:not(:disabled) { ... } // Só aplica se NÃO estiver disabled
```

**Por quê?**
- Botões desabilitados não devem ter hover effect
- `:not(:disabled)` garante que hover só funciona quando clicável

**3. Estilos de Disabled:**
```scss
&:disabled {
    opacity: 0.5;         // Visual "apagado" (50% transparente)
    cursor: not-allowed;  // Cursor de "proibido"
}
```

**Estados visuais:**

| Estado | `opacity` | `cursor` | Hover |
|--------|----------|----------|-------|
| **Normal** | `1.0` | `pointer` | ✅ Sim |
| **Disabled** | `0.5` | `not-allowed` | ❌ Não |

**Cursor `not-allowed`:**
```
    Normal          Disabled
   ┌─────┐         ┌─────┐
   │ 👆  │         │ 🚫  │
   └─────┘         └─────┘
   pointer       not-allowed
```

---

## 🛠️ Passo 5: Renomear Eventos para `onPonyChange`

### 5.1. Modificar CreatePonyComponent

Edite `web/src/app/features/ponies/components/create-pony/create-pony.component.ts`:

**Declaração do output:**
```typescript
export class CreatePonyComponent {
    // ... outros signals

    onPonyChange = output<void>(); // ← RENOMEAR (era ponyCreated)

    // ...
}
```

**Emissão no método `createPony()`:**
```typescript
createPony(formData: PonyFormData): void {
    this.ponyService.createPony(formData).subscribe({
        next: (pony) => {
            this.snackbarService.success(`${pony.name} cadastrado com sucesso!`);
            this.onPonyChange.emit(); // ← RENOMEAR (era ponyCreated)
            this.closeForm();
            this.isLoading.set(false);
        },
        // ...
    });
}
```

**Emissão no método `updatePony()`:**
```typescript
updatePony(ponyId: string, formData: PonyFormData): void {
    this.ponyService.updatePony(ponyId, formData).subscribe({
        next: (pony) => {
            this.snackbarService.success(`${pony.name} atualizado com sucesso!`);
            this.onPonyChange.emit(); // ← RENOMEAR (era ponyCreated)
            this.closeForm();
            this.isLoading.set(false);
        },
        // ...
    });
}
```

### 5.2. Modificar PonyDetailsComponent

Edite `web/src/app/features/ponies/components/pony-details/pony-details.component.ts`:

**Declaração do output:**
```typescript
export class PonyDetailsComponent {
    // ... outros signals

    onPonyChange = output<void>(); // ← RENOMEAR (era ponyCreated)

    // ...
}
```

**Emissão já está no `removePony()` (implementado no Passo 2):**
```typescript
next: () => {
    this.snackbarService.success(`${pony.name} removido com sucesso!`);
    this.onPonyChange.emit(); // ✅ JÁ RENOMEADO
    this.closeDetails();
}
```

### 5.3. Conectar Eventos no Template da Lista

Edite `web/src/app/features/ponies/pages/list/list.component.html`:

**Componente `pony-details`:**
```html
<pony-details
    #ponyDetails
    [createPonyRef]="createPony"
    (onPonyChange)="getData()" <!-- ← ADICIONAR (não tinha evento antes) -->
/>
```

**Componente `create-pony`:**
```html
<create-pony
    #createPony
    (onPonyChange)="getData()" <!-- ← RENOMEAR (era ponyCreated) -->
/>
```

### 📝 Explicação da Arquitetura de Eventos

**Fluxo completo de comunicação:**

```
┌─────────────────────────────────────────────────────────────────┐
│                      list.component.html                        │
│                                                                 │
│  ┌───────────────────┐          ┌──────────────────────┐       │
│  │  create-pony      │          │  pony-details        │       │
│  │ (onPonyChange)───┼──────┐    │ (onPonyChange)──────┼──┐    │
│  └───────────────────┘      │    └──────────────────────┘  │    │
│                             ↓                               ↓    │
│                        getData()                      getData()  │
└─────────────────────────────────────────────────────────────────┘
                                  ↓
                          API GET /ponies
                          Refresh lista
```

**Por que ambos emitem `onPonyChange`?**

1. **create-pony**: 
   - Emite após **criar** novo pony
   - Emite após **atualizar** pony existente
   
2. **pony-details**:
   - Emite após **deletar** pony

3. **list.component**:
   - Escuta ambos eventos
   - Chama `getData()` para refresh
   - Lista sempre sincronizada

**Por que `onPonyChange` é melhor que `ponyCreated`?**

| Evento | Create | Update | Delete | Semântica |
|--------|--------|--------|--------|-----------|
| `ponyCreated` | ✅ Faz sentido | ❓ Estranho | ❌ Contraditório | Específico demais |
| `onPonyChange` | ✅ Mudou | ✅ Mudou | ✅ Mudou | Genérico e correto |

---

## ✅ Testando a Implementação

### Cenário 1: Exclusão com Sucesso

**Pré-requisitos:**
- Backend rodando (`http://localhost:3000`)
- Usuário logado
- Pelo menos 1 pony cadastrado

**Passos:**
1. Acesse a lista de ponies
2. Clique em um card para abrir detalhes
3. Clique no botão de deletar (ícone de lixeira)
4. **Resultado esperado**: Dialog de confirmação aparece

**Dialog:**
```
┌─────────────────────────────────────┐
│ Tem certeza que deseja remover      │
│ Rainbow Dash?                       │
│                                     │
│      [Cancel]           [OK]        │
└─────────────────────────────────────┘
```

5. Clique em **OK**
6. **Resultado esperado**:
   - Todos os botões ficam desabilitados (opacity 50%, cursor not-allowed)
   - Requisição DELETE é enviada
   - Snackbar verde aparece: "Rainbow Dash removido com sucesso!"
   - Sidesheet fecha automaticamente
   - **Lista atualiza** (pony removido não aparece mais)

**Verificar no console:**
```javascript
// NetWork tab (DevTools)
DELETE http://localhost:3000/ponies/abc123
Status: 200 OK
Headers: Authorization: Bearer ...
```

### Cenário 2: Cancelar Exclusão

**Passos:**
1. Abra detalhes de um pony
2. Clique no botão de deletar
3. Clique em **Cancel** no dialog
4. **Resultado esperado**:
   - Nada acontece
   - Sidesheet continua aberto
   - Nenhuma requisição é enviada (verificar Network tab)
   - Botões continuam habilitados

### Cenário 3: Erro na Exclusão (Backend Offline)

**Passos:**
1. **Desligue o backend** (Ctrl+C no terminal da API)
2. Tente deletar um pony
3. Confirme no dialog (OK)
4. **Resultado esperado**:
   - Botões ficam desabilitados
   - Requisição falha (Network error)
   - Snackbar vermelho: "Erro ao remover pony. Tente novamente."
   - **Botões são reabilitados** (pode tentar novamente)
   - Sidesheet **continua aberto**
   - Console mostra erro detalhado

**Console:**
```
Erro ao remover pony: HttpErrorResponse {
    status: 0,
    statusText: "Unknown Error",
    message: "Http failure response for http://localhost:3000/ponies/abc123: 0 Unknown Error"
}
```

5. **Ligue o backend novamente**
6. Clique em deletar novamente
7. **Resultado esperado**: Agora funciona (cenário 1)

### Cenário 4: Erro 404 (Pony Não Existe)

**Simular:**
```bash
# No backend, delete manualmente um pony do banco
# Ou use outro cliente para deletar antes
```

**Passos:**
1. Liste ponies (cache ainda mostra o pony)
2. Abra detalhes do pony já deletado
3. Tente deletar novamente
4. **Resultado esperado**:
   - Snackbar de erro aparece
   - Console mostra `status: 404`

### Cenário 5: Múltiplos Cliques (Double-click Prevention)

**Passos:**
1. Abra detalhes de um pony
2. **Clique rapidamente 5x no botão de deletar**
3. Confirme no dialog
4. **Resultado esperado**:
   - Apenas **1 requisição** é enviada (verificar Network tab)
   - Botão fica desabilitado após primeiro clique
   - `[disabled]="isLoading()"` previne cliques adicionais

### Cenário 6: Interação com Outros Botões Durante Loading

**Passos:**
1. Inicie uma exclusão (confirme no dialog)
2. **Tente rapidamente clicar em:**
   - Botão "Atualizar"
   - Botão "Fechar"
3. **Resultado esperado**:
   - Nenhum botão responde (todos disabled)
   - Cursor muda para `not-allowed`
   - Hover effect não funciona

### Cenário 7: Lista Atualiza Automaticamente

**Setup:**
- Tenha exatamente 3 ponies cadastrados

**Passos:**
1. Liste os 3 ponies (contagem: 3)
2. Delete o primeiro pony
3. **Resultado esperado**:
   - Lista agora mostra apenas 2 ponies
   - Pony deletado não aparece mais
   - Ordem dos cards permanece consistente
   - Nenhum refresh manual necessário

**Como funciona:**
```typescript
// pony-details.component.ts
this.onPonyChange.emit(); // Notifica pai

// list.component.html
(onPonyChange)="getData()" // Escuta evento

// list.component.ts
getData(): void {
    this.ponyService.getPonyList().subscribe(...); // Recarrega lista
}
```

---

## 🎓 Conceitos Avançados

### 1. Por que `Observable<void>` em DELETE?

**DELETE não retorna dados:**
```typescript
// ❌ Backend não retorna o pony deletado
DELETE /ponies/123
Response: 200 OK (body vazio)

// ❌ Isso NÃO acontece:
Response: {
    "id": "123",
    "name": "Rainbow Dash",
    "deleted": true
}
```

**Razões:**
- Recurso foi **destruído** (não existe mais)
- Retornar dados de algo que não existe é contraditório
- Status HTTP já indica sucesso (`200 OK` ou `204 No Content`)

**Tipagem correta:**
```typescript
// ✅ Observable<void> (sem dados)
deletePony(id: string): Observable<void> {
    return this.http.delete<void>(...);
}

// ❌ Observable<Pony> (errado - DELETE não retorna Pony)
deletePony(id: string): Observable<Pony> {
    return this.http.delete<Pony>(...); // TypeScript error
}
```

### 2. Event Naming Best Practices

**Convenções de nomenclatura:**

| Padrão | Exemplo | Uso |
|--------|---------|-----|
| **on + Action** | `onClick`, `onSubmit` | Ação específica do usuário |
| **on + Entity + Action** | `onPonyChange`, `onUserUpdate` | Mudança de estado de entidade |
| **Entity + ActionPast** | `ponyCreated`, `userDeleted` | Ação específica já concluída |

**Para este caso:**

```typescript
// ❌ Muito específico (só faz sentido para create)
ponyCreated = output<void>();

// ❌ Muito genérico (não indica o que mudou)
changed = output<void>();

// ✅ Balanceado (indica entidade e tipo de mudança)
onPonyChange = output<void>();
```

**Quando usar cada padrão:**

- **`on + Action`**: Eventos de UI (click, hover, submit)
  ```typescript
  onClick = output<MouseEvent>();
  onHover = output<void>();
  ```

- **`on + Entity + Action`**: Mudanças de domínio (CRUD)
  ```typescript
  onPonyChange = output<void>();  // Create, Update, Delete
  onFilterChange = output<string>(); // Filtro mudou
  ```

- **`Entity + ActionPast`**: Auditoria/histórico
  ```typescript
  ponyCreated = output<Pony>();   // Log específico
  ponyDeleted = output<string>(); // ID para rollback
  ```

### 3. Guard Clauses e Early Returns

**Padrão Guard Clause:**
```typescript
removePony(): void {
    // Guard 1: Validação de dados
    const pony = this.ponyDetails();
    if (!pony) return;

    // Guard 2: Confirmação do usuário
    if (!confirm(`Tem certeza que deseja remover ${pony.name}?`)) {
        return;
    }

    // Happy path (código principal)
    this.isLoading.set(true);
    this.ponyService.deletePony(pony.id).subscribe({ ... });
}
```

**Por que é melhor que nested if?**

**❌ Nested if (difícil de ler):**
```typescript
removePony(): void {
    const pony = this.ponyDetails();
    if (pony) { // +1 indentação
        if (confirm(`Tem certeza?`)) { // +2 indentação
            this.isLoading.set(true); // +3 indentação
            this.ponyService.deletePony(pony.id).subscribe({ // +4 indentação
                // ...
            });
        }
    }
}
```

**✅ Guard clause (fácil de ler):**
```typescript
removePony(): void {
    const pony = this.ponyDetails();
    if (!pony) return; // ← Erro: sai cedo

    if (!confirm(`Tem certeza?`)) {
        return; // ← Cancelado: sai cedo
    }

    // ← Happy path: indentação mínima
    this.isLoading.set(true);
    this.ponyService.deletePony(pony.id).subscribe({ ... });
}
```

**Vantagens:**
- ✅ **Menos indentação**: Código mais legível
- ✅ **Erros primeiro**: Falhas são tratadas no topo
- ✅ **Happy path ao final**: Lógica principal fica visível
- ✅ **Separação clara**: Validações vs. lógica de negócio

### 4. Loading State Management (Assimetria)

**Padrão assimétrico de loading:**

```typescript
removePony(): void {
    // ...confirmações...

    this.isLoading.set(true); // ← ALWAYS set before request

    this.ponyService.deletePony(pony.id).subscribe({
        next: () => {
            // ❌ NÃO set isLoading.set(false) aqui
            // ✅ closeDetails() já reseta o componente
            this.closeDetails();
        },
        error: () => {
            // ✅ MUST set isLoading.set(false) aqui
            // ❌ Componente não fecha, precisa reabilitar
            this.isLoading.set(false);
        },
    });
}
```

**Por que assimétrico?**

| Cenário | `isLoading.set(false)` necessário? | Por quê? |
|---------|--------------------------------------|----------|
| **Sucesso** | ❌ Não | `closeDetails()` reseta tudo |
| **Erro** | ✅ Sim | Componente continua aberto, precisa reabilitar |

**Se fosse simétrico (errado):**
```typescript
next: () => {
    this.snackbarService.success(...);
    this.onPonyChange.emit();
    this.isLoading.set(false); // ← Desnecessário (closeDetails faz isso)
    this.closeDetails();
}
```

**Melhor abordagem (finalize operator):**
```typescript
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

### 5. Confirm Dialog: Native vs. Custom

**Comparação técnica:**

| Aspecto | Native `confirm()` | Custom Modal (Angular Material) |
|---------|-------------------|----------------------------------|
| **Sícrono** | ✅ Blocking (trava código) | ❌ Assíncrono (Observable) |
| **Estilo** | ❌ Browser default | ✅ Customizável (CSS) |
| **Acessibilidade** | ✅ Boa (nativo) | ⚠️ Depende da implementação |
| **Complexidade** | ✅ 1 linha de código | ❌ Componente + service + module |
| **Bundle size** | ✅ Zero bytes | ❌ +50KB (library) |
| **Testing** | ⚠️ Difícil (mockar window.confirm) | ✅ Fácil (mockar dialog service) |

**Native confirm():**
```typescript
// Síncrono - código espera resposta
if (!confirm('Tem certeza?')) {
    return; // Usuário cancelou
}
// Continua execução
```

**Custom Modal (Angular Material):**
```typescript
// Assíncrono - usa Observable
const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    data: { title: 'Confirmar', message: 'Tem certeza?' }
});

dialogRef.afterClosed().subscribe(result => {
    if (result) {
        // Usuário confirmou (depois de fechar dialog)
    }
});
```

**Trade-off (quando usar cada um):**

- **Native confirm()**: 
  - ✅ MVPs, protótipos
  - ✅ Admin panels internos
  - ✅ Quando design system não importa
  
- **Custom Modal**:
  - ✅ Produtos de consumo (UX é crítico)
  - ✅ Quando precisa branding consistente
  - ✅ Quando precisa funcionalidades extras (checkbox "não perguntar novamente")

### 6. Por que Não Fazer Soft Delete no Frontend?

**Soft Delete (backend):**
```typescript
// Backend marca como deletado (não remove do banco)
UPDATE ponies SET deleted_at = NOW() WHERE id = 123;
```

**Hard Delete (backend):**
```typescript
// Backend remove fisicamente do banco
DELETE FROM ponies WHERE id = 123;
```

**Frontend não deve saber a diferença:**
```typescript
// ✅ Frontend só sabe que "removeu"
this.ponyService.deletePony(id).subscribe(...);

// ❌ Frontend NÃO deve fazer:
this.ponyService.softDeletePony(id).subscribe(...);
this.ponyService.hardDeletePony(id).subscribe(...);
```

**Por quê?**
- **Responsabilidade**: Soft vs. Hard delete é regra de negócio (backend)
- **Flexibilidade**: Backend pode mudar implementação sem quebrar frontend
- **Simplicidade**: Frontend só se importa com "foi removido" (resultado)

**REST é sobre recursos, não implementação:**
```http
DELETE /ponies/123  ← Frontend envia
                    ← Backend decide: soft ou hard delete
```

---

## 📦 Resumo dos Arquivos Modificados

| Arquivo | Ação | O que foi feito |
|---------|------|-----------------|
| `pony.service.ts` | ✏️ MODIFICADO | Adicionado método `deletePony()` com HTTP DELETE |
| `pony-details.component.ts` | ✏️ MODIFICADO | Injetado `SnackbarService`, implementado `removePony()`, renomeado output para `onPonyChange` |
| `pony-details.component.html` | ✏️ MODIFICADO | Adicionado `[disabled]="isLoading()"` em todos os botões do footer |
| `pony-details.component.scss` | ✏️ MODIFICADO | Adicionado `cursor: pointer`, hover condicional, estilos de disabled |
| `create-pony.component.ts` | ✏️ MODIFICADO | Renomeado output de `ponyCreated` para `onPonyChange` |
| `list.component.html` | ✏️ MODIFICADO | Adicionado `(onPonyChange)="getData()"` no pony-details, renomeado evento no create-pony |

---

## 🎯 Checklist de Conclusão

### Service Layer
- ✅ Método `deletePony(id: string): Observable<void>` implementado
- ✅ Endpoint dinâmico com template literal (`/ponies/${id}`)
- ✅ Autenticação JWT no header
- ✅ Tratamento de erro com `catchError`

### Component Logic
- ✅ `SnackbarService` injetado
- ✅ Método `removePony()` implementado com guard clauses
- ✅ Confirmação do usuário com `confirm()` nativo
- ✅ Loading state ativado antes da requisição
- ✅ Feedback de sucesso com snackbar
- ✅ Feedback de erro com snackbar e console.error
- ✅ Evento `onPonyChange` emitido após sucesso
- ✅ Sidesheet fecha após sucesso
- ✅ Loading desabilitado após erro (permite retry)

### Template & Styles
- ✅ Botão de deletar com `[disabled]="isLoading()"`
- ✅ Botão de fechar com `[disabled]="isLoading()"`
- ✅ Botão de atualizar com `[disabled]="isLoading()"`
- ✅ Estilos de disabled (`opacity`, `cursor: not-allowed`)
- ✅ Hover condicional (`:hover:not(:disabled)`)
- ✅ Cursor pointer no estado normal

### Event Architecture
- ✅ Output renomeado de `ponyCreated` para `onPonyChange` (create-pony)
- ✅ Output renomeado de `ponyCreated` para `onPonyChange` (pony-details)
- ✅ Evento `(onPonyChange)="getData()"` conectado no pony-details
- ✅ Evento `(onPonyChange)="getData()"` conectado no create-pony
- ✅ Lista atualiza automaticamente após qualquer operação

### Testing
- ✅ Exclusão com sucesso testada
- ✅ Cancelamento de exclusão testado
- ✅ Erro de rede testado (backend offline)
- ✅ Double-click prevention testado
- ✅ Botões desabilitados durante loading testado
- ✅ Refresh automático da lista testado

---

## 📚 Referências

- [Angular HttpClient - DELETE](https://angular.io/guide/http#making-a-delete-request)
- [RxJS catchError](https://rxjs.dev/api/operators/catchError)
- [RxJS finalize](https://rxjs.dev/api/operators/finalize)
- [Angular Signals](https://angular.dev/guide/signals)
- [Window.confirm() - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/confirm)
- [REST API Best Practices - DELETE](https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/#h-delete-removes-data)
- [Guard Clauses (Martin Fowler)](https://refactoring.com/catalog/replaceNestedConditionalWithGuardClauses.html)
- [Angular Material Dialog](https://material.angular.io/components/dialog/overview)

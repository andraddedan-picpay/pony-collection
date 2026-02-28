# 📘 Aula 14 — Detalhes do Pônei

**Progresso do Curso Frontend:** `[█████████████████░░░] 84% concluído`

## Objetivo

Implementar o **componente de detalhes** que exibe informações completas de um pony individual, integrando com a API através do método `getPonyById()`, gerenciando estados de loading e erro com **signals**, e utilizando o **Sidesheet** criado anteriormente para apresentar as informações de forma elegante.

---

## 🎯 O que vamos construir

- **Método `getPonyById()`**: Busca dados específicos de um pony na API
- **PonyDetailsComponent**: Componente standalone com gerenciamento de estado
- **Template Variables**: Referência ao componente filho via `#ponyDetails`
- **Event Binding**: Passagem de `pony.id` ao clicar em "Ver detalhes"
- **Estados de Loading/Erro**: Feedback visual durante requisição
- **Integração completa**: Fluxo da listagem até os detalhes

---

## 📋 Conceitos Importantes

### Template Reference Variables

**Template Reference Variable** (`#nome`) permite acessar componentes filhos:

```html
<pony-details #ponyDetails />

<!-- Acessa métodos públicos do componente -->
<button (click)="ponyDetails.openDetails('123')">Ver</button>
```

**Por que usar:**
- ✅ Sem criar `@ViewChild` no TypeScript
- ✅ Acesso direto no template
- ✅ Comunicação simplificada entre componentes

### Signals com Tipos Union

```typescript
ponyDetails = signal<Pony | null>(null);
```

**`Pony | null` significa:**
- Pode ser um objeto do tipo `Pony`
- Pode ser `null` (valor inicial ou erro)

**No template:**
```html
@if (ponyDetails()) {
    <!-- TypeScript sabe que aqui NÃO é null -->
    {{ ponyDetails()!.name }}
}
```

**Non-null assertion operator (`!`):**
- `ponyDetails()!` informa ao TypeScript: "confie em mim, não é null"
- Só use dentro de `@if` que já verifica nullability

### GET por ID vs. GET All

| Aspecto | GET /ponies | GET /ponies/:id |
|---------|-------------|-----------------|
| **Payload** | Array completo | Objeto único |
| **Performance** | ❌ Mais dados | ✅ Apenas necessário |
| **Cache** | Lista geral | Item específico |
| **Caso de uso** | Listagem | Detalhes |

**Por que não reusar dados da lista?**
```typescript
// ❌ Não escalável
const pony = ponyList.find(p => p.id === id);

// ✅ Sempre atualizado, funciona com deep links
this.service.getPonyById(id).subscribe(...);
```

---

## 📂 Estrutura de Arquivos

```
web/src/app/
├── features/
│   └── ponies/
│       ├── components/
│       │   └── pony-details/
│       │       ├── pony-details.component.ts    ← MODIFICAR
│       │       ├── pony-details.component.html  ← MODIFICAR
│       │       └── pony-details.component.scss  ← (já existe)
│       ├── services/
│       │   └── pony.service.ts                  ← MODIFICAR
│       └── pages/
│           └── list/
│               ├── list.component.ts            ← MODIFICAR
│               └── list.component.html          ← MODIFICAR
```

---

## 🛠️ Passo 1: Adicionar Método getPonyById no Service

### 1.1. Implementar o Método

Atualize `web/src/app/features/ponies/services/pony.service.ts`:

```typescript
getPonyById(ponyId: string): Observable<Pony> {
    const endpoint = `${this.apiUrl}/ponies/${ponyId}`;
    const token = LocalStorageHelper.get<string>(LocalStorageKeys.TOKEN);

    const options = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    return this.http.get<Pony>(endpoint, options).pipe(
        catchError((error) => {
            return throwError(() => error);
        }),
    );
}
```

### 📝 Explicação do Método

**1. Endpoint dinâmico:**
```typescript
const endpoint = `${this.apiUrl}/ponies/${ponyId}`;
```
- **Template literal** com interpolação
- Exemplo: `http://localhost:3000/ponies/abc123`
- O `ponyId` é passado como parâmetro da função

**2. Retorno tipado:**
```typescript
return this.http.get<Pony>(endpoint, options)
```
- **`<Pony>`**: TypeScript sabe que retorna **objeto único** (não array)
- Diferente de `getPonyList()` que retorna `<Pony[]>`

**3. Autenticação:**
```typescript
headers: {
    Authorization: `Bearer ${token}`,
}
```
- **Mesmo padrão** dos outros métodos
- Backend valida token e retorna 401 se inválido

**4. Tratamento de erro:**
```typescript
.pipe(
    catchError((error) => {
        return throwError(() => error);
    }),
)
```
- **404**: Pony não encontrado
- **401**: Token inválido/expirado
- **500**: Erro no servidor

---

## 🛠️ Passo 2: Implementar o Componente PonyDetails

### 2.1. Modificar o TypeScript

Atualize `web/src/app/features/ponies/components/pony-details/pony-details.component.ts`:

```typescript
import { CommonModule } from '@angular/common';
import { Component, signal, output, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { PonyButtonComponent } from '@app/shared/components/pony-button/pony-button.component';
import { PonySidesheetComponent } from '@app/shared/components/sidesheet/sidesheet.component';
import { SvgIconComponent } from 'angular-svg-icon';
import { PonyService } from '../../services/pony.service';
import { Pony } from '../../models/pony.model';

@Component({
    selector: 'pony-details',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        PonySidesheetComponent,
        PonyButtonComponent,
        SvgIconComponent,
    ],
    templateUrl: './pony-details.component.html',
    styleUrl: './pony-details.component.scss',
})
export class PonyDetailsComponent {
    private ponyService = inject(PonyService);

    showDetails = signal<boolean>(false);
    isLoading = signal<boolean>(false);
    ponyDetails = signal<Pony | null>(null);

    ponyCreated = output<void>();

    openDetails(ponyId: string): void {
        this.showDetails.set(true);
        this.isLoading.set(true);
        this.ponyDetails.set(null);

        this.ponyService.getPonyById(ponyId).subscribe({
            next: (pony) => {
                this.ponyDetails.set(pony);
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
                this.closeDetails();
            },
        });
    }

    closeDetails(): void {
        this.showDetails.set(false);
        this.ponyDetails.set(null);
    }

    removePony(): void {
        // Lógica para remover o pony
    }
}
```

### 📝 Explicação do Componente

**1. Imports necessários:**
```typescript
import { PonyService } from '../../services/pony.service';
import { Pony } from '../../models/pony.model';
```
- **`PonyService`**: Para fazer requisição HTTP
- **`Pony`**: Interface de tipagem dos dados

**2. Injeção do Service:**
```typescript
private ponyService = inject(PonyService);
```
- **`inject()`**: Função moderna de DI (Angular 14+)
- **`private`**: Não acessível no template (apenas métodos públicos)

**3. Signals de Estado:**
```typescript
showDetails = signal<boolean>(false);
isLoading = signal<boolean>(false);
ponyDetails = signal<Pony | null>(null);
```

**Estado de cada signal:**
- **`showDetails`**: Controla se o sidesheet está aberto
- **`isLoading`**: Indica se há requisição em andamento
- **`ponyDetails`**: Armazena os dados do pony (ou `null` se não carregou)

**Por que `Pony | null`?**
```typescript
// Estado inicial
ponyDetails = null

// Durante loading
ponyDetails = null  // Limpa dados anteriores

// Após sucesso
ponyDetails = { id: '123', name: 'Rainbow', ... }

// Após erro
ponyDetails = null  // Não tem dados para exibir
```

**4. Método openDetails():**
```typescript
openDetails(ponyId: string): void {
    this.showDetails.set(true);        // 1. Abre sidesheet
    this.isLoading.set(true);          // 2. Ativa loading
    this.ponyDetails.set(null);        // 3. Limpa dados antigos

    this.ponyService.getPonyById(ponyId).subscribe({
        next: (pony) => {
            this.ponyDetails.set(pony);      // 4a. Sucesso: armazena dados
            this.isLoading.set(false);       // 5a. Desativa loading
        },
        error: () => {
            this.isLoading.set(false);       // 4b. Erro: desativa loading
            this.closeDetails();             // 5b. Fecha sidesheet
        },
    });
}
```

**Fluxo de execução:**

**Cenário de Sucesso:**
1. `showDetails = true` → Sidesheet aparece
2. `isLoading = true` → Mostra "Carregando..."
3. `ponyDetails = null` → Limpa dados do pony anterior
4. Requisição HTTP iniciada
5. **Resposta OK** → Armazena dados
6. `isLoading = false` → Esconde loading, mostra dados

**Cenário de Erro:**
1. `showDetails = true` → Sidesheet aparece
2. `isLoading = true` → Mostra "Carregando..."
3. `ponyDetails = null` → Limpa dados do pony anterior
4. Requisição HTTP iniciada
5. **Erro 404/500** → Entra no `error` callback
6. `isLoading = false` → Desativa loading
7. `closeDetails()` → Fecha sidesheet automaticamente

**Por que limpar dados antigos?**
```typescript
this.ponyDetails.set(null);  // ← Importante!

// Sem isso:
// 1. Abre detalhes do Pony A
// 2. Fecha
// 3. Abre detalhes do Pony B
// 4. Por 1 segundo, mostra dados do Pony A (errado!)
// 5. Depois carrega Pony B
```

**5. Método closeDetails():**
```typescript
closeDetails(): void {
    this.showDetails.set(false);  // Fecha sidesheet
    this.ponyDetails.set(null);   // Limpa dados (libera memória)
}
```

**Por que limpar dados ao fechar?**
- ✅ Libera memória (especialmente se tem imagem grande)
- ✅ Próxima abertura sempre mostra loading primeiro
- ✅ Não mantém estado "fantasma" em memória

---

### 2.2. Modificar o Template

Atualize `web/src/app/features/ponies/components/pony-details/pony-details.component.html`:

```html
<sidesheet
    [(isOpen)]="showDetails"
    [title]="'Detalhes'"
>
    <div class="pony-details">
        @if (isLoading()) {
            <div class="pony-details__loading">
                <p>Carregando...</p>
            </div>
        } @else if (ponyDetails()) {
            <div class="pony-details__box">
                <svg-icon
                    [src]="`assets/icons/heart${ponyDetails()!.isFavorite ? '-filled' : ''}.svg`"
                    class="pony-details__heart"
                    [svgStyle]="{ 'width.px': 34, 'height.px': 34 }"
                />
                <div class="pony-details__image">
                    <img
                        [src]="ponyDetails()!.imageUrl"
                        [alt]="ponyDetails()!.name"
                    />
                </div>
                <div class="pony-details__info">
                    <h2>{{ ponyDetails()!.name }}</h2>
                    <p><strong>Elemento:</strong> {{ ponyDetails()!.element }}</p>
                    <p><strong>Personalidade:</strong> {{ ponyDetails()!.personality }}</p>
                    <p><strong>Talento:</strong> {{ ponyDetails()!.talent }}</p>
                    <p><strong>Resumo:</strong> {{ ponyDetails()!.summary }}</p>
                </div>
            </div>
        }
    </div>

    <div
        sidesheet-footer
        class="pony-details__footer"
    >
        <button
            class="pony-details__trash"
            (click)="removePony()"
            aria-label="Deletar Pony"
            type="button"
        >
            <svg-icon
                src="assets/icons/trash.svg"
                class="icon"
                [svgStyle]="{ 'width.px': 20 }"
            />
        </button>
        <pony-button
            variant="secondary"
            type="button"
            (click)="closeDetails()"
            width="144px"
        >
            Atualizar
        </pony-button>
        <pony-button
            variant="primary"
            type="button"
            (click)="closeDetails()"
            [disabled]="isLoading()"
            width="144px"
            [loading]="isLoading()"
        >
            Fechar
        </pony-button>
    </div>
</sidesheet>
```

### 📝 Explicação do Template

**1. Estrutura Condicional:**
```html
@if (isLoading()) {
    <!-- Estado de loading -->
} @else if (ponyDetails()) {
    <!-- Estado com dados -->
}
```

**Lógica:**
- **`isLoading() === true`**: Mostra "Carregando..."
- **`isLoading() === false && ponyDetails() !== null`**: Mostra dados
- **`isLoading() === false && ponyDetails() === null`**: Não mostra nada (sidesheet fechado ou erro)

**2. Loading State:**
```html
<div class="pony-details__loading">
    <p>Carregando...</p>
</div>
```
- Placeholder temporário enquanto aguarda resposta da API
- Futuramente pode ser um skeleton loader

**3. Ícone de Favorito Dinâmico:**
```html
<svg-icon
    [src]="`assets/icons/heart${ponyDetails()!.isFavorite ? '-filled' : ''}.svg`"
/>
```

**Template literal com expressão ternária:**
```typescript
// Se isFavorite === true
`assets/icons/heart-filled.svg`

// Se isFavorite === false
`assets/icons/heart.svg`
```

**Por que usar template literal no Angular?**
```html
<!-- ✅ Template literal (ES6) -->
[src]="`assets/icons/${icon}.svg`"

<!-- ❌ Concatenação (não funciona) -->
[src]="'assets/icons/' + icon + '.svg'"
```

**4. Non-null Assertion Operator:**
```html
{{ ponyDetails()!.name }}
```

**Por que `!` é necessário:**
```typescript
ponyDetails: Signal<Pony | null>

// TypeScript reclama:
ponyDetails().name  // ❌ Error: Object is possibly 'null'

// Dentro de @if já verificamos que não é null:
@if (ponyDetails()) {
    ponyDetails()!.name  // ✅ Ok: "trust me, não é null aqui"
}
```

**5. Interpolação vs. Property Binding:**
```html
<!-- Interpolação (texto) -->
{{ ponyDetails()!.name }}

<!-- Property Binding (atributos) -->
[src]="ponyDetails()!.imageUrl"
[alt]="ponyDetails()!.name"
```

**Diferenças:**

| Aspecto | `{{ }}` | `[propriedade]` |
|---------|---------|-----------------|
| **Uso** | Texto no DOM | Atributos/propriedades |
| **Tipo** | Sempre string | Qualquer tipo |
| **Contexto** | Dentro de tags | Em atributos |

**6. Footer do Sidesheet:**
```html
<div sidesheet-footer class="pony-details__footer">
```

**`sidesheet-footer`:**
- **Content projection** do componente sidesheet
- Posiciona no rodapé com sticky position
- Visto na Aula 10 (Sidesheet)

**7. Botões de Ação:**
```html
<pony-button
    variant="primary"
    type="button"
    (click)="closeDetails()"
    [disabled]="isLoading()"
    width="144px"
    [loading]="isLoading()"
>
    Fechar
</pony-button>
```

**Propriedades:**
- **`[disabled]="isLoading()"`**: Desabilita durante loading
- **`[loading]="isLoading()"`**: Mostra spinner no botão
- **`(click)="closeDetails()"`**: Event binding

---

## 🛠️ Passo 3: Integrar na Página de Listagem

### 3.1. Atualizar o TypeScript

Atualize `web/src/app/features/ponies/pages/list/list.component.ts`:

```typescript
import { PonyDetailsComponent } from '../../components/pony-details/pony-details.component';

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
        PonyDetailsComponent,  // ← ADICIONAR
    ],
    templateUrl: './list.component.html',
    styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit {
    // ... resto do código
}
```

### 📝 Explicação

**Import do componente:**
```typescript
import { PonyDetailsComponent } from '../../components/pony-details/pony-details.component';
```

**Adicionar no array `imports`:**
```typescript
imports: [
    // ...
    PonyDetailsComponent,  // Torna o componente disponível no template
]
```

**Standalone components:**
- ✅ Não precisa declarar em `NgModule`
- ✅ Importa diretamente onde será usado
- ✅ Melhor tree-shaking (bundle menor)

---

### 3.2. Atualizar o Template

Atualize `web/src/app/features/ponies/pages/list/list.component.html`:

```html
<main-layout (onSearchEvent)="updateFilter($event)">
    <!-- ... breadcrumb e container ... -->

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
                        (viewDetailsEvent)="ponyDetails.openDetails(pony.id)"
                    />
                </div>
            }
            <!-- ... outros estados ... -->
        }
    </div>

    <!-- ... botão create pony ... -->
</main-layout>

<pony-details #ponyDetails />

<create-pony
    #createPony
    (ponyCreated)="getData()"
/>
```

### 📝 Explicação da Integração

**1. Template Reference Variable:**
```html
<pony-details #ponyDetails />
```

**Como funciona:**
- **`#ponyDetails`**: Cria variável local no template
- **Escopo**: Disponível em todo o template do componente
- **Tipo**: Referência à instância do `PonyDetailsComponent`

**2. Event Binding com Método do Componente Filho:**
```html
(viewDetailsEvent)="ponyDetails.openDetails(pony.id)"
```

**Fluxo:**
1. Usuário clica no botão "Ver detalhes" no card
2. Evento `viewDetailsEvent` é emitido (output do pony-card)
3. Chama `ponyDetails.openDetails()` passando `pony.id`
4. Componente `pony-details` faz requisição HTTP
5. Sidesheet abre e mostra os dados

**Por que funciona?**
```typescript
// pony-details.component.ts
export class PonyDetailsComponent {
    openDetails(ponyId: string): void { ... }  // ← Método público
}

// list.component.html
<pony-details #ponyDetails />  // ← Referência à instância

// Acessa método público da instância:
ponyDetails.openDetails(pony.id)  // ✅ Ok
```

**3. Passagem de Parâmetro:**
```html
(viewDetailsEvent)="ponyDetails.openDetails(pony.id)"
                                              ^^^^^^^^
                                              Passa o ID do pony clicado
```

**Contexto do `pony`:**
```html
<pony-card
    *ngFor="let pony of filteredPonyList()"
    <!-- ... -->
    (viewDetailsEvent)="ponyDetails.openDetails(pony.id)"
                                                 ^^^^
                                                 Variável do *ngFor
/>
```

**4. Posicionamento do Componente:**
```html
</main-layout>

<pony-details #ponyDetails />  ← Fora do main-layout

<create-pony #createPony />
```

**Por que fora do `<main-layout>`?**
- Sidesheet tem `position: fixed` (sobrepõe tudo)
- Não precisa estar dentro do layout
- Evita problemas com z-index e overflow

---

## ✅ Testando a Implementação

### Cenário 1: Listar e Ver Detalhes

**Requisitos:**
- Backend rodando
- Pelo menos 1 pony cadastrado

**Passos:**
1. Acesse `http://localhost:4200`
2. Veja a lista de ponies
3. Clique no ícone de olho no card
4. **Resultado esperado**:
   - Sidesheet abre pela direita
   - Mostra "Carregando..." por ~1 segundo
   - Exibe detalhes completos do pony:
     - Imagem grande
     - Nome em destaque
     - Elemento, Personalidade, Talento, Resumo
     - Ícone de coração (filled se favorito)

### Cenário 2: Loading State

**Passos:**
1. Abra DevTools → Network → Throttling → Slow 3G
2. Clique em "Ver detalhes"
3. **Resultado esperado**:
   - Sidesheet abre imediatamente
   - "Carregando..." aparece
   - Requisição demora ~5 segundos (throttling)
   - Botão "Fechar" fica desabilitado e com spinner
   - Após carregar, mostra os dados

### Cenário 3: Erro 404

**Passos:**
1. Abra DevTools → Console
2. Execute:
   ```javascript
   document.querySelector('pony-details').openDetails('id-inexistente')
   ```
3. **Resultado esperado**:
   - Sidesheet abre
   - Mostra "Carregando..." brevemente
   - Requisição retorna 404
   - Sidesheet **fecha automaticamente**
   - Nenhum erro no console do browser

### Cenário 4: Ver Detalhes de Múltiplos Ponies

**Passos:**
1. Clique em "Ver detalhes" do Pony A
2. Veja os dados carregarem
3. Feche o sidesheet
4. Clique em "Ver detalhes" do Pony B
5. **Resultado esperado**:
   - Não mostra dados "fantasma" do Pony A
   - Loading aparece primeiro
   - Depois carrega dados corretos do Pony B

### Cenário 5: Favorito Dinâmico

**Passos:**
1. Favorite um pony na listagem
2. Abra os detalhes desse pony
3. **Resultado esperado**:
   - Ícone de coração **filled** (preenchido) aparece
4. Feche e desfavorite o pony
5. Abra os detalhes novamente
6. **Resultado esperado**:
   - Ícone de coração **outline** (vazio) aparece

---

## 🎓 Conceitos Avançados

### 1. Template Reference Variables vs. @ViewChild

**Template Reference Variable (usado nesta aula):**
```html
<pony-details #ponyDetails />

<button (click)="ponyDetails.openDetails()">Ver</button>
```

**@ViewChild (alternativa no TypeScript):**
```typescript
@ViewChild(PonyDetailsComponent) ponyDetails!: PonyDetailsComponent;

openPonyDetails(id: string): void {
    this.ponyDetails.openDetails(id);
}
```

```html
<pony-details />

<button (click)="openPonyDetails('123')">Ver</button>
```

**Comparação:**

| Aspecto | Template Variable | @ViewChild |
|---------|-------------------|------------|
| **Declaração** | No template | No TypeScript |
| **Acesso** | Apenas no template | TypeScript + template |
| **Lifecycle** | Imediato | Após `ngAfterViewInit` |
| **Uso** | Casos simples | Lógica complexa |

**Quando usar cada um:**
- **Template Variable**: Comunicação simples (chamar método ao clicar)
- **@ViewChild**: Lógica complexa (validações, múltiplos métodos, condicionais)

### 2. Por que não Passar o Objeto Completo?

**❌ Passar objeto completo:**
```html
(viewDetailsEvent)="ponyDetails.openDetails(pony)"
```

```typescript
openDetails(pony: Pony): void {
    this.showDetails.set(true);
    this.ponyDetails.set(pony);  // Usa dados da lista
}
```

**Problemas:**
- ❌ Dados podem estar desatualizados
- ❌ Não funciona com deep linking (`/ponies/123`)
- ❌ Não revalida dados no backend
- ❌ Se outro usuário editou, mostra dados errados

**✅ Passar apenas ID (implementação atual):**
```html
(viewDetailsEvent)="ponyDetails.openDetails(pony.id)"
```

```typescript
openDetails(ponyId: string): void {
    this.showDetails.set(true);
    this.isLoading.set(true);
    
    // Sempre busca no backend (dados frescos)
    this.ponyService.getPonyById(ponyId).subscribe(...);
}
```

**Vantagens:**
- ✅ Sempre dados atualizados
- ✅ Funciona com rotas (`/ponies/:id`)
- ✅ Single source of truth (backend)
- ✅ Validação automática (404 se deletado)

### 3. Padrão de Limpeza de Estado

```typescript
openDetails(ponyId: string): void {
    this.showDetails.set(true);
    this.isLoading.set(true);
    this.ponyDetails.set(null);  // ← Por que limpar?
    
    this.ponyService.getPonyById(ponyId).subscribe(...);
}
```

**Cenário SEM limpeza:**
```
1. Abre Pony A (name: "Rainbow Dash")
2. Fecha sidesheet
3. Abre Pony B (name: "Twilight Sparkle")
4. Por ~1 segundo, mostra "Rainbow Dash" (ERRADO!)
5. Depois carrega "Twilight Sparkle"
```

**Cenário COM limpeza:**
```
1. Abre Pony A (name: "Rainbow Dash")
2. Fecha sidesheet
3. Abre Pony B
4. Limpa dados → ponyDetails = null
5. Mostra "Carregando..."
6. Carrega "Twilight Sparkle" (CORRETO!)
```

**Padrão de limpeza:**
```typescript
closeDetails(): void {
    this.showDetails.set(false);
    this.ponyDetails.set(null);  // Libera memória
}
```

### 4. Error Handling: Fechar vs. Mostrar Feedback

**Implementação atual (fecha automaticamente):**
```typescript
error: () => {
    this.isLoading.set(false);
    this.closeDetails();  // Fecha o sidesheet
}
```

**Alternativa (mostra mensagem de erro):**
```typescript
hasError = signal<boolean>(false);

error: () => {
    this.isLoading.set(false);
    this.hasError.set(true);  // Mantém sidesheet aberto
}
```

```html
@if (isLoading()) {
    <p>Carregando...</p>
} @else if (hasError()) {
    <feedback
        imageName="error"
        title="Erro ao carregar"
        (onRetry)="openDetails(lastPonyId)"
    />
} @else if (ponyDetails()) {
    <!-- Dados -->
}
```

**Trade-offs:**

| Aspecto | Fecha Automaticamente | Mostra Feedback |
|---------|----------------------|-----------------|
| **UX** | ✅ Limpo, sem confusão | ⚠️ Modal com erro |
| **Retry** | ❌ Precisa clicar novamente no card | ✅ Botão "Tentar novamente" |
| **Complexidade** | ✅ Simples | ❌ Mais código |
| **Casos 404** | ✅ Lógico (pony deletado) | ⚠️ Confuso |

**Decisão:**
- Fechar automaticamente é adequado quando erros são raros (404, 500)
- Mostrar feedback é melhor para casos onde usuário pode resolver (sem internet, timeout)

### 5. Singleton Service e Cache de Requisições

**Nosso service é singleton:**
```typescript
@Injectable({ providedIn: 'root' })
export class PonyService { ... }
```

**Implicações:**
- ✅ Uma única instância em toda a aplicação
- ✅ Estado compartilhado (se adicionar cache)

**Implementação de cache (exemplo avançado):**
```typescript
export class PonyService {
    private cache = new Map<string, Pony>();

    getPonyById(ponyId: string): Observable<Pony> {
        // Verifica cache
        const cached = this.cache.get(ponyId);
        if (cached) {
            return of(cached);  // Retorna imediatamente
        }

        // Se não tem cache, busca na API
        return this.http.get<Pony>(`${this.apiUrl}/ponies/${ponyId}`).pipe(
            tap(pony => this.cache.set(ponyId, pony))  // Armazena no cache
        );
    }
}
```

**Vantagens:**
- ✅ Performance (menos requisições)
- ✅ UX melhor (sem loading desnecessário)

**Desvantagens:**
- ⚠️ Dados podem ficar desatualizados
- ⚠️ Precisa invalidar cache ao editar/deletar

---

## 📦 Resumo dos Arquivos Criados/Modificados

| Arquivo | Ação | Responsabilidade |
|---------|------|------------------|
| `pony.service.ts` | ✏️ MODIFICADO | Adicionado método `getPonyById()` |
| `pony-details.component.ts` | ✏️ MODIFICADO | Implementado lógica de busca e estados |
| `pony-details.component.html` | ✏️ MODIFICADO | Template com loading e exibição de dados |
| `list.component.ts` | ✏️ MODIFICADO | Importado `PonyDetailsComponent` |
| `list.component.html` | ✏️ MODIFICADO | Adicionado componente e event binding |

---

## 🎯 Checklist de Conclusão

- ✅ Método `getPonyById()` criado no service
- ✅ Endpoint dinâmico com template literal (`/ponies/${id}`)
- ✅ Signal `ponyDetails` com tipo union (`Pony | null`)
- ✅ Método `openDetails()` recebe ID como parâmetro
- ✅ Loading state funcional (mostra "Carregando...")
- ✅ Error handling fecha sidesheet automaticamente
- ✅ Limpeza de dados ao abrir/fechar (sem dados "fantasma")
- ✅ Template reference variable (`#ponyDetails`) implementada
- ✅ Event binding passa `pony.id` corretamente
- ✅ Non-null assertion operator (`!`) usado corretamente
- ✅ Ícone de favorito dinâmico (filled ou outline)
- ✅ Template com `@if/@else if` para estados
- ✅ Integração completa listagem → detalhes funcional

---

## 📚 Referências

- [Angular Signals](https://angular.io/guide/signals)
- [Template Reference Variables](https://angular.io/guide/template-reference-variables)
- [HttpClient](https://angular.io/guide/http)
- [RxJS Subscribe](https://rxjs.dev/guide/subscription)
- [Non-null Assertion Operator](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#non-null-assertion-operator-postfix-)
- [Template Literals (ES6)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)

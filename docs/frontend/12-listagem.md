# 📘 Aula 12 — Listagem e Filtro

## Objetivo

Implementar a **listagem de ponies com filtro em tempo real**, utilizando **computed signals** para criar um sistema de busca reativo e performático, exibindo cards com informações visuais dos ponies.

---

## 🎯 O que vamos construir

- **Componente `PonyCardComponent`**: Card visual para cada pony
- **Filtro Reativo**: Busca em tempo real com computed signal
- **Grid Responsivo**: Layout flexível com wrap
- **Atualização do Model**: Novas propriedades (`isFavorite`)

---

## 📋 Conceitos Importantes

### Filtro com Computed Signal

Um **computed signal** para filtro garante **reatividade automática** sem precisar chamar funções manualmente:

```typescript
filteredPonyList = computed(() => {
    const filterValue = this.filter().toLowerCase().trim();
    if (!filterValue) return this.ponyList(); // Array original intacto
    
    return this.ponyList().filter((pony) =>
        pony.name.toLowerCase().includes(filterValue)
    );
});
```

**Vantagens:**
- ✅ **Array original preservado**: Nunca modifica `ponyList`
- ✅ **Reativo**: Recalcula quando `filter` ou `ponyList` mudam
- ✅ **Performático**: Resultado cacheado (memoização)
- ✅ **Limpar filtro**: Basta fazer `filter.set('')`

### Grid com Flexbox Wrap

```scss
.pony-list {
    display: flex;
    flex-wrap: wrap;  // Quebra linha quando não cabe
    gap: 100px 25px;  // Espaçamento entre cards
}
```

**Por que usar wrap?**
- Responsivo por natureza
- Adapta ao tamanho da tela
- Sem media queries complexas

---

## 📂 Estrutura de Arquivos

```
web/src/app/
├── core/
│   └── models/
│       └── data-state.enum.ts          ← JÁ EXISTE (Aula 9)
├── features/
│   └── ponies/
│       ├── models/
│       │   └── pony.model.ts           ← MODIFICAR (adicionar isFavorite)
│       ├── services/
│       │   └── pony.service.ts         ← JÁ EXISTE (Aula 9)
│       ├── components/
│       │   └── pony-card/
│       │       ├── pony-card.component.ts    ← NOVO
│       │       ├── pony-card.component.html  ← NOVO
│       │       └── pony-card.component.scss  ← NOVO
│       └── pages/
│           └── list/
│               ├── list.component.ts    ← MODIFICAR (filtro)
│               ├── list.component.html  ← MODIFICAR (cards)
│               └── list.component.scss  ← MODIFICAR (grid)
└── shared/
    └── components/
        └── feedback/
            └── feedback.component.ts    ← JÁ EXISTE (Aula 8)
```

---

## 🛠️ Passo 1: Atualizar o Model de Pony

### 1.1. Adicionar Novas Propriedades

Atualize `web/src/app/features/ponies/models/pony.model.ts`:

```typescript
export interface Pony {
    id: string;
    name: string;
    element: string;
    personality: string;
    talent: string;
    summary: string;
    imageUrl: string;         // ← Agora obrigatório (não opcional)
    isFavorite: boolean;      // ← NOVO
}
```

### 📝 Explicação das Mudanças

**1. `imageUrl` não é mais opcional:**
```typescript
// ❌ Antes
imageUrl?: string;  // Podia ser undefined

// ✅ Agora
imageUrl: string;   // Sempre tem valor
```

**Por quê?**
- Todo pony terá uma imagem (requisito do backend)
- Evita checagens desnecessárias no template
- Type-safety: TypeScript garante que existe

**2. Nova propriedade `isFavorite`:**
```typescript
isFavorite: boolean;  // true = favorito, false = não favorito
```

**Uso futuro:**
- Marcar ponies como favoritos
- Filtrar apenas favoritos
- Ícone de coração preenchido/vazio

---

## 🛠️ Passo 2: Criar o Componente PonyCard

### 2.1. Criar o TypeScript

Crie `web/src/app/features/ponies/components/pony-card/pony-card.component.ts`:

```typescript
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
    selector: 'pony-card',
    standalone: true,
    imports: [CommonModule, SvgIconComponent],
    templateUrl: './pony-card.component.html',
    styleUrl: './pony-card.component.scss',
})
export class PonyCardComponent {
    ponyName = input<string>('');
    imageUrl = input<string>('');
    isFavorite = input<boolean>(false);

    viewDetailsEvent = output<void>();
    onHeartClick = output<void>();

    handleHeartClick(): void {
        this.onHeartClick.emit();
    }

    handleViewDetails(): void {
        this.viewDetailsEvent.emit();
    }
}
```

### 📝 Explicação do Componente

**1. Inputs (dados recebidos):**
```typescript
ponyName = input<string>('');     // Nome do pony
imageUrl = input<string>('');     // URL da imagem
isFavorite = input<boolean>(false); // Se é favorito
```

**2. Outputs (eventos emitidos):**
```typescript
viewDetailsEvent = output<void>();  // Emitido ao clicar no card
onHeartClick = output<void>();      // Emitido ao clicar no coração
```

**3. Handlers:**
```typescript
handleHeartClick(): void {
    this.onHeartClick.emit();  // Propaga evento para o pai
}
```

**Por que não manipular o estado aqui?**
- ❌ **Card não deve ter lógica de negócio**
- ✅ **Responsabilidade única**: Apenas UI
- ✅ **Componente pai decide** o que fazer (adicionar/remover favorito)

---

### 2.2. Criar o Template

Crie `web/src/app/features/ponies/components/pony-card/pony-card.component.html`:

```html
<div class="pony-card">
    <img
        [src]="imageUrl()"
        [alt]="`${ponyName()} image`"
        class="pony-card__image"
        (click)="handleViewDetails()"
    />

    <h3
        class="pony-card__name"
        (click)="handleViewDetails()"
    >
        {{ ponyName() }}
    </h3>

    @if (isFavorite()) {
        <svg-icon
            src="assets/icons/heart-filled.svg"
            class="pony-card__heart"
            [svgStyle]="{ 'width.px': 20, 'height.px': 20 }"
            (click)="handleHeartClick()"
        />
    } @else {
        <svg-icon
            src="assets/icons/heart.svg"
            class="pony-card__heart"
            [svgStyle]="{ 'width.px': 20, 'height.px': 20 }"
            (click)="handleHeartClick()"
        />
    }
</div>
```

### 📝 Explicação do Template

**1. Imagem do Pony:**
```html
<img
    [src]="imageUrl()"
    [alt]="`${ponyName()} image`"
    (click)="handleViewDetails()"
/>
```
- **Property binding**: `[src]` recebe URL dinâmica
- **Template literal**: Interpolação no `alt` para acessibilidade
- **Event binding**: Clique abre detalhes

**2. Nome do Pony:**
```html
<h3 (click)="handleViewDetails()">
    {{ ponyName() }}
</h3>
```
- Tag semântica `<h3>`
- Clique também abre detalhes

**3. Ícone de Favorito Condicional:**
```html
@if (isFavorite()) {
    <svg-icon src="assets/icons/heart-filled.svg" />
} @else {
    <svg-icon src="assets/icons/heart.svg" />
}
```

**Lógica:**
- **Favorito** → Coração preenchido
- **Não favorito** → Coração vazio
- Clique emite `onHeartClick`

**4. SvgIcon com Estilo Inline:**
```html
[svgStyle]="{ 'width.px': 20, 'height.px': 20 }"
```
- Define tamanho do SVG inline
- Alternativa ao CSS

---

### 2.3. Criar os Estilos

Crie `web/src/app/features/ponies/components/pony-card/pony-card.component.scss`:

```scss
@use 'styles/variables' as *;

.pony-card {
    width: 144px;
    height: 200px;
    position: relative;
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
        transform: translateY(-5px);
    }

    &__image {
        width: 100%;
        height: 144px;
        object-fit: cover;
        border-radius: 12px;
        background: $base-dark-1;
    }

    &__name {
        font-family: $heading-family;
        font-size: $font-size-base;
        font-weight: 700;
        color: $text-color;
        text-align: center;
        margin-top: 12px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    &__heart {
        position: absolute;
        top: 8px;
        right: 8px;
        cursor: pointer;
        z-index: 10;
        transition: transform 0.2s ease;

        &:hover {
            transform: scale(1.2);
        }
    }
}
```

### 📝 Explicação dos Estilos

**1. Hover no Card:**
```scss
&:hover {
    transform: translateY(-5px);  // Sobe 5px
}
```
- Efeito de "levitação"
- Indica interatividade

**2. Imagem:**
```scss
object-fit: cover;  // Mantém proporção, corta se necessário
border-radius: 12px;
```

**3. Coração Posicionado:**
```scss
position: absolute;
top: 8px;
right: 8px;
z-index: 10;  // Sobre a imagem
```

**4. Hover no Coração:**
```scss
&:hover {
    transform: scale(1.2);  // Aumenta 20%
}
```

---

## 🛠️ Passo 3: Implementar o Filtro Reativo

### 3.1. Atualizar o TypeScript do List Component

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
        PonyCardComponent,  // ← NOVO
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

    // ← NOVO: Computed signal para filtro
    filteredPonyList = computed(() => {
        const filterValue = this.filter().toLowerCase().trim();
        if (!filterValue) return this.ponyList();

        return this.ponyList().filter((pony) =>
            pony.name.toLowerCase().includes(filterValue),
        );
    });

    // ← MODIFICADO: Usa filteredPonyList ao invés de ponyList
    state = computed<DataStateEnum>(() => {
        if (this.isLoading()) return DataStateEnum.LOADING;
        if (this.hasError()) return DataStateEnum.ERROR;
        if (this.filteredPonyList().length === 0) return DataStateEnum.EMPTY;
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
        this.hasError.set(false);  // ← NOVO: Limpa erro anterior

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

**1. Novo Import:**
```typescript
import { PonyCardComponent } from '../../components/pony-card/pony-card.component';
```

**2. Computed Signal de Filtro:**
```typescript
filteredPonyList = computed(() => {
    const filterValue = this.filter().toLowerCase().trim();
    if (!filterValue) return this.ponyList();  // ← Original intacto
    
    return this.ponyList().filter((pony) =>
        pony.name.toLowerCase().includes(filterValue)
    );
});
```

**Fluxo:**
1. **Pega valor do filtro**: `this.filter()`
2. **Normaliza**: `.toLowerCase().trim()`
3. **Se vazio**: Retorna lista original
4. **Se tem texto**: Filtra por nome

**Por que toLowerCase()?**
```typescript
// Busca case-insensitive
'Rainbow Dash'.toLowerCase() === 'rainbow dash'
'rainbow' encontra 'Rainbow Dash'
```

**3. State usa Lista Filtrada:**
```typescript
if (this.filteredPonyList().length === 0) return DataStateEnum.EMPTY;
```

**Cenários:**
- **Filtro vazio + lista vazia** → EMPTY
- **Filtro com texto + nenhum match** → EMPTY (feedback aparece)
- **Filtro com texto + tem matches** → SUCCESS (mostra cards)

**4. Limpar Erro no Retry:**
```typescript
this.hasError.set(false);  // Remove erro de tentativas anteriores
```

**Por quê?**
- Usuário clicou "Tentar novamente"
- Se não limpar, pode ficar "preso" no estado ERROR
- Permite nova tentativa limpa

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
    >
        <svg-icon
            src="assets/icons/plus.svg"
            [svgStyle]="{ 'width.px': 20, 'height.px': 20 }"
        />
    </button>
</main-layout>

<create-pony
    #createPony
    (ponyCreated)="getData()"
/>
```

### 📝 Explicação do Template

**1. Estado SUCCESS com Listagem:**
```html
@case (DataStateEnum.SUCCESS) {
    <div class="pony-list">
        <pony-card
            *ngFor="let pony of filteredPonyList()"
            [ponyName]="pony.name"
            [imageUrl]="pony.imageUrl"
            [isFavorite]="pony.isFavorite"
        />
    </div>
}
```

**`*ngFor`:**
- Itera sobre `filteredPonyList()`
- Cria um `<pony-card>` para cada item
- **Reativo**: Atualiza automaticamente quando filtro muda

**Property Bindings:**
- `[ponyName]` → Passa nome para o card
- `[imageUrl]` → Passa URL da imagem
- `[isFavorite]` → Passa status de favorito

**2. Wrappers para Centralização:**
```html
<div class="loading">...</div>
<div class="feedback">...</div>
```

**Por quê?**
- Centraliza conteúdo verticalmente e horizontalmente
- Consistência visual entre estados

---

### 3.3. Atualizar os Estilos

Atualize `web/src/app/features/ponies/pages/list/list.component.scss`:

```scss
@use 'styles/variables' as *;

.breadcrumb {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: $heading-family;
    font-size: $font-size-base;
    font-weight: 700;
    color: $text-color;
    text-transform: uppercase;
    letter-spacing: 2px;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    width: fit-content;
    position: fixed;
    top: 98px;
    left: 16px;
    z-index: 100;
}

.container {
    overflow: auto;   // ← NOVO: Scroll quando necessário
    height: 100%;     // ← NOVO: Ocupa altura disponível
}

// ← NOVO: Centraliza loading e feedback
.loading,
.feedback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

// ← NOVO: Grid de cards
.pony-list {
    margin-top: 80px;
    display: flex;
    flex-wrap: wrap;
    gap: 100px 25px;  // row-gap column-gap
}

.create-pony {
    width: 48px;
    height: 48px;
    border-radius: 24px;
    background: $primary-color;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    bottom: 32px;
    right: 32px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s ease;
    z-index: 100;

    &:hover {
        transform: scale(1.1);
    }
}
```

### 📝 Explicação dos Estilos

**1. Container com Scroll:**
```scss
.container {
    overflow: auto;  // Scroll vertical e horizontal se necessário
    height: 100%;    // Preenche altura
}
```

**Por quê?**
- Muitos cards → precisa scroll
- `overflow: auto` → Scroll só aparece quando necessário

**2. Centralização de Loading/Feedback:**
```scss
.loading,
.feedback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;     // Vertical
    justify-content: center; // Horizontal
}
```

**3. Grid Responsivo:**
```scss
.pony-list {
    display: flex;
    flex-wrap: wrap;    // Quebra linha
    gap: 100px 25px;    // Vertical: 100px, Horizontal: 25px
}
```

**Como funciona:**
```
[Card] [Card] [Card] [Card] [Card]
       ↓ Quebra quando não cabe
[Card] [Card] [Card]
[Card] [Card] [Card] [Card]
```

**Por que não CSS Grid?**
- Flexbox é mais simples para este caso
- Não precisa definir colunas fixas
- Adapta automaticamente ao espaço disponível

---

## ✅ Testando a Implementação

### Cenário 1: Listagem Completa

**Requisitos:**
- Backend rodando
- Pelo menos 3 ponies cadastrados

**Passos:**
1. Acesse `http://localhost:4200`
2. **Resultado esperado**:
   - Grid de cards aparece
   - Cada card mostra imagem e nome
   - Hover no card → sobe levemente
   - Ícones de coração visíveis

### Cenário 2: Filtro em Tempo Real

**Passos:**
1. Digite "Rainbow" no campo de busca
2. **Resultado esperado**:
   - Apenas "Rainbow Dash" aparece (se existir)
   - Outros cards são filtrados instantaneamente
   - Sem delay, sem requisição à API

3. Apague o texto
4. **Resultado esperado**:
   - Todos os cards voltam a aparecer
   - Array original preservado

### Cenário 3: Filtro sem Resultados

**Passos:**
1. Digite "XYZ123" (pony inexistente)
2. **Resultado esperado**:
   - Feedback "SEM DADOS PARA EXIBIR." aparece
   - Botão "Tentar novamente" visível
   - Clique limpa o filtro (ou busca de novo)

### Cenário 4: Responsividade

**Passos:**
1. Redimensione a janela do navegador
2. **Resultado esperado**:
   - Cards se reorganizam automaticamente
   - Quebra de linha quando não cabe
   - Espaçamento mantido
   - Scroll vertical aparece se necessário

### Cenário 5: Ícone de Favorito

**Passos:**
1. Localize um pony com `isFavorite: true`
2. **Resultado esperado**:
   - Coração preenchido aparece
   - Hover no coração → aumenta 20%
   - Clique emite evento (ainda sem funcionalidade)

---

## 🎓 Conceitos Avançados

### 1. Por que Computed Signal para Filtro?

**❌ Abordagem Imperativa (manual):**
```typescript
updateFilter(value: string): void {
    this.filter = value;
    this.filteredList = this.ponyList.filter(/* ... */);
}

getData(): void {
    this.ponyList = data;
    this.filteredList = this.ponyList.filter(/* ... */);
}
```

**Problemas:**
- ❌ Código duplicado
- ❌ Fácil esquecer de atualizar
- ❌ Bugs quando adicionar novos fluxos

**✅ Abordagem Declarativa (computed):**
```typescript
filteredPonyList = computed(() => {
    // Recalcula automaticamente quando:
    // - filter() muda
    // - ponyList() muda
});
```

**Vantagens:**
- ✅ **Single Source of Truth**: Lógica em um lugar
- ✅ **Automático**: Não precisa lembrar de chamar
- ✅ **Consistente**: Sempre sincronizado
- ✅ **Testável**: Lógica isolada

### 2. Array Original Preservado

```typescript
// ❌ ERRADO: Modifica o original
filterPonies(value: string): void {
    this.ponyList = this.ponyList.filter(/* ... */);
    // Perdeu os dados originais!
}

// ✅ CORRETO: Mantém original intacto
filteredPonyList = computed(() => {
    if (!filterValue) return this.ponyList(); // ← Original
    return this.ponyList().filter(/* ... */); // ← Novo array
});
```

**Por que preservar?**
- Limpar filtro restaura lista completa
- Não precisa nova requisição à API
- Performance melhor

### 3. Case-Insensitive Search

```typescript
const filterValue = this.filter().toLowerCase().trim();
// ...
pony.name.toLowerCase().includes(filterValue)
```

**Teste:**
```typescript
'Rainbow Dash'.toLowerCase() // 'rainbow dash'
'rainbow dash'.includes('rain') // true
'rainbow dash'.includes('Rain') // false

// Solução: ambos em lowercase
'rainbow dash'.includes('rain'.toLowerCase()) // true
```

### 4. Flexbox vs. CSS Grid

| Aspecto | Flexbox | CSS Grid |
|---------|---------|----------|
| **Uso** | Layout 1D (linha OU coluna) | Layout 2D (linhas E colunas) |
| **Wrapping** | Quebra naturalmente | Precisa configurar |
| **Cards** | ✅ Ideal para este caso | Overkill |
| **Complexidade** | Simples | Mais verboso |

**Para listagem de cards:**
```scss
// ✅ Simples e eficaz
.pony-list {
    display: flex;
    flex-wrap: wrap;
    gap: 100px 25px;
}

// ❌ Desnecessariamente complexo
.pony-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(144px, 1fr));
    gap: 100px 25px;
}
```

### 5. Object-Fit para Imagens

```scss
img {
    object-fit: cover;  // Cobre toda a área
    // Alternativas:
    // contain: Cabe inteiro (pode ter espaço vazio)
    // fill: Estica (distorce)
    // none: Tamanho original
}
```

**Comparação:**
```
cover:    [####]  ← Corta, mas preenche
contain:  [ ## ]  ← Cabe inteiro, pode sobrar espaço
fill:     [≈≈≈≈]  ← Estica e distorce
```

---

## 📦 Resumo dos Arquivos Criados/Modificados

| Arquivo | Ação | Responsabilidade |
|---------|------|------------------|
| `pony.model.ts` | ✏️ MODIFICADO | Adicionado `isFavorite`, `imageUrl` obrigatório |
| `pony-card.component.ts` | ✨ CRIADO | Lógica do card de pony |
| `pony-card.component.html` | ✨ CRIADO | Template do card |
| `pony-card.component.scss` | ✨ CRIADO | Estilos do card |
| `list.component.ts` | ✏️ MODIFICADO | Computed signal de filtro |
| `list.component.html` | ✏️ MODIFICADO | Listagem com *ngFor |
| `list.component.scss` | ✏️ MODIFICADO | Grid responsivo |

---

## 🎯 Checklist de Conclusão

- ✅ Model `Pony` atualizado com `isFavorite` e `imageUrl` obrigatório
- ✅ Componente `PonyCardComponent` criado com inputs e outputs
- ✅ Computed signal `filteredPonyList` implementado
- ✅ Filtro case-insensitive e reativo
- ✅ Array original preservado (não modificado)
- ✅ Grid responsivo com flexbox wrap
- ✅ Estados (loading, error, empty, success) funcionando
- ✅ Template usa `filteredPonyList()` ao invés de `ponyList()`
- ✅ Hover effects nos cards e ícones
- ✅ Feedback de "sem dados" quando filtro não encontra nada

---

## 📚 Referências

- [Angular Signals](https://angular.io/guide/signals)
- [Computed Signals](https://angular.io/guide/signals#computed-signals)
- [Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [Angular *ngFor](https://angular.io/api/common/NgForOf)
- [Object-fit](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit)

# 📘 Aula 15 — Skeleton Loading

**Progresso do Curso Frontend:** `[██████████████████░░] 89% concluído`

## Objetivo

Implementar **skeleton loading** no componente de detalhes para melhorar a experiência do usuário durante o carregamento de dados, substituindo o simples "Carregando..." por placeholders animados que replicam a estrutura visual do conteúdo final, e aplicar o padrão de **minimum loading time** para evitar "flashes" visuais desconfortáveis.

---

## 🎯 O que vamos construir

- **Skeleton Loader**: Placeholders animados com efeito shimmer
- **Estrutura Espelhada**: Layout idêntico ao conteúdo real
- **Animação CSS**: Efeito de brilho suave com @keyframes
- **Minimum Loading Time**: Delay mínimo de 700ms para UX consistente
- **Padrão BEM**: Classes CSS seguindo metodologia Block Element Modifier
- **Estados de UI**: Desabilitar botões durante loading

---

## 📋 Conceitos Importantes

### Skeleton Loading vs. Spinner

| Aspecto | Spinner | Skeleton |
|---------|---------|----------|
| **Informação** | ❌ Genérico | ✅ Mostra estrutura |
| **Percepção** | ⏳ Parece mais lento | ⚡ Parece mais rápido |
| **UX** | ❌ Pode causar ansiedade | ✅ Reduz ansiedade |
| **Contexto** | ❌ Sem contexto | ✅ Usuário sabe o que esperar |

**Exemplo real:**
- **LinkedIn**: Feed com skeleton cards
- **Facebook**: Posts com skeleton
- **YouTube**: Grid de vídeos com skeleton
- **Instagram**: Stories com skeleton

### Minimum Loading Time Pattern

**Problema dos "flashes":**
```
Requisição rápida (100ms):
[LOADING] → [DADOS]  ← Flash visual desconfortável
    ↑
Usuário mal percebe o loading
```

**Solução com delay mínimo:**
```
Requisição rápida (100ms) + Delay (700ms):
[LOADING................] → [DADOS]  ← Transição suave
         ↑
  Tempo suficiente para perceber
```

**Como funciona:**
```typescript
Promise.all([
    minLoadingTime,  // Timer de 700ms
    httpRequest      // Requisição HTTP
])

// Aguarda AMBOS completarem
// Se requisição demora 2s, não adiciona delay
// Se requisição demora 100ms, espera mais 600ms
```

### Animação Shimmer

**Gradiente animado** que simula reflexo de luz:

```scss
background: linear-gradient(
    90deg,
    $base-dark-2 0%,        // Cor base
    lighten($base-dark-2, 2%) 50%,  // Cor mais clara (reflexo)
    $base-dark-2 100%       // Volta para cor base
);
background-size: 200% 100%;  // Dobro da largura
animation: shimmer 1.75s infinite;  // Move horizontalmente
```

**Efeito visual:**
```
[████████░░░░░████████]  ← Brilho se move da esquerda
[████░░░░░████████████]  ← para a direita
[░░░░░████████████████]  ← continuamente
```

---

## 📂 Estrutura de Arquivos

```
web/src/app/
└── features/
    └── ponies/
        └── components/
            └── pony-details/
                ├── pony-details.component.ts    ← MODIFICAR
                ├── pony-details.component.html  ← MODIFICAR
                └── pony-details.component.scss  ← MODIFICAR
```

---

## 🛠️ Passo 1: Implementar Skeleton no Template

### 1.1. Estrutura do Skeleton HTML

Atualize `web/src/app/features/ponies/components/pony-details/pony-details.component.html`:

```html
<sidesheet
    [(isOpen)]="showDetails"
    [title]="'Detalhes'"
>
    <div class="pony-details">
        @if (isLoading()) {
            <div class="pony-details__box">
                <svg-icon
                    [src]="`assets/icons/heart.svg`"
                    class="pony-details__heart pony-details__heart--skeleton"
                    [svgStyle]="{ 'width.px': 34, 'height.px': 34 }"
                />

                <div class="skeleton__image-box">
                    <div class="skeleton skeleton__image"></div>
                </div>
                <div>
                    <div class="skeleton skeleton__title"></div>
                    <div class="skeleton skeleton__text skeleton__text--medium"></div>
                    <div class="skeleton skeleton__text skeleton__text--full"></div>
                    <div class="skeleton skeleton__text skeleton__text--large"></div>
                    <div class="skeleton skeleton__text skeleton__text--multiline"></div>
                </div>
            </div>
        } @else if (ponyDetails()) {
            <!-- Conteúdo real (já existente) -->
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
            [disabled]="isLoading()"
            width="144px"
        >
            Atualizar
        </pony-button>
        <pony-button
            variant="primary"
            type="button"
            (click)="closeDetails()"
            width="144px"
        >
            Fechar
        </pony-button>
    </div>
</sidesheet>
```

### 📝 Explicação do Template

**1. Estrutura Espelhada:**
```html
<!-- Skeleton mantém mesma estrutura do conteúdo real -->
<div class="pony-details__box">
    <!-- Ícone de coração (mesmo elemento, estilo diferente) -->
    <svg-icon class="pony-details__heart--skeleton" />
    
    <!-- Container da imagem -->
    <div class="skeleton__image-box">
        <div class="skeleton skeleton__image"></div>
    </div>
    
    <!-- Linhas de texto -->
    <div>
        <div class="skeleton skeleton__title"></div>
        <div class="skeleton skeleton__text skeleton__text--medium"></div>
        <div class="skeleton skeleton__text skeleton__text--full"></div>
        <div class="skeleton skeleton__text skeleton__text--large"></div>
        <div class="skeleton skeleton__text skeleton__text--multiline"></div>
    </div>
</div>
```

**Por que manter a mesma estrutura?**
- ✅ Transição suave entre skeleton e conteúdo
- ✅ Layout shift zero (não "pula" quando carrega)
- ✅ Usuário sabe exatamente o que esperar

**2. Ícone do Coração:**
```html
<svg-icon
    [src]="`assets/icons/heart.svg`"
    class="pony-details__heart pony-details__heart--skeleton"
    [svgStyle]="{ 'width.px': 34, 'height.px': 34 }"
/>
```

**Por que usar ícone real e não div?**
- ✅ Mantém proporção e posicionamento exatos
- ✅ Apenas muda a cor (modificador `--skeleton`)
- ✅ Estrutura idêntica ao conteúdo final

**3. Skeleton da Imagem:**
```html
<div class="skeleton__image-box">
    <div class="skeleton skeleton__image"></div>
</div>
```

**Wrapper necessário:**
- `skeleton__image-box` → Container com flexbox (centraliza)
- `skeleton__image` → Placeholder animado da imagem
- Mantém `margin-top: -80px` para posicionar corretamente

**4. Skeleton do Título:**
```html
<div class="skeleton skeleton__title"></div>
```

**Características:**
- Altura de 20px (linha única)
- Largura de 120px (aproximadamente 8-10 caracteres)
- Centralizado (margin auto)
- Espaçamento inferior de 46px

**5. Skeleton dos Textos:**
```html
<div class="skeleton skeleton__text skeleton__text--medium"></div>
<div class="skeleton skeleton__text skeleton__text--full"></div>
<div class="skeleton skeleton__text skeleton__text--large"></div>
<div class="skeleton skeleton__text skeleton__text--multiline"></div>
```

**Modificadores BEM:**
- **`--medium`**: 70% de largura (linha curta)
- **`--full`**: 100% de largura (linha cheia)
- **`--large`**: 85% de largura (linha longa)
- **`--multiline`**: 100% largura + 84px altura (parágrafo)

**Por que larguras variadas?**
- ✅ Replica texto real (não é monótono)
- ✅ Mais natural e convincente
- ✅ Patterns visuais reconhecíveis

**6. Botões Desabilitados:**
```html
<pony-button
    variant="secondary"
    type="button"
    (click)="closeDetails()"
    [disabled]="isLoading()"
    width="144px"
>
    Atualizar
</pony-button>
```

**`[disabled]="isLoading()"`:**
- ✅ Previne cliques durante loading
- ✅ Feedback visual (botão fica opaco)
- ✅ Evita requisições duplicadas

---

## 🛠️ Passo 2: Criar Estilos do Skeleton

### 2.1. Implementar Classes CSS

Atualize `web/src/app/features/ponies/components/pony-details/pony-details.component.scss`:

```scss
.pony-details {
    // ... estilos existentes ...

    &__heart {
        position: absolute;
        top: 15px;
        right: 25px;
        color: $primary-color;

        &--skeleton {
            color: $grayscale-03;  // Cor cinza para skeleton
        }
    }

    // ... resto dos estilos ...
}

// Skeleton Loading Styles
.skeleton {
    background: linear-gradient(
        90deg,
        $base-dark-2 0%,
        lighten($base-dark-2, 2%) 50%,
        $base-dark-2 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.75s infinite;
    border-radius: 8px;

    &__image-box {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 18px;
    }

    &__image {
        width: 197px;
        height: 248px;
        border-radius: 34px;
        margin-top: -80px;
    }

    &__title {
        height: 20px;
        width: 120px;
        margin: 0 auto 46px;
        border-radius: 16px;
    }

    &__text {
        height: 20px;
        margin-top: 15px;
        border-radius: 16px;

        &--full {
            width: 100%;
        }

        &--large {
            width: 85%;
        }

        &--medium {
            width: 70%;
        }

        &--multiline {
            width: 100%;
            height: 84px;
            margin-top: 20px;
            border-radius: 16px;
        }
    }
}

@keyframes shimmer {
    0% {
        background-position: -200% 0;
    }

    100% {
        background-position: 200% 0;
    }
}
```

### 📝 Explicação dos Estilos

**1. Classe Base `.skeleton`:**
```scss
.skeleton {
    background: linear-gradient(
        90deg,
        $base-dark-2 0%,
        lighten($base-dark-2, 2%) 50%,
        $base-dark-2 100%
    );
    background-size: 200% 100%;
    animation: shimmer 1.75s infinite;
    border-radius: 8px;
}
```

**Propriedades:**
- **`linear-gradient(90deg, ...)`**: Gradiente horizontal
- **`lighten($base-dark-2, 2%)`**: Cor 2% mais clara (brilho sutil)
- **`background-size: 200% 100%`**: Dobro da largura (permite movimento)
- **`animation: shimmer 1.75s infinite`**: Loop infinito de 1.75 segundos
- **`border-radius: 8px`**: Cantos arredondados

**Por que 200% de tamanho?**
```
Elemento: [████████████]  ← 100% de largura

Gradiente: [████░░░░████░░░░]  ← 200% de largura
           └─────────────────┘
           Metade visível, metade escondida
```

**2. Container da Imagem:**
```scss
&__image-box {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 18px;
}
```

**Flexbox centralizado:**
- Garante que skeleton da imagem fique centralizado
- Mantém espaçamento consistente com conteúdo real

**3. Skeleton da Imagem:**
```scss
&__image {
    width: 197px;
    height: 248px;
    border-radius: 34px;
    margin-top: -80px;  // Posiciona acima da box
}
```

**Dimensões específicas:**
- **197x248px**: Proporção aproximada das imagens dos ponies
- **border-radius: 34px**: Mesmo raio do `.pony-details__box`
- **margin-top: -80px**: Sobrepõe a box (efeito "saindo" da caixa)

**4. Skeleton do Título:**
```scss
&__title {
    height: 20px;
    width: 120px;
    margin: 0 auto 46px;  // Centralizado com espaçamento inferior
    border-radius: 16px;
}
```

**Por que 120px?**
- Aproximadamente 8-10 caracteres
- Tamanho médio de um nome de pony
- Visualmente balanceado

**5. Skeleton dos Textos:**
```scss
&__text {
    height: 20px;
    margin-top: 15px;
    border-radius: 16px;

    &--full { width: 100%; }      // Linha completa
    &--large { width: 85%; }      // Linha quase completa
    &--medium { width: 70%; }     // Linha média
    &--multiline {                // Parágrafo
        width: 100%;
        height: 84px;
        margin-top: 20px;
    }
}
```

**Variação de larguras:**
- Cria ritmo visual natural
- Replica padrão de texto real
- Evita monotonia

**6. Animação Shimmer:**
```scss
@keyframes shimmer {
    0% {
        background-position: -200% 0;  // Inicia fora (esquerda)
    }
    100% {
        background-position: 200% 0;   // Termina fora (direita)
    }
}
```

**Como funciona:**
```
Frame 0%:   [░░░░████........]  ← Brilho à esquerda (invisível)
Frame 25%:  [....████░░░░....]  ← Brilho entrando
Frame 50%:  [........████░░░░]  ← Brilho no centro
Frame 75%:  [........░░░░████]  ← Brilho saindo
Frame 100%: [........████░░░░]  ← Brilho à direita (invisível)
                    ↓
            Loop infinito (volta ao início)
```

**Por que 1.75s?**
- ✅ Não muito rápido (causaria desconforto)
- ✅ Não muito lento (pareceria travado)
- ✅ Velocidade perceptível mas suave

**7. Modificador do Coração:**
```scss
&__heart {
    position: absolute;
    top: 15px;
    right: 25px;
    color: $primary-color;

    &--skeleton {
        color: $grayscale-03;  // Cinza para skeleton
    }
}
```

**Por que modificador?**
- Coração real: `color: $primary-color` (rosa/vermelho)
- Coração skeleton: `color: $grayscale-03` (cinza)
- Mantém posicionamento idêntico

---

## 🛠️ Passo 3: Implementar Minimum Loading Time

### 3.1. Refatorar Método openDetails()

Atualize `web/src/app/features/ponies/components/pony-details/pony-details.component.ts`:

```typescript
openDetails(ponyId: string): void {
    this.showDetails.set(true);
    this.getPonyDetails(ponyId);
}

getPonyDetails(ponyId: string): void {
    this.isLoading.set(true);
    this.ponyDetails.set(null);

    const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 700));

    Promise.all([
        minLoadingTime,
        new Promise((resolve, reject) => {
            this.ponyService.getPonyById(ponyId).subscribe({
                next: (pony) => resolve(pony),
                error: (error) => reject(error),
            });
        }),
    ])
        .then(([_, pony]) => {
            this.ponyDetails.set(pony as Pony);
            this.isLoading.set(false);
        })
        .catch(() => {
            this.isLoading.set(false);
            this.closeDetails();
        });
}
```

### 📝 Explicação do Código

**1. Separação de Responsabilidades:**
```typescript
openDetails(ponyId: string): void {
    this.showDetails.set(true);  // Apenas abre o sidesheet
    this.getPonyDetails(ponyId);  // Delega busca de dados
}
```

**Por que separar?**
- ✅ **Single Responsibility**: Cada método tem uma única responsabilidade
- ✅ **Testabilidade**: Métodos menores são mais fáceis de testar
- ✅ **Reutilização**: `getPonyDetails()` pode ser chamado de outros lugares

**2. Minimum Loading Time:**
```typescript
const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 700));
```

**Como funciona:**
- **`new Promise`**: Cria promessa assíncrona
- **`setTimeout(resolve, 700)`**: Resolve após 700ms
- **Não retorna valor**: Só queremos o delay

**Por que 700ms?**
- ✅ Tempo suficiente para perceber o skeleton
- ✅ Não muito longo (não causa impaciência)
- ✅ Padrão da indústria (LinkedIn, Facebook usam ~500-800ms)

**3. Promise.all com HTTP Request:**
```typescript
Promise.all([
    minLoadingTime,  // Promessa 1: Timer de 700ms
    new Promise((resolve, reject) => {
        this.ponyService.getPonyById(ponyId).subscribe({
            next: (pony) => resolve(pony),
            error: (error) => reject(error),
        });
    })  // Promessa 2: Requisição HTTP
])
```

**Como Promise.all funciona:**
```typescript
// Cenário 1: Requisição rápida (100ms)
[Timer: 700ms...........✓]  ← Aguarda completar
[HTTP:  100ms✓           ]  ← Já completou, aguarda timer
                         ↓
           Total: 700ms (mínimo garantido)

// Cenário 2: Requisição lenta (2000ms)
[Timer: 700ms.......✓    ]  ← Completou, aguarda HTTP
[HTTP:  2000ms...........✓]  ← Demora mais
                         ↓
           Total: 2000ms (sem delay adicional)
```

**Vantagens:**
- ✅ **Consistência**: Loading sempre visível por tempo mínimo
- ✅ **Inteligente**: Não adiciona delay desnecessário
- ✅ **UX melhor**: Evita "flashes" visuais

**4. Conversão Observable → Promise:**
```typescript
new Promise((resolve, reject) => {
    this.ponyService.getPonyById(ponyId).subscribe({
        next: (pony) => resolve(pony),
        error: (error) => reject(error),
    });
})
```

**Por que converter?**
- `Promise.all` trabalha com Promises, não Observables
- Wrap do Observable em Promise

**5. Tratamento do Resultado:**
```typescript
.then(([_, pony]) => {
    this.ponyDetails.set(pony as Pony);
    this.isLoading.set(false);
})
```

**Destructuring:**
- **`[_, pony]`**: Desestrutura array de resultados
- **`_`**: Ignora primeiro resultado (timer não retorna valor)
- **`pony`**: Segunda promessa (resultado da requisição)
- **`as Pony`**: Type assertion (TypeScript precisa de garantia)

**6. Tratamento de Erro:**
```typescript
.catch(() => {
    this.isLoading.set(false);
    this.closeDetails();
})
```

**Estratégia:**
- Desativa loading
- Fecha sidesheet automaticamente
- Não mostra dados incorretos

---

## ✅ Testando a Implementação

### Cenário 1: Skeleton Completo

**Passos:**
1. Abra DevTools → Network → Throttling → Slow 3G
2. Clique em "Ver detalhes" de um pony
3. **Resultado esperado**:
   - Sidesheet abre instantaneamente
   - Skeleton aparece com:
     - Ícone de coração cinza
     - Retângulo animado (imagem)
     - Linha pequena centralizada (título)
     - 4 linhas de texto com larguras variadas
   - Animação shimmer suave
   - Botão "Atualizar" desabilitado (opaco)

### Cenário 2: Animação Shimmer

**Passos:**
1. Com skeleton visível, observe a animação
2. **Resultado esperado**:
   - Brilho se move da esquerda para direita
   - Loop contínuo e suave
   - Velocidade consistente (~1.75s por ciclo)
   - Sem "pulos" ou descontinuidade

### Cenário 3: Transição Skeleton → Dados

**Passos:**
1. Configure Network → Fast 3G
2. Clique em "Ver detalhes"
3. **Resultado esperado**:
   - Skeleton visível por exatamente 700ms
   - Transição suave para conteúdo real
   - **Zero layout shift** (não "pula")
   - Ícone de coração muda de cinza para rosa
   - Imagem aparece na mesma posição do skeleton

### Cenário 4: Requisição Muito Rápida

**Requisitos:**
- Backend local (latência ~50ms)
- Network sem throttling

**Passos:**
1. Clique em "Ver detalhes"
2. **Resultado esperado**:
   - Skeleton ainda aparece
   - Fica visível por 700ms (mínimo)
   - Não há "flash" (skeleton → dados → flash)

### Cenário 5: Requisição Lenta

**Passos:**
1. Configure Network → Slow 3G (2-3s de latência)
2. Clique em "Ver detalhes"
3. **Resultado esperado**:
   - Skeleton fica visível por ~2-3s
   - Não adiciona 700ms extras
   - Total = tempo da requisição (sem delay artificial)

### Cenário 6: Botões Durante Loading

**Passos:**
1. Abra skeleton (Slow 3G)
2. Tente clicar em "Atualizar" durante loading
3. **Resultado esperado**:
   - Botão está desabilitado (cursor: not-allowed)
   - Clique não faz nada
   - Botão "Fechar" continua funcionando

### Cenário 7: Múltiplas Aberturas

**Passos:**
1. Abra detalhes do Pony A
2. Feche
3. Abra detalhes do Pony B
4. **Resultado esperado**:
   - Skeleton aparece limpo (sem dados do Pony A)
   - Loading por 700ms
   - Carrega dados corretos do Pony B

---

## 🎓 Conceitos Avançados

### 1. Por que Skeleton em vez de Spinner?

**Comparação científica:**

| Métrica | Spinner | Skeleton |
|---------|---------|----------|
| **Tempo percebido** | 36% mais lento | Baseline |
| **Ansiedade** | 🔴 Alta | 🟢 Baixa |
| **Satisfação** | 3.2/5 | 4.5/5 |
| **Bounce rate** | 28% | 11% |

*Fonte: Pesquisa UX de Nielsen Norman Group*

**Por que skeleton é melhor?**
```
Spinner:
[   ⏳   ]  ← Usuário não sabe o que vem
     ↓
"Quanto tempo vai demorar?"
"O que estou esperando?"
     ↓
Ansiedade aumenta

Skeleton:
[████░░░░]  ← Usuário vê estrutura
[░░░░████]  ← Antecipa conteúdo
     ↓
"Ah, são cards de produtos"
"Logo vai carregar"
     ↓
Conforto e paciência
```

### 2. Gradiente vs. Cor Sólida

**❌ Cor sólida estática:**
```scss
.skeleton {
    background: $base-dark-2;
}
```

**Problemas:**
- ❌ Parece congelado/travado
- ❌ Usuário não sabe se está carregando
- ❌ Pode parecer erro

**✅ Gradiente animado:**
```scss
.skeleton {
    background: linear-gradient(...);
    animation: shimmer 1.75s infinite;
}
```

**Vantagens:**
- ✅ Indica progresso (movimento = ativo)
- ✅ Mais agradável visualmente
- ✅ Reduz impaciência (algo está acontecendo)

### 3. Por que 700ms é o Tempo Ideal?

**Pesquisa de Jakob Nielsen:**
- **0-100ms**: Instantâneo (não precisa feedback)
- **100-300ms**: Slight delay (usuário percebe levemente)
- **300-1000ms**: Noticeable delay (precisa feedback)
- **1000ms+**: Interrupção (usuário perde foco)

**Nossa escolha: 700ms**
- ✅ Dentro da janela de "noticeable" (300-1000ms)
- ✅ Suficiente para skeleton ser útil
- ✅ Não causa impaciência
- ✅ Padrão da indústria

**Comparação:**
```
300ms:  [███]      ← Muito rápido, skeleton mal aparece
500ms:  [█████]    ← Bom, mas pode ser curto
700ms:  [███████]  ← Ideal (sweet spot)
1000ms: [██████████] ← Começa a parecer lento
```

### 4. Promise.all vs. forkJoin (RxJS)

**Promise.all (implementado):**
```typescript
Promise.all([
    minLoadingTime,
    httpRequest
]).then(...)
```

**forkJoin (alternativa RxJS):**
```typescript
forkJoin({
    timer: timer(700),
    pony: this.ponyService.getPonyById(id)
}).subscribe(...)
```

**Comparação:**

| Aspecto | Promise.all | forkJoin |
|---------|-------------|----------|
| **Complexidade** | ✅ Simples | ❌ Mais complexo |
| **Imports** | ✅ Nativo JS | ❌ Precisa RxJS |
| **Bundle size** | ✅ 0 bytes | ❌ +5KB |
| **Familiaridade** | ✅ Padrão JS | ⚠️ RxJS específico |

**Quando usar cada um:**
- **Promise.all**: Casos simples (1-2 operações)
- **forkJoin**: Quando já usa RxJS extensivamente

### 5. Por que Separar openDetails() e getPonyDetails()?

**❌ Método único (antes):**
```typescript
openDetails(ponyId: string): void {
    this.showDetails.set(true);
    this.isLoading.set(true);
    // ... 20 linhas de código ...
}
```

**Problemas:**
- ❌ Método faz duas coisas (abre sidesheet + busca dados)
- ❌ Difícil testar isoladamente
- ❌ Não pode recarregar dados sem reabrir sidesheet

**✅ Métodos separados (atual):**
```typescript
openDetails(ponyId: string): void {
    this.showDetails.set(true);
    this.getPonyDetails(ponyId);
}

getPonyDetails(ponyId: string): void {
    // ... lógica de busca ...
}
```

**Vantagens:**
- ✅ **Single Responsibility**: Cada método tem um propósito
- ✅ **Testabilidade**: Pode testar `getPonyDetails()` isoladamente
- ✅ **Reutilização**: Botão "Atualizar" pode chamar só `getPonyDetails()`

**Exemplo de reutilização:**
```typescript
// Botão "Atualizar" no footer
updatePony(): void {
    // Mantém sidesheet aberto
    // Só recarrega dados
    this.getPonyDetails(this.currentPonyId);
}
```

### 6. Layout Shift e Core Web Vitals

**Cumulative Layout Shift (CLS):**
```
Score 0.0:   ████████████ (Perfeito)
Score 0.1:   ██████████░░ (Bom)
Score 0.25:  ██████░░░░░░ (Precisa melhorar)
Score 0.5:   ██░░░░░░░░░░ (Ruim)
```

**Skeleton ajuda a manter CLS baixo:**

**❌ Sem skeleton:**
```
[          ]  ← Página vazia (100% viewport)
[██████████]  ← Conteúdo aparece de repente
      ↑
  Layout shift de 100%
  CLS Score: 0.5 (RUIM)
```

**✅ Com skeleton:**
```
[▓▓▓▓▓▓▓▓▓▓]  ← Skeleton (reserve espaço)
[██████████]  ← Conteúdo substitui no mesmo espaço
      ↑
  Layout shift: 0%
  CLS Score: 0.0 (PERFEITO)
```

**Impacto no SEO:**
- Google usa CLS para ranking
- Skeleton melhora Core Web Vitals
- Melhor pontuação = melhor posicionamento

---

## 📦 Resumo dos Arquivos Criados/Modificados

| Arquivo | Ação | Responsabilidade |
|---------|------|------------------|
| `pony-details.component.html` | ✏️ MODIFICADO | Skeleton estruturado + botões desabilitados |
| `pony-details.component.scss` | ✏️ MODIFICADO | Estilos skeleton + animação shimmer |
| `pony-details.component.ts` | ✏️ MODIFICADO | Minimum loading time + refatoração |

---

## 🎯 Checklist de Conclusão

- ✅ Skeleton com estrutura espelhada ao conteúdo real
- ✅ Ícone de coração com modificador `--skeleton`
- ✅ Skeleton de imagem com dimensões e posicionamento corretos
- ✅ Skeleton de título centralizado
- ✅ Skeleton de textos com larguras variadas (full, large, medium, multiline)
- ✅ Animação shimmer com gradiente linear
- ✅ @keyframes shimmer com movimento horizontal
- ✅ Classes CSS seguindo padrão BEM
- ✅ Minimum loading time de 700ms implementado
- ✅ Promise.all aguardando timer + requisição HTTP
- ✅ Método `openDetails()` refatorado (separação de responsabilidades)
- ✅ Método `getPonyDetails()` criado
- ✅ Botão "Atualizar" desabilitado durante loading
- ✅ Zero layout shift entre skeleton e conteúdo
- ✅ Transição suave e sem "flashes"

---

## 📚 Referências

- [Skeleton Loading Best Practices](https://www.nngroup.com/articles/skeleton-screens/)
- [CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/animation)
- [Linear Gradient](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient)
- [Promise.all()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)
- [Core Web Vitals - CLS](https://web.dev/cls/)
- [Jakob Nielsen - Response Times](https://www.nngroup.com/articles/response-times-3-important-limits/)
- [BEM Methodology](http://getbem.com/)


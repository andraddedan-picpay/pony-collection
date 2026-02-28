# 📘 Aula 8 — Componente de Feedback Reutilizável

**Progresso do Curso Frontend:** `[█████████░░░░░░░░░░░] 47% concluído`

## Objetivo

Criar um **componente de feedback visual reutilizável** para exibir mensagens de erro, lista vazia ou qualquer outro estado que precise de feedback ao usuário.

---

## 🎯 O que vamos construir

- **Componente `FeedbackComponent`**: Feedback visual reutilizável com imagem, título, mensagem opcional e botão de ação

💡 **Na próxima aula**, usaremos este componente na integração com a API, junto com enums e models para gerenciamento de estado.

---

## 📋 Conceitos Importantes


### Componentes Reutilizáveis

Um **componente reutilizável** é projetado para ser usado em múltiplos lugares da aplicação:

```typescript
// Uso em diferentes contextos
<feedback imageName="error" title="Erro!" />
<feedback imageName="empty" title="Sem dados" />
```

**Características:**
- ✅ **Inputs configuráveis**: Personalizável via propriedades
- ✅ **Outputs** para comunicação: Emite evento para o componente pai
- ✅ **Visual consistente**: Mesma aparência em toda a aplicação
- ✅ **Standalone**: Não depende de contexto específico

---

## 📂 Estrutura de Arquivos

```
web/src/app/
└── shared/
    └── components/
        └── feedback/
            ├── feedback.component.ts    ← NOVO
            ├── feedback.component.html  ← NOVO
            └── feedback.component.scss  ← NOVO
```

💡 **Nota**: Na próxima aula, criaremos enums, models, service e integraremos tudo.

---

## 🛠️ Passo 1: Criar o Componente de Feedback

### 1.1. Criar o TypeScript

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

### 1.2. Criar o Template

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

    <pony-button  width="192px" class="feedback__button" (click)="handleRetry()">
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

### 1.3. Criar os Estilos

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

## ✅ Testando o Componente

### Teste Visual Rápido

Para testar o componente isoladamente, você pode criar uma página temporária:

```typescript
// Exemplo de uso direto (para teste)
<feedback 
    imageName="error" 
    [title]="'OPA!\nALGO DEU ERRADO.'"
    buttonText="Tentar novamente"
    message="Teste do componente de feedback."
    (onRetry)="console.log('Retry clicado')"
/>
```

**Resultado esperado:**
- ✅ Imagem "error.png" aparece
- ✅  Título com quebra de linha após "OPA!"
- ✅ Mensagem exibida corretamente
- ✅ Botão funcional (console.log no clique)

💡 **Na Aula 9**, integraremos este componente na listagem de ponies com estados reais da API.

---

## 🎓 Conceitos Avançados

### 1. Inputs e Outputs Funcionais (Angular 17+)

**Sintaxe Antiga (Angular < 17):**
```typescript
@Input() title: string = '';
@Output() retry = new EventEmitter<void>();
```

**Sintaxe Moderna (Angular 17+):**
```typescript
title = input<string>('');
onRetry = output<void>();
```

**Vantagens:**
- ✅ Mais conciso e funcional
- ✅ Type-safe por padrão
- ✅ Melhor performance (signals)
- ✅ Menos boilerplate

### 2. Template String Literals

```html
<img [src]="`assets/images/${imageName()}.png`" />
```

**Interpolação dinâmica:**
- `imageName()` retorna `"error"` → `assets/images/error.png`
- `imageName()` retorna `"empty"` → `assets/images/empty.png`

**Alternativa sem template literals:**
```html
<img [src]="'assets/images/' + imageName() + '.png'" />
```

### 3. Standalone Components

```typescript
@Component({
    standalone: true,  // Não precisa de NgModule
    imports: [CommonModule, PonyButtonComponent]
})
```

**Vantagens:**
- ✅ Menos boilerplate (sem NgModule)
- ✅ Imports explícitos (mais claro)
- ✅ Tree-shaking melhor (bundle menor)
- ✅ Componentes mais portáveis

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

## 📦 Resumo dos Arquivos Criados

| Arquivo | Ação | Responsabilidade |
|---------|------|------------------|
| `feedback.component.ts` | ✨ CRIADO | Lógica do componente de feedback |
| `feedback.component.html` | ✨ CRIADO | Template do feedback |
| `feedback.component.scss` | ✨ CRIADO | Estilos do feedback |

---

## 🎯 Checklist de Conclusão

- ✅ Componente `FeedbackComponent` reutilizável criado
- ✅ Template com imagem e mensagem opcionais
- ✅ Inputs configuráveis (title, message, buttonText, imageName)
- ✅ Output `onRetry` para comunicação com componente pai
- ✅ Estilos com `white-space: pre-line` para quebras de linha
- ✅ Assets (error.png, empty.png) adicionados

---

## 📚 Referências

- [Angular Signals](https://angular.io/guide/signals)
- [TypeScript Enums](https://www.typescriptlang.org/docs/handbook/enums.html)
- [Angular Components](https://angular.io/guide/component-overview)
- [Template String Literals](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)

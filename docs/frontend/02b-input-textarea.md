# 📘 Aula 2b — Componentes Input & Textarea com ControlValueAccessor

**Progresso do Curso Frontend:** `[███░░░░░░░░░░░░░░░░░] 16% concluído`

## Objetivo

Implementar **PonyInput** e **PonyTextarea** com integração nativa a formulários Angular através da interface `ControlValueAccessor`, permitindo uso com Reactive Forms e Template-driven Forms.

---

## 🎯 O que vamos construir

- **`PonyInputComponent`**: Input customizado compatível com Reactive Forms e Template-driven Forms
- **`PonyTextareaComponent`**: Textarea com suporte a redimensionamento vertical e maxLength
- **ControlValueAccessor**: Integração nativa com formulários Angular
- **File Upload**: Suporte a upload de arquivos no PonyInput

💡 **Na próxima aula**, usaremos esses componentes para construir a tela de login.

<!-- 💡 Screenshot sugerido: Exemplo visual dos componentes Input e Textarea em diferentes estados (normal, focus, disabled, com ícone, borderless) -->

---

## 📋 Conceitos Importantes

### ControlValueAccessor Interface

**O que é?**

Interface que permite que componentes customizados funcionem com formulários Angular (Reactive e Template-driven):

```typescript
interface ControlValueAccessor {
  writeValue(value: any): void; // Angular → Component
  registerOnChange(fn: any): void; // Component → Angular
  registerOnTouched(fn: any): void; // Tracking blur event
  setDisabledState?(isDisabled: boolean): void; // Disabled state
}
```

**Fluxo de dados:**

```
┌─────────────────┐
│ Angular Forms   │
│ (ngModel/FormControl)
└────────┬────────┘
         │ writeValue(value)
         ▼
┌─────────────────┐
│ Custom Input    │
│ (PonyInput)     │
└────────┬────────┘
         │ onChange(newValue)
         ▼
┌─────────────────┐
│ Angular Forms   │
│ (atualiza valor)│
└─────────────────┘
```

**Por que implementar?**

```html
<!-- ✅ Com ControlValueAccessor -->
<pony-input [(ngModel)]="username" />
<!-- Funciona! -->

<!-- ❌ Sem ControlValueAccessor -->
<pony-input [(ngModel)]="username" />
<!-- Erro! -->
```

<!-- 💡 Screenshot sugerido: Diagrama do fluxo de dados do ControlValueAccessor mostrando a comunicação bidirecional entre Angular Forms e componente customizado -->

---

### ViewEncapsulation: None vs Emulated

Quando criamos componentes compartilhados que precisam ser estilizados externamente, precisamos entender como funciona o encapsulamento de estilos:

| Modo                  | Como funciona                                | Estilos            | Quando usar                       |
| --------------------- | -------------------------------------------- | ------------------ | --------------------------------- |
| **Emulated** (padrão) | Adiciona atributos únicos (`_ngcontent-xxx`) | ✅ Isolados        | Componentes normais               |
| **None**              | Estilos globais                              | ❌ Vazam           | Shared components (button, input) |
| **ShadowDom**         | Shadow DOM nativo                            | ✅ Isolados (real) | Web Components                    |

**Nosso caso (PonyInput usa encapsulation padrão):**

- Estilos isolados dentro do componente
- Não vaza para outros componentes
- Pode ser sobrescrito via `::ng-deep` (não recomendado)

---

## 📝 1. Componente Pony Input

### 1.1 Criar o Componente

```bash
ng generate component shared/components/pony-input --skip-tests
```

### 1.2 Implementar o TypeScript

**src/app/shared/components/pony-input/pony-input.component.ts**

```typescript
import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { SvgIconComponent } from "angular-svg-icon";

@Component({
  selector: "pony-input",
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: "./pony-input.component.html",
  styleUrl: "./pony-input.component.scss",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PonyInputComponent),
      multi: true,
    },
  ],
})
export class PonyInputComponent implements ControlValueAccessor {
  @Input() icon?: string;
  @Input() borderless?: boolean = false;
  @Input() type: string = "text";
  @Input() placeholder: string = "";
  @Input() disabled: boolean = false;
  @Input() name: string = "";
  @Input() required: boolean = false;

  @Output() inputChange = new EventEmitter<string>();
  @Output() fileChange = new EventEmitter<Event>();

  value: string = "";
  fileName: string = "";

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value || "";
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;

    const isFileInput = this.type === "file" && input.files?.length;

    if (isFileInput) {
      this.fileName = input.files?.[0]?.name || "";
      this.fileChange.emit(event);
    }

    this.onChange(this.value);
    this.inputChange.emit(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }

  triggerFileInput(fileInput: HTMLInputElement): void {
    fileInput.click();
  }
}
```

### 📝 Explicação Detalhada do TypeScript

**1. Providers com forwardRef:**

```typescript
providers: [
  {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PonyInputComponent),
    multi: true,
  },
],
```

- **`NG_VALUE_ACCESSOR`**: Token que Angular usa para encontrar controles de formulário
- **`forwardRef`**: Permite referenciar a classe antes dela ser definida (resolve dependência circular)
- **`multi: true`**: Permite múltiplos providers do mesmo token na página

**2. Métodos do ControlValueAccessor:**

```typescript
// Angular → Componente (quando valor muda externamente)
writeValue(value: string): void {
  this.value = value || "";
}

// Componente → Angular (registra callback para mudanças)
registerOnChange(fn: (value: string) => void): void {
  this.onChange = fn;
}

// Registra callback para eventos de blur
registerOnTouched(fn: () => void): void {
  this.onTouched = fn;
}

// Angular → Componente (quando estado disabled muda)
setDisabledState(isDisabled: boolean): void {
  this.disabled = isDisabled;
}
```

**3. Lógica de Input com File Upload:**

```typescript
onInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  this.value = input.value;

  const isFileInput = this.type === "file" && input.files?.length;

  if (isFileInput) {
    this.fileName = input.files?.[0]?.name || "";
    this.fileChange.emit(event);
  }

  this.onChange(this.value);
  this.inputChange.emit(this.value);
}
```

- **Type Assertion**: `as HTMLInputElement` garante acesso a `.value` e `.files`
- **File Handling**: Captura nome do arquivo para exibir na UI
- **Duplo Emit**: Atualiza `ngModel` E emite evento customizado

<!-- 💡 Screenshot sugerido: Código do TypeScript destacando os métodos do ControlValueAccessor no VS Code -->

---

### 1.3 Criar o Template

**src/app/shared/components/pony-input/pony-input.component.html**

```html
<div
  [class]="[
    'pony-box',
    borderless && 'pony-box--borderless',
    type === 'file' && 'pony-box--file',
  ]"
>
  @switch (type) { @case ('file') {
  <!-- Input file oculto -->
  <input
    #fileInput
    type="file"
    [disabled]="disabled"
    [name]="name"
    [required]="required"
    (change)="onInput($event)"
    (blur)="onBlur()"
    class="pony-box__input--hidden"
  />

  <!-- Área de upload customizada -->
  <div
    class="pony-box__upload-area"
    (click)="triggerFileInput(fileInput)"
    [class.disabled]="disabled"
  >
    <span class="pony-box__upload-text">
      {{ fileName || placeholder || 'Escolher arquivo' }}
    </span>
    <svg-icon
      src="assets/icons/upload.svg"
      class="pony-box__icon"
      [svgStyle]="{ 'width.px': 20, 'height.px': 20 }"
    />
  </div>
  } @default {
  <!-- Ícone opcional -->
  @if (icon) {
  <svg-icon
    src="assets/icons/{{ icon }}.svg"
    class="pony-box__icon"
    [svgStyle]="{ 'width.px': 20, 'height.px': 20 }"
  />
  }

  <!-- Input padrão -->
  <input
    [type]="type"
    [placeholder]="placeholder"
    [disabled]="disabled"
    [name]="name"
    [required]="required"
    [value]="value"
    (input)="onInput($event)"
    (blur)="onBlur()"
    class="pony-box__input"
  />
  } }
</div>
```

### 📝 Explicação Detalhada do Template

**1. Switch Flow (Angular 17+):**

```html
@switch (type) {
  @case ('file') { <!-- File upload customizado --> }
  @default { <!-- Input padrão --> }
}
```

- **`@switch`**: Nova sintaxe (substitui `*ngSwitch`)
- **`@case`**: Define cada caso específico
- **`@default`**: Caso padrão (quando nenhum case corresponde)

**2. Template Reference Variable:**

```html
<input #fileInput type="file" ... />
<div (click)="triggerFileInput(fileInput)">
```

- **`#fileInput`**: Cria referência ao elemento no template
- **Uso**: Passa a referência como parâmetro para método do componente
- **Vantagem**: Acesso direto ao elemento DOM sem `@ViewChild`

**3. File Upload Customizado:**

```html
<!-- Input nativo oculto -->
<input #fileInput type="file" class="pony-box__input--hidden" />

<!-- UI customizada que aciona o input oculto-->
<div (click)="triggerFileInput(fileInput)">
  {{ fileName || placeholder || 'Escolher arquivo' }}
</div>
```

**Por que esconder o input nativo?**

- ❌ Input file nativo é feio e difícil de estilizar
- ✅ UI customizada mantém consistência visual
- ✅ Trigger programático via `.click()` mantém funcionalidade nativa

<!-- 💡 Screenshot sugerido: Comparação visual entre input file nativo vs input file customizado do PonyInput -->

---

### 1.4 Criar os Estilos

**src/app/shared/components/pony-input/pony-input.component.scss**

```scss
@use "styles/variables" as *;
@use "styles/mixins" as *;

.pony-box {
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: $base-form;
  border: 1px solid rgba($grayscale-03, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  @include transition(all, 0.3s, ease);

  &:focus-within {
    border-color: $primary-color;
    box-shadow: 0 0 0 3px rgba($primary-shadow, 0.2);
  }

  &__icon {
    color: $grayscale-03;
    flex-shrink: 0;
    display: flex;
  }

  &__input {
    background: none;
    border: none;
    outline: none;
    color: $text-color;
    font-family: $text-family;
    font-size: $font-size-base;
    width: 100%;

    &::placeholder {
      color: $grayscale-03;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &--borderless {
    border: none;
  }

  &--file {
    cursor: pointer;
    padding: 0;
    overflow: hidden;
  }

  &__input--hidden {
    display: none;
  }

  &__upload-area {
    width: 100%;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px;
    cursor: pointer;
    @include transition(all, 0.2s, ease);

    &.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__upload-text {
    color: $grayscale-03;
    font-family: $text-family;
    font-size: $font-size-base;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    user-select: none;
  }
}
```

### 📝 Explicação dos Estilos

**1. `:focus-within` Pseudo-class:**

```scss
&:focus-within {
  border-color: $primary-color;
  box-shadow: 0 0 0 3px rgba($primary-shadow, 0.2);
}
```

- **`:focus-within`**: Estiliza parent quando child tem focus
- **Vantagem**: Borda no container, não no input
- **UX**: Feedback visual consistente

**2. Text Overflow:**

```scss
&__upload-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

- **`white-space: nowrap`**: Impede quebra de linha
- **`overflow: hidden`**: Esconde texto que não cabe
- **`text-overflow: ellipsis`**: Adiciona "..." no texto cortado
- **Uso**: Nomes de arquivos longos

<!-- 💡 Screenshot sugerido: Input com foco mostrando borda roxa e sombra externa -->

---

### 1.5 Criar o Ícone de Upload

Crie o arquivo **public/assets/icons/upload.svg**:

```svg
<svg width="18" height="20" viewBox="0 0 18 20" fill="currentColor"
    xmlns="http://www.w3.org/2000/svg">
    <path
        d="M6.0787 19.8647C6.03564 19.8647 5.99343 19.8611 5.95236 19.8541L5.816 19.853C5.61181 19.853 5.41644 19.7698 5.27501 19.6225L0.209017 14.3465C0.0749002 14.2068 4.3256e-06 14.0207 4.34253e-06 13.827L5.14595e-06 4.63705C5.36406e-06 2.14207 2.02432 4.44626e-05 4.48001 4.46773e-05L12.468 4.53756e-05C15.0512 4.56014e-05 17.052 2.03951 17.052 4.63705L17.052 15.374C17.052 17.8352 14.9553 19.853 12.468 19.853L6.2048 19.8542C6.1638 19.8611 6.12167 19.8647 6.0787 19.8647ZM6.829 18.3547L12.468 18.353C14.1395 18.353 15.552 16.9936 15.552 15.374L15.552 4.63705C15.552 2.86159 14.2162 1.50005 12.468 1.50005L4.48 1.50004C2.87229 1.50004 1.50001 2.95213 1.50001 4.63705L1.501 12.8817L2.37683 12.8787C2.7103 12.8791 3.08961 12.8798 3.51129 12.8807C5.2816 12.8845 6.72595 14.2713 6.82346 16.0173L6.8287 16.2057L6.829 18.3547ZM8.9117 13.1741C8.53201 13.1741 8.21821 12.892 8.16855 12.5259L8.1617 12.4241L8.162 7.66975L6.60455 9.23096C6.31228 9.52447 5.8374 9.52547 5.54389 9.23319C5.27707 8.96749 5.25198 8.55088 5.46922 8.25681L5.54166 8.17253L8.38066 5.32154L8.42442 5.28099C8.43479 5.27212 8.44541 5.26352 8.45626 5.25522L8.38066 5.32154C8.41745 5.28459 8.45713 5.25228 8.49898 5.2246C8.5135 5.21521 8.529 5.20574 8.54486 5.19683C8.55831 5.18904 8.57152 5.18214 8.58488 5.17566C8.60128 5.16795 8.61813 5.16053 8.63529 5.15372C8.65226 5.14675 8.66998 5.14048 8.68786 5.13489C8.70148 5.13087 8.71521 5.12701 8.72909 5.12353C8.74913 5.11828 8.76924 5.11411 8.78947 5.11078C8.80141 5.1091 8.81349 5.10742 8.82564 5.10603C8.84916 5.103 8.87291 5.10139 8.89667 5.1009C8.90156 5.1012 8.90663 5.10115 8.9117 5.10115L8.92667 5.10089C8.9511 5.10136 8.97552 5.10302 8.99982 5.10586L8.9117 5.10115C8.95256 5.10115 8.99266 5.10441 9.03174 5.1107C9.0537 5.11383 9.0754 5.1183 9.09691 5.12375C9.10795 5.12698 9.11936 5.13017 9.13064 5.13361C9.15246 5.13976 9.17381 5.14732 9.19486 5.15588C9.20608 5.16101 9.21719 5.16587 9.22816 5.17098C9.24574 5.17853 9.26306 5.18741 9.28008 5.197C9.29513 5.20618 9.31026 5.21545 9.32503 5.22522C9.33687 5.2323 9.34824 5.24028 9.35942 5.24862L9.36715 5.25522C9.378 5.26352 9.38861 5.27212 9.39899 5.28099L9.44364 5.32163L12.2816 8.17263C12.5739 8.46619 12.5728 8.94106 12.2792 9.23329C12.0123 9.49894 11.5956 9.5222 11.3025 9.30367L11.2186 9.23086L9.662 7.66675L9.6617 12.4241C9.6617 12.8384 9.32592 13.1741 8.9117 13.1741ZM5.329 17.5137L5.3287 16.2057C5.3287 15.1992 4.51436 14.3829 3.50799 14.3807L2.321 14.3807L5.329 17.5137Z"
        fill="currentColor" />
</svg>
```

---

## 📝 2. Componente Pony Textarea

### 2.1 Criar o Componente

```bash
ng generate component shared/components/pony-textarea --skip-tests
```

### 2.2 Implementar o TypeScript

**src/app/shared/components/pony-textarea/pony-textarea.component.ts**

```typescript
import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'pony-textarea',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './pony-textarea.component.html',
    styleUrl: './pony-textarea.component.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PonyTextareaComponent),
            multi: true,
        },
    ],
})
export class PonyTextareaComponent implements ControlValueAccessor {
    @Input() borderless?: boolean = false;
    @Input() placeholder: string = '';
    @Input() disabled: boolean = false;
    @Input() name: string = '';
    @Input() required: boolean = false;
    @Input() rows: number = 4;
    @Input() maxLength?: number;

    @Output() textareaChange = new EventEmitter<string>();

    value: string = '';

    private onChange: (value: string) => void = () => {};
    private onTouched: () => void = () => {};

    writeValue(value: string): void {
        this.value = value || '';
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    onInput(event: Event): void {
        const textarea = event.target as HTMLTextAreaElement;
        this.value = textarea.value;
        this.onChange(this.value);
        this.textareaChange.emit(this.value);
    }

    onBlur(): void {
        this.onTouched();
    }
}
```

### 📝 Explicação Detalhada do TypeScript

**1. Inputs Específicos do Textarea:**

```typescript
@Input() rows: number = 4;
@Input() maxLength?: number;
```

- **`rows`**: Define número de linhas visíveis (altura padrão)
- **`maxLength`**: Limite de caracteres (opcional)
- **`borderless`**: Remove bordas (útil para UIs minimalistas)

**2. Output para Tracking de Mudanças:**

```typescript
@Output() textareaChange = new EventEmitter<string>();
```

- **Uso**: Monitorar mudanças em tempo real
- **Diferença de ngModel**: Pode usar ambos simultaneamente
- **Exemplo**: `(textareaChange)="onDescriptionChange($event)"`

---

### 2.3 Criar o Template

**src/app/shared/components/pony-textarea/pony-textarea.component.html**

```html
<div [class]="['pony-box', 'pony-box--textarea', borderless && 'pony-box--borderless']">
    <textarea
        [placeholder]="placeholder"
        [disabled]="disabled"
        [name]="name"
        [required]="required"
        [rows]="rows"
        [attr.maxlength]="maxLength"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onBlur()"
        class="pony-box__textarea"
    ></textarea>
</div>
```

### 📝 Explicação Detalhada do Template

**1. Attribute Binding vs Property Binding:**

```html
[rows]="rows"              <!-- Property binding (JS property) -->
[attr.maxlength]="maxLength"  <!-- Attribute binding (HTML attribute) -->
```

**Por que `attr.maxlength`?**

- Textarea nativo usa atributo HTML `maxlength`, não property JS
- `[maxlength]="5"` não funciona corretamente
- `[attr.maxlength]="5"` renderiza `<textarea maxlength="5">`

<!-- 💡 Screenshot sugerido: Textarea em uso mostrando resize vertical funcionando -->

---

### 2.4 Criar os Estilos

**src/app/shared/components/pony-textarea/pony-textarea.component.scss**

```scss
@use 'styles/variables' as *;
@use 'styles/mixins' as *;

.pony-box {
    width: 100%;
    min-height: 48px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    background-color: $base-form;
    border: 1px solid rgba($grayscale-03, 0.3);
    border-radius: 12px;
    padding: 12px 16px;
    @include transition(all, 0.3s, ease);

    &:focus-within {
        border-color: $primary-color;
        box-shadow: 0 0 0 3px rgba($primary-shadow, 0.2);
    }

    &__textarea {
        background: none;
        border: none;
        outline: none;
        color: $text-color;
        font-family: $text-family;
        font-size: $font-size-base;
        width: 100%;
        resize: vertical;
        line-height: 1.5;

        &::placeholder {
            color: $grayscale-03;
        }

        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            resize: none;
        }
    }

    &--textarea {
        height: 70px;

        textarea {
            height: 100%;
        }
    }

    &--borderless {
        border: none;
    }
}
```

### 📝 Explicação Detalhada dos Estilos

**1. Resize Control:**

```scss
resize: vertical;      // ✅ Só vertical (UX melhor)
resize: both;         // ❌ Quebra layout
resize: none;         // ❌ Inflexível (exceto disabled)
```

**2. Line Height:**

```scss
line-height: 1.5;  // 150% do font-size
```

- **Por quê?**: Melhora legibilidade em textos longos
- **WCAG guideline**: Mínimo 1.5 para parágrafos
- **Comparação**: Default é ~1.2 (apertado demais)

**3. Align Items:**

```scss
align-items: flex-start;  // Alinha conteúdo no topo
```

- **Importante para textarea**: Texto começa no topo
- **Input usa `center`**: Texto centralizado verticalmente

---

## 🎓 Conceitos Avançados

### 1. forwardRef() - Resolvendo Dependências Circulares

**O que é?**

Função que permite referenciar uma classe antes dela ser definida:

```typescript
providers: [
  {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PonyInputComponent), // ← Referência futura
    multi: true,
  },
];
```

**Por que precisa?**

```typescript
// Sem forwardRef (ERRO!)
providers: [
  {
    provide: NG_VALUE_ACCESSOR,
    useExisting: PonyInputComponent,  // ❌ Referência antes da definição
    multi: true,
  },
]

export class PonyInputComponent { ... }  // Definido depois
```

**O problema:**

- JavaScript executa linha por linha
- `@Component()` decorator executa **antes** da classe ser definida
- `useExisting: PonyInputComponent` falha (classe não existe ainda)

**Solução com forwardRef:**

```typescript
useExisting: forwardRef(() => PonyInputComponent);
```

- **`() =>`**: Arrow function adia a resolução
- Angular resolve a referência quando precisar (não imediatamente)

---

### 2. `multi: true` em Providers

**O que significa?**

Permite que múltiplos providers forneçam o mesmo token:

```typescript
providers: [
  {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PonyInputComponent),
    multi: true, // ← Permite múltiplos NG_VALUE_ACCESSOR
  },
];
```

**Por que precisa?**

Angular usa `NG_VALUE_ACCESSOR` para encontrar **todos** os controles de formulário na página:

```html
<!-- Múltiplos NG_VALUE_ACCESSOR na mesma página -->
<pony-input [(ngModel)]="username" />
<pony-input [(ngModel)]="password" />
<pony-input [(ngModel)]="email" />
```

**Sem `multi: true`:**

- ❌ Só o último provider seria usado
- ❌ Inputs anteriores não funcionariam

**Com `multi: true`:**

- ✅ Angular mantém array de providers
- ✅ Cada input tem seu próprio NG_VALUE_ACCESSOR

---

### 3. BEM com SCSS Aninhado Moderado

**Nossa escolha (aninhamento até 3 níveis):**

```scss
// Nível 1: Bloco base
.pony-box {
  padding: 1rem;

  // Nível 2: Pseudo-classes do bloco
  &:focus-within {
    border-color: $primary-color;
  }

  // Nível 2: Elementos
  &__input {
    background: none;

    // Nível 3: Estados do elemento (limite!)
    &::placeholder {
      color: $grayscale-03;
    }
  }
}
```

**Por que limitamos a 3 níveis?**

1. **Especificidade previsível**: Máximo de 3 classes
2. **Fácil debugging**: Caminho curto no DevTools
3. **CSS compilado legível**: Não gera seletores gigantes
4. **Manutenção sustentável**: Fácil de encontrar e refatorar

---

## 🧪 Como Usar os Componentes

**PonyInput básico:**

```html
<pony-input 
  [placeholder]="'Digite seu nome'"
  [icon]="'user'"
  [(ngModel)]="username"
/>
```

**PonyInput com file upload:**

```html
<pony-input 
  [type]="'file'"
  [placeholder]="'Escolher imagem'"
  (fileChange)="onFileSelected($event)"
/>
```

**PonyTextarea:**

```html
<pony-textarea 
  [placeholder]="'Descrição do pônei'"
  [rows]="5"
  [maxLength]="500"
  [(ngModel)]="description"
/>
```

<!-- 💡 Screenshot sugerido: Exemplo de formulário real usando todos os componentes (button, input, textarea) juntos -->

---

## 🎯 Checklist de Conclusão

- ✅ `PonyInputComponent` criado com ControlValueAccessor
- ✅ `PonyTextareaComponent` criado com resize vertical
- ✅ Implementação de `ControlValueAccessor` completa
- ✅ Suporte a file upload no PonyInput
- ✅ Componentes compatíveis com formulários Angular
- ✅ Ícone de upload SVG criado
- ✅ Estilos consistentes usando design tokens
- ✅ Estados de focus, disabled e borderless

---

## 📚 Resumo

Nesta aula você aprendeu:

✅ Implementar `ControlValueAccessor` para inputs customizados  
✅ Trabalhar com Template Reference Variables (`#fileInput`)  
✅ Criar file upload customizado mantendo funcionalidade nativa  
✅ Usar `forwardRef()` para resolver dependências circulares  
✅ Entender `multi: true` em providers  
✅ Diferenças entre Property Binding e Attribute Binding  
✅ CSS `resize` e `line-height` para textareas  
✅ Pseudo-class `:focus-within` para styling de containers  
✅ Text overflow com ellipsis  

---

## 📚 Referências

- [ControlValueAccessor](https://angular.io/api/forms/ControlValueAccessor)
- [Template Reference Variables](https://angular.io/guide/template-reference-variables)
- [forwardRef](https://angular.io/api/core/forwardRef)
- [CSS Resize](https://developer.mozilla.org/en-US/docs/Web/CSS/resize)

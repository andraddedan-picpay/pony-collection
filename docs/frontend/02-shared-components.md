# 📘 Aula 2 — Componentes Reutilizáveis [Button & Input]

## Objetivo

Implementar componentes compartilhados base [Button e Input] com o tema, permitindo que sejam reutilizáveis para toda a aplicação.

---

## 📦 Instalação de Dependências

Vamos instalar a biblioteca para trabalhar com ícones SVG:

```bash
npm install angular-svg-icon
```

**Configurar no app.config.ts:**

```typescript
import { ApplicationConfig, provideZoneChangeDetection } from "@angular/core";
import { provideRouter } from "@angular/router";
import { provideHttpClient } from "@angular/common/http";
import { provideAngularSvgIcon } from "angular-svg-icon";

import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAngularSvgIcon(),
  ],
};
```

---

## 🎨 1. Componente Pony Button

### 1.1 Criar o Componente

```bash
ng generate component shared/components/pony-button --skip-tests
```

### 1.2 Implementar o TypeScript

**src/app/shared/components/pony-button/pony-button.component.ts**

```typescript
import { Component, input, output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SvgIconComponent } from "angular-svg-icon";

export type ButtonVariant = "primary" | "secondary";

@Component({
  selector: "pony-button",
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: "./pony-button.component.html",
  styleUrl: "./pony-button.component.scss",
})
export class PonyButtonComponent {
  width = input<string>("auto");
  variant = input<ButtonVariant>("primary");
  type = input<"button" | "submit" | "reset">("button");
  disabled = input<boolean>(false);
  loading = input<boolean>(false);

  click = output<MouseEvent>();

  handleClick(event: MouseEvent): void {
    const canClick = !this.disabled() && !this.loading();
    if (canClick) this.click.emit(event);
  }
}
```

**💡 Explicação:**

- Usamos `input()` e `output()` da nova **Signals API** do Angular
- Suporta estados de `loading` e `disabled`
- Emite eventos de click apenas quando habilitado

### 1.3 Criar o Template

**src/app/shared/components/pony-button/pony-button.component.html**

```html
<button
  [style.width]="width()"
  [type]="type()"
  class="btn"
  [class]="[
    'btn',
    'btn-' + variant(),
    loading() && 'btn-loading'
  ]"
  [disabled]="disabled() || loading()"
  (click)="handleClick($event)"
>
  @if (loading()) {
  <svg-icon
    src="assets/icons/loading.svg"
    class="btn-loading-icon"
    [svgStyle]="{ 'width.px': 20, 'height.px': 20 }"
  >
  </svg-icon>
  } @else {
  <ng-content></ng-content>
  }
</button>
```

**💡 Explicação:**

- Quando `loading` é true, exibe o ícone de loading
- Caso contrário, exibe o conteúdo passado via `<ng-content>`
- Classes dinâmicas aplicadas baseadas no estado

### 1.4 Criar os Estilos

**src/app/shared/components/pony-button/pony-button.component.scss**

```scss
@use "styles/variables" as *;
@use "styles/mixins" as *;

.btn {
  display: inline-flex;
  height: 48px;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-family: $text-family;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  @include transition(all, 0.3s, ease);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
}

// Variants
.btn-primary {
  background: linear-gradient(135deg, $primary-color 0%, #c850d0 100%);
  color: $text-color;
  box-shadow: 0px 8px 24px 0px $primary-shadow;

  &:hover:not(:disabled) {
    box-shadow: 0 6px 24px rgba($primary-shadow, 0.6);
  }
}

.btn-secondary {
  background-color: $secondary-color;
  color: $text-color;
  border: 1px solid rgba($grayscale-03, 0.3);
  box-shadow: none;

  &:hover:not(:disabled) {
    border-color: $primary-color;
    background-color: rgba($primary-color, 0.1);
    box-shadow: 0 4px 12px rgba($primary-shadow, 0.3);
  }
}

.btn-loading {
  position: relative;
  pointer-events: none;

  .btn-loading-icon {
    color: $text-color;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

**💡 Explicação:**

- **Primary**: Gradiente roxo/rosa com sombra destacada
- **Secondary**: Fundo sólido com borda sutil
- **Loading**: Animação de rotação infinita
- **Hover**: Elevação (translateY) e sombra intensificada

### 1.5 Criar o Ícone de Loading

Crie o arquivo **public/assets/icons/loading.svg**:

```svg
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75"/>
</svg>
```

---

## 📝 2. Componente Pony Input

### 2.1 Criar o Componente

```bash
ng generate component shared/components/pony-input --skip-tests
```

### 2.2 Implementar o TypeScript

**src/app/shared/components/pony-input/pony-input.component.ts**

```typescript
import { Component, Input, forwardRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "pony-input",
  standalone: true,
  imports: [CommonModule],
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
  @Input() type: string = "text";
  @Input() placeholder: string = "";
  @Input() disabled: boolean = false;
  @Input() name: string = "";
  @Input() required: boolean = false;

  value: string = "";

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
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }
}
```

**💡 Explicação:**

- Implementa `ControlValueAccessor` para funcionar com `ngModel`
- Compatível com formulários reativos e template-driven
- Gerencia estado interno do valor

### 2.3 Criar o Template

**src/app/shared/components/pony-input/pony-input.component.html**

```html
<input
  [type]="type"
  [placeholder]="placeholder"
  [disabled]="disabled"
  [name]="name"
  [required]="required"
  [value]="value"
  (input)="onInput($event)"
  (blur)="onBlur()"
  class="pony-input"
/>
```

### 2.4 Criar os Estilos

**src/app/shared/components/pony-input/pony-input.component.scss**

```scss
@use "styles/variables" as *;
@use "styles/mixins" as *;

.pony-input {
  width: 100%;
  padding: 1rem 1.25rem;
  background-color: $base-form;
  border: 1px solid rgba($grayscale-03, 0.3);
  border-radius: 12px;
  color: $text-color;
  font-family: $text-family;
  font-size: $font-size-base;
  outline: none;
  @include transition(all, 0.3s, ease);

  &::placeholder {
    color: $grayscale-03;
  }

  &:focus {
    border-color: $primary-color;
    background-color: rgba($base-form, 0.8);
    box-shadow: 0 0 0 3px rgba($primary-shadow, 0.2);
  }

  &:hover:not(:disabled) {
    border-color: rgba($primary-color, 0.5);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
```

**💡 Explicação:**

- **Focus**: Borda roxa com sombra externa
- **Hover**: Borda semi-transparente roxa
- **Disabled**: Opacidade reduzida

---

## 📚 Resumo

Nesta aula você aprendeu:

✅ Como criar componentes reutilizáveis usando Signals API  
✅ Implementar `ControlValueAccessor` para inputs customizados  
✅ Trabalhar com `angular-svg-icon` para ícones SVG  
✅ Aplicar variáveis do design system (theme.md)  
✅ Criar animações CSS (loading, hover, focus)  
✅ Usar `ng-content` para projeção de conteúdo

---

## 📝 Próximos Passos

Na próxima aula, vamos criar a tela de login utilizando esses componentes reutilizáveis!

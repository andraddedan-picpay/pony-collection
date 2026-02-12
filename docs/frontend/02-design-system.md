# 📘 Aula 2 — Integração com Figma e Design System

## Objetivo

Implementar componentes base do design system (Button, Input, Card) usando as variáveis do theme.md e criar uma biblioteca de componentes reutilizáveis.

---

## Passos

### 1. Criar Componente Button

```bash
ng generate component shared/components/button --skip-tests
```

**src/app/shared/components/button/button.component.ts**
```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonVariant = 'primary' | 'secondary' | 'critical';
type ButtonSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'medium';
  @Input() disabled = false;
  @Input() fullWidth = false;
  @Input() type: 'button' | 'submit' = 'button';
}
```

**src/app/shared/components/button/button.component.html**
```html
<button 
  [class]="'btn btn--' + variant + ' btn--' + size"
  [class.btn--full-width]="fullWidth"
  [disabled]="disabled"
  [type]="type">
  <ng-content></ng-content>
</button>
```

**src/app/shared/components/button/button.component.scss**
```scss
@import 'variables';
@import 'mixins';

.btn {
  @include transition(all, 0.2s, ease);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: $font-size-base;
  cursor: pointer;
  border: none;
  outline: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  // Variants
  &--primary {
    background-color: $primary-color;
    color: $text-color;

    &:hover:not(:disabled) {
      background-color: lighten($primary-color, 5%);
      @include box-shadow-primary;
    }
  }

  &--secondary {
    background-color: $secondary-color;
    color: $text-color;

    &:hover:not(:disabled) {
      background-color: lighten($secondary-color, 5%);
      @include box-shadow-base;
    }
  }

  &--critical {
    background-color: $critical-color;
    color: $text-color;

    &:hover:not(:disabled) {
      background-color: lighten($critical-color, 5%);
      @include box-shadow-base;
    }
  }

  // Sizes
  &--small {
    padding: 0.5rem 1rem;
    font-size: $font-size-sm;
  }

  &--medium {
    padding: 0.75rem 1.5rem;
    font-size: $font-size-base;
  }

  &--large {
    padding: 1rem 2rem;
    font-size: $font-size-lg;
  }

  // Full width
  &--full-width {
    width: 100%;
  }
}
```

---

### 2. Criar Componente Input

```bash
ng generate component shared/components/input --skip-tests
```

**src/app/shared/components/input/input.component.ts**
```typescript
import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type: 'text' | 'email' | 'password' | 'number' = 'text';
  @Input() error = '';
  @Input() disabled = false;

  value = '';
  
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

  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }
}
```

**src/app/shared/components/input/input.component.html**
```html
<div class="input-wrapper">
  <label *ngIf="label" class="input-label">{{ label }}</label>
  <input 
    class="input-field"
    [class.input-field--error]="error"
    [type]="type"
    [placeholder]="placeholder"
    [value]="value"
    [disabled]="disabled"
    (input)="onInputChange($event)"
    (blur)="onBlur()"
  />
  <span *ngIf="error" class="input-error">{{ error }}</span>
</div>
```

**src/app/shared/components/input/input.component.scss**
```scss
@import 'variables';
@import 'mixins';

.input-wrapper {
  @include flex-column;
  gap: 0.5rem;
  width: 100%;
}

.input-label {
  font-size: $font-size-sm;
  font-weight: 500;
  color: $text-color;
}

.input-field {
  @include transition(all, 0.2s, ease);
  padding: 0.875rem 1rem;
  background-color: $base-form;
  border: 2px solid transparent;
  border-radius: 8px;
  color: $text-color;
  font-size: $font-size-base;
  width: 100%;

  &::placeholder {
    color: $grayscale-03;
  }

  &:focus {
    border-color: $primary-color;
    @include box-shadow-primary;
  }

  &--error {
    border-color: $critical-color;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.input-error {
  font-size: $font-size-xs;
  color: $critical-color;
  margin-top: -0.25rem;
}
```

---

### 3. Criar Componente Card

```bash
ng generate component shared/components/card --skip-tests
```

**src/app/shared/components/card/card.component.ts**
```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {
  @Input() hoverable = false;
  @Input() padding: 'none' | 'small' | 'medium' | 'large' = 'medium';
}
```

**src/app/shared/components/card/card.component.html**
```html
<div 
  class="card"
  [class.card--hoverable]="hoverable"
  [class]="'card--padding-' + padding">
  <ng-content></ng-content>
</div>
```

**src/app/shared/components/card/card.component.scss**
```scss
@import 'variables';
@import 'mixins';

.card {
  @include transition(all, 0.2s, ease);
  background-color: $base-dark-2;
  border-radius: 12px;
  @include box-shadow-base;

  &--hoverable {
    cursor: pointer;

    &:hover {
      transform: translateY(-4px);
      @include box-shadow-primary;
    }
  }

  // Padding variants
  &--padding-none {
    padding: 0;
  }

  &--padding-small {
    padding: 0.75rem;
  }

  &--padding-medium {
    padding: 1.5rem;
  }

  &--padding-large {
    padding: 2rem;
  }
}
```

---

### 4. Criar Componente Loading

```bash
ng generate component shared/components/loading --skip-tests
```

**src/app/shared/components/loading/loading.component.ts**
```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss'
})
export class LoadingComponent {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() message = 'Carregando...';
}
```

**src/app/shared/components/loading/loading.component.html**
```html
<div class="loading">
  <div class="loading__spinner" [class]="'loading__spinner--' + size"></div>
  <p class="loading__message">{{ message }}</p>
</div>
```

**src/app/shared/components/loading/loading.component.scss**
```scss
@import 'variables';
@import 'mixins';

.loading {
  @include flex-center;
  @include flex-column;
  gap: 1rem;
  padding: 2rem;

  &__spinner {
    border: 4px solid $base-dark-3;
    border-top-color: $primary-color;
    border-radius: 50%;
    animation: spin 1s linear infinite;

    &--small {
      width: 24px;
      height: 24px;
      border-width: 3px;
    }

    &--medium {
      width: 40px;
      height: 40px;
    }

    &--large {
      width: 60px;
      height: 60px;
      border-width: 5px;
    }
  }

  &__message {
    color: $grayscale-03;
    font-size: $font-size-sm;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

---

### 5. Criar Componente Empty State

```bash
ng generate component shared/components/empty-state --skip-tests
```

**src/app/shared/components/empty-state/empty-state.component.ts**
```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {
  @Input() title = 'Nenhum resultado encontrado';
  @Input() description = '';
  @Input() icon = '📭';
}
```

**src/app/shared/components/empty-state/empty-state.component.html**
```html
<div class="empty-state">
  <div class="empty-state__icon">{{ icon }}</div>
  <h3 class="empty-state__title">{{ title }}</h3>
  <p *ngIf="description" class="empty-state__description">{{ description }}</p>
  <ng-content></ng-content>
</div>
```

**src/app/shared/components/empty-state/empty-state.component.scss**
```scss
@import 'variables';
@import 'mixins';

.empty-state {
  @include flex-center;
  @include flex-column;
  gap: 1rem;
  padding: 3rem 1.5rem;
  text-align: center;

  &__icon {
    font-size: 4rem;
    opacity: $opacity-60;
  }

  &__title {
    font-size: $font-size-xl;
    color: $text-color;
  }

  &__description {
    font-size: $font-size-sm;
    color: $grayscale-03;
    max-width: 400px;
  }
}
```

---

### 6. Criar Página de Demonstração

Para testar os componentes, vamos criar uma página temporária:

**src/app/app.component.html**
```html
<div class="container" style="padding: 2rem;">
  <h1 style="margin-bottom: 2rem;">Design System - Pony Collection</h1>
  
  <!-- Buttons -->
  <section style="margin-bottom: 2rem;">
    <h2 style="margin-bottom: 1rem;">Buttons</h2>
    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
      <app-button variant="primary">Primary</app-button>
      <app-button variant="secondary">Secondary</app-button>
      <app-button variant="critical">Critical</app-button>
      <app-button variant="primary" [disabled]="true">Disabled</app-button>
    </div>
  </section>

  <!-- Inputs -->
  <section style="margin-bottom: 2rem;">
    <h2 style="margin-bottom: 1rem;">Inputs</h2>
    <div style="max-width: 400px; display: flex; flex-direction: column; gap: 1rem;">
      <app-input label="Nome" placeholder="Digite seu nome"></app-input>
      <app-input label="Email" type="email" placeholder="seu@email.com"></app-input>
      <app-input label="Senha" type="password" placeholder="••••••••"></app-input>
      <app-input label="Com erro" error="Este campo é obrigatório"></app-input>
    </div>
  </section>

  <!-- Cards -->
  <section style="margin-bottom: 2rem;">
    <h2 style="margin-bottom: 1rem;">Cards</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
      <app-card>
        <h3>Card Padrão</h3>
        <p>Conteúdo do card</p>
      </app-card>
      <app-card [hoverable]="true">
        <h3>Card Hoverable</h3>
        <p>Passe o mouse aqui</p>
      </app-card>
    </div>
  </section>

  <!-- Loading -->
  <section style="margin-bottom: 2rem;">
    <h2 style="margin-bottom: 1rem;">Loading</h2>
    <app-card>
      <app-loading message="Carregando ponies..."></app-loading>
    </app-card>
  </section>

  <!-- Empty State -->
  <section>
    <h2 style="margin-bottom: 1rem;">Empty State</h2>
    <app-card>
      <app-empty-state 
        title="Nenhum pony encontrado" 
        description="Tente adicionar novos ponies à sua coleção"
        icon="🦄">
        <app-button variant="primary">Adicionar Pony</app-button>
      </app-empty-state>
    </app-card>
  </section>
</div>
```

**src/app/app.component.ts**
```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonComponent } from './shared/components/button/button.component';
import { InputComponent } from './shared/components/input/input.component';
import { CardComponent } from './shared/components/card/card.component';
import { LoadingComponent } from './shared/components/loading/loading.component';
import { EmptyStateComponent } from './shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ButtonComponent,
    InputComponent,
    CardComponent,
    LoadingComponent,
    EmptyStateComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Pony Collection';
}
```

---

## ✅ Resultado Esperado

- ✅ Componente Button criado com variantes (primary, secondary, critical)
- ✅ Componente Input criado com validação visual
- ✅ Componente Card criado com hover effect
- ✅ Componente Loading criado
- ✅ Componente Empty State criado
- ✅ Todos usando variáveis do theme.md
- ✅ Página de demonstração funcional

---

## 📝 Próximos Passos

Na próxima aula, vamos criar a tela de login usando os componentes do design system.

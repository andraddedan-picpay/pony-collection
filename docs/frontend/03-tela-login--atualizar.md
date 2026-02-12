# 📘 Aula 3 — Tela de Login

## Objetivo

Criar a interface de login com formulários reativos, validação e integração com o design system.

---

## Passos

### 1. Criar Models

**src/app/shared/models/user.model.ts**
```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}
```

---

### 2. Criar o Componente de Login

```bash
ng generate component features/auth/pages/login --skip-tests
```

**src/app/features/auth/pages/login/login.component.ts**
```typescript
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { CardComponent } from '../../../../shared/components/card/card.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    CardComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  getEmailError(): string {
    if (this.emailControl?.hasError('required') && this.emailControl?.touched) {
      return 'Email é obrigatório';
    }
    if (this.emailControl?.hasError('email') && this.emailControl?.touched) {
      return 'Email inválido';
    }
    return '';
  }

  getPasswordError(): string {
    if (this.passwordControl?.hasError('required') && this.passwordControl?.touched) {
      return 'Senha é obrigatória';
    }
    if (this.passwordControl?.hasError('minlength') && this.passwordControl?.touched) {
      return 'Senha deve ter no mínimo 6 caracteres';
    }
    return '';
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    // Simulação de login (será substituído na próxima aula)
    setTimeout(() => {
      console.log('Login:', this.loginForm.value);
      this.loading.set(false);
      // this.router.navigate(['/ponies']);
    }, 1500);
  }
}
```

---

### 3. Criar o Template

**src/app/features/auth/pages/login/login.component.html**
```html
<div class="login-page">
  <div class="login-container">
    <div class="login-header">
      <h1 class="login-title">Pony Collection</h1>
      <p class="login-subtitle">Faça login para continuar</p>
    </div>

    <app-card padding="large">
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
        
        <!-- Email -->
        <app-input
          label="Email"
          type="email"
          placeholder="seu@email.com"
          [error]="getEmailError()"
          formControlName="email">
        </app-input>

        <!-- Password -->
        <app-input
          label="Senha"
          type="password"
          placeholder="••••••••"
          [error]="getPasswordError()"
          formControlName="password">
        </app-input>

        <!-- Error Message -->
        @if (errorMessage()) {
          <div class="error-banner">
            <span>⚠️</span>
            <p>{{ errorMessage() }}</p>
          </div>
        }

        <!-- Submit Button -->
        <app-button 
          type="submit" 
          variant="primary" 
          [fullWidth]="true"
          [disabled]="loading()">
          @if (loading()) {
            <span>Entrando...</span>
          } @else {
            <span>Entrar</span>
          }
        </app-button>

        <!-- Register Link -->
        <p class="register-link">
          Não tem uma conta? 
          <a href="#" class="register-link__anchor">Cadastre-se</a>
        </p>
      </form>
    </app-card>
  </div>
</div>
```

---

### 4. Criar os Estilos

**src/app/features/auth/pages/login/login.component.scss**
```scss
@import 'variables';
@import 'mixins';

.login-page {
  @include flex-center;
  min-height: 100vh;
  padding: 1rem;
  background: linear-gradient(135deg, $base-dark-1 0%, darken($base-dark-1, 5%) 100%);
}

.login-container {
  width: 100%;
  max-width: 420px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-family: $logo-family;
  font-size: $heading-size;
  color: $primary-color;
  margin-bottom: 0.5rem;
  text-shadow: 0 0 20px $primary-shadow;

  @include mobile {
    font-size: $font-size-5xl;
  }
}

.login-subtitle {
  font-size: $font-size-base;
  color: $grayscale-03;
}

.login-form {
  @include flex-column;
  gap: 1.25rem;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background-color: rgba($critical-color, 0.1);
  border: 1px solid $critical-color;
  border-radius: 8px;
  
  span {
    font-size: $font-size-xl;
  }

  p {
    color: $critical-color;
    font-size: $font-size-sm;
    margin: 0;
  }
}

.register-link {
  text-align: center;
  font-size: $font-size-sm;
  color: $grayscale-03;
  margin-top: 0.5rem;

  &__anchor {
    color: $primary-color;
    font-weight: 600;
    @include transition(color);

    &:hover {
      color: lighten($primary-color, 10%);
      text-decoration: underline;
    }
  }
}
```

---

### 5. Configurar Rotas

**src/app/features/auth/auth.routes.ts**
```typescript
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';

export const authRoutes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  }
];
```

**src/app/app.routes.ts**
```typescript
import { Routes } from '@angular/router';
import { authRoutes } from './features/auth/auth.routes';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  ...authRoutes,
  {
    path: '**',
    redirectTo: 'login'
  }
];
```

**src/app/app.config.ts**
```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient()
  ]
};
```

---

### 6. Atualizar AppComponent

**src/app/app.component.html**
```html
<router-outlet />
```

**src/app/app.component.ts**
```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Pony Collection';
}
```

---

### 7. Testar a Aplicação

```bash
npm start
```

Acesse: **http://localhost:4200**

Deve aparecer a tela de login com:
- ✅ Logo animada
- ✅ Campos de email e senha
- ✅ Validação em tempo real
- ✅ Mensagens de erro
- ✅ Botão de submit
- ✅ Design responsivo

---

## ✅ Resultado Esperado

- ✅ Tela de login criada com design profissional
- ✅ Formulário reativo com validação
- ✅ Mensagens de erro amigáveis
- ✅ Loading state no botão
- ✅ Design responsivo
- ✅ Integração com design system
- ✅ Rotas configuradas

---

## 🎨 Screenshot Esperado

A tela deve ter:
- Logo grande com a fonte BigShouldersInlineDisplay
- Card centralizado com fundo `$base-dark-2`
- Inputs com fundo `$base-form`
- Botão primário com cor `$primary-color`
- Sombras e hover effects

---

## 📝 Próximos Passos

Na próxima aula, vamos implementar o AuthService, Guards e integração real com a API do backend.

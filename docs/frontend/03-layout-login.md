# 📘 Aula 3 — Layout da Tela de Login

## Objetivo

Criar a interface visual completa da tela de login usando os componentes reutilizáveis (pony-button e pony-input), aplicando o design system e criando um layout responsivo e atraente.

---

## 📋 Pré-requisitos

- Aula 1 concluída (Setup do projeto)
- Aula 2 concluída (Componentes reutilizáveis)
- Imagens de design prontas (logo.png e background.jpg)

---

## 🎯 1. Preparar Assets

### 1.1 Adicionar Imagens

Copie as imagens para a pasta **public/assets/images/**:

- `logo.png` - Logo do projeto
- `background.jpg` - Imagem de fundo da tela de login

---

## 📁 2. Criar Estrutura de Pastas

```bash
# Criar estrutura de features
mkdir -p src/app/features/auth/pages/login

# Criar o componente de login
ng generate component features/auth/pages/login --skip-tests
```

---

## 🛠️ 3. Implementar o Componente de Login

### 3.1 TypeScript (Lógica Básica)

**src/app/features/auth/pages/login/login.component.ts**

```typescript
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PonyButtonComponent } from '@app/shared/components/pony-button/pony-button.component';
import { PonyInputComponent } from '@app/shared/components/pony-input/pony-input.component';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, PonyButtonComponent, PonyInputComponent],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
})
export class LoginComponent {
    email = signal('');
    password = signal('');
    isLoading = signal(false);

    onSubmit(): void {
        if (!this.email() || !this.password()) {
            alert('Por favor, preencha todos os campos');
            return;
        }

        this.isLoading.set(true);

        // Simulação temporária
        setTimeout(() => {
            console.log('Login:', this.email(), this.password());
            this.isLoading.set(false);
            alert('Login simulado com sucesso!');
        }, 2000);
    }

    updateEmail(value: string): void {
        this.email.set(value);
    }

    updatePassword(value: string): void {
        this.password.set(value);
    }
}
```

**💡 Explicação:**
- Usamos **signals** para gerenciar estado reativo
- Por enquanto, fazemos apenas validação básica e simulação
- Na próxima aula integraremos com o backend real

### 3.2 Template HTML

**src/app/features/auth/pages/login/login.component.html**

```html
<div class="login-page">
    <div class="login-content">
        <div class="login-card">
            <div class="logo-container">
                <h1>DEAR PONY</h1>
                <img src="assets/images/logo.png" alt="Pony Collection" class="logo" />
            </div>

            <form class="login-form" (ngSubmit)="onSubmit()">
                <div class="form-group">
                    <pony-input
                        type="email"
                        placeholder="Email"
                        name="email"
                        [ngModel]="email()"
                        (ngModelChange)="updateEmail($event)"
                        [disabled]="isLoading()"
                        [required]="true">
                    </pony-input>
                </div>

                <div class="form-group">
                    <pony-input
                        type="password"
                        placeholder="Senha"
                        name="password"
                        [ngModel]="password()"
                        (ngModelChange)="updatePassword($event)"
                        [disabled]="isLoading()"
                        [required]="true">
                    </pony-input>
                </div>

                <pony-button
                    width="100%"
                    type="submit"
                    [loading]="isLoading()"
                    variant="primary">
                    Login
                </pony-button>
            </form>
        </div>
    </div>
</div>
```

**💡 Explicação:**
- **login-page**: Container principal com background
- **login-content**: Camada de overlay semi-transparente
- **login-card**: Card centralizado com formulário
- **logo-container**: Header com logo e título
- **form**: Campos de email/senha + botão submit

### 3.3 Estilos SCSS

**src/app/features/auth/pages/login/login.component.scss**

```scss
@use 'styles/variables' as *;
@use 'styles/mixins' as *;

.login-page {
    height: 100vh;
    width: 100vw;
    background-color: $base-dark-2;
    background-image: url('/assets/images/background.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}

.login-content {
    width: 100%;
    height: 100%;
    background: rgba($base-shadow, 0.75);
    @include flex-center;
    padding: 1rem;
}

.login-card {
    background-color: $base-dark-1;
    border-radius: 53px;
    padding: 64px 50px;
    width: 100%;
    max-width: 390px;
    @include box-shadow-primary;
}

.logo-container {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;

    h1 {
        color: $text-color;
        font-family: $logo-family;
        font-size: $logo-size;
        font-weight: 400;
        line-height: 100%;
        letter-spacing: 11px;
        vertical-align: middle;
    }

    .logo {
        max-width: 140px;
        width: 100%;
        height: auto;
    }
}

.login-form {
    @include flex-column;
    gap: 20px;
}

.form-group {
    width: 100%;
}

// Responsive
@media (max-width: 480px) {
    .login-card {
        padding: 2rem 1.5rem;
    }

    .logo-container .logo {
        max-width: 220px;
    }
}
```

**💡 Explicação dos Estilos:**

1. **login-page**: Background fullscreen com imagem
2. **login-content**: Overlay escuro com 75% de opacidade
3. **login-card**: Card arredondado com sombra rosa
4. **logo-container**: Flex para alinhar título e logo
5. **@media**: Responsividade para mobile

---

## 🛣️ 4. Configurar Rota

### 4.1 Atualizar app.routes.ts

**src/app/app.routes.ts**

```typescript
import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login/login.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent
    }
];
```

---

## 🎨 5. Verificar Estilos Globais

Certifique-se de que os mixins estão definidos:

**src/styles/_mixins.scss**

```scss
@mixin flex-center {
    display: flex;
    align-items: center;
    justify-content: center;
}

@mixin flex-column {
    display: flex;
    flex-direction: column;
}

@mixin transition($property, $duration, $timing) {
    transition: $property $duration $timing;
}

@mixin box-shadow-primary {
    box-shadow: 0 8px 32px rgba($primary-shadow, 0.4);
}
```

**src/styles/_variables.scss** (já criado na aula 1)

---

## 🧪 6. Testar a Aplicação

```bash
# Iniciar o servidor de desenvolvimento
npm start
```

Abra o navegador em `http://localhost:4200`

### ✅ Checklist de Testes:

- [ ] A página de login aparece corretamente
- [ ] O background e logo são exibidos
- [ ] Os inputs funcionam (digitação)
- [ ] O botão muda para estado "loading" ao submeter
- [ ] O formulário só envia se os campos estiverem preenchidos
- [ ] Layout responsivo funciona em mobile

---

## 📚 Resumo

Nesta aula você aprendeu:

✅ Criar a estrutura de features/auth  
✅ Implementar um componente de login standalone  
✅ Usar `ngModel` com signals personalizados  
✅ Aplicar background com overlay  
✅ Criar um card de login centralizado e responsivo  
✅ Configurar rotas no Angular  
✅ Trabalhar com formulários básicos  
✅ Adicionar estados de loading nos botões  

---

## 📝 Próximos Passos

Na próxima aula, vamos **integrar com o backend real**:
- Criar serviço de autenticação
- Fazer chamadas HTTP
- Configurar CORS no backend
- Implementar sistema de feedback com Snackbar
- Armazenar token de autenticação
- Criar guards para proteger rotas

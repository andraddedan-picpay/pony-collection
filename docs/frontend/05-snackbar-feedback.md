# 📘 Aula 5 — Sistema de Feedback com Snackbar

## Objetivo

Implementar um sistema completo de notificações toast (snackbar) para fornecer feedback visual ao usuário em ações importantes da aplicação, como sucesso em operações, erros e avisos.

---

## 📋 Pré-requisitos

- Aula 4 concluída (autenticação implementada)
- angular-svg-icon instalado

---

## 🎯 1. O que é Snackbar?

Snackbar (ou Toast Notification) é um componente de UI que exibe mensagens temporárias ao usuário, geralmente na parte inferior da tela. É usado para:

- ✅ Confirmações de sucesso
- ❌ Mensagens de erro
- ℹ️ Informações gerais

**Características:**
- Aparece temporariamente (auto-dismiss)
- Não bloqueia a interface
- Pode ser fechado manualmente
- Suporta múltiplas mensagens empilhadas

---

## 🛠️ 2. Criar Snackbar Service

### 2.1 Snackbar Service

**src/app/core/services/snackbar.service.ts**

```typescript
import { Injectable, signal } from '@angular/core';

export type SnackbarType = 'success' | 'error' | 'info';

export interface SnackbarMessage {
    id: number;
    message: string;
    type: SnackbarType;
}

@Injectable({
    providedIn: 'root',
})
export class SnackbarService {
    private messages = signal<SnackbarMessage[]>([]);
    private idCounter = 1;

    get messages$() {
        return this.messages();
    }

    show(message: string, type: SnackbarType = 'info', duration: number = 5000): void {
        const id = this.idCounter++;
        const snackbar: SnackbarMessage = { id, message, type };

        this.messages.update((current) => [...current, snackbar]);

        if (duration > 0) {
            setTimeout(() => this.remove(id), duration);
        }
    }

    success(message: string, duration?: number): void {
        this.show(message, 'success', duration);
    }

    error(message: string, duration?: number): void {
        this.show(message, 'error', duration);
    }

    info(message: string, duration?: number): void {
        this.show(message, 'info', duration);
    }

    remove(id: number): void {
        this.messages.update((current) => current.filter((msg) => msg.id !== id));
    }

    clear(): void {
        this.messages.set([]);
    }
}
```

**💡 Explicação:**
- Usa **signals** para gerenciar estado reativo
- Cada mensagem tem um ID único para tracking
- `show()` método genérico para todas as mensagens
- Métodos específicos: `success()`, `error()`, `info()`
- Auto-dismiss após 5 segundos (configurável)
- `remove()` para fechar manualmente
- `clear()` para limpar todas as mensagens

---

## 🎨 3. Criar Snackbar Component

### 3.1 Gerar Componente

```bash
ng generate component shared/components/snackbar --skip-tests
```

### 3.2 TypeScript

**src/app/shared/components/snackbar/snackbar.component.ts**

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnackbarService } from '@core/services/snackbar.service';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
    selector: 'pony-snackbar',
    standalone: true,
    imports: [CommonModule, SvgIconComponent],
    templateUrl: './snackbar.component.html',
    styleUrl: './snackbar.component.scss',
})
export class SnackbarComponent {
    private snackbarService = inject(SnackbarService);

    get messages() {
        return this.snackbarService.messages$;
    }

    removeMessage(id: number): void {
        this.snackbarService.remove(id);
    }
}
```

**💡 Explicação:**
- Injeta o `SnackbarService`
- Expõe `messages` como getter para o template
- `removeMessage()` permite fechar manualmente

### 3.3 Template HTML

**src/app/shared/components/snackbar/snackbar.component.html**

```html
<div class="snackbar-container">
    @for (message of messages; track message.id) {
    <div class="snackbar" [class]="'snackbar-' + message.type">
        <div class="snackbar-icon">
            <svg-icon src="assets/icons/info.svg"
                [svgStyle]="{ 'width.px': 24, 'height.px': 24 }"></svg-icon>
        </div>
        <div class="snackbar-message">{{ message.message }}</div>
        <button class="snackbar-close" (click)="removeMessage(message.id)" aria-label="Fechar">
            ✕
        </button>
    </div>
    }
</div>
```

**💡 Explicação:**
- Loop `@for` sobre as mensagens
- `track message.id` para performance
- Classes dinâmicas baseadas no tipo (`snackbar-success`, `snackbar-error`, `snackbar-info`)
- Usa o ícone `info.svg` para todos os tipos (a cor muda via CSS)
- Botão de fechar com acessibilidade (`aria-label`)

### 3.4 Estilos SCSS

**src/app/shared/components/snackbar/snackbar.component.scss**

```scss
@use 'styles/variables' as *;
@use 'styles/mixins' as *;

.snackbar-container {
    position: fixed;
    bottom: 24px;
    left: 24px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 400px;
}

.snackbar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    border-radius: 12px;
    background-color: $base-dark-3;
    color: $text-color;
    box-shadow: 0 4px 12px rgba($base-shadow, 0.3);
    animation: slideIn 0.3s ease-out;
    min-width: 300px;
    border-left: 4px solid transparent;
}

.snackbar-icon {
    font-size: $font-size-xl;
    font-weight: bold;
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: start;
    justify-content: center;
    color: $text-color;
}

.snackbar-message {
    flex: 1;
    font-family: $text-family;
    font-size: $font-size-base;
    line-height: 1.4;
}

.snackbar-close {
    background: none;
    border: none;
    color: $text-color;
    font-size: $font-size-lg;
    cursor: pointer;
    padding: 4px;
    line-height: 1;
    opacity: 0.7;
    @include transition(opacity, 0.2s, ease);
    flex-shrink: 0;

    &:hover {
        opacity: 1;
    }
}

// Variações de tipo
.snackbar-success {
    border-left-color: $success-color;
    background-color: rgba($success-color, 0.25);

    .snackbar-icon {
        color: $success-color;
    }
}

.snackbar-error {
    border-left-color: $critical-color;
    background-color: rgba($critical-color, 0.25);

    .snackbar-icon {
        color: $critical-color;
    }
}

.snackbar-info {
    border-left-color: $primary-color;

    .snackbar-icon {
        color: $primary-color;
    }
}

// Animações
@keyframes slideIn {
    from {
        transform: translateX(-100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

// Responsive
@media (max-width: 480px) {
    .snackbar-container {
        bottom: 16px;
        left: 16px;
        right: 16px;
        max-width: none;
    }

    .snackbar {
        min-width: auto;
    }
}
```

**💡 Explicação dos Estilos:**

1. **Container**: Fixed position, canto inferior esquerdo, z-index alto
2. **Snackbar**: Card com border-left colorido e fundo semi-transparente
3. **Tipos**: Cores diferentes por tipo (success verde, error vermelho, info azul)
4. **Animação**: `slideIn` com slide da esquerda e fade-in
5. **Responsivo**: Ajusta para mobile ocupando toda a largura

---

## 🎨 4. Ícone SVG

O projeto utiliza um único ícone (`info.svg`) para todos os tipos de snackbar. A diferenciação visual é feita através das cores aplicadas via CSS.

**src/assets/icons/info.svg**

```svg
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>
```

**💡 Por que um único ícone?**
- Simplicidade: Menos arquivos para gerenciar
- Consistência: Mesmo ícone, cores diferentes
- Performance: Apenas um SVG carregado
- O `currentColor` no SVG permite herdar a cor definida no CSS

---

## 🔗 5. Integrar no App Principal

### 5.1 Adicionar no App Component

**src/app/app.ts**

```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SnackbarComponent } from '@app/shared/components/snackbar/snackbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SnackbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
```

### 5.2 Adicionar no Template

**src/app/app.html**

```html
<router-outlet />
<pony-snackbar />
```

**💡 Importante:** O componente snackbar deve estar fora do `<router-outlet>` para ser exibido em todas as páginas.

---

## 🔄 6. Usar no Login Component

Vamos atualizar o componente de login para usar o Snackbar:

**src/app/features/auth/pages/login/login.component.ts**

```typescript
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { SnackbarService } from '@core/services/snackbar.service';
import { LoginRequest } from '@core/models/user.model';
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

    private authService = inject(AuthService);
    private snackbarService = inject(SnackbarService);
    private router = inject(Router);

    onSubmit(): void {
        if (!this.email() || !this.password()) {
            this.snackbarService.error('Por favor, preencha todos os campos');
            return;
        }

        this.isLoading.set(true);

        const loginData: LoginRequest = {
            email: this.email(),
            password: this.password(),
        };

        this.authService.login(loginData).subscribe({
            next: (response) => {
                this.isLoading.set(false);
                const hasUserData = response.access_token && response.user;

                if (hasUserData) {
                    this.snackbarService.success('Login realizado com sucesso!');
                    // this.router.navigate(['/home']);
                    return;
                }

                this.snackbarService.error('Tente novamente!');
            },
            error: () => {
                this.snackbarService.error('Erro ao processar a solicitação.');
                this.isLoading.set(false);
            },
        });
    }

    updateEmail(value: string): void {
        this.email.set(value);
    }

    updatePassword(value: string): void {
        this.password.set(value);
    }
}
```

**💡 Mudanças:**
- Injetamos `SnackbarService`
- Substituímos `alert()` por `snackbarService.error()` e `snackbarService.success()`
- Feedback de sucesso quando login é bem-sucedido
- Feedback de erro quando campos não são preenchidos ou ocorre erro na requisição
- Navegação comentada até implementar a rota `/home`

---

## 🧪 7. Testar o Snackbar

### 7.1 Teste Manual

1. Abra `http://localhost:4200`
2. **Teste erro de validação:**
   - Clique em "Login" sem preencher campos
   - Snackbar vermelho deve aparecer
3. **Teste erro de credenciais:**
   - Digite email/senha incorretos
   - Snackbar vermelho "Email ou senha inválidos!"
4. **Teste sucesso:**
   - Digite credenciais corretas
   - Snackbar verde "Login realizado com sucesso!"

### 7.2 Verificar Auto-Dismiss

- Snackbar deve desaparecer automaticamente após 5 segundos
- Botão X deve fechar manualmente

### 7.3 Verificar Múltiplas Mensagens

- Clique várias vezes em "Login" (sem preencher)
- Múltiplos snackbars devem empilhar verticalmente

---

## 🎨 8. Customizações Avançadas

### 8.1 Duração Customizada

```typescript
// Mensagem que fica 10 segundos
this.snackbarService.error('Erro crítico!', 10000);

// Mensagem que não desaparece automaticamente
this.snackbarService.info('Importante!', 0);
```

### 8.2 Adicionar Mais Ícones

Atualmente, o projeto usa apenas `info.svg`. Se desejar ícones específicos por tipo, você pode:

1. Criar novos ícones SVG (`success.svg`, `error.svg`)
2. Modificar o componente para selecionar o ícone dinamicamente:

```typescript
getIcon(type: string): string {
    const icons: Record<string, string> = {
        success: 'check',
        error: 'error',
        info: 'info',
    };
    return `assets/icons/${icons[type] || 'info'}.svg`;
}
```

3. Atualizar o template:

```html
<svg-icon [src]="getIcon(message.type)" [svgStyle]="{ 'width.px': 24, 'height.px': 24 }" />
```

### 8.3 Posicionamento

Altere no SCSS para top-right:

```scss
.snackbar-container {
    position: fixed;
    top: 24px;      // mudou de bottom
    right: 24px;    // mudou de left
    // ...
}
```

---

## 📚 Resumo

Nesta aula você aprendeu:

✅ Criar service de Snackbar com Signals  
✅ Implementar múltiplos tipos de mensagens  
✅ Criar componente visual com animações  
✅ Integrar globalmente no app  
✅ Usar em componentes (exemplo: login)  
✅ Auto-dismiss configurável  
✅ Empilhamento de mensagens  
✅ Responsividade e acessibilidade  

---

## 🎓 Conceitos Aprendidos

- **Toast Notifications**: Padrão de UX para feedback
- **Signal Updates**: Gerenciamento de array reativo
- **setTimeout**: Auto-dismiss de mensagens
- **Dynamic Classes**: Classes CSS baseadas em tipos
- **CSS Animations**: Animação de entrada suave
- **Z-index**: Camadas de interface
- **Accessibility**: Aria-labels para acessibilidade

---

## 🚀 Melhorias Futuras

Possíveis melhorias para o sistema de Snackbar:

1. **Ações nos Snackbars**: Adicionar botões de ação
2. **Histórico**: Armazenar mensagens antigas
3. **Som**: Notificações sonoras
4. **Ícones Animados**: Ícones com animações
5. **Templates Customizados**: Permitir HTML customizado
6. **Max Messages**: Limitar quantidade exibida
7. **Position Options**: Múltiplas posições configuráveis

---

## 📝 Próximos Passos

Na próxima aula, vamos usar o Snackbar em mais lugares:
- Listagem de ponies
- Operações CRUD
- Tratamento de erros global
- Interceptor para erros HTTP

# 📘 Aula 5B — Sistema de Feedback com Snackbar (Parte 2: Integração e Testes)

> 📌 **Parte 1:** [05a-snackbar.md](05a-snackbar.md) — Service e Component

**Progresso do Curso Frontend:** `[██████░░░░░░░░░░░░░░] 32% concluído`

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

**💡 Importante:** O componente snackbar deve estar fora do `<router-outlet>` para ser exibido em todas as páginas e persistir durante navegações.

### 🔍 Conceitos Importantes: Global Component Placement

**Por que fora do router-outlet?**

```html
<!-- ✅ CORRETO -->
<router-outlet />
<pony-snackbar />     <!-- Sempre visível -->

<!-- ❌ ERRADO -->
<router-outlet>
    <pony-snackbar />  <!-- Dentro da rota, seria destruído -->
</router-outlet>
```

**Como funciona:**
```
App Component (global)
│
├─ <router-outlet>         ← Conteúdo das rotas (muda)
│   ├─ LoginComponent
│   ├─ HomeComponent
│   └─ PoniesComponent
│
└─ <pony-snackbar>         ← Sempre presente (não muda)
```

**Outros componentes globais:**
- Modals
- Loading spinners
- Confirmation dialogs
- Global notifications

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

✅ Criar service de Snackbar com Signals (Angular 17+)  
✅ Implementar múltiplos tipos de mensagens (success, error, info)  
✅ Criar componente visual com animações CSS suaves  
✅ Integrar globalmente no app (fora do router-outlet)  
✅ Usar em componentes (exemplo: login com feedback real)  
✅ Auto-dismiss configurável com setTimeout  
✅ Empilhamento de mensagens em array reativo  
✅ Acessibilidade (ARIA labels)  
✅ Entender diferenças Toast vs Modal vs Alert  
✅ Position fixed para componentes globais  
✅ Z-index stacking context para sobrepor elementos  
✅ Signals update() com imutabilidade de arrays  
✅ Track function no @for para otimização  
✅ SVG com currentColor para reutilização de ícones  

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

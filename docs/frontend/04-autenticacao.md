# 📘 Aula 4 — Autenticação e Integração com Backend

## Objetivo

Integrar a tela de login com o backend NestJS, implementando autenticação completa com JWT, configuração de CORS e armazenamento seguro de tokens.

---

## 📋 Pré-requisitos

- Backend NestJS rodando (aula de backend concluída)
- Aula 3 concluída (tela de login criada)

---

## 📦 1. Criar Models no Frontend

### 1.1 Criar Interface de User

**src/app/core/models/user.model.ts**

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

export interface ErrorResponse {
    message: string;
    statusCode: number;
}
```

---

## 🛠️ 2. Criar Helper de LocalStorage

### 2.1 LocalStorage Helper

**src/app/core/helpers/local-storage.helper.ts**

```typescript
export enum LocalStorageKeys {
    TOKEN = 'pony_auth_token',
    USER = 'pony_user',
}

export class LocalStorageHelper {
    static set<T>(key: LocalStorageKeys, value: T): void {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    static get<T>(key: LocalStorageKeys): T | null {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }

    static remove(key: LocalStorageKeys): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    }

    static clear(): void {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }
}
```

---

## 🔐 3. Criar Serviço de Autenticação

### 3.1 AuthService

**src/app/core/services/auth.service.ts**

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { LoginRequest, LoginResponse, User } from '@core/models/user.model';
import { LocalStorageHelper, LocalStorageKeys } from '@core/helpers/local-storage.helper';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:3000';

    constructor(private http: HttpClient) {}

    login(loginData: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, loginData).pipe(
            tap(response => {
                if (response.access_token && response.user) {
                    LocalStorageHelper.set<string>(LocalStorageKeys.TOKEN, response.access_token);
                    LocalStorageHelper.set<User>(LocalStorageKeys.USER, response.user);
                }
            }),
            catchError(error => {
                return throwError(() => error);
            })
        );
    }

    logout(): void {
        LocalStorageHelper.remove(LocalStorageKeys.TOKEN);
        LocalStorageHelper.remove(LocalStorageKeys.USER);
    }

    getToken(): string | null {
        return LocalStorageHelper.get<string>(LocalStorageKeys.TOKEN);
    }

    getUser(): User | null {
        return LocalStorageHelper.get<User>(LocalStorageKeys.USER);
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }
}
```

---

## 🔧 4. Configurar CORS no Backend

### 4.1 Adicionar CORS no main.ts

**api/src/main.ts**

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para permitir requisições do frontend
  app.enableCors({
    origin: 'http://localhost:4200', // URL do frontend Angular
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Pony Collection API')
    .setDescription('API para gerenciar coleção de poneis')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
```

**💡 Importante:** Reinicie o servidor do backend após essa alteração!

```bash
# No terminal do backend
cd api
npm run start:dev
```

---

## � 5. Integrar Login com AuthService

**src/app/features/auth/pages/login/login.component.ts**

```typescript
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
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
    private router = inject(Router);

    onSubmit(): void {
        if (!this.email() || !this.password()) {
            alert('Por favor, preencha todos os campos');
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

                if (response.access_token && response.user) {
                    console.log('Login bem-sucedido!', response);
                    this.router.navigate(['/ponies']);
                } else {
                    alert('Erro ao fazer login. Tente novamente!');
                }
            },
            error: (error) => {
                this.isLoading.set(false);
                console.error('Erro ao fazer login:', error);

                if (error.error?.message) {
                    alert(error.error.message);
                } else if (error.status === 401) {
                    alert('Email ou senha inválidos!');
                } else {
                    alert('Ocorreu um erro durante a requisição!');
                }
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
- Injetamos `AuthService`
- Chamamos a API real com `authService.login()`
- Usamos `alert()` temporário para feedback (será substituído pelo sistema de Snackbar na **Aula 5**)
- Navegamos para `/ponies` em caso de sucesso
- Token e usuário são salvos automaticamente no localStorage

---

## 🧪 6. Testar a Integração

### 6.1 Criar Usuário de Teste (via Swagger)

1. Abra `http://localhost:3000/swagger`
2. Vá em `/users` → POST
3. Crie um usuário:

```json
{
  "name": "Teste User",
  "email": "teste@email.com",
  "password": "123456"
}
```

### 6.2 Testar Login

1. Abra `http://localhost:4200`
2. Digite o email e senha criados
3. Clique em "Login"
4. Verifique:
   - Loading aparece no botão
   - Alert aparece com sucesso
   - Token é salvo no localStorage (inspecione no devtools)
   - Redirecionamento acontece
   - Console mostra o log da resposta

---

## 🛡️ 7. Criar Guard de Autenticação (Opcional)

**src/app/core/guards/auth.guard.ts**

```typescript
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return true;
    }

    router.navigate(['/login']);
    return false;
};
```

**Usar no app.routes.ts:**

```typescript
import { authGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'ponies',
        component: PoniesComponent,
        canActivate: [authGuard] // Proteger rota
    },
    // ... outras rotas
];
```

---

## 🎯 8. Interceptor HTTP (Opcional)

Para adicionar automaticamente o token nas requisições:

**src/app/core/interceptors/auth.interceptor.ts**

```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();

    if (token) {
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(req);
};
```

**Configurar no app.config.ts:**

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... outros providers
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
```

---

## 📚 Resumo

Nesta aula você aprendeu:

✅ Configurar CORS no backend NestJS  
✅ Criar models TypeScript para API  
✅ Implementar LocalStorage helper para persistência  
✅ Criar AuthService para autenticação  
✅ Integrar login com backend real  
✅ Gerenciar tokens JWT  
✅ Criar guards de autenticação  
✅ Implementar interceptors HTTP  
✅ Tratar erros de API básico (alert temporário)  

---

## 🎓 Conceitos Aprendidos

- **CORS**: Cross-Origin Resource Sharing
- **JWT**: JSON Web Tokens para autenticação
- **Observables**: RxJS para chamadas assíncronas
- **Guards**: Proteção de rotas
- **Interceptors**: Middleware para requisições HTTP
- **LocalStorage**: Persistência de dados no navegador
- **Signals**: Reatividade moderna do Angular

---

## 📝 Próximos Passos

Na próxima aula (**Aula 5**), vamos implementar o **Sistema de Feedback com Snackbar** para substituir os `alert()` temporários por notificações elegantes e modernas:
- Criar SnackbarService com Signals
- Implementar componente visual com animações
- Tipos de mensagens (success, error, info)
- Auto-dismiss configurável
- Integração global no app
- Substituir alerts do login por snackbars

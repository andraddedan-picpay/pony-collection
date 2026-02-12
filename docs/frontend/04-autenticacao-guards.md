# 📘 Aula 4 — Autenticação e Guards

## Objetivo

Implementar o serviço de autenticação, integração com a API, Guards para proteção de rotas e interceptor JWT.

---

## Passos

### 1. Criar AuthService

**src/app/features/auth/services/auth.service.ts**
```typescript
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoginRequest, LoginResponse, User } from '../../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'pony_collection_token';
  private readonly USER_KEY = 'pony_collection_user';

  // Estado reativo com Signals
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  currentUser$ = this.currentUserSubject.asObservable();
  
  // Signals
  isAuthenticated = signal(this.hasToken());
  currentUser = signal<User | null>(this.getUserFromStorage());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Realiza o login do usuário
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/auth/login`,
      credentials
    ).pipe(
      tap(response => {
        this.setSession(response);
      }),
      catchError(error => {
        console.error('Erro no login:', error);
        return throwError(() => new Error(
          error.error?.message || 'Erro ao fazer login'
        ));
      })
    );
  }

  /**
   * Realiza o logout do usuário
   */
  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isLoggedIn(): boolean {
    return this.hasToken();
  }

  /**
   * Retorna o token JWT
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Retorna o usuário atual
   */
  getCurrentUser(): User | null {
    return this.currentUser();
  }

  // ========================================
  // Métodos Privados
  // ========================================

  private setSession(authResult: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authResult.access_token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authResult.user));
    
    this.isAuthenticated.set(true);
    this.currentUser.set(authResult.user);
    this.currentUserSubject.next(authResult.user);
  }

  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.currentUserSubject.next(null);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }
}
```

---

### 2. Criar AuthGuard

**src/app/core/guards/auth.guard.ts**
```typescript
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Redireciona para login mantendo a URL tentada
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  
  return false;
};
```

---

### 3. Criar JWT Interceptor

**src/app/core/interceptors/jwt.interceptor.ts**
```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../features/auth/services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Se houver token, adiciona ao header
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

---

### 4. Configurar Interceptor no App Config

**src/app/app.config.ts**
```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([jwtInterceptor])
    )
  ]
};
```

---

### 5. Atualizar LoginComponent

**src/app/features/auth/pages/login/login.component.ts**
```typescript
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { AuthService } from '../../services/auth.service';

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
  returnUrl = '/ponies';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    // Se já estiver logado, redireciona
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/ponies']);
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Pega a URL de retorno se houver
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/ponies';
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

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate([this.returnUrl]);
      },
      error: (error) => {
        this.errorMessage.set(
          error.message || 'Email ou senha incorretos'
        );
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }
}
```

---

### 6. Criar Rota Protegida Temporária

**src/app/features/ponies/ponies.routes.ts**
```typescript
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const poniesRoutes: Routes = [
  {
    path: 'ponies',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => 
          import('./pages/ponies-list/ponies-list.component')
            .then(m => m.PoniesListComponent)
      }
    ]
  }
];
```

Criar componente temporário:

```bash
ng generate component features/ponies/pages/ponies-list --skip-tests
```

**src/app/features/ponies/pages/ponies-list/ponies-list.component.html**
```html
<div class="container" style="padding: 2rem;">
  <h1>Lista de Ponies</h1>
  <p>Rota protegida! Você está autenticado.</p>
  <app-button variant="critical" (click)="logout()">Sair</app-button>
</div>
```

**src/app/features/ponies/pages/ponies-list/ponies-list.component.ts**
```typescript
import { Component } from '@angular/core';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-ponies-list',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './ponies-list.component.html',
  styleUrl: './ponies-list.component.scss'
})
export class PoniesListComponent {
  constructor(private authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
```

---

### 7. Atualizar Rotas Principais

**src/app/app.routes.ts**
```typescript
import { Routes } from '@angular/router';
import { authRoutes } from './features/auth/auth.routes';
import { poniesRoutes } from './features/ponies/ponies.routes';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'ponies',
    pathMatch: 'full'
  },
  ...authRoutes,
  ...poniesRoutes,
  {
    path: '**',
    redirectTo: 'login'
  }
];
```

---

### 8. Testar Fluxo Completo

```bash
npm start
```

#### Cenários de Teste:

1. **Acesso sem login:**
   - Acesse `http://localhost:4200/ponies`
   - Deve redirecionar para `/login?returnUrl=/ponies`

2. **Login com sucesso:**
   - Faça login com credenciais válidas
   - Deve redirecionar para `/ponies`
   - Token deve estar no localStorage

3. **Token enviado nas requisições:**
   - Abra o DevTools → Network
   - Veja que as requisições têm header `Authorization: Bearer <token>`

4. **Logout:**
   - Clique em "Sair" na página de ponies
   - Deve limpar token e redirecionar para login

5. **Acesso direto após login:**
   - Com token válido, acesse `http://localhost:4200/ponies`
   - Deve acessar diretamente sem redirecionar

---

## ✅ Resultado Esperado

- ✅ AuthService implementado com Signals
- ✅ Login funcional com integração à API
- ✅ Token JWT armazenado no localStorage
- ✅ AuthGuard protegendo rotas privadas
- ✅ JwtInterceptor adicionando token automaticamente
- ✅ Logout funcional com limpeza de estado
- ✅ Redirecionamento após login
- ✅ TypeScript tipado e sem erros

---

## 🔐 Segurança

### Boas Práticas Implementadas:

✅ Token armazenado no localStorage (adequado para SPA)
✅ Verificação de autenticação no guard
✅ Interceptor automático para todas as requisições
✅ Limpeza completa no logout
✅ Estado reativo com Signals

### Melhorias Futuras:

- Refresh token automático
- Expiração de token com countdown
- Múltiplas tentativas de login com bloqueio
- Remember me (armazenamento persistente)

---

## 📝 Próximos Passos

Na próxima aula, vamos implementar a listagem real de ponies com integração à API, cards, loading e empty states.

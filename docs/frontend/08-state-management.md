# 📘 Aula 8 — State Management e Boas Práticas

## Objetivo

Aprofundar em gerenciamento de estado com Signals, implementar patterns avançados, otimizar performance e aplicar boas práticas no Angular.

---

## Conceitos Importantes

### 1. Signals vs RxJS

**Signals (Angular 16+)**
- Estado reativo síncrono
- Melhor performance
- Menos boilerplate
- Change detection otimizado

**RxJS (Observables)**
- Para operações assíncronas
- HTTP requests
- Event streams
- Composição complexa

---

## Passos

### 1. Criar Service de Estado Global

**src/app/core/services/app-state.service.ts**
```typescript
import { Injectable, signal, computed } from '@angular/core';

export interface AppState {
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  // Estado global da aplicação
  private state = signal<AppState>({
    loading: false,
    error: null,
    successMessage: null
  });

  // Selectors (computed)
  loading = computed(() => this.state().loading);
  error = computed(() => this.state().error);
  successMessage = computed(() => this.state().successMessage);
  hasError = computed(() => !!this.state().error);
  hasSuccess = computed(() => !!this.state().successMessage);

  /**
   * Define loading state
   */
  setLoading(loading: boolean): void {
    this.state.update(state => ({ ...state, loading }));
  }

  /**
   * Define mensagem de erro
   */
  setError(error: string | null): void {
    this.state.update(state => ({ ...state, error, successMessage: null }));
    
    // Auto-clear após 5 segundos
    if (error) {
      setTimeout(() => this.clearError(), 5000);
    }
  }

  /**
   * Define mensagem de sucesso
   */
  setSuccess(message: string): void {
    this.state.update(state => ({ ...state, successMessage: message, error: null }));
    
    // Auto-clear após 3 segundos
    setTimeout(() => this.clearSuccess(), 3000);
  }

  /**
   * Limpa erro
   */
  clearError(): void {
    this.state.update(state => ({ ...state, error: null }));
  }

  /**
   * Limpa mensagem de sucesso
   */
  clearSuccess(): void {
    this.state.update(state => ({ ...state, successMessage: null }));
  }

  /**
   * Reseta todo o estado
   */
  reset(): void {
    this.state.set({
      loading: false,
      error: null,
      successMessage: null
    });
  }
}
```

---

### 2. Criar Componente de Notificação

```bash
ng generate component shared/components/notification --skip-tests
```

**src/app/shared/components/notification/notification.component.ts**
```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss',
  animations: [
    trigger('slideDown', [
      state('void', style({ transform: 'translateY(-100%)', opacity: 0 })),
      state('*', style({ transform: 'translateY(0)', opacity: 1 })),
      transition(':enter', animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition(':leave', animate('250ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class NotificationComponent {
  @Input() message = '';
  @Input() type: NotificationType = 'info';
  @Input() show = false;
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  get icon(): string {
    const icons: Record<NotificationType, string> = {
      success: '✓',
      error: '⚠',
      info: 'ℹ',
      warning: '⚡'
    };
    return icons[this.type];
  }
}
```

**src/app/shared/components/notification/notification.component.html**
```html
@if (show && message) {
  <div 
    class="notification"
    [class]="'notification--' + type"
    @slideDown>
    <div class="notification__content">
      <span class="notification__icon">{{ icon }}</span>
      <p class="notification__message">{{ message }}</p>
    </div>
    <button class="notification__close" (click)="onClose()">✕</button>
  </div>
}
```

**src/app/shared/components/notification/notification.component.scss**
```scss
@import 'variables';
@import 'mixins';

.notification {
  position: fixed;
  top: 1rem;
  right: 1rem;
  left: 1rem;
  max-width: 500px;
  margin: 0 auto;
  padding: 1rem 3rem 1rem 1rem;
  border-radius: 12px;
  @include box-shadow-base;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @include mobile {
    left: 1rem;
    right: 1rem;
    max-width: none;
  }

  &__content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
  }

  &__icon {
    font-size: $font-size-xl;
    line-height: 1;
  }

  &__message {
    font-size: $font-size-sm;
    font-weight: 500;
    margin: 0;
    flex: 1;
  }

  &__close {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    @include flex-center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background-color: transparent;
    border: none;
    cursor: pointer;
    font-size: $font-size-lg;
    @include transition(background-color);

    &:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }

  // Variants
  &--success {
    background-color: $success-color;
    color: darken($success-color, 40%);

    .notification__icon {
      background-color: rgba(255, 255, 255, 0.3);
      width: 32px;
      height: 32px;
      @include flex-center;
      border-radius: 50%;
    }
  }

  &--error {
    background-color: $critical-color;
    color: $text-color;
  }

  &--info {
    background-color: $primary-color;
    color: $text-color;
  }

  &--warning {
    background-color: lighten($secondary-color, 20%);
    color: $text-color;
  }
}
```

---

### 3. Atualizar PoniesService com Melhor Gerenciamento

**src/app/features/ponies/services/ponies.service.ts**
```typescript
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError, finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Pony, CreatePonyDto, UpdatePonyDto } from '../../../shared/models/pony.model';
import { AppStateService } from '../../../core/services/app-state.service';

@Injectable({
  providedIn: 'root'
})
export class PoniesService {
  // Estado local
  private poniesSignal = signal<Pony[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  // Public readonly signals
  readonly ponies = this.poniesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  // Computed signals
  readonly hasPonies = computed(() => this.poniesSignal().length > 0);
  readonly poniesCount = computed(() => this.poniesSignal().length);
  readonly sortedPonies = computed(() => 
    [...this.poniesSignal()].sort((a, b) => a.name.localeCompare(b.name))
  );

  constructor(
    private http: HttpClient,
    private appState: AppStateService
  ) {}

  /**
   * Busca todos os ponies
   */
  getPonies(): Observable<Pony[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<Pony[]>(`${environment.apiUrl}/ponies`).pipe(
      tap(ponies => {
        this.poniesSignal.set(ponies);
      }),
      catchError(error => this.handleError(error, 'Erro ao carregar ponies')),
      finalize(() => this.loadingSignal.set(false))
    );
  }

  /**
   * Busca um pony por ID
   */
  getPonyById(id: string): Observable<Pony> {
    return this.http.get<Pony>(`${environment.apiUrl}/ponies/${id}`).pipe(
      catchError(error => this.handleError(error, 'Erro ao buscar pony'))
    );
  }

  /**
   * Cria um novo pony
   */
  createPony(pony: CreatePonyDto): Observable<Pony> {
    this.appState.setLoading(true);

    return this.http.post<Pony>(`${environment.apiUrl}/ponies`, pony).pipe(
      tap(newPony => {
        this.poniesSignal.update(ponies => [...ponies, newPony]);
        this.appState.setSuccess('Pony criado com sucesso! 🎉');
      }),
      catchError(error => this.handleError(error, 'Erro ao criar pony')),
      finalize(() => this.appState.setLoading(false))
    );
  }

  /**
   * Atualiza um pony
   */
  updatePony(id: string, pony: UpdatePonyDto): Observable<Pony> {
    this.appState.setLoading(true);

    return this.http.put<Pony>(`${environment.apiUrl}/ponies/${id}`, pony).pipe(
      tap(updatedPony => {
        this.poniesSignal.update(ponies =>
          ponies.map(p => p.id === id ? updatedPony : p)
        );
        this.appState.setSuccess('Pony atualizado com sucesso! ✓');
      }),
      catchError(error => this.handleError(error, 'Erro ao atualizar pony')),
      finalize(() => this.appState.setLoading(false))
    );
  }

  /**
   * Deleta um pony
   */
  deletePony(id: string): Observable<void> {
    this.appState.setLoading(true);

    return this.http.delete<void>(`${environment.apiUrl}/ponies/${id}`).pipe(
      tap(() => {
        this.poniesSignal.update(ponies => ponies.filter(p => p.id !== id));
        this.appState.setSuccess('Pony excluído com sucesso');
      }),
      catchError(error => this.handleError(error, 'Erro ao deletar pony')),
      finalize(() => this.appState.setLoading(false))
    );
  }

  /**
   * Busca pony por nome (local)
   */
  searchByName(query: string): Pony[] {
    const lowerQuery = query.toLowerCase();
    return this.poniesSignal().filter(pony =>
      pony.name.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Tratamento de erros centralizado
   */
  private handleError(error: HttpErrorResponse, defaultMessage: string): Observable<never> {
    console.error('HTTP Error:', error);
    
    let errorMessage = defaultMessage;
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 0) {
      errorMessage = 'Erro de conexão. Verifique sua internet.';
    } else if (error.status >= 500) {
      errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
    }

    this.errorSignal.set(errorMessage);
    this.appState.setError(errorMessage);
    
    return throwError(() => new Error(errorMessage));
  }
}
```

---

### 4. Adicionar Notificações no AppComponent

**src/app/app.component.ts**
```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { AppStateService } from './core/services/app-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // Expose app state signals
  error = this.appState.error;
  successMessage = this.appState.successMessage;
  hasError = this.appState.hasError;
  hasSuccess = this.appState.hasSuccess;

  constructor(public appState: AppStateService) {}
}
```

**src/app/app.component.html**
```html
<!-- Notifications -->
<app-notification
  [message]="error() || ''"
  [show]="hasError()"
  type="error"
  (close)="appState.clearError()">
</app-notification>

<app-notification
  [message]="successMessage() || ''"
  [show]="hasSuccess()"
  type="success"
  (close)="appState.clearSuccess()">
</app-notification>

<!-- Router -->
<router-outlet />
```

---

### 5. Otimizar PoniesListComponent

**src/app/features/ponies/pages/ponies-list/ponies-list.component.ts**
```typescript
import { Component, OnInit, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PonyCardComponent } from '../../components/pony-card/pony-card.component';
import { PonyDetailsSidesheetComponent } from '../../components/pony-details-sidesheet/pony-details-sidesheet.component';
import { PonyFormSidesheetComponent } from '../../components/pony-form-sidesheet/pony-form-sidesheet.component';
import { PoniesService } from '../../services/ponies.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Pony, CreatePonyDto, UpdatePonyDto } from '../../../../shared/models/pony.model';

@Component({
  selector: 'app-ponies-list',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    LoadingComponent,
    EmptyStateComponent,
    PonyCardComponent,
    PonyDetailsSidesheetComponent,
    PonyFormSidesheetComponent
  ],
  templateUrl: './ponies-list.component.html',
  styleUrl: './ponies-list.component.scss'
})
export class PoniesListComponent implements OnInit {
  // Signals do service
  ponies = this.poniesService.ponies;
  loading = this.poniesService.loading;
  error = this.poniesService.error;

  // Local signals
  selectedPony = signal<Pony | null>(null);
  ponyToEdit = signal<Pony | null>(null);
  isDetailsSidesheetOpen = signal(false);
  isFormSidesheetOpen = signal(false);

  // Computed
  hasPonies = computed(() => this.ponies().length > 0);
  userName = computed(() => this.authService.currentUser()?.name || 'Usuário');

  // Effect para log (apenas para demonstração)
  private logEffect = effect(() => {
    console.log('Ponies count:', this.ponies().length);
  });

  constructor(
    private poniesService: PoniesService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPonies();
  }

  loadPonies(): void {
    this.poniesService.getPonies()
      .pipe(takeUntilDestroyed())
      .subscribe();
  }

  onPonyClick(pony: Pony): void {
    this.selectedPony.set(pony);
    this.isDetailsSidesheetOpen.set(true);
  }

  onCloseSidesheet(): void {
    this.isDetailsSidesheetOpen.set(false);
    setTimeout(() => this.selectedPony.set(null), 300);
  }

  onEditPony(pony: Pony): void {
    this.ponyToEdit.set(pony);
    this.isFormSidesheetOpen.set(true);
    this.onCloseSidesheet();
  }

  onDeletePony(id: string): void {
    this.poniesService.deletePony(id).subscribe();
  }

  onAddPony(): void {
    this.ponyToEdit.set(null);
    this.isFormSidesheetOpen.set(true);
  }

  onCloseFormSidesheet(): void {
    this.isFormSidesheetOpen.set(false);
    setTimeout(() => this.ponyToEdit.set(null), 300);
  }

  onSavePony(ponyData: CreatePonyDto | UpdatePonyDto): void {
    const ponyToEdit = this.ponyToEdit();

    const operation = ponyToEdit
      ? this.poniesService.updatePony(ponyToEdit.id, ponyData)
      : this.poniesService.createPony(ponyData as CreatePonyDto);

    operation.subscribe({
      next: () => this.onCloseFormSidesheet(),
      error: () => {} // Erro já tratado no service
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
```

---

## ✅ Resultado Esperado

- ✅ AppStateService para estado global
- ✅ Notificações toast com auto-dismiss
- ✅ Tratamento de erros centralizado
- ✅ Signals otimizados (readonly)
- ✅ Computed signals para dados derivados
- ✅ Effects para side effects
- ✅ takeUntilDestroyed para cleanup automático
- ✅ Mensagens de sucesso/erro em todas operações
- ✅ Performance otimizada

---

## 🎯 Boas Práticas Aplicadas

### Signals
✅ Use `asReadonly()` para expor signals
✅ Use `computed()` para valores derivados
✅ Use `effect()` para side effects
✅ Use `update()` ao invés de `set()` quando possível

### RxJS
✅ Use `takeUntilDestroyed()` para cleanup
✅ Use `finalize()` para ações de cleanup
✅ Use `catchError()` para tratamento de erros
✅ Use `tap()` para side effects

### Performance
✅ OnPush change detection (automático com signals)
✅ Lazy loading de rotas
✅ TrackBy em ngFor (track no @for)
✅ Computed signals para dados derivados

### Organização
✅ Services com single responsibility
✅ Estado centralizado quando necessário
✅ Componentes dump vs smart
✅ Reutilização de componentes

---

## 📝 Próximos Passos

Na próxima e última aula, vamos implementar melhorias finais: header com usuário, confirmações, melhorias de UX e polish geral.

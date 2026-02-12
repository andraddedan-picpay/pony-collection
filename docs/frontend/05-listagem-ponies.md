# 📘 Aula 5 — Listagem de Ponies

## Objetivo

Implementar a listagem de ponies com integração à API, PonyCard component, loading states, empty states e grid responsivo.

---

## Passos

### 1. Criar Model do Pony

**src/app/shared/models/pony.model.ts**
```typescript
export interface Pony {
  id: string;
  name: string;
  element: string;
  personality: string;
  talent: string;
  summary: string;
  imageUrl: string;
  createdAt: string;
}

export interface CreatePonyDto {
  name: string;
  element: string;
  personality: string;
  talent: string;
  summary: string;
  imageUrl: string;
}

export interface UpdatePonyDto extends Partial<CreatePonyDto> {}
```

---

### 2. Criar Ponies Service

**src/app/features/ponies/services/ponies.service.ts**
```typescript
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Pony, CreatePonyDto, UpdatePonyDto } from '../../../shared/models/pony.model';

@Injectable({
  providedIn: 'root'
})
export class PoniesService {
  // Estado reativo
  ponies = signal<Pony[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Busca todos os ponies
   */
  getPonies(): Observable<Pony[]> {
    this.loading.set(true);
    this.error.set(null);

    return this.http.get<Pony[]>(`${environment.apiUrl}/ponies`).pipe(
      tap(ponies => {
        this.ponies.set(ponies);
        this.loading.set(false);
      }),
      catchError(error => {
        this.error.set('Erro ao carregar ponies');
        this.loading.set(false);
        console.error('Erro ao buscar ponies:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Busca um pony por ID
   */
  getPonyById(id: string): Observable<Pony> {
    return this.http.get<Pony>(`${environment.apiUrl}/ponies/${id}`).pipe(
      catchError(error => {
        console.error('Erro ao buscar pony:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Cria um novo pony
   */
  createPony(pony: CreatePonyDto): Observable<Pony> {
    return this.http.post<Pony>(`${environment.apiUrl}/ponies`, pony).pipe(
      tap(newPony => {
        // Adiciona o novo pony à lista
        this.ponies.update(ponies => [...ponies, newPony]);
      }),
      catchError(error => {
        console.error('Erro ao criar pony:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Atualiza um pony
   */
  updatePony(id: string, pony: UpdatePonyDto): Observable<Pony> {
    return this.http.put<Pony>(`${environment.apiUrl}/ponies/${id}`, pony).pipe(
      tap(updatedPony => {
        // Atualiza o pony na lista
        this.ponies.update(ponies =>
          ponies.map(p => p.id === id ? updatedPony : p)
        );
      }),
      catchError(error => {
        console.error('Erro ao atualizar pony:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Deleta um pony
   */
  deletePony(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/ponies/${id}`).pipe(
      tap(() => {
        // Remove o pony da lista
        this.ponies.update(ponies => ponies.filter(p => p.id !== id));
      }),
      catchError(error => {
        console.error('Erro ao deletar pony:', error);
        return throwError(() => error);
      })
    );
  }
}
```

---

### 3. Criar PonyCard Component

```bash
ng generate component features/ponies/components/pony-card --skip-tests
```

**src/app/features/ponies/components/pony-card/pony-card.component.ts**
```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { Pony } from '../../../../shared/models/pony.model';

@Component({
  selector: 'app-pony-card',
  standalone: true,
  imports: [CommonModule, CardComponent],
  templateUrl: './pony-card.component.html',
  styleUrl: './pony-card.component.scss'
})
export class PonyCardComponent {
  @Input({ required: true }) pony!: Pony;
  @Output() cardClick = new EventEmitter<Pony>();

  onClick(): void {
    this.cardClick.emit(this.pony);
  }
}
```

**src/app/features/ponies/components/pony-card/pony-card.component.html**
```html
<app-card [hoverable]="true" padding="none" (click)="onClick()">
  <div class="pony-card">
    <div class="pony-card__image">
      <img [src]="pony.imageUrl" [alt]="pony.name" />
    </div>
    
    <div class="pony-card__content">
      <h3 class="pony-card__name">{{ pony.name }}</h3>
      
      <div class="pony-card__badges">
        <span class="badge badge--element">{{ pony.element }}</span>
        <span class="badge badge--personality">{{ pony.personality }}</span>
      </div>
      
      <p class="pony-card__summary">
        {{ pony.summary | slice:0:100 }}{{ pony.summary.length > 100 ? '...' : '' }}
      </p>
      
      <div class="pony-card__footer">
        <span class="pony-card__talent">⭐ {{ pony.talent }}</span>
      </div>
    </div>
  </div>
</app-card>
```

**src/app/features/ponies/components/pony-card/pony-card.component.scss**
```scss
@import 'variables';
@import 'mixins';

.pony-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  &__image {
    width: 100%;
    height: 200px;
    overflow: hidden;
    background: linear-gradient(135deg, $base-dark-1, $base-dark-3);
    @include flex-center;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__content {
    @include flex-column;
    gap: 0.75rem;
    padding: 1.25rem;
    flex: 1;
  }

  &__name {
    font-size: $font-size-xl;
    font-weight: 700;
    color: $text-color;
    margin: 0;
  }

  &__badges {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  &__summary {
    font-size: $font-size-sm;
    color: $grayscale-03;
    line-height: 1.5;
    flex: 1;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.75rem;
    border-top: 1px solid $base-dark-3;
  }

  &__talent {
    font-size: $font-size-xs;
    color: $primary-color;
    font-weight: 600;
  }
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: $font-size-xs;
  font-weight: 600;

  &--element {
    background-color: rgba($primary-color, 0.2);
    color: $primary-color;
  }

  &--personality {
    background-color: rgba($secondary-color, 0.3);
    color: lighten($secondary-color, 30%);
  }
}
```

---

### 4. Atualizar PoniesListComponent

**src/app/features/ponies/pages/ponies-list/ponies-list.component.ts**
```typescript
import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PonyCardComponent } from '../../components/pony-card/pony-card.component';
import { PoniesService } from '../../services/ponies.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Pony } from '../../../../shared/models/pony.model';

@Component({
  selector: 'app-ponies-list',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    LoadingComponent,
    EmptyStateComponent,
    PonyCardComponent
  ],
  templateUrl: './ponies-list.component.html',
  styleUrl: './ponies-list.component.scss'
})
export class PoniesListComponent implements OnInit {
  // Signals do service
  ponies = this.poniesService.ponies;
  loading = this.poniesService.loading;
  error = this.poniesService.error;

  // Computed
  hasPonies = computed(() => this.ponies().length > 0);
  userName = computed(() => this.authService.currentUser()?.name || 'Usuário');

  constructor(
    private poniesService: PoniesService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPonies();
  }

  loadPonies(): void {
    this.poniesService.getPonies().subscribe();
  }

  onPonyClick(pony: Pony): void {
    console.log('Pony clicado:', pony);
    // Na próxima aula, abrirá o sidesheet
  }

  onAddPony(): void {
    console.log('Adicionar pony');
    // Na próxima aula, abrirá o sidesheet de formulário
  }

  logout(): void {
    this.authService.logout();
  }
}
```

**src/app/features/ponies/pages/ponies-list/ponies-list.component.html**
```html
<div class="ponies-page">
  <!-- Header -->
  <header class="ponies-header">
    <div class="container">
      <div class="ponies-header__content">
        <div class="ponies-header__left">
          <h1 class="ponies-header__title">Pony Collection</h1>
          <p class="ponies-header__subtitle">Olá, {{ userName() }}! 🦄</p>
        </div>
        
        <div class="ponies-header__actions">
          <app-button variant="primary" (click)="onAddPony()">
            + Adicionar Pony
          </app-button>
          <app-button variant="secondary" (click)="logout()">
            Sair
          </app-button>
        </div>
      </div>
    </div>
  </header>

  <!-- Content -->
  <main class="ponies-content">
    <div class="container">
      
      <!-- Loading State -->
      @if (loading()) {
        <app-loading message="Carregando ponies..." size="large" />
      }

      <!-- Error State -->
      @else if (error()) {
        <app-empty-state 
          title="Erro ao carregar" 
          [description]="error()!"
          icon="⚠️">
          <app-button variant="primary" (click)="loadPonies()">
            Tentar novamente
          </app-button>
        </app-empty-state>
      }

      <!-- Empty State -->
      @else if (!hasPonies()) {
        <app-empty-state 
          title="Nenhum pony encontrado" 
          description="Comece adicionando o primeiro pony à sua coleção"
          icon="🦄">
          <app-button variant="primary" (click)="onAddPony()">
            Adicionar primeiro pony
          </app-button>
        </app-empty-state>
      }

      <!-- Grid de Ponies -->
      @else {
        <div class="ponies-grid">
          @for (pony of ponies(); track pony.id) {
            <app-pony-card 
              [pony]="pony" 
              (cardClick)="onPonyClick($event)" />
          }
        </div>
      }

    </div>
  </main>
</div>
```

**src/app/features/ponies/pages/ponies-list/ponies-list.component.scss**
```scss
@import 'variables';
@import 'mixins';

.ponies-page {
  min-height: 100vh;
  background-color: $base-dark-1;
}

.ponies-header {
  background-color: $base-dark-2;
  padding: 1.5rem 0;
  @include box-shadow-base;
  position: sticky;
  top: 0;
  z-index: 100;

  &__content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;

    @include mobile {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  &__left {
    @include flex-column;
    gap: 0.25rem;
  }

  &__title {
    font-family: $logo-family;
    font-size: $font-size-4xl;
    color: $primary-color;
    margin: 0;
  }

  &__subtitle {
    font-size: $font-size-sm;
    color: $grayscale-03;
    margin: 0;
  }

  &__actions {
    display: flex;
    gap: 0.75rem;

    @include mobile {
      width: 100%;
      
      app-button {
        flex: 1;
      }
    }
  }
}

.ponies-content {
  padding: 2rem 0;
}

.ponies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  
  @include mobile {
    grid-template-columns: 1fr;
  }
}
```

---

## ✅ Resultado Esperado

- ✅ Listagem de ponies funcional
- ✅ Integração com API do backend
- ✅ PonyCard component estilizado
- ✅ Grid responsivo
- ✅ Loading state durante carregamento
- ✅ Empty state quando não há ponies
- ✅ Error state com retry
- ✅ Header com nome do usuário
- ✅ Botões de ação (adicionar e sair)
- ✅ Estado gerenciado com Signals

---

## 🎨 Screenshot Esperado

A página deve ter:
- Header fixo com logo e botões
- Grid de cards com imagens dos ponies
- Badges coloridas para element e personality
- Hover effects nos cards
- Design responsivo

---

## 📝 Próximos Passos

Na próxima aula, vamos criar o componente Sidesheet e implementar a visualização de detalhes do pony.

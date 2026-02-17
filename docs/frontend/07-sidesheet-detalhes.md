# 📘 Aula 6 — Sidesheet de Detalhes

## Objetivo

Criar um componente Sidesheet reutilizável e implementar a visualização detalhada de um pony com animações suaves.

---

## Passos

### 1. Criar Componente Sidesheet

```bash
ng generate component shared/components/sidesheet --skip-tests
```

**src/app/shared/components/sidesheet/sidesheet.component.ts**
```typescript
import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-sidesheet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidesheet.component.html',
  styleUrl: './sidesheet.component.scss',
  animations: [
    trigger('slideIn', [
      state('void', style({ transform: 'translateX(100%)' })),
      state('*', style({ transform: 'translateX(0)' })),
      transition(':enter', animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition(':leave', animate('250ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
    trigger('fadeIn', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),
      transition(':enter', animate('200ms ease-in')),
      transition(':leave', animate('150ms ease-out'))
    ])
  ]
})
export class SidesheetComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  onOverlayClick(): void {
    this.onClose();
  }

  onContentClick(event: Event): void {
    event.stopPropagation();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.isOpen) {
      this.onClose();
    }
  }
}
```

**src/app/shared/components/sidesheet/sidesheet.component.html**
```html
@if (isOpen) {
  <div class="sidesheet-overlay" @fadeIn (click)="onOverlayClick()">
    <div 
      class="sidesheet" 
      [class]="'sidesheet--' + size"
      @slideIn 
      (click)="onContentClick($event)">
      
      <!-- Header -->
      <div class="sidesheet__header">
        <h2 class="sidesheet__title">{{ title }}</h2>
        <button class="sidesheet__close" (click)="onClose()">
          <span>✕</span>
        </button>
      </div>

      <!-- Body -->
      <div class="sidesheet__body">
        <ng-content></ng-content>
      </div>
    </div>
  </div>
}
```

**src/app/shared/components/sidesheet/sidesheet.component.scss**
```scss
@import 'variables';
@import 'mixins';

.sidesheet-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.sidesheet {
  background-color: $base-dark-2;
  height: 100%;
  display: flex;
  flex-direction: column;
  @include box-shadow-base;

  &--small {
    width: 400px;
  }

  &--medium {
    width: 600px;
  }

  &--large {
    width: 800px;
  }

  @include mobile {
    width: 100% !important;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid $base-dark-3;
    background-color: $base-dark-1;
  }

  &__title {
    font-size: $font-size-2xl;
    font-weight: 700;
    color: $text-color;
    margin: 0;
  }

  &__close {
    @include flex-center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background-color: transparent;
    border: none;
    cursor: pointer;
    @include transition(background-color);

    span {
      font-size: $font-size-2xl;
      color: $text-color;
      line-height: 1;
    }

    &:hover {
      background-color: rgba($critical-color, 0.1);
      
      span {
        color: $critical-color;
      }
    }
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding: 2rem;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: $base-dark-1;
    }

    &::-webkit-scrollbar-thumb {
      background: $base-dark-3;
      border-radius: 4px;

      &:hover {
        background: lighten($base-dark-3, 10%);
      }
    }
  }
}
```

---

### 2. Adicionar provideAnimations

**src/app/app.config.ts**
```typescript
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideAnimations()
  ]
};
```

---

### 3. Criar PonyDetailsSidesheet

```bash
ng generate component features/ponies/components/pony-details-sidesheet --skip-tests
```

**src/app/features/ponies/components/pony-details-sidesheet/pony-details-sidesheet.component.ts**
```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidesheetComponent } from '../../../../shared/components/sidesheet/sidesheet.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { Pony } from '../../../../shared/models/pony.model';

@Component({
  selector: 'app-pony-details-sidesheet',
  standalone: true,
  imports: [CommonModule, SidesheetComponent, ButtonComponent],
  templateUrl: './pony-details-sidesheet.component.html',
  styleUrl: './pony-details-sidesheet.component.scss'
})
export class PonyDetailsSidesheetComponent {
  @Input() pony: Pony | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Pony>();
  @Output() delete = new EventEmitter<string>();

  onClose(): void {
    this.close.emit();
  }

  onEdit(): void {
    if (this.pony) {
      this.edit.emit(this.pony);
    }
  }

  onDelete(): void {
    if (this.pony && confirm(`Deseja realmente excluir ${this.pony.name}?`)) {
      this.delete.emit(this.pony.id);
      this.onClose();
    }
  }
}
```

**src/app/features/ponies/components/pony-details-sidesheet/pony-details-sidesheet.component.html**
```html
<app-sidesheet 
  [isOpen]="isOpen" 
  [title]="pony?.name || ''" 
  size="medium"
  (close)="onClose()">
  
  @if (pony) {
    <div class="pony-details">
      
      <!-- Image -->
      <div class="pony-details__image">
        <img [src]="pony.imageUrl" [alt]="pony.name" />
      </div>

      <!-- Info Cards -->
      <div class="pony-details__info-grid">
        <div class="info-card">
          <span class="info-card__label">Elemento</span>
          <span class="info-card__value info-card__value--primary">
            {{ pony.element }}
          </span>
        </div>

        <div class="info-card">
          <span class="info-card__label">Personalidade</span>
          <span class="info-card__value">{{ pony.personality }}</span>
        </div>

        <div class="info-card info-card--full">
          <span class="info-card__label">Talento</span>
          <span class="info-card__value info-card__value--talent">
            ⭐ {{ pony.talent }}
          </span>
        </div>
      </div>

      <!-- Summary -->
      <div class="pony-details__section">
        <h3 class="pony-details__section-title">Sobre</h3>
        <p class="pony-details__summary">{{ pony.summary }}</p>
      </div>

      <!-- Metadata -->
      <div class="pony-details__metadata">
        <span class="metadata-item">
          <strong>ID:</strong> {{ pony.id }}
        </span>
        <span class="metadata-item">
          <strong>Criado em:</strong> {{ pony.createdAt | date:'dd/MM/yyyy HH:mm' }}
        </span>
      </div>

      <!-- Actions -->
      <div class="pony-details__actions">
        <app-button variant="secondary" [fullWidth]="true" (click)="onEdit()">
          ✏️ Editar
        </app-button>
        <app-button variant="critical" [fullWidth]="true" (click)="onDelete()">
          🗑️ Excluir
        </app-button>
      </div>

    </div>
  }
</app-sidesheet>
```

**src/app/features/ponies/components/pony-details-sidesheet/pony-details-sidesheet.component.scss**
```scss
@import 'variables';
@import 'mixins';

.pony-details {
  @include flex-column;
  gap: 2rem;

  &__image {
    width: 100%;
    height: 300px;
    border-radius: 12px;
    overflow: hidden;
    background: linear-gradient(135deg, $base-dark-1, $base-dark-3);
    @include box-shadow-base;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  &__section {
    @include flex-column;
    gap: 0.75rem;
  }

  &__section-title {
    font-size: $font-size-lg;
    font-weight: 600;
    color: $primary-color;
    margin: 0;
  }

  &__summary {
    font-size: $font-size-base;
    line-height: 1.7;
    color: $text-color;
    margin: 0;
  }

  &__metadata {
    @include flex-column;
    gap: 0.5rem;
    padding: 1rem;
    background-color: $base-dark-1;
    border-radius: 8px;
  }

  &__actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid $base-dark-3;
  }
}

.info-card {
  @include flex-column;
  gap: 0.5rem;
  padding: 1.25rem;
  background-color: $base-dark-1;
  border-radius: 12px;
  border: 2px solid $base-dark-3;

  &--full {
    grid-column: 1 / -1;
  }

  &__label {
    font-size: $font-size-xs;
    font-weight: 600;
    color: $grayscale-03;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  &__value {
    font-size: $font-size-lg;
    font-weight: 700;
    color: $text-color;

    &--primary {
      color: $primary-color;
    }

    &--talent {
      color: $success-color;
    }
  }
}

.metadata-item {
  font-size: $font-size-sm;
  color: $grayscale-03;

  strong {
    color: $text-color;
    font-weight: 600;
  }
}
```

---

### 4. Integrar Sidesheet na Lista

**src/app/features/ponies/pages/ponies-list/ponies-list.component.ts**
```typescript
import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { PonyCardComponent } from '../../components/pony-card/pony-card.component';
import { PonyDetailsSidesheetComponent } from '../../components/pony-details-sidesheet/pony-details-sidesheet.component';
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
    PonyCardComponent,
    PonyDetailsSidesheetComponent
  ],
  templateUrl: './ponies-list.component.html',
  styleUrl: './ponies-list.component.scss'
})
export class PoniesListComponent implements OnInit {
  // Signals do service
  ponies = this.poniesService.ponies;
  loading = this.poniesService.loading;
  error = this.poniesService.error;

  // Sidesheet state
  selectedPony = signal<Pony | null>(null);
  isDetailsSidesheetOpen = signal(false);

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
    this.selectedPony.set(pony);
    this.isDetailsSidesheetOpen.set(true);
  }

  onCloseSidesheet(): void {
    this.isDetailsSidesheetOpen.set(false);
    setTimeout(() => {
      this.selectedPony.set(null);
    }, 300);
  }

  onEditPony(pony: Pony): void {
    console.log('Editar pony:', pony);
    this.onCloseSidesheet();
    // Na próxima aula, abrirá o sidesheet de formulário
  }

  onDeletePony(id: string): void {
    this.poniesService.deletePony(id).subscribe({
      next: () => {
        console.log('Pony excluído com sucesso');
      },
      error: (error) => {
        console.error('Erro ao excluir pony:', error);
        alert('Erro ao excluir pony');
      }
    });
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

**Adicionar ao template (ponies-list.component.html):**
```html
<!-- Adicionar antes do fechamento da div.ponies-page -->

<!-- Details Sidesheet -->
<app-pony-details-sidesheet
  [pony]="selectedPony()"
  [isOpen]="isDetailsSidesheetOpen()"
  (close)="onCloseSidesheet()"
  (edit)="onEditPony($event)"
  (delete)="onDeletePony($event)">
</app-pony-details-sidesheet>
```

---

## ✅ Resultado Esperado

- ✅ Componente Sidesheet reutilizável criado
- ✅ Animações de entrada e saída suaves
- ✅ Sidesheet de detalhes do pony funcional
- ✅ Informações completas do pony exibidas
- ✅ Botões de editar e excluir
- ✅ Fechamento por overlay, botão X ou ESC
- ✅ Responsivo (fullscreen no mobile)
- ✅ Delete funcional com confirmação

---

## 🎨 Funcionalidades do Sidesheet

✅ Animação slide-in da direita
✅ Overlay escuro com fade
✅ Scroll interno no body
✅ Fechar ao clicar no overlay
✅ Fechar ao pressionar ESC
✅ Botão X estilizado
✅ Tamanhos configuráveis (small, medium, large)

---

## 📝 Próximos Passos

Na próxima aula, vamos criar o sidesheet de formulário para criar e editar ponies com validação completa.

# 📘 Aula 7 — Sidesheet de Cadastro/Edição

## Objetivo

Criar formulário reativo para criar e editar ponies com validação completa, feedback visual e integração com a API.

---

## Passos

### 1. Criar PonyFormSidesheet

```bash
ng generate component features/ponies/components/pony-form-sidesheet --skip-tests
```

**src/app/features/ponies/components/pony-form-sidesheet/pony-form-sidesheet.component.ts**
```typescript
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SidesheetComponent } from '../../../../shared/components/sidesheet/sidesheet.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { Pony, CreatePonyDto, UpdatePonyDto } from '../../../../shared/models/pony.model';

@Component({
  selector: 'app-pony-form-sidesheet',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SidesheetComponent,
    ButtonComponent,
    InputComponent
  ],
  templateUrl: './pony-form-sidesheet.component.html',
  styleUrl: './pony-form-sidesheet.component.scss'
})
export class PonyFormSidesheetComponent implements OnChanges {
  @Input() pony: Pony | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<CreatePonyDto | UpdatePonyDto>();

  ponyForm: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);

  constructor(private fb: FormBuilder) {
    this.ponyForm = this.createForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pony'] && this.pony) {
      this.isEditMode.set(true);
      this.patchForm(this.pony);
    } else if (changes['pony'] && !this.pony) {
      this.isEditMode.set(false);
      this.resetForm();
    }

    if (changes['isOpen'] && !this.isOpen) {
      this.resetForm();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      element: ['', [Validators.required]],
      personality: ['', [Validators.required]],
      talent: ['', [Validators.required]],
      summary: ['', [Validators.required, Validators.minLength(10)]],
      imageUrl: ['', [Validators.required, Validators.pattern('https?://.+')]]
    });
  }

  private patchForm(pony: Pony): void {
    this.ponyForm.patchValue({
      name: pony.name,
      element: pony.element,
      personality: pony.personality,
      talent: pony.talent,
      summary: pony.summary,
      imageUrl: pony.imageUrl
    });
  }

  private resetForm(): void {
    this.ponyForm.reset();
    this.loading.set(false);
  }

  getFieldError(fieldName: string): string {
    const field = this.ponyForm.get(fieldName);
    
    if (!field?.touched) return '';

    if (field.hasError('required')) {
      return 'Este campo é obrigatório';
    }
    
    if (field.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Deve ter no mínimo ${minLength} caracteres`;
    }
    
    if (field.hasError('pattern')) {
      return 'URL inválida (deve começar com http:// ou https://)';
    }

    return '';
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.ponyForm.invalid) {
      this.ponyForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.save.emit(this.ponyForm.value);
  }

  get title(): string {
    return this.isEditMode() ? 'Editar Pony' : 'Novo Pony';
  }

  get submitButtonText(): string {
    if (this.loading()) {
      return this.isEditMode() ? 'Salvando...' : 'Criando...';
    }
    return this.isEditMode() ? 'Salvar' : 'Criar';
  }
}
```

---

### 2. Criar Template do Formulário

**src/app/features/ponies/components/pony-form-sidesheet/pony-form-sidesheet.component.html**
```html
<app-sidesheet 
  [isOpen]="isOpen" 
  [title]="title" 
  size="medium"
  (close)="onClose()">
  
  <form [formGroup]="ponyForm" (ngSubmit)="onSubmit()" class="pony-form">
    
    <!-- Name -->
    <app-input
      label="Nome *"
      placeholder="Ex: Twilight Sparkle"
      formControlName="name"
      [error]="getFieldError('name')">
    </app-input>

    <!-- Element & Personality (Grid) -->
    <div class="form-row">
      <app-input
        label="Elemento *"
        placeholder="Ex: Magia"
        formControlName="element"
        [error]="getFieldError('element')">
      </app-input>

      <app-input
        label="Personalidade *"
        placeholder="Ex: Estudiosa"
        formControlName="personality"
        [error]="getFieldError('personality')">
      </app-input>
    </div>

    <!-- Talent -->
    <app-input
      label="Talento *"
      placeholder="Ex: Leitura de feitiços"
      formControlName="talent"
      [error]="getFieldError('talent')">
    </app-input>

    <!-- Image URL -->
    <app-input
      label="URL da Imagem *"
      type="text"
      placeholder="https://exemplo.com/imagem.jpg"
      formControlName="imageUrl"
      [error]="getFieldError('imageUrl')">
    </app-input>

    <!-- Image Preview -->
    @if (ponyForm.get('imageUrl')?.valid && ponyForm.get('imageUrl')?.value) {
      <div class="image-preview">
        <span class="image-preview__label">Pré-visualização:</span>
        <img 
          [src]="ponyForm.get('imageUrl')?.value" 
          alt="Preview"
          class="image-preview__img"
          (error)="$event.target.src='https://via.placeholder.com/300x200?text=Imagem+Inválida'" />
      </div>
    }

    <!-- Summary (Textarea) -->
    <div class="form-field">
      <label class="form-field__label">Resumo *</label>
      <textarea 
        class="form-field__textarea"
        [class.form-field__textarea--error]="getFieldError('summary')"
        placeholder="Descreva o personagem..."
        formControlName="summary"
        rows="5">
      </textarea>
      @if (getFieldError('summary')) {
        <span class="form-field__error">{{ getFieldError('summary') }}</span>
      }
    </div>

    <!-- Helper Text -->
    <div class="form-helper">
      <p>* Campos obrigatórios</p>
    </div>

    <!-- Actions -->
    <div class="form-actions">
      <app-button 
        type="button" 
        variant="secondary" 
        [fullWidth]="true"
        (click)="onClose()">
        Cancelar
      </app-button>
      
      <app-button 
        type="submit" 
        variant="primary" 
        [fullWidth]="true"
        [disabled]="loading()">
        {{ submitButtonText }}
      </app-button>
    </div>

  </form>
</app-sidesheet>
```

---

### 3. Criar Estilos do Formulário

**src/app/features/ponies/components/pony-form-sidesheet/pony-form-sidesheet.component.scss**
```scss
@import 'variables';
@import 'mixins';

.pony-form {
  @include flex-column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @include mobile {
    grid-template-columns: 1fr;
  }
}

.form-field {
  @include flex-column;
  gap: 0.5rem;

  &__label {
    font-size: $font-size-sm;
    font-weight: 500;
    color: $text-color;
  }

  &__textarea {
    @include transition(all, 0.2s, ease);
    padding: 0.875rem 1rem;
    background-color: $base-form;
    border: 2px solid transparent;
    border-radius: 8px;
    color: $text-color;
    font-size: $font-size-base;
    font-family: $text-family;
    resize: vertical;
    min-height: 120px;

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
  }

  &__error {
    font-size: $font-size-xs;
    color: $critical-color;
    margin-top: -0.25rem;
  }
}

.image-preview {
  @include flex-column;
  gap: 0.75rem;
  padding: 1rem;
  background-color: $base-dark-1;
  border-radius: 8px;
  border: 2px solid $primary-color;

  &__label {
    font-size: $font-size-sm;
    font-weight: 600;
    color: $primary-color;
  }

  &__img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
    @include box-shadow-base;
  }
}

.form-helper {
  padding: 0.75rem 1rem;
  background-color: rgba($primary-color, 0.1);
  border-radius: 8px;
  border-left: 3px solid $primary-color;

  p {
    font-size: $font-size-xs;
    color: $grayscale-03;
    margin: 0;
  }
}

.form-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid $base-dark-3;
}
```

---

### 4. Integrar Formulário na Lista

**src/app/features/ponies/pages/ponies-list/ponies-list.component.ts**
```typescript
// Adicionar imports
import { PonyFormSidesheetComponent } from '../../components/pony-form-sidesheet/pony-form-sidesheet.component';
import { CreatePonyDto, UpdatePonyDto } from '../../../../shared/models/pony.model';

// No @Component, adicionar ao imports
PonyFormSidesheetComponent

// Adicionar signals
isFormSidesheetOpen = signal(false);
ponyToEdit = signal<Pony | null>(null);

// Atualizar método onEditPony
onEditPony(pony: Pony): void {
  this.ponyToEdit.set(pony);
  this.isFormSidesheetOpen.set(true);
  this.onCloseSidesheet();
}

// Atualizar método onAddPony
onAddPony(): void {
  this.ponyToEdit.set(null);
  this.isFormSidesheetOpen.set(true);
}

// Adicionar novos métodos
onCloseFormSidesheet(): void {
  this.isFormSidesheetOpen.set(false);
  setTimeout(() => {
    this.ponyToEdit.set(null);
  }, 300);
}

onSavePony(ponyData: CreatePonyDto | UpdatePonyDto): void {
  const ponyToEdit = this.ponyToEdit();

  if (ponyToEdit) {
    // Update
    this.poniesService.updatePony(ponyToEdit.id, ponyData).subscribe({
      next: () => {
        console.log('Pony atualizado com sucesso');
        this.onCloseFormSidesheet();
      },
      error: (error) => {
        console.error('Erro ao atualizar pony:', error);
        alert('Erro ao atualizar pony');
      }
    });
  } else {
    // Create
    this.poniesService.createPony(ponyData as CreatePonyDto).subscribe({
      next: () => {
        console.log('Pony criado com sucesso');
        this.onCloseFormSidesheet();
      },
      error: (error) => {
        console.error('Erro ao criar pony:', error);
        alert('Erro ao criar pony');
      }
    });
  }
}
```

**Adicionar ao template (ponies-list.component.html):**
```html
<!-- Adicionar após o details sidesheet -->

<!-- Form Sidesheet -->
<app-pony-form-sidesheet
  [pony]="ponyToEdit()"
  [isOpen]="isFormSidesheetOpen()"
  (close)="onCloseFormSidesheet()"
  (save)="onSavePony($event)">
</app-pony-form-sidesheet>
```

---

## ✅ Resultado Esperado

- ✅ Formulário de criação/edição funcional
- ✅ Validação em tempo real
- ✅ Mensagens de erro específicas
- ✅ Pré-visualização de imagem
- ✅ Modo create vs edit
- ✅ Integração com API (POST/PUT)
- ✅ Atualização automática da lista
- ✅ Loading states no botão
- ✅ Textarea para resumo longo
- ✅ Layout responsivo

---

## 🎨 Funcionalidades do Formulário

✅ Validação de campos obrigatórios
✅ Validação de tamanho mínimo
✅ Validação de URL
✅ Preview da imagem em tempo real
✅ Feedback visual de erros
✅ Grid de 2 colunas em campos relacionados
✅ Textarea redimensionável
✅ Botões de cancelar e salvar

---

## 📝 Validações Implementadas

| Campo | Validações |
|-------|------------|
| Nome | Obrigatório, mínimo 2 caracteres |
| Elemento | Obrigatório |
| Personalidade | Obrigatório |
| Talento | Obrigatório |
| Resumo | Obrigatório, mínimo 10 caracteres |
| URL Imagem | Obrigatório, formato de URL válido |

---

## 📝 Próximos Passos

Na próxima aula, vamos aprofundar em state management, otimizações de performance e boas práticas com Signals.

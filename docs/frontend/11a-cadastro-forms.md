# 📘 Aula 11a — Formulário de Cadastro com Reactive Forms

**Progresso do Curso Frontend:** `[█████████████░░░░░░░] 63% concluído`

## Objetivo

Implementar o **formulário de cadastro de ponies** usando **Reactive Forms** com validações robustas e feedback visual.

---

## 🎯 O que vamos construir

- **File Helper**: Validação de tipo e tamanho de arquivo
- **Service Methods**: `createPony()` e `uploadImage()`
- **Componente `CreatePonyComponent`**: Formulário reativo completo
- **Reactive Forms**: Validação tipada com `FormBuilder`

<!-- 💡 Screenshot sugerido: Formulário de cadastro aberto no sidesheet -->

💡 **Próxima aula (11b)**: Integração com listagem, botão FAB e upload de imagens.

---

## 📋 Conceitos Importantes

### Reactive Forms vs Template-Driven

| Feature | Template-Driven | Reactive Forms |
|---------|----------------|----------------|
| **Validação** | ❌ No template | ✅ No TypeScript |
| **Type-safety** | ❌ Sem tipagem | ✅ Totalmente tipado |
| **Testing** | ❌ Difícil | ✅ Fácil testar |

**Por que Reactive Forms?**
- ✅ Validações complexas e compostas
- ✅ Type-safe (erros em compile-time)
- ✅ Testável (lógica fora do template)

### FormBuilder

**✅ Form Builder (conciso):**
```typescript
this.form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
});
```

---

## 📂 Estrutura de Arquivos

```
web/src/app/
├── core/
│   └── helpers/
│       ├── index.ts                 ← MODIFICAR
│       └── file.helper.ts           ← NOVO
├── features/
│   └── ponies/
│       ├── components/
│       │   └── create-pony/
│       │       ├── create-pony.component.ts    ← NOVO
│       │       ├── create-pony.component.html  ← NOVO
│       │       └── create-pony.component.scss  ← NOVO
│       └── services/
│           └── pony.service.ts      ← MODIFICAR
```

---

## 🛠️ Passo 1: Criar o File Helper

Crie `web/src/app/core/helpers/file.helper.ts`:

```typescript
export interface FileValidationResult {
    valid: boolean;
    error?: string;
}

export class FileHelper {
    static validateImageType(file: File): FileValidationResult {
        if (!file.type.startsWith('image/')) {
            return {
                valid: false,
                error: 'Por favor, selecione apenas arquivos de imagem.',
            };
        }
        return { valid: true };
    }

    static validateFileSize(file: File, maxSizeMB: number = 2): FileValidationResult {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        if (file.size > maxSizeBytes) {
            return {
                valid: false,
                error: `A imagem deve ter no máximo ${maxSizeMB}MB.`,
            };
        }
        return { valid: true };
    }

    static validateImageFile(file: File, maxSizeMB: number = 2): FileValidationResult {
        const typeValidation = this.validateImageType(file);
        if (!typeValidation.valid) return typeValidation;

        const sizeValidation = this.validateFileSize(file, maxSizeMB);
        if (!sizeValidation.valid) return sizeValidation;

        return { valid: true };
    }
}
```

**Exportar** em `web/src/app/core/helpers/index.ts`:

```typescript
export * from './local-storage.helper';
export * from './file.helper';
```

---

## 🛠️ Passo 2: Adicionar Métodos no Service

Atualize `web/src/app/features/ponies/services/pony.service.ts`:

```typescript
createPony(pony: Omit<Pony, 'id'>): Observable<Pony> {
    const endpoint = `${this.apiUrl}/ponies`;
    const token = LocalStorageHelper.get<string>(LocalStorageKeys.TOKEN);

    const options = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    return this.http.post<Pony>(endpoint, pony, options).pipe(
        catchError((error) => {
            return throwError(() => error);
        }),
    );
}

uploadImage(file: File): Observable<{ imageUrl: string }> {
    const endpoint = `${this.apiUrl}/ponies/upload`;
    const token = LocalStorageHelper.get<string>(LocalStorageKeys.TOKEN);

    const formData = new FormData();
    formData.append('file', file);

    const options = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    return this.http.post<{ imageUrl: string }>(endpoint, formData, options).pipe(
        catchError((error) => {
            return throwError(() => error);
        }),
    );
}
```

**Notas importantes:**
- **`Omit<Pony, 'id'>`**: Remove `id` (backend gera automaticamente)
- **`FormData`**: Necessário para upload de arquivos
- **Não defina `Content-Type` manualmente**: Angular detecta FormData automaticamente

---

## 🛠️ Passo 3: Criar o Componente TypeScript

```bash
ng generate component features/ponies/components/create-pony --skip-tests
```

Atualize `web/src/app/features/ponies/components/create-pony/create-pony.component.ts`:

```typescript
import { CommonModule } from '@angular/common';
import { Component, signal, inject, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PonyButtonComponent } from '@app/shared/components/pony-button/pony-button.component';
import { PonyInputComponent } from '@app/shared/components/pony-input/pony-input.component';
import { PonySidesheetComponent } from '@app/shared/components/sidesheet/sidesheet.component';
import { PonyTextareaComponent } from "@app/shared/components/pony-textarea/pony-textarea.component";
import { PonyService } from '../../services/pony.service';
import { SnackbarService } from '@core/services/snackbar.service';
import { FileHelper } from '@core/helpers';

@Component({
    selector: 'create-pony',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        PonySidesheetComponent,
        PonyButtonComponent,
        PonyInputComponent,
        PonyTextareaComponent,
    ],
    templateUrl: './create-pony.component.html',
    styleUrl: './create-pony.component.scss',
})
export class CreatePonyComponent {
    private fb = inject(FormBuilder);
    private ponyService = inject(PonyService);
    private snackbarService = inject(SnackbarService);

    showDetails = signal<boolean>(false);
    isLoading = signal<boolean>(false);
    selectedFile = signal<File | null>(null);

    ponyCreated = output<void>();

    ponyForm: FormGroup;

    constructor() {
        this.ponyForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            imageUrl: [''],
            element: ['', Validators.required],
            personality: ['', Validators.required],
            talent: ['', Validators.required],
            summary: ['', [Validators.required, Validators.minLength(10)]],
        });
    }

    openForm(): void {
        this.showDetails.set(true);
        this.ponyForm.reset();
        this.selectedFile.set(null);
    }

    closeForm(): void {
        this.showDetails.set(false);
        this.ponyForm.reset();
        this.selectedFile.set(null);
    }

    onSubmit(): void {
        if (this.ponyForm.invalid) {
            this.ponyForm.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);

        const file = this.selectedFile();
        if (file) {
            this.ponyService.uploadImage(file).subscribe({
                next: (response) => {
                    this.ponyForm.patchValue({ imageUrl: response.imageUrl });
                    this.createPony();
                },
                error: (error) => {
                    console.error('Erro ao fazer upload:', error);
                    this.snackbarService.error('Erro ao enviar imagem. Tente novamente.');
                    this.isLoading.set(false);
                },
            });
        } else {
            this.createPony();
        }
    }

    private createPony(): void {
        const formData = this.ponyForm.value;

        this.ponyService.createPony(formData).subscribe({
            next: (pony) => {
                this.snackbarService.success(`${pony.name} cadastrado com sucesso!`);
                this.ponyCreated.emit();
                this.closeForm();
                this.isLoading.set(false);
            },
            error: (error) => {
                console.error('Erro ao criar pony:', error);
                this.snackbarService.error('Erro ao cadastrar pony. Tente novamente.');
                this.isLoading.set(false);
            },
        });
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;

        if (!input.files || input.files.length === 0) {
            this.selectedFile.set(null);
            return;
        }

        const file = input.files[0];
        const validation = FileHelper.validateImageFile(file, 4);

        if (!validation.valid) {
            this.snackbarService.error(validation.error!);
            this.selectedFile.set(null);
            return;
        }

        this.selectedFile.set(file);
    }

    get formControls() {
        return this.ponyForm.controls;
    }
}
```

**Destaques:**
- **`markAllAsTouched()`**: Mostra erros de validação
- **`patchValue()`**: Atualiza campo específico sem alterar outros
- **Upload condicional**: Só faz upload se arquivo selecionado

---

## 🛠️ Passo 4: Criar o Template

Crie `web/src/app/features/ponies/components/create-pony/create-pony.component.html`:

```html
<sidesheet
    [(isOpen)]="showDetails"
    [title]="'Cadastrar'"
>
    <form
        [formGroup]="ponyForm"
        class="create-pony"
    >
        <div class="create-pony__field">
            <label for="name">Nome *</label>
            <pony-input
                id="name"
                type="text"
                formControlName="name"
                [borderless]="true"
                placeholder="Twilight Sparkle"
            />
            @if (formControls['name'].invalid && formControls['name'].touched) {
                <span class="create-pony__error">Nome é obrigatório (mínimo 3 caracteres)</span>
            }
        </div>

        <div class="create-pony__field">
            <label for="imageUrl">Imagem</label>
            <pony-input
                id="imageUrl"
                type="file"
                [borderless]="true"
                placeholder="/twilight.png"
                (fileChange)="onFileSelected($event)"
            />
        </div>

        <div class="create-pony__field">
            <label for="element">Elemento *</label>
            <pony-input
                id="element"
                type="text"
                formControlName="element"
                [borderless]="true"
                placeholder="Magia"
            />
            @if (formControls['element'].invalid && formControls['element'].touched) {
                <span class="create-pony__error">Elemento é obrigatório</span>
            }
        </div>

        <div class="create-pony__field">
            <label for="personality">Personalidade *</label>
            <pony-input
                id="personality"
                type="text"
                formControlName="personality"
                [borderless]="true"
                placeholder="Inteligente, organizada, curiosa..."
            />
            @if (formControls['personality'].invalid && formControls['personality'].touched) {
                <span class="create-pony__error">Personalidade é obrigatória</span>
            }
        </div>

        <div class="create-pony__field">
            <label for="talent">Talento *</label>
            <pony-input
                id="talent"
                type="text"
                formControlName="talent"
                [borderless]="true"
                placeholder="Magia poderosa"
            />
            @if (formControls['talent'].invalid && formControls['talent'].touched) {
                <span class="create-pony__error">Talento é obrigatório</span>
            }
        </div>

        <div class="create-pony__field">
            <label for="summary">Resumo *</label>
            <pony-textarea
                id="summary"
                formControlName="summary"
                [borderless]="true"
                placeholder="Estudiosa que se torna líder..."
            />
            @if (formControls['summary'].invalid && formControls['summary'].touched) {
                <span class="create-pony__error">Resumo é obrigatório (mínimo 10 caracteres)</span>
            }
        </div>
    </form>

    <div
        sidesheet-footer
        class="create-pony__footer"
    >
        <pony-button
            variant="secondary"
            type="button"
            (click)="closeForm()"
            width="172px"
        >
            Cancelar
        </pony-button>
        <pony-button
            variant="primary"
            type="button"
            (click)="onSubmit()"
            [disabled]="isLoading()"
            width="172px"
            [loading]="isLoading()"
        >
            Cadastrar
        </pony-button>
    </div>
</sidesheet>
```

**Validação condicional:**
```html
@if (formControls['name'].invalid && formControls['name'].touched) {
    <span class="create-pony__error">...</span>
}
```
- **`invalid`**: Validators falharam
- **`touched`**: Usuário interagiu com o campo

---

## 🛠️ Passo 5: Criar os Estilos

Crie `web/src/app/features/ponies/components/create-pony/create-pony.component.scss`:

```scss
@use 'styles/variables' as *;
@use 'styles/mixins' as *;

.create-pony {
    border-radius: 34px;
    background-color: $base-dark-3;
    width: 100%;
    height: 100%;
    color: $text-color;
    padding: 15px 25px;

    &__field {
        display: flex;
        flex-direction: column;
        height: 90px;

        &:not(:nth-of-type(2)) {
            margin-bottom: 10px;
        }

        label {
            font-family: $text-family;
            font-weight: 500;
            font-size: $font-size-sm;
            color: $text-color;
            margin-bottom: 3px;
        }
    }

    &__error {
        font-family: $text-family;
        font-size: $font-size-sm;
        color: $critical-color;
    }

    &__footer {
        display: flex;
        justify-content: space-between
    }
}
```

---

## ✅ Testando

### Cenário 1: Validação

**Passos:**
1. Execute `openForm()` no componente (próxima aula terá botão)
2. Clique em "Cadastrar" sem preencher
3. **Esperado**: Erros em vermelho aparecem

### Cenário 2: Arquivo Inválido

**Passos:**
1. Selecione PDF (não imagem)
2. **Esperado**: Snackbar "Por favor, selecione apenas arquivos de imagem."

---

## 🎯 Checklist

- ✅ `FileHelper` com validações de tipo e tamanho
- ✅ Métodos `createPony()` e `uploadImage()` no service
- ✅ Formulário reativo com `FormBuilder`
- ✅ Validações visuais (invalid + touched)
- ✅ Upload de imagens com validação client-side
- ✅ Snackbar feedback de sucesso/erro
- ✅ Loading state durante submit

---

## 📚 Referências

- [Reactive Forms](https://angular.io/guide/reactive-forms)
- [Form Validation](https://angular.io/guide/form-validation)
- [FormData API](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
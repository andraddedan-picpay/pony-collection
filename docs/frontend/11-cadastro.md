# 📘 Aula 11 — Sidesheet de Cadastro/Edição

## Objetivo

Implementar o **formulário de cadastro de ponies** usando **Reactive Forms**, integrar com upload de imagens, validações robustas e feedback visual para o usuário através de snackbar.

---

## 🎯 O que vamos construir

- **Componente `CreatePonyComponent`**: Formulário completo de cadastro
- **Reactive Forms**: Validação tipada e robusta
- **Upload de Imagens**: Integração com endpoint de upload
- **File Helper**: Validação de tipo e tamanho de arquivo
- **Botão Flutuante (FAB)**: Acesso rápido ao cadastro
- **Snackbar Feedback**: Mensagens de sucesso/erro
- **Output Events**: Comunicação com página de listagem

---

## 📋 Conceitos Importantes

### Reactive Forms vs Template-Driven Forms

| Feature | Template-Driven | Reactive Forms |
|---------|----------------|----------------|
| **Setup** | ❌ FormsModule, ngModel | ✅ ReactiveFormsModule, FormBuilder |
| **Validação** | ❌ Diretivas no template | ✅ Validators no TypeScript |
| **Type-safety** | ❌ Sem tipagem | ✅ Totalmente tipado |
| **Testing** | ❌ Difícil testar | ✅ Fácil testar |
| **Async validators** | ⚠️ Complicado | ✅ Simples |
| **Dynamic forms** | ❌ Muito código | ✅ Fácil manipular |

**Por que Reactive Forms?**
- ✅ **Validações complexas**: Composição de validators
- ✅ **Type-safe**: Erros detectados em compile-time
- ✅ **Testável**: Lógica no TypeScript, não no template
- ✅ **Performance**: Change detection otimizada
- ✅ **Reatividade**: RxJS Observable para mudanças

### FormBuilder vs FormGroup Manual

**❌ Manual (verboso):**
```typescript
this.form = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email])
});
```

**✅ FormBuilder (conciso):**
```typescript
this.form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
});
```

### Output Events para Comunicação Entre Componentes

**Fluxo:**
```
┌─────────────────┐
│  ListComponent  │
│                 │
│  [dados da API] │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ CreatePonyComponent     │
│                         │
│  (ponyCreated) ──────┐  │
└──────────────────────┼──┘
                       │
                       ▼ emit()
              ┌────────────────┐
              │ getData()      │
              │ (recarrega)    │
              └────────────────┘
```

**Vantagens:**
- ✅ **Desacoplamento**: Componentes não conhecem implementação interna um do outro
- ✅ **Reusabilidade**: CreatePony pode ser usado em qualquer lugar
- ✅ **Testabilidade**: Fácil simular eventos

---

## 📂 Estrutura de Arquivos

```
web/src/app/
├── core/
│   └── helpers/
│       ├── index.ts                            ← MODIFICAR (export FileHelper)
│       └── file.helper.ts                      ← NOVO
├── features/
│   └── ponies/
│       ├── components/
│       │   └── create-pony/
│       │       ├── create-pony.component.ts    ← NOVO
│       │       ├── create-pony.component.html  ← NOVO
│       │       └── create-pony.component.scss  ← NOVO
│       ├── services/
│       │   └── pony.service.ts                 ← MODIFICAR (adicionar métodos)
│       └── pages/
│           └── list/
│               ├── list.component.ts           ← MODIFICAR (integrar create-pony)
│               ├── list.component.html         ← MODIFICAR (botão FAB)
│               └── list.component.scss         ← MODIFICAR (estilos do FAB)
└── assets/
    └── icons/
        └── plus.svg                             ← NOVO
```

---

## 🛠️ Passo 1: Criar o File Helper

### 1.1. Criar o Helper

Crie `web/src/app/core/helpers/file.helper.ts`:

```typescript
export interface FileValidationResult {
    valid: boolean;
    error?: string;
}

export class FileHelper {
    /**
     * Valida se o arquivo é uma imagem
     */
    static validateImageType(file: File): FileValidationResult {
        if (!file.type.startsWith('image/')) {
            return {
                valid: false,
                error: 'Por favor, selecione apenas arquivos de imagem.',
            };
        }

        return { valid: true };
    }

    /**
     * Valida o tamanho do arquivo
     */
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

    /**
     * Valida tipo e tamanho do arquivo
     */
    static validateImageFile(file: File, maxSizeMB: number = 2): FileValidationResult {
        const typeValidation = this.validateImageType(file);
        if (!typeValidation.valid) {
            return typeValidation;
        }

        const sizeValidation = this.validateFileSize(file, maxSizeMB);
        if (!sizeValidation.valid) {
            return sizeValidation;
        }

        return { valid: true };
    }
}
```

### 📝 Explicação do File Helper

**1. Interface de Resultado:**
```typescript
export interface FileValidationResult {
    valid: boolean;
    error?: string;
}
```
- **`valid`**: Indica se o arquivo passou na validação
- **`error?`**: Mensagem de erro (opcional, só existe se `valid = false`)

**2. Validação de Tipo:**
```typescript
static validateImageType(file: File): FileValidationResult {
    if (!file.type.startsWith('image/')) {
        return {
            valid: false,
            error: 'Por favor, selecione apenas arquivos de imagem.',
        };
    }
    return { valid: true };
}
```
- **`file.type`**: MIME type (ex: `image/png`, `image/jpeg`)
- **`startsWith('image/')`**: Aceita qualquer formato de imagem
- **Por quê?**: Previne upload de PDFs, vídeos, etc.

**3. Validação de Tamanho:**
```typescript
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
```
- **Conversão MB → Bytes**: `maxSizeMB * 1024 * 1024`
- **`file.size`**: Tamanho em bytes
- **Default 2MB**: Padrão configurável
- **Por quê?**: Evita uploads grandes que podem falhar ou demorar

**4. Método Composto:**
```typescript
static validateImageFile(file: File, maxSizeMB: number = 2): FileValidationResult {
    const typeValidation = this.validateImageType(file);
    if (!typeValidation.valid) {
        return typeValidation;
    }

    const sizeValidation = this.validateFileSize(file, maxSizeMB);
    if (!sizeValidation.valid) {
        return sizeValidation;
    }

    return { valid: true };
}
```
- **Validações em cadeia**: Tipo primeiro, depois tamanho
- **Early return**: Para na primeira falha
- **Por quê?**: Usuário recebe feedback específico do erro

### 1.2. Exportar no Index

Atualize `web/src/app/core/helpers/index.ts`:

```typescript
// Barrel exports for core helpers
export * from './local-storage.helper';
export * from './file.helper';  // ← ADICIONAR
```

---

## 🛠️ Passo 2: Adicionar Métodos no Service

Atualize `web/src/app/features/ponies/services/pony.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Pony } from '../models/pony.model';
import { LocalStorageHelper, LocalStorageKeys } from '@app/core/helpers';

@Injectable({
    providedIn: 'root',
})
export class PonyService {
    private apiUrl = 'http://localhost:3000';

    constructor(private http: HttpClient) {}

    getPonyList(): Observable<Pony[]> {
        const endpoint = `${this.apiUrl}/ponies`;
        const token = LocalStorageHelper.get<string>(LocalStorageKeys.TOKEN);

        const options = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        return this.http.get<Pony[]>(endpoint, options).pipe(
            catchError((error) => {
                return throwError(() => error);
            }),
        );
    }

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
}
```

### 📝 Explicação dos Novos Métodos

**1. createPony() - POST de Pony:**
```typescript
createPony(pony: Omit<Pony, 'id'>): Observable<Pony> {
    return this.http.post<Pony>(endpoint, pony, options).pipe(
        catchError((error) => {
            return throwError(() => error);
        }),
    );
}
```

**Detalhes importantes:**
- **`Omit<Pony, 'id'>`**: Remove a propriedade `id` do tipo
  - **Por quê?**: O backend gera o ID automaticamente
  - **Exemplo**: `Omit<{id: string, name: string}, 'id'>` = `{name: string}`
- **`http.post<Pony>`**: Especifica tipo de retorno
- **Body automático**: Segundo argumento é serializado para JSON

**2. uploadImage() - POST de Arquivo:**
```typescript
uploadImage(file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ imageUrl: string }>(endpoint, formData, options).pipe(
        catchError((error) => {
            return throwError(() => error);
        }),
    );
}
```

**FormData explicado:**
```typescript
const formData = new FormData();
formData.append('file', file);
```
- **O que é?**: API do navegador para enviar arquivos via HTTP
- **`append('file', file)`**: Adiciona arquivo com key "file"
- **Por quê?**: Backend espera `multipart/form-data`

**Comparação:**
| Tipo | Usado para | Content-Type |
|------|-----------|--------------|
| **JSON** | Dados estruturados | `application/json` |
| **FormData** | ✅ Arquivos (upload) | `multipart/form-data` |

**Headers automáticos:**
- Angular detecta FormData
- Define `Content-Type: multipart/form-data` automaticamente
- **Não defina manualmente!** (quebraria o boundary)

---

## 🛠️ Passo 3: Criar o Componente de Cadastro

### 3.1. Criar o Componente

```bash
ng generate component features/ponies/components/create-pony --skip-tests
```

### 3.2. Implementar o TypeScript

Crie/atualize `web/src/app/features/ponies/components/create-pony/create-pony.component.ts`:

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

    // Controle da sidesheet via signal
    showDetails = signal<boolean>(false);
    isLoading = signal<boolean>(false);
    selectedFile = signal<File | null>(null);

    // Event para notificar quando pony for criado
    ponyCreated = output<void>();

    // Formulário reativo
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

        // Se há arquivo selecionado, faz upload primeiro
        const file = this.selectedFile();
        if (file) {
            this.ponyService.uploadImage(file).subscribe({
                next: (response) => {
                    // Atualiza o formulário com a URL da imagem
                    this.ponyForm.patchValue({ imageUrl: response.imageUrl });
                    // Cria o pony com a URL da imagem
                    this.createPony();
                },
                error: (error) => {
                    console.error('Erro ao fazer upload:', error);
                    this.snackbarService.error('Erro ao enviar imagem. Tente novamente.');
                    this.isLoading.set(false);
                },
            });
        } else {
            // Sem arquivo, cria o pony diretamente
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

        // Apenas guarda o arquivo para fazer upload no submit
        this.selectedFile.set(file);
    }

    get formControls() {
        return this.ponyForm.controls;
    }
}
```

### 📝 Explicação Detalhada do TypeScript

**1. Imports do Reactive Forms:**
```typescript
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
```
- **FormBuilder**: Simplifica criação de formulários
- **FormGroup**: Representa o formulário completo
- **ReactiveFormsModule**: Módulo necessário nos imports
- **Validators**: Validadores built-in (required, minLength, etc)

**2. Injeção de Dependências:**
```typescript
private fb = inject(FormBuilder);
private ponyService = inject(PonyService);
private snackbarService = inject(SnackbarService);
```
- **`inject()`**: Função moderna de DI (Angular 14+)
- Alternativa ao `constructor(private fb: FormBuilder)`

**3. Signals de Estado:**
```typescript
showDetails = signal<boolean>(false);
isLoading = signal<boolean>(false);
selectedFile = signal<File | null>(null);
```
- **`showDetails`**: Controla abertura/fechamento da sidesheet
- **`isLoading`**: Estado de loading durante submit
- **`selectedFile`**: Armazena arquivo selecionado (antes do upload)

**4. Output Event:**
```typescript
ponyCreated = output<void>();
```
- **`output<void>()`**: Não envia dados, apenas notifica
- **Uso**: `this.ponyCreated.emit();` após sucesso
- **Parent escuta**: `(ponyCreated)="getData()"`

**5. Construção do Formulário:**
```typescript
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
```

**Anatomia de um control:**
```typescript
name: ['', [Validators.required, Validators.minLength(3)]]
//     ↑   ↑
//     |   └── Array de validators
//     └────── Valor inicial
```

**Tipos de validators:**
- **`Validators.required`**: Não pode estar vazio
- **`Validators.minLength(n)`**: Mínimo de caracteres
- **`Validators.email`**: Formato de email válido
- **Custom**: Pode criar seus próprios

**6. Método openForm():**
```typescript
openForm(): void {
    this.showDetails.set(true);
    this.ponyForm.reset();
    this.selectedFile.set(null);
}
```
- **`reset()`**: Limpa todos os campos do formulário
- **Por quê?**: Garante que não há dados de cadastros anteriores

**7. Método onSubmit() - Lógica Principal:**
```typescript
onSubmit(): void {
    if (this.ponyForm.invalid) {
        this.ponyForm.markAllAsTouched();
        return;
    }

    this.isLoading.set(true);

    const file = this.selectedFile();
    if (file) {
        // Fluxo: Upload → Create Pony
        this.ponyService.uploadImage(file).subscribe({
            next: (response) => {
                this.ponyForm.patchValue({ imageUrl: response.imageUrl });
                this.createPony();
            },
            error: (error) => {
                this.snackbarService.error('Erro ao enviar imagem. Tente novamente.');
                this.isLoading.set(false);
            },
        });
    } else {
        // Sem imagem, cria direto
        this.createPony();
    }
}
```

**Fluxo de execução:**
1. **Valida formulário**: Se inválido, marca campos touched (mostra erros)
2. **Ativa loading**: Desabilita botão, mostra spinner
3. **Condicional de arquivo**:
   - **Com arquivo**: Upload → Atualiza `imageUrl` → Cria pony
   - **Sem arquivo**: Cria pony diretamente

**Por que `markAllAsTouched()`?**
```typescript
this.ponyForm.markAllAsTouched();
```
- **Marca todos os campos como "tocados"**
- **Efeito**: Validações visuais aparecem (texto vermelho)
- **UX**: Usuário vê exatamente quais campos estão inválidos

**Por que `patchValue()`?**
```typescript
this.ponyForm.patchValue({ imageUrl: response.imageUrl });
```
- **Atualiza campo específico** sem alterar outros
- **Alternativa**: `setValue()` (precisa passar todos os campos)

**8. Método createPony() - Separado para Reuso:**
```typescript
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
            this.snackbarService.error('Erro ao cadastrar pony. Tente novamente.');
            this.isLoading.set(false);
        },
    });
}
```

**Por que método privado separado?**
- ✅ **Reuso**: Chamado com ou sem upload de imagem
- ✅ **Legibilidade**: `onSubmit()` fica focado na orquestração
- ✅ **Single Responsibility**: Cada método com uma responsabilidade

**Fluxo de sucesso:**
1. **Snackbar**: Mensagem com nome do pony
2. **Emit event**: Notifica parent para recarregar lista
3. **Close form**: Fecha sidesheet
4. **Desativa loading**: Habilita botões novamente

**9. Método onFileSelected() - Validação Client-Side:**
```typescript
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
```

**Type assertion:**
```typescript
const input = event.target as HTMLInputElement;
```
- **Por quê?**: `event.target` é genérico (`EventTarget`)
- **Cast**: Garante acesso a propriedade `files`

**Validação de 4MB:**
```typescript
const validation = FileHelper.validateImageFile(file, 4);
```
- **Diferente do backend** (lá são 5MB)
- **Por quê?**: Feedback imediato, antes de fazer upload

**10. Getter Convenience:**
```typescript
get formControls() {
    return this.ponyForm.controls;
}
```
- **Simplifica template**: `formControls['name']` ao invés de `ponyForm.controls['name']`

---

### 3.3. Criar o Template

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
                placeholder="Inteligente, organizada, curiosa e um pouco ans.."
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
                placeholder="Magia poderosa e amor por estudos"
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
                placeholder="Começa como uma estudiosa solitária e vira a líder do grupo."
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

### 📝 Explicação do Template

**1. Two-Way Binding da Sidesheet:**
```html
<sidesheet [(isOpen)]="showDetails" [title]="'Cadastrar'">
```
- **`[(isOpen)]`**: Model binding (leitura + escrita)
- **Funciona porque**: Sidesheet usa `model()` signal input

**2. Form Binding:**
```html
<form [formGroup]="ponyForm" class="create-pony">
```
- **`[formGroup]`**: Conecta template ao FormGroup do TypeScript
- **Necessário**: Para que `formControlName` funcione

**3. Form Control Binding:**
```html
<pony-input
    id="name"
    type="text"
    formControlName="name"
    [borderless]="true"
    placeholder="Twilight Sparkle"
/>
```
- **`formControlName="name"`**: Liga ao control do FormGroup
- **Não precisa**: `[(ngModel)]` porque ReactiveFormsModule gerencia
- **`id`**: Para acessibilidade (label's `for` aponta para ele)

**4. Validação Condicional:**
```html
@if (formControls['name'].invalid && formControls['name'].touched) {
    <span class="create-pony__error">Nome é obrigatório (mínimo 3 caracteres)</span>
}
```

**Condições explicadas:**
```typescript
formControls['name'].invalid  // ← Falha em validators
&&
formControls['name'].touched   // ← Usuário já interagiu
```

**Por que ambas as condições?**
- **Sem `touched`**: Erro apareceria ao abrir o formulário (UX ruim)
- **Só com `touched`**: Erro aparece após usuário clicar/sair do campo

**Estados possíveis:**
| Estado | `invalid` | `touched` | Mostra erro? |
|--------|----------|----------|-------------|
| Inicial | true | false | ❌ Não |
| Clicou e saiu (vazio) | true | true | ✅ Sim |
| Preencheu válido | false | true | ❌ Não |

**5. Input File Especial:**
```html
<pony-input
    id="imageUrl"
    type="file"
    [borderless]="true"
    placeholder="/twilight.png"
    (fileChange)="onFileSelected($event)"
/>
```
- **`type="file"`**: Usa UI customizada do pony-input (área de upload)
- **`(fileChange)`**: Event específico para arquivo
- **Não usa `formControlName`**: Arquivo é gerenciado manualmente no `selectedFile` signal

**Por que não usar formControlName para file?**
- `FormControl` não suporta `File` objects nativamente
- Arquivo precisa ser enviado como `FormData` (diferente de JSON)
- Melhor controlar manualmente no component

**6. Textarea:**
```html
<pony-textarea
    id="summary"
    formControlName="summary"
    [borderless]="true"
    placeholder="Começa como uma estudiosa solitária e vira a líder do grupo."
/>
```
- **`<pony-textarea>`**: Componente customizado criado na aula 2
- **`formControlName`**: Funciona porque implementa `ControlValueAccessor`

**7. Footer com Botões:**
```html
<div sidesheet-footer class="create-pony__footer">
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
```

**Botão de Cancelar:**
- **`variant="secondary"`**: Estilo menos proeminente
- **`(click)="closeForm()"`**: Fecha sem salvar

**Botão de Cadastrar:**
- **`[disabled]="isLoading()"`**: Bloqueia cliques durante loading
- **` [loading]="isLoading()"`**: Mostra spinner quando loading
- **`type="button"`**: Previne submit default (usamos `(click)`)

**Por que `type="button"`?**
- **Sem isso**: Botão submeteria o form (comportamento HTML padrão)
- **Com isso**: Controle manual via `(click)="onSubmit()"`

---

### 3.4. Criar os Estilos

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

        input,
        textarea {
            background-color: $base-dark-2;
            border: none;
            border-radius: 12px;
            padding: 12px 16px;
            color: $text-color;
            font-family: $text-family;
            font-size: $font-size-base;

            &:focus {
                outline: 2px solid $primary-color;
                outline-offset: -2px;
            }
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

### 📝 Explicação dos Estilos

**1. Container Principal:**
```scss
.create-pony {
    border-radius: 34px;
    background-color: $base-dark-3;
    padding: 15px 25px;
}
```
- **`border-radius: 34px`**: Cantos arredondados
- **`$base-dark-3`**: Cor de fundo do tema

**2. Campo do Formulário:**
```scss
&__field {
    display: flex;
    flex-direction: column;
    height: 90px;

    &:not(:nth-of-type(2)) {
        margin-bottom: 10px;
    }
}
```
- **`flex-direction: column`**: Label acima do input
- **`height: 90px`**: Espaço fixo (garante alinhamento)
- **`&:not(:nth-of-type(2))`**: Todos exceto o 2º (campo de imagem)
  - **Por quê?**: Campo de imagem não tem mensagem de erro

**3. Mensagem de Erro:**
```scss
&__error {
    font-family: $text-family;
    font-size: $font-size-sm;
    color: $critical-color;
}
```
- **`$critical-color`**: Vermelho do tema (para erros)
- **`$font-size-sm`**: Menor que o input (hierarquia visual)

**4. Footer:**
```scss
&__footer {
    display: flex;
    justify-content: space-between
}
```
- **`space-between`**: Botões nas extremidades

---

## 🛠️ Passo 4: Integrar na Página de Listagem

### 4.1. Adicionar Botão Flutuante (FAB)

Atualize `web/src/app/features/ponies/pages/list/list.component.html`:

```html
<main-layout (onSearchEvent)="updateFilter($event)">

    <div class="breadcrumb">
        <span>Poneis</span>
    </div>

    <div class="container">
        @switch (state()) {
            @case (DataStateEnum.LOADING) {
                <p>Carregando...</p>
            }
            @case (DataStateEnum.SUCCESS) {
                <p>Dados</p>
            }
            @case (DataStateEnum.EMPTY) {
                <feedback 
                    (onRetry)="getData()" 
                    imageName="empty" 
                    [title]="'SEM\nDADOS PARA EXIBIR.'"
                    buttonText="Tentar novamente" 
                />
            }
            @case (DataStateEnum.ERROR) {
                <feedback 
                    (onRetry)="getData()" 
                    imageName="error" 
                    [title]="'OPA!\nALGO DEU ERRADO.'"
                    buttonText="Tentar novamente"
                    message="Não foi possível carregar as informações esperadas. Aguarde alguns instantes e tente novamente." 
                />
            }
        }
    </div>

    <button
        class="create-pony"
        (click)="createPony.openForm()"
        aria-label="Formulário de cadastro"
        type="button"
    >
        <svg-icon
            src="assets/icons/plus.svg"
            class="icon"
            [svgStyle]="{ 'width.px': 20, 'height.px': 20 }"
        ></svg-icon>
    </button>
</main-layout>

<create-pony #createPony (ponyCreated)="getData()" />
```

### 📝 Explicação do Template

**1. Botão Flutuante (FAB):**
```html
<button
    class="create-pony"
    (click)="createPony.openForm()"
    aria-label="Formulário de cadastro"
    type="button"
>
```
- **`createPony.openForm()`**: Acessa método do component via template reference
- **`aria-label`**: Acessibilidade para screen readers
- **`type="button"`**: Previne comportamento de submit

**2. Template Reference Variable:**
```html
<create-pony #createPony (ponyCreated)="getData()" />
```
- **`#createPony`**: Cria variável local no template
- **Acesso**: `createPony.openForm()` chama método público
- **`(ponyCreated)`**: Escuta evento emitido pelo component

**Fluxo completo:**
1. Usuário clica no FAB
2. `createPony.openForm()` é chamado
3. Sidesheet abre
4. Usuário preenche e envia
5. `(ponyCreated)` emite evento
6. `getData()` recarrega a lista

---

### 4.2. Estilizar o Botão Flutuante

Atualize `web/src/app/features/ponies/pages/list/list.component.scss`:

```scss
@use 'styles/variables' as *;
@use 'styles/mixins' as *;

.breadcrumb {
    font-family: $title-family;
    font-style: normal;
    font-weight: 700;
    font-size: $font-size-2xl;
    line-height: 39px;
    color: $text-color;
    padding: 0 0 30px 0;
}

.container {
    display: flex;
    flex-wrap: wrap;
    gap: 26px;
    align-items: center;
    justify-content: center;
}

.create-pony {
    width: 48px;
    height: 48px;
    position: fixed;
    border-radius: 8px;
    bottom: 50px;
    right: 50px;
    padding: 14px;
    background-color: $primary-color;
    color: $text-color;
    box-shadow: 4px 4px 12px $base-shadow;
}
```

### 📝 Explicação dos Estilos do FAB

```scss
.create-pony {
    width: 48px;
    height: 48px;
    position: fixed;
    border-radius: 8px;
    bottom: 50px;
    right: 50px;
    padding: 14px;
    background-color: $primary-color;
    color: $text-color;
    box-shadow: 4px 4px 12px $base-shadow;
}
```

**Propriedades explicadas:**
- **`position: fixed`**: Fica fixo mesmo com scroll
- **`bottom: 50px; right: 50px`**: Canto inferior direito
- **`box-shadow`**: Elevação visual (Material Design)
- **`$primary-color`**: Cor de destaque (roxo)

**Padrão FAB (Floating Action Button):**
- Posição fixa
- Canto inferior direito
- Ação primária da página
- Sempre visível

---

### 4.3. Atualizar o TypeScript

Atualize `web/src/app/features/ponies/pages/list/list.component.ts`:

```typescript
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainLayoutComponent } from '@core/layout/main-layout/main-layout.component';
import { FeedbackComponent } from '@shared/components/feedback/feedback.component';
import { PonyService } from '../../services/pony.service';
import { Pony } from '../../models/pony.model';
import { DataStateEnum } from '@core/models/data-state.enum';
import { SvgIconComponent } from 'angular-svg-icon';
import { CreatePonyComponent } from '../../components/create-pony/create-pony.component';

@Component({
    selector: 'app-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MainLayoutComponent,
        FeedbackComponent,
        SvgIconComponent,
        CreatePonyComponent,
    ],
    templateUrl: './list.component.html',
    styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit {
    filter = signal('');

    isLoading = signal(false);
    hasError = signal(false);
    ponyList = signal<Pony[]>([]);

    public readonly DataStateEnum = DataStateEnum;

    state = computed<DataStateEnum>(() => {
        if (this.isLoading()) return DataStateEnum.LOADING;
        if (this.hasError()) return DataStateEnum.ERROR;
        if (this.ponyList().length === 0) return DataStateEnum.EMPTY;
        return DataStateEnum.SUCCESS;
    });

    private ponyService = inject(PonyService);

    ngOnInit(): void {
        this.getData();
    }

    updateFilter(value: string): void {
        this.filter.set(value);
    }

    getData(): void {
        this.isLoading.set(true);
        this.hasError.set(false);

        this.ponyService.getPonyList().subscribe({
            next: (ponies: Pony[]) => {
                this.ponyList.set(ponies);
                this.isLoading.set(false);
            },
            error: () => {
                this.hasError.set(true);
                this.isLoading.set(false);
            },
        });
    }
}
```

### 📝 Mudanças no TypeScript

**Imports adicionados:**
```typescript
import { SvgIconComponent } from 'angular-svg-icon';
import { CreatePonyComponent } from '../../components/create-pony/create-pony.component';
```

**No array de imports:**
```typescript
imports: [
    // ... existentes
    SvgIconComponent,      // ← ADICIONAR
    CreatePonyComponent,   // ← ADICIONAR
],
```

**Por quê?**
- **`SvgIconComponent`**: Para renderizar o ícone plus.svg
- **`CreatePonyComponent`**: Para usar `<create-pony>` no template

---

## 🛠️ Passo 5: Criar o Ícone Plus

Crie `web/public/assets/icons/plus.svg`:

```svg
<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.3999 0.899902V8.3999M8.3999 15.8999V8.3999M8.3999 8.3999H15.8999M8.3999 8.3999H0.899902" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

**Explicação:**
- **`stroke="currentColor"`**: Herda cor do elemento pai (adaptável)
- **`stroke-linecap="round"`**: Pontas arredondadas
- **Ícone de cruz (+)**: Universal para "adicionar"

---

## ✅ Testando a Implementação

### Cenário 1: Abrir Formulário

**Passos:**
1. Acesse `http://localhost:4200`
2. Clique no botão roxo flutuante (canto inferior direito)
3. **Resultado esperado**:
   - Sidesheet abre da direita para esquerda
   - Título "Cadastrar"
   - Todos os campos vazios

### Cenário 2: Validação de Campos

**Passos:**
1. Abra o formulário
2. Clique em "Cadastrar" sem preencher nada
3. **Resultado esperado**:
   - Mensagens de erro aparecem em vermelho
   - Campos obrigatórios destacados
   - Botão não faz submit

**Teste individual:**
4. Preencha "Nome" com "AB" (menos de 3 caracteres)
5. Clique fora do campo
6. **Resultado esperado**:
   - Erro: "Nome é obrigatório (mínimo 3 caracteres)"

### Cenário 3: Validação de Arquivo

**Passos:**
1. Clique em "Escolher arquivo"
2. Selecione um arquivo **PDF** (não imagem)
3. **Resultado esperado**:
   - Snackbar vermelho: "Por favor, selecione apenas arquivos de imagem."
   - Arquivo não é aceito

**Teste de tamanho:**
4. Selecione uma imagem maior que 4MB
5. **Resultado esperado**:
   - Snackbar: "A imagem deve ter no máximo 4MB."

### Cenário 4: Cadastro com Sucesso (Sem Imagem)

**Requisitos:**
- Backend rodando
- Token válido no localStorage

**Passos:**
1. Preencha todos os campos obrigatórios:
   - Nome: "Twilight Sparkle"
   - Elemento: "Magia"
   - Personalidade: "Inteligente"
   - Talento: "Estudos"
   - Resumo: "Líder da amizade"
2. **Não** selecione imagem
3. Clique em "Cadastrar"
4. **Resultado esperado**:
   - Loading aparece no botão
   - Snackbar verde: "Twilight Sparkle cadastrado com sucesso!"
   - Sidesheet fecha
   - Lista recarrega automaticamente

### Cenário 5: Cadastro com Imagem

**Passos:**
1. Preencha todos os campos
2. Selecione uma imagem válida (PNG/JPG, < 4MB)
3. Clique em "Cadastrar"
4. **Resultado esperado**:
   - Loading no botão (upload pode demorar)
   - Snackbar verde após sucesso
   - Imagem aparece na listagem (próxima aula)

### Cenário 6: Erro no Backend

**Simular erro:**
1. Desligue o backend
2. Preencha e envie o formulário
3. **Resultado esperado**:
   - Snackbar vermelho: "Erro ao cadastrar pony. Tente novamente."
   - Formulário permanece aberto
   - Dados não são perdidos

### Cenário 7: Cancelamento

**Passos:**
1. Abra o formulário
2. Preencha alguns campos
3. Clique em "Cancelar"
4. Reabra o formulário
5. **Resultado esperado**:
   - Todos os campos limpos
   - Nenhum dado anterior

---

## 🎓 Conceitos Avançados

### 1. Por que Reactive Forms ao invés de Template-Driven?

**Template-Driven (simples, mas limitado):**
```html
<input [(ngModel)]="name" required minlength="3" />
```

**Problemas:**
- ❌ Validação no template (difícil testar)
- ❌ Sem tipagem (refatoração perigosa)
- ❌ Validações assíncronas complexas

**Reactive Forms (robusto, escalável):**
```typescript
this.form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]]
});
```

**Vantagens:**
- ✅ **Testabilidade**: Lógica no TypeScript
- ✅ **Type-safe**: `this.form.get('name')` é tipado
- ✅ **Composição**: Fácil criar validators customizados
- ✅ **Reatividade**: Observable para mudanças

### 2. Padrão de Upload: File → URL

**Fluxo implementado:**
```
1. Usuário seleciona arquivo
        ↓
2. Validação client-side (tipo, tamanho)
        ↓
3. Armazena em signal (selectedFile)
        ↓
4. Usuário preenche form e submete
        ↓
5. Upload da imagem
        ↓
6. Backend retorna URL
        ↓
7. Atualiza form com URL
        ↓
8. Cria pony com URL da imagem
```

**Por que não upload imediato?**
- ❌ **Desperdício**: Se usuário cancelar, imagem fica no servidor
- ❌ **UX**: Loading logo ao selecionar assusta
- ✅ **Upload ao submit**: Só envia se formulário válido

**Alternativa (upload imediato):**
```typescript
// Ao selecionar arquivo, já faz upload
onFileSelected(event: Event) {
    const file = ...;
    this.ponyService.uploadImage(file).subscribe({
        next: (response) => {
            this.ponyForm.patchValue({ imageUrl: response.imageUrl });
        }
    });
}
```

**Trade-off:**
| Abordagem | Prós | Contras |
|-----------|------|---------|
| **Upload ao submit** | ✅ Sem desperdício | ⚠️ Loading mais longo |
| **Upload imediato** | ✅ Feedback rápido | ❌ Cleanup complexo |

### 3. FormData vs JSON

**JSON (dados estruturados):**
```typescript
const body = { name: 'Twilight', element: 'Magic' };
this.http.post('/ponies', body);  // Content-Type: application/json
```

**FormData (arquivos):**
```typescript
const formData = new FormData();
formData.append('file', file);
this.http.post('/upload', formData);  // Content-Type: multipart/form-data
```

**Quando usar cada um:**
- **JSON**: Dados textuais, numéricos, booleanos
- **FormData**: Arquivos binários (imagens, PDFs, vídeos)

**Por que não misturar?**
- Não é possível enviar JSON + Arquivo em uma única requisição HTTP padrão
- **Solução**: Duas requests separadas (nossa abordagem)

**Alternativa (envio único):**
```typescript
// Backend precisa suportar multipart misto
const formData = new FormData();
formData.append('file', file);
formData.append('data', new Blob([JSON.stringify(ponyData)], { type: 'application/json' }));
```

### 4. Template Reference Variables (#createPony)

**O que são:**
```html
<create-pony #createPony />
<button (click)="createPony.openForm()">Abrir</button>
```
- **`#createPony`**: Variável local no template
- **Acesso**: Métodos e propriedades **públicos** do component

**Alternativa (sem template ref):**
```typescript
// No ListComponent
@ViewChild(CreatePonyComponent) createPony!: CreatePonyComponent;

openForm() {
    this.createPony.openForm();
}
```

**Trade-off:**
| Abordagem | Código | Quando usar |
|-----------|--------|-------------|
| **Template ref** | ✅ Menos código | UI simples, poucos métodos |
| **ViewChild** | ❌ Mais verboso | Lógica complexa, TypeScript |

### 5. Omit<T, K> - Utility Type do TypeScript

**Definição:**
```typescript
createPony(pony: Omit<Pony, 'id'>): Observable<Pony>
```

**O que faz:**
```typescript
type Pony = {
    id: string;
    name: string;
    element: string;
};

type PonyCreate = Omit<Pony, 'id'>;
// = { name: string; element: string; }
```

**Por que usar?**
- ✅ **Type-safe**: TypeScript force no compile-time
- ✅ **DRY**: Não duplica definições
- ✅ **Refatoração**: Adicionar campo em `Pony` atualiza `Omit` automaticamente

**Outros Utility Types úteis:**
- **`Pick<T, K>`**: Seleciona campos
- **`Partial<T>`**: Todos campos opcionais
- **`Required<T>`**: Todos campos obrigatórios

**Exemplo:**
```typescript
type PonyUpdate = Partial<Pony>;  // Todos opcionais (para PATCH)
type PonyName = Pick<Pony, 'name'>;  // Só { name: string }
```

---

## 📦 Resumo dos Arquivos Criados/Modificados

| Arquivo | Ação | Responsabilidade |
|---------|------|------------------|
| `file.helper.ts` | ✨ CRIADO | Validação de arquivos (tipo, tamanho) |
| `plus.svg` | ✨ CRIADO | Ícone do botão FAB |
| `create-pony.component.ts` | ✨ CRIADO | Formulário reativo de cadastro |
| `create-pony.component.html` | ✨ CRIADO | Template com validações visuais |
| `create-pony.component.scss` | ✨ CRIADO | Estilos do formulário |
| `pony.service.ts` | ✏️ MODIFICADO | Métodos createPony() e uploadImage() |
| `list.component.ts` | ✏️ MODIFICADO | Importa CreatePony e SvgIcon |
| `list.component.html` | ✏️ MODIFICADO | Botão FAB + integração create-pony |
| `list.component.scss` | ✏️ MODIFICADO | Estilos do botão FAB |
| `core/helpers/index.ts` | ✏️ MODIFICADO | Exporta FileHelper |

---

## 🎯 Checklist de Conclusão

- ✅ `FileHelper` criado com validações de tipo e tamanho
- ✅ Métodos `createPony()` e `uploadImage()` no service
- ✅ Formulário reativo com `FormBuilder` e `Validators`
- ✅ Validações visuais no template (touched + invalid)
- ✅ Upload de imagens com validação client-side
- ✅ Botão flutuante (FAB) no canto inferior direito
- ✅ Integração entre CreatePony e ListComponent via output
- ✅ Snackbar feedback de sucesso/erro
- ✅ Loading state durante submit
- ✅ Reset de formulário ao cancelar/sucesso
- ✅ FormData para upload de arquivos
- ✅ Two-way binding da sidesheet funcionando

---

## 📚 Resumo

Nesta aula você aprendeu:

✅ Como criar formulários reativos com `FormBuilder`  
✅ Validações com `Validators` (required, minLength)  
✅ Validação visual condicional (invalid + touched)  
✅ Upload de arquivos com `FormData`  
✅ Validação client-side de arquivos (tipo, tamanho)  
✅ Comunicação entre componentes via `output()`  
✅ Padrão de upload: File → URL → Create  
✅ Template reference variables (`#createPony`)  
✅ Utility Types do TypeScript (`Omit<T, K>`)  
✅ Botão flutuante (FAB) com `position: fixed`  
✅ Integração com snackbar para feedbacks  
✅ Reset de formulário e estados  

---

## 📚 Referências

- [Reactive Forms](https://angular.io/guide/reactive-forms)
- [Form Validation](https://angular.io/guide/form-validation)
- [FormData API](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [Material Design FAB](https://material.io/components/buttons-floating-action-button)
- [Template Reference Variables](https://angular.io/guide/template-reference-variables)

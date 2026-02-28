# 📘 Aula 16 — Edição de Ponies e Reutilização de Formulário

**Progresso do Curso Frontend:** `[███████████████████░] 95% concluído`

## Objetivo

Implementar a funcionalidade de **edição de ponies** reutilizando o componente de cadastro existente. Aprenderemos a criar um formulário que funciona em **dois modos** (criação e edição) usando **computed signals**, **component references** e **comunicação entre componentes**.

---

## 🎯 O que vamos construir

- **Modo dual no formulário**: Criar vs. Editar
- **Computed signals dinâmicos**: Título, botão e placeholder adaptáveis
- **Component reference**: Comunicação entre pony-details e create-pony
- **Validação condicional**: Imagem obrigatória apenas na criação
- **Refatoração de código**: Quebra de métodos para reduzir complexidade
- **Feedback visual**: Placeholder branco no modo de edição
- **API PUT**: Atualização de registros existentes

---

## 📋 Conceitos Importantes

### Reutilização de Componentes

**Por que reutilizar o formulário de cadastro para edição?**

| Abordagem | Vantagens | Desvantagens |
|-----------|-----------|--------------|
| **Componentes separados** | Mais simples inicialmente | ❌ Código duplicado<br>❌ Manutenção dobrada<br>❌ Inconsistências |
| **Componente reutilizável** | ✅ DRY (Don't Repeat Yourself)<br>✅ Manutenção única<br>✅ Consistência garantida | Requer planejamento |

**Princípio SOLID aplicado:**
- **Single Responsibility**: Componente gerencia formulário de pony
- **Open/Closed**: Aberto para extensão (modo edição), fechado para modificação

### Computed Signals para Estados Dinâmicos

```typescript
// ❌ Abordagem procedural
getTitle(): string {
    return this.isEditing ? 'Atualizar' : 'Cadastrar';
}

// ✅ Computed signal (reativo e memoizado)
title = computed(() => (this.editingPony() ? 'Atualizar' : 'Cadastrar'));
```

**Vantagens do computed signal:**
- ✅ **Reativo**: Atualiza automaticamente quando `editingPony()` muda
- ✅ **Memoizado**: Resultado é cacheado (não recalcula desnecessariamente)
- ✅ **Declarativo**: Mais legível e expressivo

### Component Reference com Input Signal

```typescript
// Filho recebe referência do irmão
createPonyRef = input.required<CreatePonyComponent>();

// Pode chamar métodos públicos
this.createPonyRef().openEditForm(pony);
```

**Padrão de comunicação:**
```
list.component (pai)
    ├──> pony-details (filho 1)
    │      └──> chama método via referência
    └──> create-pony (filho 2)
           └──> openEditForm() é chamado
```

### Validação Condicional

```typescript
// Imagem obrigatória apenas na criação
if (!editingPony && !file) {
    this.snackbarService.error('A imagem é obrigatória...');
    return;
}
```

**Lógica de negócio:**
- **Criando**: Imagem obrigatória (pony precisa de imagem)
- **Editando**: Imagem opcional (mantém a existente)

---

## 📂 Estrutura de Arquivos

```
web/src/app/
└── features/
    └── ponies/
        ├── components/
        │   ├── create-pony/
        │   │   ├── create-pony.component.ts    ← MODIFICAR
        │   │   ├── create-pony.component.html  ← MODIFICAR
        │   │   └── create-pony.component.scss  ← MODIFICAR
        │   └── pony-details/
        │       ├── pony-details.component.ts    ← MODIFICAR
        │       └── pony-details.component.html  ← MODIFICAR
        ├── services/
        │   └── pony.service.ts                  ← JÁ TEM updatePony()
        └── pages/
            └── list/
                └── list.component.html          ← MODIFICAR
```

---

## 🛠️ Passo 1: Adaptar o Componente de Cadastro para Modo Dual

### 1.1. Modificar o TypeScript

Atualize `web/src/app/features/ponies/components/create-pony/create-pony.component.ts`:

**Imports:**
```typescript
import { CommonModule } from '@angular/common';
import { Component, signal, inject, output, computed } from '@angular/core';  // ← +computed
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PonyButtonComponent } from '@app/shared/components/pony-button/pony-button.component';
import { PonyInputComponent } from '@app/shared/components/pony-input/pony-input.component';
import { PonySidesheetComponent } from '@app/shared/components/sidesheet/sidesheet.component';
import { PonyTextareaComponent } from '@app/shared/components/pony-textarea/pony-textarea.component';
import { PonyService } from '../../services/pony.service';
import { SnackbarService } from '@core/services/snackbar.service';
import { FileHelper } from '@core/helpers';
import { Pony } from '../../models/pony.model';  // ← ADICIONAR
```

**Signals de estado:**
```typescript
export class CreatePonyComponent {
    private fb = inject(FormBuilder);
    private ponyService = inject(PonyService);
    private snackbarService = inject(SnackbarService);

    showDetails = signal<boolean>(false);
    isLoading = signal<boolean>(false);
    selectedFile = signal<File | null>(null);
    editingPony = signal<Pony | null>(null);  // ← NOVO (null = modo criação)

    // Computed signals para UI dinâmica
    title = computed(() => (this.editingPony() ? 'Atualizar' : 'Cadastrar'));
    buttonText = computed(() => (this.editingPony() ? 'Atualizar' : 'Cadastrar'));
    imagePlaceholder = computed(() => {
        const pony = this.editingPony();
        return pony ? pony.imageUrl : '/twilight.png';
    });

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
```

### 📝 Explicação dos Computed Signals

**1. Signal de controle:**
```typescript
editingPony = signal<Pony | null>(null);
```
- **`null`**: Modo criação (novo pony)
- **`Pony`**: Modo edição (pony existente)

**2. Título dinâmico:**
```typescript
title = computed(() => (this.editingPony() ? 'Atualizar' : 'Cadastrar'));
```
- Recalcula automaticamente quando `editingPony()` muda
- Template usa `[title]="title()"` → sempre sincronizado

**3. Placeholder inteligente:**
```typescript
imagePlaceholder = computed(() => {
    const pony = this.editingPony();
    return pony ? pony.imageUrl : '/twilight.png';
});
```
- **Criando**: Mostra sugestão `/twilight.png`
- **Editando**: Mostra URL atual da imagem do pony

**Métodos de abertura:**
```typescript
openForm(): void {
    this.editingPony.set(null);  // ← Limpa estado de edição
    this.showDetails.set(true);
    this.ponyForm.reset();
    this.selectedFile.set(null);
}

openEditForm(pony: Pony): void {  // ← NOVO método público
    this.editingPony.set(pony);  // Define pony em edição
    this.showDetails.set(true);
    this.ponyForm.patchValue({   // patchValue mantém campos não alterados
        name: pony.name,
        imageUrl: pony.imageUrl,
        element: pony.element,
        personality: pony.personality,
        talent: pony.talent,
        summary: pony.summary,
    });
    this.selectedFile.set(null);
}
```

### 📝 Por que `patchValue` e não `setValue`?

| Método | Comportamento | Uso |
|--------|---------------|-----|
| **setValue** | Exige TODOS os campos | Quando tem todos os dados |
| **patchValue** | Aceita campos parciais | ✅ Mais flexível e seguro |

**Método de fechamento:**
```typescript
closeForm(): void {
    this.showDetails.set(false);
    this.ponyForm.reset();
    this.selectedFile.set(null);
    this.editingPony.set(null);  // ← Limpa estado de edição
}
```

### 1.2. Refatorar o Submit

**Código completo:**
```typescript
onSubmit(): void {
    if (this.ponyForm.invalid) {
        this.ponyForm.markAllAsTouched();
        return;
    }

    const file = this.selectedFile();
    const editingPony = this.editingPony();

    // Validação condicional: imagem obrigatória apenas na criação
    if (!editingPony && !file) {
        this.snackbarService.error('A imagem é obrigatória para cadastrar um novo pony.');
        return;
    }

    this.isLoading.set(true);

    if (file) {
        this.handleFileUpload(file);
        return;
    }

    this.savePony();
}

private handleFileUpload(file: File): void {
    this.ponyService.uploadImage(file).subscribe({
        next: (response) => {
            this.ponyForm.patchValue({ imageUrl: response.imageUrl });
            this.savePony();
        },
        error: (error) => {
            console.error('Erro ao fazer upload:', error);
            this.snackbarService.error('Erro ao enviar imagem. Tente novamente.');
            this.isLoading.set(false);
        },
    });
}

private savePony(): void {
    const editingPony = this.editingPony();

    if (editingPony) {
        this.updatePony(editingPony.id);
    } else {
        this.createPony();
    }
}
```

### 📝 Explicação da Refatoração

**Por que quebrar em 3 métodos?**

**Antes (aninhamento triplo):**
```typescript
onSubmit() {
    if (file) {
        upload().subscribe({
            next: () => {
                if (editing) {
                    update()  // ← Aninhamento profundo
                } else {
                    create()  // ← Difícil de ler
                }
            }
        })
    } else {
        if (editing) {
            update()
        } else {
            create()
        }
    }
}
```

**Depois (linear):**
```typescript
onSubmit()          → Valida e decide fluxo
  ├─> handleFileUpload()  → Faz upload
  └─> savePony()          → Decide criar/atualizar
       ├─> createPony()
       └─> updatePony()
```

**Vantagens:**
- ✅ Mais legível (fluxo linear)
- ✅ Fácil de testar (métodos isolados)
- ✅ Single Responsibility (cada método faz uma coisa)

### 1.3. Implementar UPDATE

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
            console.error('Erro ao criar pony:', error);
            this.snackbarService.error('Erro ao cadastrar pony. Tente novamente.');
            this.isLoading.set(false);
        },
    });
}

private updatePony(ponyId: string): void {  // ← NOVO método
    const formData = this.ponyForm.value;

    this.ponyService.updatePony(ponyId, formData).subscribe({
        next: (pony) => {
            this.snackbarService.success(`${pony.name} atualizado com sucesso!`);
            this.ponyCreated.emit();  // Notifica lista para recarregar
            this.closeForm();
            this.isLoading.set(false);
        },
        error: (error) => {
            console.error('Erro ao atualizar pony:', error);
            this.snackbarService.error('Erro ao atualizar pony. Tente novamente.');
            this.isLoading.set(false);
        },
    });
}
```

### 📝 Explicação do método updatePony

**Diferenças entre CREATE e UPDATE:**

| Aspecto | createPony() | updatePony() |
|---------|-------------|--------------|
| **Service** | `createPony(data)` | `updatePony(id, data)` |
| **HTTP** | POST /ponies | PUT /ponies/:id |
| **ID** | Gerado pelo backend | ✅ Passado na URL |
| **Mensagem** | "cadastrado com sucesso" | "atualizado com sucesso" |

**Por que `ponyCreated.emit()` em ambos?**
- Lista precisa recarregar para mostrar mudanças
- Mesmo evento para ambos os casos (nome genérico)

---

## 🛠️ Passo 2: Adaptar o Template

### 2.1. Modificar o HTML

Atualize `web/src/app/features/ponies/components/create-pony/create-pony.component.html`:

**Título dinâmico:**
```html
<sidesheet
    [(isOpen)]="showDetails"
    [title]="title()"  <!-- ← Era 'Cadastrar' hardcoded -->
>
```

**Campo de imagem com label e placeholder dinâmicos:**
```html
<div class="create-pony__field">
    <label for="imageUrl">Imagem{{ editingPony() ? '' : ' *' }}</label>
    <pony-input
        id="imageUrl"
        type="file"
        [borderless]="true"
        [placeholder]="imagePlaceholder()"
        [class.editing-mode]="editingPony()"
        (fileChange)="onFileSelected($event)"
    />
</div>
```

### 📝 Explicação do Template

**1. Label condicional:**
```html
Imagem{{ editingPony() ? '' : ' *' }}
```
- **Criando**: "Imagem *" (asterisco indica obrigatório)
- **Editando**: "Imagem" (sem asterisco, é opcional)

**2. Placeholder dinâmico:**
```html
[placeholder]="imagePlaceholder()"
```
- **Criando**: `/twilight.png`
- **Editando**: `http://localhost:3000/uploads/rainbow-dash.png`

**3. Classe condicional:**
```html
[class.editing-mode]="editingPony()"
```
- Aplicada apenas em modo de edição
- Usada no CSS para estilizar o placeholder

**Botão dinâmico:**
```html
<pony-button
    variant="primary"
    type="button"
    (click)="onSubmit()"
    [disabled]="isLoading()"
    width="172px"
    [loading]="isLoading()"
>
    {{ buttonText() }}  <!-- ← Era 'Cadastrar' hardcoded -->
</pony-button>
```

---

## 🛠️ Passo 3: Estilizar Modo de Edição

### 3.1. Modificar o SCSS

Atualize `web/src/app/features/ponies/components/create-pony/create-pony.component.scss`:

```scss
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

    // Estilo para placeholder do file input em modo de edição
    pony-input.editing-mode ::ng-deep .pony-box__upload-text {
        color: $text-color;
    }
}
```

### 📝 Explicação do CSS

**::ng-deep (View Encapsulation):**
```scss
pony-input.editing-mode ::ng-deep .pony-box__upload-text {
    color: $text-color;
}
```

**Por que `::ng-deep`?**
- **Problema**: `.pony-box__upload-text` está dentro de `pony-input` (componente filho)
- **Solução**: `::ng-deep` penetra o encapsulamento do Angular
- **Resultado**: Placeholder fica branco no modo de edição

**Cores aplicadas:**
- **Modo criação**: `$grayscale-03` (cinza - padrão do pony-input)
- **Modo edição**: `$text-color` (branco - destaque da URL atual)

---

## 🛠️ Passo 4: Conectar Pony Details com Create Pony

### 4.1. Modificar Pony Details TypeScript

Atualize `web/src/app/features/ponies/components/pony-details/pony-details.component.ts`:

**Imports:**
```typescript
import { CommonModule } from '@angular/common';
import { Component, signal, output, inject, input } from '@angular/core';  // ← +input
import { ReactiveFormsModule } from '@angular/forms';
import { PonyButtonComponent } from '@app/shared/components/pony-button/pony-button.component';
import { PonySidesheetComponent } from '@app/shared/components/sidesheet/sidesheet.component';
import { SvgIconComponent } from 'angular-svg-icon';
import { PonyService } from '../../services/pony.service';
import { Pony } from '../../models/pony.model';
import { CreatePonyComponent } from '../create-pony/create-pony.component';  // ← ADICIONAR
```

**Adicionar input e método:**
```typescript
export class PonyDetailsComponent {
    private ponyService = inject(PonyService);

    // Input para referência do create-pony
    createPonyRef = input.required<CreatePonyComponent>();

    showDetails = signal<boolean>(false);
    isLoading = signal<boolean>(false);
    ponyDetails = signal<Pony | null>(null);

    ponyCreated = output<void>();

    // ... métodos existentes (openDetails, getPonyDetails, closeDetails)

    editPony(): void {  // ← NOVO método
        const pony = this.ponyDetails();
        
        if (!pony) {
            return;
        }

        // Fecha o sidesheet de detalhes
        this.closeDetails();

        // Abre o sidesheet de edição com os dados
        this.createPonyRef().openEditForm(pony);
    }

    removePony(): void {
        // Lógica para remover o pony
    }
}
```

### 📝 Explicação da Comunicação

**Input Signal Required:**
```typescript
createPonyRef = input.required<CreatePonyComponent>();
```
- **`input.required`**: Força o pai a passar a referência
- **`CreatePonyComponent`**: Tipo do componente (type-safe)
- Permite chamar métodos públicos do create-pony

**Método editPony():**
```typescript
editPony(): void {
    const pony = this.ponyDetails();
    if (!pony) return;  // Guard clause

    this.closeDetails();                      // 1. Fecha detalhes
    this.createPonyRef().openEditForm(pony);  // 2. Abre edição
}
```

**Fluxo de comunicação:**
```
[Botão Atualizar]
       ↓
  editPony()
       ↓
  closeDetails()  → Fecha sidesheet de detalhes
       ↓
  createPonyRef().openEditForm(pony)  → Abre sidesheet de edição
```

### 4.2. Modificar Pony Details HTML

Atualize `web/src/app/features/ponies/components/pony-details/pony-details.component.html`:

```html
<div
    sidesheet-footer
    class="pony-details__footer"
>
    <button
        class="pony-details__trash"
        (click)="removePony()"
        aria-label="Deletar Pony"
        type="button"
    >
        <svg-icon
            src="assets/icons/trash.svg"
            class="icon"
            [svgStyle]="{ 'width.px': 20 }"
        />
    </button>
    <pony-button
        variant="secondary"
        type="button"
        (click)="editPony()"  <!-- ← Era closeDetails() -->
        [disabled]="isLoading()"
        width="144px"
    >
        Atualizar
    </pony-button>
    <pony-button
        variant="primary"
        type="button"
        (click)="closeDetails()"
        width="144px"
    >
        Fechar
    </pony-button>
</div>
```

---

## 🛠️ Passo 5: Conectar Componentes no List

### 5.1. Modificar List HTML

Atualize `web/src/app/features/ponies/pages/list/list.component.html`:

**Antes:**
```html
<pony-details #ponyDetails />

<create-pony
    #createPony
    (ponyCreated)="getData()"
/>
```

**Depois:**
```html
<pony-details
    #ponyDetails
    [createPonyRef]="createPony"  <!-- ← Passa referência -->
/>

<create-pony
    #createPony
    (ponyCreated)="getData()"
/>
```

### 📝 Explicação da Conexão

**Template Reference Variables:**
```html
<create-pony #createPony />
```
- **`#createPony`**: Cria variável de template
- Acessível por outros componentes no mesmo template

**Property Binding:**
```html
<pony-details [createPonyRef]="createPony" />
```
- **`[createPonyRef]`**: Input signal do pony-details
- **`createPony`**: Referência do create-pony

**Fluxo completo:**
```
list.component.html
    ├── <create-pony #createPony />         ← Registra referência
    └── <pony-details [createPonyRef]="createPony" />  ← Recebe referência
            └── Pode chamar: createPony.openEditForm(pony)
```

---

## ✅ Testando a Implementação

### Cenário 1: Abrir Modo de Edição

**Passos:**
1. Acesse a listagem de ponies
2. Clique para ver detalhes de um pony
3. Clique no botão "Atualizar"

**Resultado esperado:**
- ✅ Sidesheet de detalhes fecha
- ✅ Sidesheet de edição abre
- ✅ Título: "Atualizar"
- ✅ Formulário preenchido com dados do pony
- ✅ Label da imagem: "Imagem" (sem asterisco)
- ✅ Placeholder da imagem: URL atual (texto branco)
- ✅ Botão: "Atualizar"

### Cenário 2: Editar Sem Mudar Imagem

**Passos:**
1. Abra modo de edição de um pony
2. Altere apenas o nome: "Rainbow Dash Ultimate"
3. Clique em "Atualizar"

**Resultado esperado:**
- ✅ Loading no botão
- ✅ Requisição PUT para `/ponies/:id`
- ✅ Snackbar: "Rainbow Dash Ultimate atualizado com sucesso!"
- ✅ Sidesheet fecha
- ✅ Lista recarrega mostrando novo nome

**Console Network:**
```http
PUT http://localhost:3000/ponies/abc123
Authorization: Bearer TOKEN

{
    "name": "Rainbow Dash Ultimate",
    "element": "Loyalty",
    "personality": "Brave",
    "talent": "Flying",
    "summary": "Fast flyer",
    "imageUrl": "http://localhost:3000/uploads/rainbow.png"
}
```

### Cenário 3: Editar COM Nova Imagem

**Passos:**
1. Abra modo de edição de um pony
2. Selecione nova imagem (< 4MB)
3. Altere o elemento: "Loyalty & Courage"
4. Clique em "Atualizar"

**Resultado esperado:**
- ✅ Upload da imagem (POST `/ponies/upload`)
- ✅ Formulário atualizado com nova URL
- ✅ Requisição PUT com nova imageUrl
- ✅ Snackbar de sucesso
- ✅ Lista recarrega com nova imagem

**Ordem das requisições:**
```
1. POST /ponies/upload         → Retorna { imageUrl: "..." }
2. PUT  /ponies/:id            → Atualiza pony com nova URL
```

### Cenário 4: Tentar Criar Sem Imagem

**Passos:**
1. Clique no botão "+" (criar novo)
2. Preencha todos os campos EXCETO imagem
3. Clique em "Cadastrar"

**Resultado esperado:**
- ✅ Snackbar de erro: "A imagem é obrigatória para cadastrar um novo pony."
- ✅ Formulário permanece aberto
- ✅ Nenhuma requisição HTTP feita

### Cenário 5: Alternar Entre Modos

**Passos:**
1. Abra modo de criação (botão "+")
2. Verifique título: "Cadastrar"
3. Feche e abra detalhes de um pony
4. Clique em "Atualizar"
5. Verifique título: "Atualizar"
6. Feche e reabra modo de criação

**Resultado esperado:**
- ✅ Título muda corretamente
- ✅ Placeholder da imagem muda
- ✅ Label da imagem com/sem asterisco
- ✅ Botão muda de texto
- ✅ Formulário limpa ao trocar de modo

---

## 🎓 Conceitos Avançados

### 1. Por que Computed Signals ao invés de Getters?

**❌ Getter (reavaliado em cada change detection):**
```typescript
get title(): string {
    return this.editingPony() ? 'Atualizar' : 'Cadastrar';
}

// Template
<sidesheet [title]="title">  // Executado múltiplas vezes
```

**Problemas:**
- ❌ Executado em CADA ciclo de change detection
- ❌ Se usado em loop, multiplicado por N itens
- ❌ Performance degradada

**✅ Computed Signal (memoizado):**
```typescript
title = computed(() => this.editingPony() ? 'Atualizar' : 'Cadastrar');

// Template
<sidesheet [title]="title()">  // Usa cache se dependências não mudaram
```

**Vantagens:**
- ✅ Só recalcula quando `editingPony()` muda
- ✅ Resultado cacheado entre change detections
- ✅ Performance otimizada

### 2. Input Signal vs. @Input Decorator

**Decorator tradicional:**
```typescript
@Input() createPonyRef!: CreatePonyComponent;
```

**Input signal (moderno):**
```typescript
createPonyRef = input.required<CreatePonyComponent>();
```

**Comparação:**

| Aspecto | @Input | input() |
|---------|--------|---------|
| **Reatividade** | ❌ Não reativo | ✅ Signal reativo |
| **Composição** | ❌ Difícil | ✅ Usa em computed |
| **Type safety** | ⚠️ Precisa `!` | ✅ Required por padrão |
| **Change detection** | OnPush complexo | ✅ Automático |

### 3. Template Reference vs. ViewChild

**Template Reference (usado aqui):**
```html
<create-pony #createPony />
<pony-details [createPonyRef]="createPony" />
```

**ViewChild (alternativa):**
```typescript
@ViewChild(CreatePonyComponent) createPony!: CreatePonyComponent;

ngAfterViewInit() {
    this.ponyDetails.createPonyRef = this.createPony;
}
```

**Por que Template Reference é melhor aqui?**
- ✅ Mais declarativo (tudo no HTML)
- ✅ Menos código TypeScript
- ✅ Angular gerencia lifecycle automaticamente
- ✅ Sem problemas de timing (AfterViewInit)

### 4. Refatoração: Early Return Pattern

**Antes (aninhamento):**
```typescript
editPony(): void {
    const pony = this.ponyDetails();
    
    if (pony) {
        this.closeDetails();
        this.createPonyRef().openEditForm(pony);
    }
}
```

**Depois (early return):**
```typescript
editPony(): void {
    const pony = this.ponyDetails();
    if (!pony) return;  // ← Guard clause
    
    this.closeDetails();
    this.createPonyRef().openEditForm(pony);
}
```

**Vantagens:**
- ✅ Menos indentação (fluxo principal à esquerda)
- ✅ Casos especiais tratados no topo
- ✅ Código mais legível

### 5. Validação Condicional Avançada

**Lógica implementada:**
```typescript
if (!editingPony && !file) {
    // Erro apenas na criação sem arquivo
}
```

**Tabela de decisão:**

| Modo | Arquivo Selecionado | Resultado |
|------|---------------------|-----------|
| **Criação** | ❌ Não | ❌ Erro: obrigatório |
| **Criação** | ✅ Sim | ✅ Procede com upload |
| **Edição** | ❌ Não | ✅ Mantém imagem atual |
| **Edição** | ✅ Sim | ✅ Upload nova imagem |

**Por que essa lógica?**
- **UX**: Usuário pode editar outros campos sem reenviar imagem
- **Performance**: Evita upload desnecessário de imagem já existente
- **Flexibilidade**: Permite trocar imagem se quiser

---

## 📦 Resumo dos Arquivos Modificados

| Arquivo | Ação | Mudanças Principais |
|---------|------|---------------------|
| `create-pony.component.ts` | ✏️ MODIFICADO | +editingPony signal<br>+computed signals (title, buttonText, imagePlaceholder)<br>+openEditForm()<br>+updatePony()<br>Refatoração do onSubmit() |
| `create-pony.component.html` | ✏️ MODIFICADO | Título dinâmico<br>Label condicional<br>Placeholder dinâmico<br>Classe editing-mode<br>Botão dinâmico |
| `create-pony.component.scss` | ✏️ MODIFICADO | Estilo para placeholder branco |
| `pony-details.component.ts` | ✏️ MODIFICADO | +createPonyRef input<br>+editPony() método |
| `pony-details.component.html` | ✏️ MODIFICADO | Botão "Atualizar" chama editPony() |
| `list.component.html` | ✏️ MODIFICADO | Passa createPonyRef para pony-details |

---

## 🎯 Checklist de Conclusão

- ✅ Signal `editingPony` controla modo dual
- ✅ Computed signals para UI dinâmica
- ✅ Método `openEditForm()` preenche formulário
- ✅ Método `updatePony()` implementado com PUT
- ✅ Validação condicional (imagem obrigatória só na criação)
- ✅ Refatoração com early return e métodos focados
- ✅ Component reference via input signal
- ✅ Comunicação entre pony-details e create-pony
- ✅ Placeholder branco no modo de edição
- ✅ Template reference no list.component
- ✅ Snackbar de sucesso/erro para atualização
- ✅ Lista recarrega após edição

---

## 📚 Referências

- [Angular Signals](https://angular.io/guide/signals)
- [Computed Signals](https://angular.io/guide/signals#computed-signals)
- [Input Signals](https://angular.io/guide/signals#input-signals)
- [Template Reference Variables](https://angular.io/guide/template-reference-variables)
- [Component Interaction](https://angular.io/guide/component-interaction)
- [Reactive Forms](https://angular.io/guide/reactive-forms)

# 📘 Aula 11b — Integração e Upload de Imagens

**Progresso do Curso Frontend:** `[██████████████░░░░░░] 68% concluído`

## Objetivo

Integrar o **formulário de cadastro** na página de listagem, implementar botão flutuante (FAB) e completar o fluxo de upload de imagens.

---

## 🎯 O que vamos construir

- **Botão Flutuante (FAB)**: Acesso rápido ao cadastro
- **Integração com ListComponent**: Output events
- **Ícone Plus SVG**: Para o botão FAB
- **Fluxo completo**: Upload → Create → Refresh lista

<!-- 💡 Screenshot sugerido: Botão FAB purple no canto inferior direito -->
<!-- 💡 Screenshot sugerido: Formulário aberto via FAB -->

💡 **Pré-requisito**: [Aula 11a](./11a-cadastro-forms.md) concluída.

---

## 📋 Conceitos Importantes

### Template Reference Variables

```html
<create-pony #createPony />
<button (click)="createPony.openForm()">Abrir</button>
```

- **`#createPony`**: Variável local no template
- **Acesso**: Métodos **públicos** do componente
- **Vantagem**: Menos código que `@ViewChild`

### FAB Pattern (Floating Action Button)

**Características:**
- `position: fixed` (fica fixo mesmo com scroll)
- Canto inferior direito
- Ação primária da página
- Sempre visível

---

## 📂 Estrutura de Arquivos

```
web/src/app/
├── features/
│   └── ponies/
│       └── pages/
│           └── list/
│               ├── list.component.ts        ← MODIFICAR
│               ├── list.component.html      ← MODIFICAR
│               └── list.component.scss      ← MODIFICAR
└── assets/
    └── icons/
        └── plus.svg                          ← NOVO
```

---

## 🛠️ Passo 1: Criar o Ícone Plus

Crie `web/public/assets/icons/plus.svg`:

```svg
<svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.3999 0.899902V8.3999M8.3999 15.8999V8.3999M8.3999 8.3999H15.8999M8.3999 8.3999H0.899902" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

**`stroke="currentColor"`**: Herda cor do elemento pai ✅

---

## 🛠️ Passo 2: Adicionar Botão FAB no Template

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
                    message="Não foi possível carregar as informações esperadas." 
                />
            }
        }
    </div>

    <!-- Botão Flutuante -->
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

<!-- Sidesheet de Cadastro -->
<create-pony #createPony (ponyCreated)="getData()" />
```

**Explicação:**
- **`#createPony`**: Template reference variable
- **`createPony.openForm()`**: Acessa método público
- **`(ponyCreated)="getData()"`**: Recarrega lista após cadastro

---

## 🛠️ Passo 3: Estilizar o Botão FAB

Atualize `web/src/app/features/ponies/pages/list/list.component.scss`:

```scss
@use 'styles/variables' as *;
@use 'styles/mixins' as *;

.breadcrumb {
    font-family: $title-family;
    font-weight: 700;
    font-size: $font-size-2xl;
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

**Propriedades importantes:**
- **`position: fixed`**: Fixo na tela (não move com scroll)
- **`bottom/right: 50px`**: Posicionamento no canto
- **`box-shadow`**: Elevação visual (Material Design)

---

## 🛠️ Passo 4: Atualizar o TypeScript

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
import { CreatePonyComponent } from '../../components/create-pony/create-pony.component';  // ← ADICIONAR

@Component({
    selector: 'app-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MainLayoutComponent,
        FeedbackComponent,
        SvgIconComponent,              // ← ADICIONAR
        CreatePonyComponent,            // ← ADICIONAR
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

**Imports adicionados:**
- **`SvgIconComponent`**: Para renderizar plus.svg
- **`CreatePonyComponent`**: Para usar `<create-pony>` no template

---

## ✅ Testando a Implementação

### Cenário 1: Abrir Formulário via FAB

**Passos:**
1. Acesse `http://localhost:4200`
2. Clique no botão roxo (canto inferior direito)
3. **Esperado**:
   - Sidesheet abre da direita
   - Título "Cadastrar"
   - Campos vazios

<!-- 💡 Screenshot sugerido: FAB clicado e sidesheet abrindo -->

### Cenário 2: Cadastro Completo (Sem Imagem)

**Requisitos:**
- Backend rodando
- Token válido

**Passos:**
1. Preencha:
   - Nome: "Twilight Sparkle"
   - Elemento: "Magia"
   - Personalidade: "Inteligente"
   - Talento: "Estudos"
   - Resumo: "Líder da amizade"
2. Clique em "Cadastrar"
3. **Esperado**:
   - Loading no botão
   - Snackbar verde: "Twilight Sparkle cadastrado com sucesso!"
   - Sidesheet fecha
   - **Lista recarrega automaticamente**

<!-- 💡 Screenshot sugerido: Snackbar de sucesso exibido -->

### Cenário 3: Cadastro com Imagem

**Passos:**
1. Preencha formulário completo
2. Selecione imagem válida (PNG/JPG < 4MB)
3. Clique em "Cadastrar"
4. **Esperado**:
   - Loading (upload pode demorar)
   - Snackbar de sucesso
   - Lista atualizada com novo pony

### Cenário 4: Cancelamento

**Passos:**
1. Preencha alguns campos
2. Clique em "Cancelar"
3. Reabra formulário
4. **Esperado**: Campos limpos

### Cenário 5: Erro no Backend

**Simular:**
1. Desligue o backend
2. Tente cadastrar
3. **Esperado**:
   - Snackbar vermelho: "Erro ao cadastrar pony. Tente novamente."
   - Formulário permanece aberto

---

## 🎓 Conceitos Avançados

### 1. Padrão de Upload: File → URL

**Fluxo implementado:**
```
1. Usuário seleciona arquivo → Validação client-side
2. Submit do formulário → Upload da imagem
3. Backend retorna URL → Atualiza form com URL
4. Cria pony com URL
```

**Por que não upload imediato?**
- ❌ Desperdício se usuário cancelar
- ✅ Upload apenas se formulário válido

### 2. FormData vs JSON

| Tipo | Usado para | Content-Type |
|------|-----------|--------------|
| **JSON** | Dados estruturados | `application/json` |
| **FormData** | ✅ Arquivos | `multipart/form-data` |

**Não é possível:** Enviar JSON + Arquivo em uma única request HTTP padrão

**Solução**: Duas requests separadas (nossa abordagem)

### 3. Output Events

```typescript
// Componente filho emite
ponyCreated = output<void>();
this.ponyCreated.emit();

// Parent escuta
<create-pony (ponyCreated)="getData()" />
```

**Vantagens:**
- ✅ Desacoplamento (filho não conhece pai)
- ✅ Reusabilidade
- ✅ Testabilidade

---

## 🎯 Checklist de Conclusão

- ✅ Ícone plus.svg criado
- ✅ Botão FAB implementado e estilizado
- ✅ Template reference variable funcionando
- ✅ Output event conectado ao `getData()`
- ✅ Lista recarrega após cadastro
- ✅ Loading state durante upload
- ✅ Validação client-side de imagens
- ✅ Snackbar feedback de sucesso/erro

---

## 📚 Resumo

Nesta aula você aprendeu:

✅ Botão flutuante (FAB) com `position: fixed`  
✅ Template reference variables (`#createPony`)  
✅ Output events para comunicação  
✅ Padrão de upload: File → URL → Create  
✅ Integração completa de formulário com listagem  
✅ FormData para upload de arquivos  

---

## 📚 Referências

- [Template Reference Variables](https://angular.io/guide/template-reference-variables)
- [Material Design FAB](https://material.io/components/buttons-floating-action-button)
- [FormData API](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [Output Events](https://angular.dev/guide/components/outputs)
# 📘 Aula 6B — Layout Base da Aplicação (Parte 2: Integração e Rotas)

> 📌 **Parte 1:** [06a-layout-base.md](06a-layout-base.md) — Estrutura e Components

**Progresso do Curso Frontend:** `[███████░░░░░░░░░░░░░] 37% concluído`

## 🧩 3. Criar Componente Ponies List (Smart Component)

### 3.1 Gerar o Componente

```bash
ng generate component features/ponies/pages/list --name=list --skip-tests
```

---

### 3.2 Implementar TypeScript

**src/app/features/ponies/pages/list/list.component.ts**

```typescript
import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MainLayoutComponent } from "@app/core/layout/main-layout/main-layout.component";

@Component({
  selector: "app-list",
  standalone: true,
  imports: [CommonModule, FormsModule, MainLayoutComponent],
  templateUrl: "./list.component.html",
})
export class ListComponent {
  filter = signal("");

  updateFilter(value: string): void {
    console.log("Filtro atualizado:", value);
    this.filter.set(value);
  }
}
```

**💡 Explicação:**

- **Smart Component**: Gerencia estado e lógica de negócio (aqui, apenas o filtro; futuramente, chamadas de API)
- **Single Source of Truth**: Apenas este componente guarda o estado do filtro
- **filter signal**: Armazena o termo de busca do usuário
- **updateFilter()**: Recebe evento do main-layout e atualiza o signal

### 🔍 Conceitos Importantes: Single Source of Truth

**Problema comum: Estado duplicado**

```typescript
// ❌ RUIM - Estado em dois lugares
// MainLayout
filter = signal("");

// List
filter = signal(""); // Duplicado! Pode dessincronizar
```

**Solução: Estado apenas no Smart Component**

```typescript
// ✅ BOM - Estado apenas no List (Smart)
// MainLayout (Dumb)
onSearchEvent = output<string>();  // Apenas emite

// List (Smart)
filter = signal('');  // Única fonte de verdade
updateFilter(value: string) {
  this.filter.set(value);  // Único lugar que atualiza
}
```

**Fluxo de dados unidirecional:**

```
┌─────────────────────────────────────────┐
│  List (Smart Component)                 │
│  - filter = signal('')                  │
│  - Recebe: (onSearchEvent)="update()"   │
└─────────────────┬───────────────────────┘
                  │
                  ↓ (state down)
┌─────────────────────────────────────────┐
│  MainLayout (Dumb Component)            │
│  - Renderiza: <pony-input>              │
│  - Emite: onSearchEvent.emit(value)     │
└─────────────────────────────────────────┘
                  │
                  ↑ (events up)
```

### 📊 Comparação: State Management Approaches

| Abordagem                        | Exemplo                  | Complexidade | Melhor Para                                   |
| -------------------------------- | ------------------------ | ------------ | --------------------------------------------- |
| **Local Signal (nossa escolha)** | `filter = signal('')`    | Baixa        | Estado de um componente                       |
| **Service com Signal**           | `filterService.filter()` | Média        | Estado compartilhado entre poucos componentes |
| **Signal Store**                 | `@ngrx/signals`          | Média-Alta   | Estado de feature (ex: ponies list + details) |
| **NgRx Store**                   | `@ngrx/store`            | Alta         | Apps grandes, estado complexo                 |

**Nossa escolha atual:**

- Filtro é local à página de listagem
- Não precisa ser compartilhado com outras features
- Signal local é suficiente

**Quando escalar:**

- Se precisar compartilhar filtro entre múltiplas páginas → Service
- Se adicionar sorting, paginação, seleção → Signal Store
- Se app crescer muito → NgRx Store

---

### 3.3 Implementar Template HTML

**src/app/features/ponies/pages/list/list.component.html**

```html
<main-layout (onSearchEvent)="updateFilter($event)">
  <h2>Ponies List</h2>
  <p>Filtro atual: <strong>{{ filter() }}</strong></p>
</main-layout>
```

**💡 Explicação:**

- **main-layout**: Wrapper que fornece estrutura visual (sidebar + header)
- **onSearchEvent**: Escuta evento de busca emitido pelo main-layout
- **Conteúdo projetado**: Todo conteúdo dentro de `<main-layout>` é renderizado via `ng-content`
- **filter()**: Exibe valor do signal para debug/validação

---

## 🔗 4. Criar Ícones SVG

**src/assets/icons/search.svg**

```svg
<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"
    xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd"
        d="M4.16667 9.16667C4.16667 6.40917 6.40917 4.16667 9.16667 4.16667C11.9242 4.16667 14.1667 6.40917 14.1667 9.16667C14.1667 11.9242 11.9242 14.1667 9.16667 14.1667C6.40917 14.1667 4.16667 11.9242 4.16667 9.16667ZM17.2558 16.0775L14.4267 13.2475C15.3042 12.1192 15.8333 10.705 15.8333 9.16667C15.8333 5.49083 12.8425 2.5 9.16667 2.5C5.49083 2.5 2.5 5.49083 2.5 9.16667C2.5 12.8425 5.49083 15.8333 9.16667 15.8333C10.705 15.8333 12.1192 15.3042 13.2475 14.4267L16.0775 17.2558C16.24 17.4183 16.4533 17.5 16.6667 17.5C16.88 17.5 17.0933 17.4183 17.2558 17.2558C17.5817 16.93 17.5817 16.4033 17.2558 16.0775Z"
        fill="currentColor" />
    <mask id="mask0_4950_488" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="2" y="2"
        width="16" height="16">
        <path fill-rule="evenodd" clip-rule="evenodd"
            d="M4.16667 9.16667C4.16667 6.40917 6.40917 4.16667 9.16667 4.16667C11.9242 4.16667 14.1667 6.40917 14.1667 9.16667C14.1667 11.9242 11.9242 14.1667 9.16667 14.1667C6.40917 14.1667 4.16667 11.9242 4.16667 9.16667ZM17.2558 16.0775L14.4267 13.2475C15.3042 12.1192 15.8333 10.705 15.8333 9.16667C15.8333 5.49083 12.8425 2.5 9.16667 2.5C5.49083 2.5 2.5 5.49083 2.5 9.16667C2.5 12.8425 5.49083 15.8333 9.16667 15.8333C10.705 15.8333 12.1192 15.3042 13.2475 14.4267L16.0775 17.2558C16.24 17.4183 16.4533 17.5 16.6667 17.5C16.88 17.5 17.0933 17.4183 17.2558 17.2558C17.5817 16.93 17.5817 16.4033 17.2558 16.0775Z"
            fill="currentColor" />
    </mask>
    <g mask="url(#mask0_4950_488)">
        <rect width="20" height="20" fill="currentColor" />
    </g>
</svg>

```

**src/assets/icons/home.svg**

```svg
<svg width="19" height="20" viewBox="0 0 19 20" fill="currentColor"
    xmlns="http://www.w3.org/2000/svg">
    <path
        d="M7.23 0.787988C8.5 -0.221012 10.28 -0.261012 11.589 0.667988L11.75 0.787988L17.839 5.65899C18.509 6.17799 18.92 6.94899 18.99 7.78799L19 7.98899V16.098C19 18.188 17.349 19.888 15.28 19.998H13.29C12.339 19.979 11.57 19.239 11.5 18.309L11.49 18.168V15.309C11.49 14.998 11.259 14.739 10.95 14.688L10.86 14.678H8.189C7.87 14.688 7.61 14.918 7.57 15.218L7.56 15.309V18.159C7.56 18.218 7.549 18.288 7.54 18.338L7.53 18.359L7.519 18.428C7.4 19.279 6.7 19.928 5.83 19.989L5.7 19.998H3.91C1.82 19.998 0.11 18.359 0 16.298V7.98899C0.009 7.13799 0.38 6.34799 1 5.79799L7.23 0.787988ZM10.88 1.87799C10.12 1.26799 9.04 1.23899 8.24 1.76799L8.089 1.87799L2.009 6.77899C1.66 7.03799 1.45 7.42799 1.4 7.83799L1.389 7.99799V16.098C1.389 17.428 2.429 18.518 3.75 18.598H5.7C5.92 18.598 6.11 18.449 6.139 18.239L6.16 18.059L6.17 18.008V15.309C6.17 14.239 6.99 13.369 8.04 13.288H10.86C11.929 13.288 12.799 14.109 12.88 15.159V18.168C12.88 18.378 13.03 18.559 13.23 18.598H15.089C16.429 18.598 17.519 17.569 17.599 16.258L17.61 16.098V7.99799C17.599 7.56899 17.42 7.16799 17.11 6.86899L16.98 6.75799L10.88 1.87799Z"
        fill="currentColor" />
</svg>

```

**src/assets/icons/logout.svg**

```svg
<svg width="21" height="20" viewBox="0 0 21 20" fill="currentColor"
    xmlns="http://www.w3.org/2000/svg">
    <path
        d="M9.309 0C11.6882 0 13.6301 1.87393 13.7392 4.22624L13.744 4.435V5.368C13.744 5.78221 13.4082 6.118 12.994 6.118C12.6143 6.118 12.3005 5.83585 12.2508 5.46977L12.244 5.368V4.435C12.244 2.8721 11.022 1.59426 9.48144 1.50498L9.309 1.5H4.434C2.87194 1.5 1.59425 2.72213 1.50498 4.26258L1.5 4.435V15.565C1.5 17.1278 2.7219 18.4057 4.26165 18.495L4.434 18.5H9.319C10.8764 18.5 12.15 17.2824 12.239 15.7478L12.244 15.576V14.633C12.244 14.2188 12.5798 13.883 12.994 13.883C13.3737 13.883 13.6875 14.1652 13.7372 14.5312L13.744 14.633V15.576C13.744 17.9472 11.8772 19.8831 9.53335 19.9949L9.319 20H4.434C2.05555 20 0.113841 18.1259 0.00482718 15.7737L0 15.565V4.435C0 2.05594 1.87376 0.113862 4.22531 0.00482809L4.434 0H9.309ZM17.3041 6.48086L17.3884 6.55329L20.3164 9.46829C20.3427 9.49445 20.3659 9.52108 20.3871 9.54924L20.3164 9.46829C20.3469 9.4987 20.3743 9.53109 20.3985 9.56505C20.4156 9.5888 20.4314 9.6139 20.4456 9.63994C20.4482 9.645 20.4509 9.64997 20.4535 9.65496C20.4661 9.67894 20.4773 9.70381 20.4872 9.72936C20.4913 9.74054 20.4953 9.75186 20.4991 9.76324C20.5064 9.78427 20.5125 9.80591 20.5177 9.82793C20.5201 9.8397 20.5225 9.85137 20.5247 9.86309C20.5288 9.88353 20.5318 9.90462 20.5339 9.92596C20.535 9.94082 20.536 9.95553 20.5366 9.97025C20.5373 9.98012 20.5375 9.98999 20.5375 9.9999L20.5367 10.0282C20.5361 10.0436 20.535 10.059 20.5335 10.0743L20.5375 9.9999C20.5375 10.0467 20.5332 10.0926 20.525 10.1371C20.5226 10.1482 20.5201 10.1599 20.5174 10.1715C20.5123 10.1947 20.5059 10.2172 20.4985 10.2392C20.4947 10.2494 20.491 10.2598 20.487 10.27C20.4778 10.2949 20.4669 10.319 20.4549 10.3424C20.4519 10.3477 20.4488 10.3536 20.4456 10.3595C20.4111 10.4228 20.368 10.48 20.3178 10.5302L20.3164 10.5312L17.3884 13.4472C17.0949 13.7395 16.6201 13.7385 16.3278 13.445C16.0621 13.1782 16.0387 12.7615 16.2572 12.4684L16.33 12.3844L17.969 10.749L7.7465 10.7499C7.33229 10.7499 6.9965 10.4141 6.9965 9.9999C6.9965 9.6202 7.27866 9.30641 7.64473 9.25675L7.7465 9.2499L17.971 9.249L16.3301 7.61631C16.0632 7.35064 16.0381 6.93403 16.2553 6.63993L16.3277 6.55565C16.5934 6.28879 17.01 6.26366 17.3041 6.48086Z"
        fill="currentColor" />
</svg>

```

---

## 🛣️ 5. Configurar Rotas

### 5.1 Adicionar Rota de Ponies

**src/app/app.routes.ts**

```typescript
import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "login",
    loadComponent: () =>
      import("./features/auth/pages/login/login.component").then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: "ponies",
    loadComponent: () =>
      import("./features/ponies/pages/list/list.component").then(
        (m) => m.ListComponent,
      ),
  },
];
```

**💡 Explicação:**

- **Lazy Loading**: Carrega componentes sob demanda

### 4.2 Atualizar Redirecionamento do Login

**src/app/features/auth/pages/login/login.component.ts**

```typescript
// Após login bem-sucedido
if (hasUserData) {
  this.snackbarService.success("Login realizado com sucesso!");
  this.router.navigate(["/ponies"]); // ✅ Navega para listagem
}
```

---

## 🧪 5. Testar o Layout

### 5.1 Executar Aplicação

```bash
cd web
npm start
```

### 5.2 Verificar Funcionalidades

1. **Login**: Faça login e verifique redirecionamento para `/ponies`
2. **Layout**: Confirme estrutura (sidebar + header + ng-content)
3. **Busca**:
   - Digite no campo de busca
   - Verifique no console: "Filtro atualizado: [valor]"
   - Veja o signal `filter()` atualizar no template
4. **Comunicação**: Main layout emite evento → Ponies list recebe

---

## 📚 Resumo

Nesta aula você aprendeu:

✅ Criar componente de layout reutilizável (main-layout)  
✅ Arquitetura Smart vs Dumb Components (separação de responsabilidades)  
✅ Implementar sidebar de navegação com efeitos arredondados (pseudo-elements)  
✅ Header contextual com busca integrada  
✅ Projeção de conteúdo com `ng-content` (content projection)  
✅ Comunicação de componentes via `output()` (Angular 17+)  
✅ Single Source of Truth para estado (evitar duplicação)  
✅ Integração com pony-input usando `(inputChange)` (dual-purpose component)  
✅ Formatação de datas em português (custom formatter)  
✅ Lazy loading de componentes (loadComponent)  
✅ Animações e transitions suaves  
✅ CSS Grid para layouts bidimensionais  
✅ :focus-within para efeitos de foco em containers  
✅ Pseudo-elements (:before/:after) para efeitos visuais complexos  
✅ Fr units no CSS Grid para layouts fluidos

---

## 🎓 Conceitos Aprendidos

- **CSS Grid Layout**: Estrutura bidimensional para layout
- **Flexbox**: Alinhamento de elementos
- **Smart vs Dumb Components**: Separação de responsabilidades
  - **Dumb (main-layout)**: Apenas apresentação, emite eventos
  - **Smart (list)**: Gerencia estado e lógica
- **Content Projection**: `ng-content` para conteúdo dinâmico
- **Signals**: Estado reativo com `signal()`
- **Output Events**: Comunicação child → parent com `output()`
- **Single Source of Truth**: Estado em um único lugar
- **Lazy Loading**: Carregamento sob demanda
- **CSS Pseudo-elements**: `:before` e `:after` para efeitos visuais

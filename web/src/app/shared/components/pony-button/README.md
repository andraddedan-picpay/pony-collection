# Pony Button Component

Componente de botão compartilhado e reutilizável com suporte a estados de loading.

## Uso

```typescript
import { PonyButtonComponent } from '@shared/components/pony-button/pony-button.component';

@Component({
  imports: [PonyButtonComponent]
})
```

```html
<!-- Botão primário básico -->
<pony-button>Clique aqui</pony-button>

<!-- Botão com loading -->
<pony-button 
  type="submit" 
  [loading]="isLoading()" 
  width="100%">
  Salvar
</pony-button>

<!-- Botão secundário -->
<pony-button variant="secondary">
  Cancelar
</pony-button>

<!-- Botão com largura customizada -->
<pony-button width="200px">
  Custom Width
</pony-button>

<!-- Botão desabilitado -->
<pony-button [disabled]="true">
  Desabilitado
</pony-button>
```

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `variant` | `'primary' \| 'secondary'` | `'primary'` | Variante visual do botão |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Tipo do botão HTML |
| `width` | `string` | `'auto'` | Largura do botão (ex: '100%', '200px', 'auto') |
| `disabled` | `boolean` | `false` | Desabilita o botão |
| `loading` | `boolean` | `false` | Exibe estado de carregamento |

## Events

| Event | Tipo | Descrição |
|-------|------|-----------|
| `click` | `MouseEvent` | Emitido quando o botão é clicado (não dispara se disabled ou loading) |

## Variantes

- **Primary**: Botão principal com gradiente roxo/rosa e sombra destacada
- **Secondary**: Botão secundário com fundo sólido e borda sutil

## Estados

- **Normal**: Estado padrão
- **Hover**: Animação de elevação (translateY) e intensificação da sombra
- **Active**: Volta para posição normal
- **Disabled**: Opacidade reduzida (0.7), cursor not-allowed, sem animações
- **Loading**: Exibe ícone SVG animado (rotação infinita), bloqueia cliques (pointer-events: none)

## Ícone de Loading

O botão usa a biblioteca **angular-svg-icon** para carregar o ícone SVG localizado em `/assets/icons/loading.svg`. 

- O ícone gira continuamente quando `loading` é `true`
- Cor do ícone: `$text-color` (branco)
- Dimensões: 20x20 pixels
- Animação: rotação de 360° em 1 segundo (linear infinite)

Quando em estado de loading, o conteúdo do botão é substituído pelo ícone, garantindo feedback visual claro ao usuário.

## Tecnologia

- **Signals API**: Usa `input()` e `output()` do Angular para reatividade
- **Standalone Component**: Não requer módulo
- **SVG Icons**: Integração com angular-svg-icon para ícones vetoriais escaláveis

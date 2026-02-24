import {
    Component,
    input,
    model,
    output,
    effect,
    inject,
    Renderer2,
    DOCUMENT,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
    selector: 'sidesheet',
    standalone: true,
    imports: [CommonModule, SvgIconComponent],
    templateUrl: './sidesheet.component.html',
    styleUrl: './sidesheet.component.scss',
})
export class PonySidesheetComponent {
    // Two-way binding com model()
    isOpen = model<boolean>(false);
    title = input<string>('');

    // Eventos opcionais para reagir a mudanças
    opened = output<void>();
    closed = output<void>();

    private renderer = inject(Renderer2);
    private document = inject(DOCUMENT);

    constructor() {
        // Previne scroll do body quando sidesheet está aberto
        effect(() => this.handleOpenStateChange());
    }

    // Métodos públicos para controle programático
    open(): void {
        this.isOpen.set(true);
    }

    handleClose(): void {
        this.isOpen.set(false);
    }

    handleBackdropClick(event: MouseEvent): void {
        // Fecha apenas se clicar no backdrop, não no conteúdo
        if (event.target === event.currentTarget) {
            this.handleClose();
        }
    }

    handleKeyDown(event: KeyboardEvent): void {
        // Fecha ao pressionar ESC
        if (event.key === 'Escape' && this.isOpen()) {
            this.handleClose();
        }
    }

    private handleOpenStateChange(): void {
        if (this.isOpen()) {
            this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
            this.opened.emit();
            return;
        }

        this.renderer.removeStyle(this.document.body, 'overflow');
        this.closed.emit();
    }
}

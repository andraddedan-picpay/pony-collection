import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from 'angular-svg-icon';

export type ButtonVariant = 'primary' | 'secondary';

@Component({
    selector: 'pony-button',
    standalone: true,
    imports: [CommonModule, SvgIconComponent],
    templateUrl: './pony-button.component.html',
    styleUrl: './pony-button.component.scss',
})
export class PonyButtonComponent {
    width = input<string>('auto');
    variant = input<ButtonVariant>('primary');
    type = input<'button' | 'submit' | 'reset'>('button');
    disabled = input<boolean>(false);
    loading = input<boolean>(false);

    click = output<MouseEvent>();

    handleClick(event: MouseEvent): void {
        event.stopPropagation();
        const canClick = !this.disabled() && !this.loading();
        if (canClick) this.click.emit(event);
    }
}

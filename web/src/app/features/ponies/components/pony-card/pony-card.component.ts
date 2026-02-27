import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
    selector: 'pony-card',
    standalone: true,
    imports: [CommonModule, SvgIconComponent],
    templateUrl: './pony-card.component.html',
    styleUrl: './pony-card.component.scss',
})
export class PonyCardComponent {
    ponyName = input<string>('');
    imageUrl = input<string>('');
    isFavorite = input<boolean>(false);

    viewDetailsEvent = output<void>();
    onHeartClick = output<void>();

    handleHeartClick(): void {
        this.onHeartClick.emit();
    }

    handleViewDetails(): void {
        this.viewDetailsEvent.emit();
    }
}

import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PonyButtonComponent } from "../pony-button/pony-button.component";

@Component({
    selector: 'feedback',
    standalone: true,
    imports: [CommonModule, PonyButtonComponent],
    templateUrl: './feedback.component.html',
    styleUrl: './feedback.component.scss',
})
export class FeedbackComponent {
    title = input<string>('');
    message = input<string>('');
    buttonText = input<string>('');
    imageName = input<string>('');

    onRetry = output<void>();

    handleRetry(): void {
        this.onRetry.emit();
    }
}

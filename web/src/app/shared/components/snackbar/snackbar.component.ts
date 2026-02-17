import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnackbarService } from '@core/services/snackbar.service';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
    selector: 'pony-snackbar',
    standalone: true,
    imports: [CommonModule, SvgIconComponent],
    templateUrl: './snackbar.component.html',
    styleUrl: './snackbar.component.scss',
})
export class SnackbarComponent {
    private snackbarService = inject(SnackbarService);

    get messages() {
        return this.snackbarService.messages$;
    }

    removeMessage(id: number): void {
        this.snackbarService.remove(id);
    }
}

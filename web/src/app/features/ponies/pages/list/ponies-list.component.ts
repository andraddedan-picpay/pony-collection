import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainLayoutComponent } from '@app/core/layout/main-layout/main-layout.component';

@Component({
    selector: 'app-ponies-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MainLayoutComponent],
    templateUrl: './ponies-list.component.html',
    // styleUrl: './ponies-list.component.scss',
})
export class PoniesListComponent {
    filter = signal('');

    updateFilter(value: string): void {
        console.log('Filtro atualizado:', value);
        this.filter.set(value);
    }
}

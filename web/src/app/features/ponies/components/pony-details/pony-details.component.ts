import { CommonModule } from '@angular/common';
import { Component, signal, output, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { PonyButtonComponent } from '@app/shared/components/pony-button/pony-button.component';
import { PonySidesheetComponent } from '@app/shared/components/sidesheet/sidesheet.component';
import { SvgIconComponent } from 'angular-svg-icon';
import { PonyService } from '../../services/pony.service';
import { Pony } from '../../models/pony.model';

@Component({
    selector: 'pony-details',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        PonySidesheetComponent,
        PonyButtonComponent,
        SvgIconComponent,
    ],
    templateUrl: './pony-details.component.html',
    styleUrl: './pony-details.component.scss',
})
export class PonyDetailsComponent {
    private ponyService = inject(PonyService);

    showDetails = signal<boolean>(false);
    isLoading = signal<boolean>(false);
    ponyDetails = signal<Pony | null>(null);

    ponyCreated = output<void>();

    openDetails(ponyId: string): void {
        this.showDetails.set(true);
        this.getPonyDetails(ponyId);
    }

    getPonyDetails(ponyId: string): void {
        this.isLoading.set(true);
        this.ponyDetails.set(null);

        const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 700));

        Promise.all([
            minLoadingTime,
            new Promise((resolve, reject) => {
                this.ponyService.getPonyById(ponyId).subscribe({
                    next: (pony) => resolve(pony),
                    error: (error) => reject(error),
                });
            }),
        ])
            .then(([_, pony]) => {
                this.ponyDetails.set(pony as Pony);
                this.isLoading.set(false);
            })
            .catch(() => {
                this.isLoading.set(false);
                this.closeDetails();
            });
    }

    closeDetails(): void {
        this.showDetails.set(false);
        this.ponyDetails.set(null);
    }

    removePony(): void {
        // Lógica para remover o pony
    }
}

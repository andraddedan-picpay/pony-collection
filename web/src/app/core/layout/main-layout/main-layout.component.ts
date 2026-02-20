import { Component, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SvgIconComponent } from 'angular-svg-icon';
import { PonyInputComponent } from '@app/shared/components/pony-input/pony-input.component';
import { AuthService } from '@core/services/auth.service';

@Component({
    selector: 'main-layout',
    standalone: true,
    imports: [CommonModule, FormsModule, SvgIconComponent, PonyInputComponent],
    templateUrl: './main-layout.component.html',
    styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
    onSearchEvent = output<string>();

    currentDate = signal(this.formatDate());

    private authService = inject(AuthService);
    private router = inject(Router);

    private formatDate(): string {
        const now = new Date();

        const days = [
            'Domingo',
            'Segunda-Feira',
            'Terça-Feira',
            'Quarta-Feira',
            'Quinta-Feira',
            'Sexta-Feira',
            'Sábado',
        ];

        const months = [
            'Janeiro',
            'Fevereiro',
            'Março',
            'Abril',
            'Maio',
            'Junho',
            'Julho',
            'Agosto',
            'Setembro',
            'Outubro',
            'Novembro',
            'Dezembro',
        ];

        const dayName = days[now.getDay()];
        const day = now.getDate();
        const monthName = months[now.getMonth()];
        const year = now.getFullYear();

        return `${dayName}, ${day} ${monthName} ${year}`;
    }

    onSearchChange(value: string): void {
        this.onSearchEvent.emit(value);
    }

    onLogout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}

import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { SnackbarService } from '@core/services/snackbar.service';
import { LoginRequest } from '@core/models/user.model';
import { PonyButtonComponent } from '@app/shared/components/pony-button/pony-button.component';
import { PonyInputComponent } from '@app/shared/components/pony-input/pony-input.component';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, PonyButtonComponent, PonyInputComponent],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
})
export class LoginComponent {
    email = signal('');
    password = signal('');
    isLoading = signal(false);

    private authService = inject(AuthService);
    private snackbarService = inject(SnackbarService);
    private router = inject(Router);

    onSubmit(): void {
        if (!this.email() || !this.password()) {
            this.snackbarService.error('Por favor, preencha todos os campos');
            return;
        }

        this.isLoading.set(true);

        const loginData: LoginRequest = {
            email: this.email(),
            password: this.password(),
        };

        this.authService.login(loginData).subscribe({
            next: (response) => {
                this.isLoading.set(false);
                const hasUserData = response.access_token && response.user;

                if (hasUserData) {
                    this.snackbarService.success('Login realizado com sucesso!');
                    this.router.navigate(['/']);
                    return;
                }

                this.snackbarService.error('Tente novamente!');
            },
            error: () => {
                this.snackbarService.error('Erro ao processar a solicitação.');
                this.isLoading.set(false);
            },
        });
    }

    updateEmail(value: string): void {
        this.email.set(value);
    }

    updatePassword(value: string): void {
        this.password.set(value);
    }
}

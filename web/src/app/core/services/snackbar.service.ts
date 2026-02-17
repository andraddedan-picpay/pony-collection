import { Injectable, signal } from '@angular/core';

export type SnackbarType = 'success' | 'error' | 'info';

export interface SnackbarMessage {
    id: number;
    message: string;
    type: SnackbarType;
}

@Injectable({
    providedIn: 'root',
})
export class SnackbarService {
    private messages = signal<SnackbarMessage[]>([]);
    private idCounter = 1;

    get messages$() {
        return this.messages();
    }

    show(message: string, type: SnackbarType = 'info', duration: number = 5000): void {
        const id = this.idCounter++;
        const snackbar: SnackbarMessage = { id, message, type };

        this.messages.update((current) => [...current, snackbar]);

        if (duration > 0) {
            setTimeout(() => this.remove(id), duration);
        }
    }

    success(message: string, duration?: number): void {
        this.show(message, 'success', duration);
    }

    error(message: string, duration?: number): void {
        this.show(message, 'error', duration);
    }

    info(message: string, duration?: number): void {
        this.show(message, 'info', duration);
    }

    remove(id: number): void {
        this.messages.update((current) => current.filter((msg) => msg.id !== id));
    }

    clear(): void {
        this.messages.set([]);
    }
}

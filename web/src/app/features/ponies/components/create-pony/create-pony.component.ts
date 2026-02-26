import { CommonModule } from '@angular/common';
import { Component, signal, inject, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PonyButtonComponent } from '@app/shared/components/pony-button/pony-button.component';
import { PonyInputComponent } from '@app/shared/components/pony-input/pony-input.component';
import { PonySidesheetComponent } from '@app/shared/components/sidesheet/sidesheet.component';
import { PonyTextareaComponent } from "@app/shared/components/pony-textarea/pony-textarea.component";
import { PonyService } from '../../services/pony.service';
import { SnackbarService } from '@core/services/snackbar.service';
import { FileHelper } from '@core/helpers';

@Component({
    selector: 'create-pony',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        PonySidesheetComponent,
        PonyButtonComponent,
        PonyInputComponent,
        PonyTextareaComponent,
    ],
    templateUrl: './create-pony.component.html',
    styleUrl: './create-pony.component.scss',
})
export class CreatePonyComponent {
    private fb = inject(FormBuilder);
    private ponyService = inject(PonyService);
    private snackbarService = inject(SnackbarService);

    // Controle da sidesheet via signal
    showDetails = signal<boolean>(false);
    isLoading = signal<boolean>(false);
    selectedFile = signal<File | null>(null);

    // Event para notificar quando pony for criado
    ponyCreated = output<void>();

    // Formulário reativo
    ponyForm: FormGroup;

    constructor() {
        this.ponyForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            imageUrl: [''],
            element: ['', Validators.required],
            personality: ['', Validators.required],
            talent: ['', Validators.required],
            summary: ['', [Validators.required, Validators.minLength(10)]],
        });
    }

    openForm(): void {
        this.showDetails.set(true);
        this.ponyForm.reset();
        this.selectedFile.set(null);
    }

    closeForm(): void {
        this.showDetails.set(false);
        this.ponyForm.reset();
        this.selectedFile.set(null);
    }

    onSubmit(): void {
        if (this.ponyForm.invalid) {
            this.ponyForm.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);

        // Se há arquivo selecionado, faz upload primeiro
        const file = this.selectedFile();
        if (file) {
            this.ponyService.uploadImage(file).subscribe({
                next: (response) => {
                    // Atualiza o formulário com a URL da imagem
                    this.ponyForm.patchValue({ imageUrl: response.imageUrl });
                    // Cria o pony com a URL da imagem
                    this.createPony();
                },
                error: (error) => {
                    console.error('Erro ao fazer upload:', error);
                    this.snackbarService.error('Erro ao enviar imagem. Tente novamente.');
                    this.isLoading.set(false);
                },
            });
        } else {
            // Sem arquivo, cria o pony diretamente
            this.createPony();
        }
    }

    private createPony(): void {
        const formData = this.ponyForm.value;

        this.ponyService.createPony(formData).subscribe({
            next: (pony) => {
                this.snackbarService.success(`${pony.name} cadastrado com sucesso!`);
                this.ponyCreated.emit();
                this.closeForm();
                this.isLoading.set(false);
            },
            error: (error) => {
                console.error('Erro ao criar pony:', error);
                this.snackbarService.error('Erro ao cadastrar pony. Tente novamente.');
                this.isLoading.set(false);
            },
        });
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;

        if (!input.files || input.files.length === 0) {
            this.selectedFile.set(null);
            return;
        }

        const file = input.files[0];
        const validation = FileHelper.validateImageFile(file, 4);

        if (!validation.valid) {
            this.snackbarService.error(validation.error!);
            this.selectedFile.set(null);
            return;
        }

        // Apenas guarda o arquivo para fazer upload no submit
        this.selectedFile.set(file);
    }

    get formControls() {
        return this.ponyForm.controls;
    }
}

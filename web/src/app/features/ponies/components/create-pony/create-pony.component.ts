import { CommonModule } from '@angular/common';
import { Component, signal, inject, output, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PonyButtonComponent } from '@app/shared/components/pony-button/pony-button.component';
import { PonyInputComponent } from '@app/shared/components/pony-input/pony-input.component';
import { PonySidesheetComponent } from '@app/shared/components/sidesheet/sidesheet.component';
import { PonyTextareaComponent } from '@app/shared/components/pony-textarea/pony-textarea.component';
import { PonyService } from '../../services/pony.service';
import { SnackbarService } from '@core/services/snackbar.service';
import { FileHelper } from '@core/helpers';
import { Pony } from '../../models/pony.model';

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

    showDetails = signal<boolean>(false);
    isLoading = signal<boolean>(false);
    selectedFile = signal<File | null>(null);
    editingPony = signal<Pony | null>(null);

    title = computed(() => (this.editingPony() ? 'Atualizar' : 'Cadastrar'));
    buttonText = computed(() => (this.editingPony() ? 'Atualizar' : 'Cadastrar'));
    imagePlaceholder = computed(() => {
        const pony = this.editingPony();
        return pony ? pony.imageUrl : 'twilight.png';
    });

    onPonyChange = output<void>();

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
        this.editingPony.set(null);
        this.showDetails.set(true);
        this.ponyForm.reset();
        this.selectedFile.set(null);
    }

    openEditForm(pony: Pony): void {
        this.editingPony.set(pony);
        this.showDetails.set(true);
        this.ponyForm.patchValue({
            name: pony.name,
            imageUrl: pony.imageUrl,
            element: pony.element,
            personality: pony.personality,
            talent: pony.talent,
            summary: pony.summary,
        });
        this.selectedFile.set(null);
    }

    closeForm(): void {
        this.showDetails.set(false);
        this.ponyForm.reset();
        this.selectedFile.set(null);
        this.editingPony.set(null);
    }

    onSubmit(): void {
        if (this.ponyForm.invalid) {
            this.ponyForm.markAllAsTouched();
            return;
        }

        const file = this.selectedFile();
        const editingPony = this.editingPony();

        if (!editingPony && !file) {
            this.snackbarService.error('A imagem é obrigatória para cadastrar um novo pony.');
            return;
        }

        this.isLoading.set(true);

        if (file) {
            this.handleFileUpload(file);
            return;
        }

        this.savePony();
    }

    private handleFileUpload(file: File): void {
        this.ponyService.uploadImage(file).subscribe({
            next: (response) => {
                this.ponyForm.patchValue({ imageUrl: response.imageUrl });
                this.savePony();
            },
            error: (error) => {
                console.error('Erro ao fazer upload:', error);
                this.snackbarService.error('Erro ao enviar imagem. Tente novamente.');
                this.isLoading.set(false);
            },
        });
    }

    private savePony(): void {
        const editingPony = this.editingPony();

        if (editingPony) {
            this.updatePony(editingPony.id);
        } else {
            this.createPony();
        }
    }

    private createPony(): void {
        const formData = this.ponyForm.value;

        this.ponyService.createPony(formData).subscribe({
            next: (pony) => {
                this.snackbarService.success(`${pony.name} cadastrado com sucesso!`);
                this.onPonyChange.emit();
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

    private updatePony(ponyId: string): void {
        const formData = this.ponyForm.value;

        this.ponyService.updatePony(ponyId, formData).subscribe({
            next: (pony) => {
                this.snackbarService.success(`${pony.name} atualizado com sucesso!`);
                this.onPonyChange.emit();
                this.closeForm();
                this.isLoading.set(false);
            },
            error: (error) => {
                console.error('Erro ao atualizar pony:', error);
                this.snackbarService.error('Erro ao atualizar pony. Tente novamente.');
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

        this.selectedFile.set(file);
    }

    get formControls() {
        return this.ponyForm.controls;
    }
}

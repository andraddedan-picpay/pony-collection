import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
    selector: 'pony-input',
    standalone: true,
    imports: [CommonModule, SvgIconComponent],
    templateUrl: './pony-input.component.html',
    styleUrl: './pony-input.component.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PonyInputComponent),
            multi: true,
        },
    ],
})
export class PonyInputComponent implements ControlValueAccessor {
    @Input() icon?: string;
    @Input() borderless?: boolean = false;
    @Input() type: string = 'text';
    @Input() placeholder: string = '';
    @Input() disabled: boolean = false;
    @Input() name: string = '';
    @Input() required: boolean = false;

    @Output() inputChange = new EventEmitter<string>();
    @Output() fileChange = new EventEmitter<Event>();

    value: string = '';
    fileName: string = '';

    private onChange: (value: string) => void = () => {};
    private onTouched: () => void = () => {};

    writeValue(value: string): void {
        this.value = value || '';
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    onInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.value = input.value;

        const isFileInput = this.type === 'file' && input.files?.length;

        if (isFileInput) {
            this.fileName = input.files?.[0]?.name || '';
            this.fileChange.emit(event);
        }

        this.onChange(this.value);
        this.inputChange.emit(this.value);
    }

    onBlur(): void {
        this.onTouched();
    }

    triggerFileInput(fileInput: HTMLInputElement): void {
        fileInput.click();
    }
}

import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
    selector: 'pony-textarea',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './pony-textarea.component.html',
    styleUrl: './pony-textarea.component.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PonyTextareaComponent),
            multi: true,
        },
    ],
})
export class PonyTextareaComponent implements ControlValueAccessor {
    @Input() borderless?: boolean = false;
    @Input() placeholder: string = '';
    @Input() disabled: boolean = false;
    @Input() name: string = '';
    @Input() required: boolean = false;
    @Input() rows: number = 4;
    @Input() maxLength?: number;

    @Output() textareaChange = new EventEmitter<string>();

    value: string = '';

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
        const textarea = event.target as HTMLTextAreaElement;
        this.value = textarea.value;
        this.onChange(this.value);
        this.textareaChange.emit(this.value);
    }

    onBlur(): void {
        this.onTouched();
    }
}

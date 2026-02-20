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
    @Input() type: string = 'text';
    @Input() placeholder: string = '';
    @Input() disabled: boolean = false;
    @Input() name: string = '';
    @Input() required: boolean = false;

    @Output() inputChange = new EventEmitter<string>();

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
        const input = event.target as HTMLInputElement;
        this.value = input.value;
        this.onChange(this.value);
        this.inputChange.emit(this.value);
    }

    onBlur(): void {
        this.onTouched();
    }
}

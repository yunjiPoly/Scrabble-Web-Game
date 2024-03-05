import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class NameControl {
    private names: string[];

    constructor(data: string[] = []) {
        this.names = data;
    }

    set data(names) {
        this.names = names;
    }

    get data() {
        return this.names;
    }

    get validator(): ValidatorFn | null {
        return (control: AbstractControl): ValidationErrors | null => {
            const forbidden = this.data.some((name) => control.value === name);
            return forbidden ? { forbiddenName: { value: control.value } } : null;
        };
    }
}

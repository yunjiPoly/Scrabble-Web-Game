import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
    providedIn: 'root',
})
export class AlertService {
    constructor(private snackBar: MatSnackBar) {}

    showAlert(message: string): void {
        const snack = this.snackBar.open(message, 'Fermer');
        const dismiss = () => snack.dismiss();
        document.addEventListener('click', dismiss);
        snack.afterDismissed().subscribe(() => document.removeEventListener('click', dismiss));
    }

    showAlertWithCallback(message: string, action: string, callback: () => void, duration?: number): void {
        const snack = this.snackBar.open(message, action, duration ? { duration } : {});
        const dismiss = () => snack.dismiss();
        document.addEventListener('click', dismiss);
        snack.onAction().subscribe(callback);
        snack.afterDismissed().subscribe(() => document.removeEventListener('click', dismiss));
    }

    showGenericError(): void {
        this.showAlert("Une erreur s'est produite");
    }
}

import { TestBed } from '@angular/core/testing';

import { AlertService } from './alert.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

describe('AlertService', () => {
    let service: AlertService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatSnackBarModule],
        });
        service = TestBed.inject(AlertService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

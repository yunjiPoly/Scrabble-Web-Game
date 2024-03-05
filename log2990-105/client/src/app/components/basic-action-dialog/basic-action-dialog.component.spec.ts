import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicActionDialogComponent } from './basic-action-dialog.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('DatabaseResetDialogComponent', () => {
    let component: BasicActionDialogComponent;
    let fixture: ComponentFixture<BasicActionDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [BasicActionDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BasicActionDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

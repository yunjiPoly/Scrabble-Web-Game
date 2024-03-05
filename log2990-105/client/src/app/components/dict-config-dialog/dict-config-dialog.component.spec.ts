import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DictConfigDialogComponent } from './dict-config-dialog.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';

describe('DictConfigDialogComponent', () => {
    let component: DictConfigDialogComponent;
    let fixture: ComponentFixture<DictConfigDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [DictConfigDialogComponent],
            providers: [FormBuilder, { provide: MatDialogRef, useValue: {} }, { provide: MAT_DIALOG_DATA, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DictConfigDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotConfigDialogComponent } from './bot-config-dialog.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';

describe('BotConfigDialogComponent', () => {
    let component: BotConfigDialogComponent;
    let fixture: ComponentFixture<BotConfigDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [BotConfigDialogComponent],
            providers: [FormBuilder, { provide: MatDialogRef, useValue: {} }, { provide: MAT_DIALOG_DATA, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BotConfigDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

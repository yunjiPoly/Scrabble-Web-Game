import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameBrowserDialogComponent } from './game-browser-dialog.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';

describe('GameBrowserDialogComponent', () => {
    let component: GameBrowserDialogComponent;
    let fixture: ComponentFixture<GameBrowserDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [GameBrowserDialogComponent],
            providers: [FormBuilder, { provide: MatDialogRef, useValue: {} }, { provide: MAT_DIALOG_DATA, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameBrowserDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

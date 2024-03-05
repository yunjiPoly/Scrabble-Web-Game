import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitingRoomDialogComponent } from './waiting-room-dialog.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';

describe('WaitingRoomDialogComponent', () => {
    let component: WaitingRoomDialogComponent;
    let fixture: ComponentFixture<WaitingRoomDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [WaitingRoomDialogComponent],
            providers: [FormBuilder, { provide: MatDialogRef, useValue: {} }, { provide: MAT_DIALOG_DATA, useValue: {} }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WaitingRoomDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

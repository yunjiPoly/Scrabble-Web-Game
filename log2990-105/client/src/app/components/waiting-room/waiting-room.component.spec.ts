import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitingRoomComponent } from './waiting-room.component';
import { MatDialogModule } from '@angular/material/dialog';

describe('WaitingRoomComponent', () => {
    let component: WaitingRoomComponent;
    let fixture: ComponentFixture<WaitingRoomComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [WaitingRoomComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WaitingRoomComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

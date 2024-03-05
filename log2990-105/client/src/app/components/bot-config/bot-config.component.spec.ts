import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotConfigComponent } from './bot-config.component';
import { MatDialogModule } from '@angular/material/dialog';

describe('BotConfigComponent', () => {
    let component: BotConfigComponent;
    let fixture: ComponentFixture<BotConfigComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [BotConfigComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BotConfigComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

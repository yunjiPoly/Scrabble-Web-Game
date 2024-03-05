import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DictConfigComponent } from './dict-config.component';
import { MatDialogModule } from '@angular/material/dialog';

describe('DictConfigComponent', () => {
    let component: DictConfigComponent;
    let fixture: ComponentFixture<DictConfigComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [DictConfigComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DictConfigComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

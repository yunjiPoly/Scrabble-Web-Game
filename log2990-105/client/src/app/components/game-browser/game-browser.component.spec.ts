import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameBrowserComponent } from './game-browser.component';
import { GameInfo } from '@app/classes/game-info';
import { MatDialogModule } from '@angular/material/dialog';
import { Subject } from 'rxjs';

describe('GameBrowserComponent', () => {
    let component: GameBrowserComponent;
    let fixture: ComponentFixture<GameBrowserComponent>;
    const gameList = new Subject<GameInfo[]>();

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [GameBrowserComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameBrowserComponent);
        component = fixture.componentInstance;
        component.gameList = gameList.asObservable();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

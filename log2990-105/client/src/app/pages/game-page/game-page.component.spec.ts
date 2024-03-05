import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { GamePageComponent } from './game-page.component';
import { HomePageComponent } from '@app/pages/home-page/home-page.component';
import { WebsocketService } from '@app/services/websocket.service';
import { GameInit } from '@app/classes/game-info';
import { Subject } from 'rxjs';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;

    const gameInit = new Subject<GameInit>();
    const websocketServiceSpy = jasmine.createSpyObj('WebsocketService', [], { init: gameInit.asObservable() });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([{ path: 'home', component: HomePageComponent }])],
            declarations: [GamePageComponent],
            providers: [{ provide: WebsocketService, useValue: websocketServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

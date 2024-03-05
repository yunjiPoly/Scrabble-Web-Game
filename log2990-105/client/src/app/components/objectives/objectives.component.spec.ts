/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ObjectivesComponent } from './objectives.component';
import { WebsocketService } from '@app/services/websocket.service';
import { Subject } from 'rxjs';
import { GameInit } from '@app/classes/game-info';

describe('ObjectivesComponent', () => {
    let component: ObjectivesComponent;
    let fixture: ComponentFixture<ObjectivesComponent>;

    const gameInitSubject = new Subject<GameInit>();
    const objectivesSubject = new Subject<{ publicObj: [number, boolean][]; privateObj: [number, boolean] }>();

    const websocketServiceSpy = jasmine.createSpyObj('WebsocketService', ['fetchObjectives'], {
        init: gameInitSubject.asObservable(),
        objective: objectivesSubject.asObservable(),
        gameInit: gameInitSubject,
        objectives: objectivesSubject,
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ObjectivesComponent],
            providers: [{ provide: WebsocketService, useValue: websocketServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ObjectivesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return the description of the wanted objective when calling obtainObjDescription', () => {
        const description = component.obtainObjDescription(8);
        expect(description).toEqual(['Quintuple placements', '20pts', "Faire un placement de 5 lettres minimum qui n'utilise aucun bonus"]);
    });

    it('should return undefined if the wanted objective does not exist when calling obtainObjDescription', () => {
        const description = component.obtainObjDescription(9);
        expect(description).toEqual([]);
    });

    it('should construct properly', () => {
        const initialization = {
            self: 'self',
            opponent: 'opponent',
            bonuses: [
                ['a', 'b'],
                ['c', 'd'],
            ],
            reserve: ['a', 'b', 'c', 'd'],
            hand: ['a', 'b', 'c', 'd'],
            gameMode: 2,
            turnState: false,
        };
        websocketServiceSpy.gameInit.next(initialization);
        expect(websocketServiceSpy.fetchObjectives).toHaveBeenCalled();
    });

    it('should affect value properly', () => {
        const pubObj: [number, boolean][] = [
            [1, false],
            [2, false],
        ];
        const prvObj: [number, boolean] = [3, false];
        const initialization = { publicObj: pubObj, privateObj: prvObj };
        websocketServiceSpy.objectives.next(initialization);
        expect(component.isVisible).toEqual(true);
        expect(component.publicObj[0][0]).toEqual(1);
        expect(component.privateObj[0]).toEqual(3);
    });
});

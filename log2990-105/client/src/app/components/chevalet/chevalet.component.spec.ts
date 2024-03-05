import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommandService } from '@app/services/command.service';
import { GridService } from '@app/services/grid.service';
import { ChevaletComponent } from './chevalet.component';

describe('ChevaletComponent', () => {
    let component: ChevaletComponent;
    let fixture: ComponentFixture<ChevaletComponent>;
    let commandServiceSpy: jasmine.SpyObj<CommandService>;
    let mouseEvent: MouseEvent;
    let gridServiceSpy: jasmine.SpyObj<GridService>;
    beforeEach(async () => {
        gridServiceSpy = jasmine.createSpyObj('GridService', ['alterWidth'], {});
        commandServiceSpy = jasmine.createSpyObj('CommandService', ['parseCommand']);
        await TestBed.configureTestingModule({
            declarations: [ChevaletComponent],

            providers: [
                { provide: CommandService, useValue: commandServiceSpy },
                { provide: GridService, useValue: gridServiceSpy },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(ChevaletComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('clickout should reset chevalet if clicked outside of chevalet', () => {
        component.isEventReceiver = true;
        component.isClicked = [true, false, false, false, false, false, false];
        component.activeLetter = [true, false, false, false, false, false, false];
        const expectedIsClicked: boolean[] = [false, false, false, false, false, false, false];
        const expectedActiveLetter: boolean[] = [false, false, false, false, false, false, false];
        mouseEvent = {} as MouseEvent;
        const eRef = {
            nativeElement: {
                contains: () => {
                    return false;
                },
            },
        };
        // eslint-disable-next-line dot-notation -- Nous avons besoin d'acceder un element prive du component pour les tests.
        component['eRef'] = eRef;
        component.clickout(mouseEvent);
        expect(component.isEventReceiver).toEqual(false);
        expect(component.isClicked).toEqual(expectedIsClicked);
        expect(component.activeLetter).toEqual(expectedActiveLetter);
    });

    it('clickout should not reset chevalet if clicked inside of chevalet', () => {
        component.isEventReceiver = true;
        component.isClicked = [true, false, false, false, false, false, false];
        component.activeLetter = [true, false, false, false, false, false, false];
        const expectedIsClicked: boolean[] = [true, false, false, false, false, false, false];
        const expectedActiveLetter: boolean[] = [true, false, false, false, false, false, false];
        mouseEvent = {} as MouseEvent;
        const eRef = {
            nativeElement: {
                contains: () => {
                    return true;
                },
            },
        };
        // eslint-disable-next-line dot-notation -- Nous avons besoin d'acceder un element prive du component pour les tests.
        component['eRef'] = eRef;
        component.clickout(mouseEvent);
        expect(component.isEventReceiver).toEqual(true);
        expect(component.isClicked).toEqual(expectedIsClicked);
        expect(component.activeLetter).toEqual(expectedActiveLetter);
    });

    it('moveRight moves a letter to the right', () => {
        component.playerHand = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        const expectedHand = ['b', 'a', 'c', 'd', 'e', 'f', 'g'];
        component.moveRight(0);
        expect(component.playerHand).toEqual(expectedHand);
    });

    it('moveRight works properly on the right edge', () => {
        component.playerHand = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        const expectedHand = ['g', 'b', 'c', 'd', 'e', 'f', 'a'];
        const SIX = 6;
        component.moveRight(SIX);
        expect(component.playerHand).toEqual(expectedHand);
    });

    it('moveLeft moves a letter to the left', () => {
        component.playerHand = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        const expectedHand = ['a', 'b', 'c', 'd', 'e', 'g', 'f'];
        const SIX = 6;
        component.moveLeft(SIX);
        expect(component.playerHand).toEqual(expectedHand);
    });

    it('moveLeft works properly on the left edge', () => {
        component.playerHand = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        const expectedHand = ['g', 'b', 'c', 'd', 'e', 'f', 'a'];
        component.moveLeft(0);
        expect(component.playerHand).toEqual(expectedHand);
    });

    it('updateActiveLetter updates active letter at given index', () => {
        component.activeLetter = [true, false, false, false, false, false, false];
        const expectedActiveLetter = [false, true, false, false, false, false, false];
        component.updateActiveLetter(1);
        expect(component.activeLetter).toEqual(expectedActiveLetter);
    });

    it('updateActiveLetter updates event receiver', () => {
        component.isEventReceiver = false;
        component.updateActiveLetter(1);
        expect(component.isEventReceiver).toEqual(true);
    });

    it('updateActiveLetter does not update if a letter is selected for exchange', () => {
        component.isClicked = [true, false, false, false, false, false, false];
        component.activeLetter = [false, false, false, false, false, false, false];
        const expectedActiveLetter = [false, false, false, false, false, false, false];
        component.updateActiveLetter(1);
        expect(component.activeLetter).toEqual(expectedActiveLetter);
    });

    it('findNextLetterIndex returns index of next instance of the letter for 2 instances', () => {
        component.playerHand = ['a', 'b', 'c', 'd', 'b', 'a', 'g'];
        const expectedIndexA = 5;
        const expectedIndexB = 1;
        const FOUR = 4;
        expect(component.findNextLetterIndex(0)).toEqual(expectedIndexA);
        expect(component.findNextLetterIndex(FOUR)).toEqual(expectedIndexB);
    });

    it('findNextLetterIndex returns index of next instance of the letter for multiple instances', () => {
        component.playerHand = ['a', 'b', 'a', 'a', 'b', 'a', 'b'];
        const expectedIndexA = 2;
        const expectedIndexB = 1;
        const SIX = 6;
        expect(component.findNextLetterIndex(0)).toEqual(expectedIndexA);
        expect(component.findNextLetterIndex(SIX)).toEqual(expectedIndexB);
    });

    it('findNextLetterIndex returns index of next instance of the letter for 1 instance', () => {
        component.playerHand = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        const expectedIndex = 0;
        expect(component.findNextLetterIndex(0)).toEqual(expectedIndex);
    });

    it('windowListener detects and updates letter is key pressed is a letter present in hand', () => {
        component.playerHand = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        component.isEventReceiver = true;
        component.activeLetter = [false, false, false, false, false, false, false];
        const expectedActiveLetter = [true, false, false, false, false, false, false];
        window.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: 'a',
            }),
        );
        expect(component.activeLetter).toEqual(expectedActiveLetter);
    });

    it('windowListener does nothing if chevalet is not event receiver', () => {
        component.playerHand = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        component.isEventReceiver = false;
        component.activeLetter = [false, false, false, false, false, false, false];
        const expectedActiveLetter = [false, false, false, false, false, false, false];
        window.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: 'a',
            }),
        );
        expect(component.activeLetter).toEqual(expectedActiveLetter);
    });

    // retester findnextletterindex?

    it('windowListener makes the proper changes if right arrow is pressed', () => {
        component.playerHand = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        component.isEventReceiver = true;
        component.activeLetter = [true, false, false, false, false, false, false];
        const expectedActiveLetter = [false, true, false, false, false, false, false];
        const expectedHand = ['b', 'a', 'c', 'd', 'e', 'f', 'g'];
        window.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: 'ArrowRight',
            }),
        );
        expect(component.activeLetter).toEqual(expectedActiveLetter);
        expect(component.playerHand).toEqual(expectedHand);
    });

    it('windowListener makes the proper changes if left arrow is pressed', () => {
        component.playerHand = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        component.isEventReceiver = true;
        component.activeLetter = [true, false, false, false, false, false, false];
        const expectedActiveLetter = [false, false, false, false, false, false, true];
        const expectedHand = ['g', 'b', 'c', 'd', 'e', 'f', 'a'];
        window.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: 'ArrowLeft',
            }),
        );
        expect(component.activeLetter).toEqual(expectedActiveLetter);
        expect(component.playerHand).toEqual(expectedHand);
    });

    it('windowListener deselects current letter if key pressed is a letter not in hand', () => {
        component.playerHand = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        component.isEventReceiver = true;
        component.activeLetter = [true, false, false, false, false, false, false];
        const expectedActiveLetter = [false, false, false, false, false, false, false];
        window.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: 'z',
            }),
        );
        expect(component.activeLetter).toEqual(expectedActiveLetter);
    });

    it('letterRemove removes letter from hand', () => {
        const hand: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        const expectedHand: string[] = ['b', 'c', 'd', 'e', 'f', 'g'];
        expect(component.letterRemove(hand, 'a')).toEqual(expectedHand);
    });

    it('letterRemove does nothing if letter is absent from hand', () => {
        const hand: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        const expectedHand: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        expect(component.letterRemove(hand, 'z')).toEqual(expectedHand);
    });

    it('verifySelected resets isContainSelectedCard properly', () => {
        component.currentHand = ['a'];
        component.isContainSelectedCard = false;
        component.verifySelected();
        expect(component.isContainSelectedCard).toEqual(true);
    });

    it('verifySelected resets isContainSelectedCard properly with empty currentHand', () => {
        component.currentHand = [];
        component.isContainSelectedCard = true;
        component.verifySelected();
        expect(component.isContainSelectedCard).toEqual(false);
    });

    it('onRightClick selects a right-clicked letter for exchange', () => {
        component.playerHand = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        component.isClicked = [false, false, false, false, false, false, false];
        component.currentHand = [];
        const expectedIsClicked: boolean[] = [true, false, false, false, false, false, false];
        const expectedCurrentHand: string[] = ['a'];
        mouseEvent = {
            // eslint-disable-next-line @typescript-eslint/no-empty-function -- We need to preventDefault
            preventDefault: () => {},
        } as MouseEvent;
        component.onRightClick(mouseEvent, 'a', 0);
        expect(component.isClicked).toEqual(expectedIsClicked);
        expect(component.currentHand).toEqual(expectedCurrentHand);
    });

    it('onRightClick deselects a right-clicked letter if letter was already selected', () => {
        component.playerHand = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        component.isClicked = [true, false, false, false, false, false, false];
        component.currentHand = ['a'];
        const expectedIsClicked: boolean[] = [false, false, false, false, false, false, false];
        const expectedCurrentHand: string[] = [];
        mouseEvent = {
            // eslint-disable-next-line @typescript-eslint/no-empty-function -- We need to preventDefault
            preventDefault: () => {},
        } as MouseEvent;
        component.onRightClick(mouseEvent, 'a', 0);
        expect(component.isClicked).toEqual(expectedIsClicked);
        expect(component.currentHand).toEqual(expectedCurrentHand);
    });

    it('onRightClick does nothing if a letter is selected for manipulation', () => {
        component.playerHand = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
        component.activeLetter = [false, false, true, false, false, false, false];
        component.isClicked = [false, false, false, false, false, false, false];
        component.currentHand = [];
        const expectedIsClicked: boolean[] = [false, false, false, false, false, false, false];
        const expectedCurrentHand: string[] = [];
        mouseEvent = {
            // eslint-disable-next-line @typescript-eslint/no-empty-function -- We need to preventDefault
            preventDefault: () => {},
        } as MouseEvent;
        component.onRightClick(mouseEvent, 'a', 0);
        expect(component.isClicked).toEqual(expectedIsClicked);
        expect(component.currentHand).toEqual(expectedCurrentHand);
    });

    it('resetManipulation unselects the letter selected for manipulation', () => {
        component.activeLetter = [true, false, false, false, false, false, false];
        const expectedActiveLetter: boolean[] = [false, false, false, false, false, false, false];
        component.resetManipulation();
        expect(component.activeLetter).toEqual(expectedActiveLetter);
    });

    it('resetExchange unselects the letters selected for exchange', () => {
        component.isClicked = [true, false, false, true, false, false, false];
        component.currentHand = ['a', 'b'];
        component.isContainSelectedCard = true;
        const expectedIsClicked: boolean[] = [false, false, false, false, false, false, false];
        const expectedCurrentHand: string[] = [];
        component.resetExchange();
        expect(component.isClicked).toEqual(expectedIsClicked);
        expect(component.currentHand).toEqual(expectedCurrentHand);
        expect(component.isContainSelectedCard).toEqual(false);
    });

    it('exchange exchanges the letters selected for exchange', () => {
        const spyResetExchange = spyOn(component, 'resetExchange').and.callThrough();
        component.currentHand = ['a', 'b'];
        const expectedCurrentHand: string[] = [];
        component.exchange();
        expect(commandServiceSpy.parseCommand).toHaveBeenCalled();
        expect(spyResetExchange).toHaveBeenCalled();
        expect(component.currentHand).toEqual(expectedCurrentHand);
    });
});

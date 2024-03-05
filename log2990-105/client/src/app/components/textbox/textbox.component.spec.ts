import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextboxComponent } from './textbox.component';
import { TextboxService } from '@app/services/textbox.service';
import { Subject } from 'rxjs';
import { Message, MessageType } from '@app/classes/message';

describe('TextboxComponent', () => {
    let component: TextboxComponent;
    let fixture: ComponentFixture<TextboxComponent>;

    let textboxServiceSpy: jasmine.SpyObj<TextboxService>;

    const subject = new Subject<Message>();

    beforeEach(async () => {
        textboxServiceSpy = jasmine.createSpyObj('TextboxService', [], { messages: subject.asObservable() });

        await TestBed.configureTestingModule({
            declarations: [TextboxComponent],
            providers: [{ provide: TextboxService, useValue: textboxServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TextboxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should save messages', () => {
        const expectedSize = 13;
        for (let i = 0; i < expectedSize; i++) {
            subject.next({} as Message);
        }
        expect(component.messages).toHaveSize(expectedSize);
    });

    it('should contain textbox div', () => {
        const root: HTMLElement = fixture.nativeElement;
        const thread = root.querySelector('#thread');

        expect(thread).toBeTruthy();
    });

    it('should display in order', () => {
        const expectedMessages: Message[] = [
            { type: MessageType.System, text: 'like' },
            { type: MessageType.User, text: 'comment' },
            { type: MessageType.Own, text: 'subscribe' },
        ];
        expectedMessages.forEach((message) => subject.next(message));
        fixture.detectChanges();

        const root: HTMLElement = fixture.nativeElement;
        const thread: HTMLElement = root.querySelector('#thread') as HTMLElement;
        const actualMessages: string[] = [];

        Array.from(expectedMessages.keys()).forEach((index) => {
            const element: HTMLDivElement = thread.querySelector(`#message-${index}`) as HTMLDivElement;
            actualMessages.push(element.innerText);
        });

        expect(actualMessages).toEqual(expectedMessages.map((message) => component.getMessage(message)));
    });
});

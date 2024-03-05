/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputbarComponent } from './inputbar.component';
import { CommandService } from '@app/services/command.service';
import { WebsocketService } from '@app/services/websocket.service';
import { TextboxService } from '@app/services/textbox.service';

describe('InputbarComponent', () => {
    const commandInput = '!placer';
    const chatInput = 'wpgg';
    const emptyInput = '';
    let component: InputbarComponent;
    let fixture: ComponentFixture<InputbarComponent>;

    let commandServiceSpy: jasmine.SpyObj<CommandService>;
    let textboxServiceSpy: jasmine.SpyObj<TextboxService>;
    let websocketServiceSpy: jasmine.SpyObj<WebsocketService>;

    beforeEach(async () => {
        commandServiceSpy = jasmine.createSpyObj('WebsocketService', ['parseCommand']);
        textboxServiceSpy = jasmine.createSpyObj('TextboxService', ['displayMessage']);
        websocketServiceSpy = jasmine.createSpyObj('CommandService', ['sendMessage']);

        await TestBed.configureTestingModule({
            declarations: [InputbarComponent],
            providers: [
                { provide: CommandService, useValue: commandServiceSpy },
                { provide: TextboxService, useValue: textboxServiceSpy },
                { provide: WebsocketService, useValue: websocketServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InputbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should check if input is a command when calling isCommand', () => {
        const command = component.isCommand(commandInput);
        const chat = component.isCommand(chatInput);
        expect(command).toEqual(true);
        expect(chat).toEqual(false);
    });

    it('should call displayMessage and parseCommand if message is a command when calling sendMessage', () => {
        component.message = commandInput;
        component.sendMessage();
        expect(textboxServiceSpy.displayMessage).toHaveBeenCalled();
        expect(commandServiceSpy.parseCommand).toHaveBeenCalled();
    });

    it('should do nothing is message is empty or only contains spaces when calling sendMessage', () => {
        component.message = emptyInput;
        component.sendMessage();
        expect(textboxServiceSpy.displayMessage).not.toHaveBeenCalled();
    });

    it('should warn the player who wrote the input that his message contains too many characters when calling sendMessage', () => {
        let bigMessage = '';
        for (let i = 0; i < 600; i++) {
            bigMessage += 'a';
        }
        component.message = bigMessage;
        component.sendMessage();
        expect(textboxServiceSpy.displayMessage).toHaveBeenCalled();
        expect(websocketServiceSpy.sendMessage).not.toHaveBeenCalled();
    });

    it('should send the normal messages to the local textbox and the textbox of the opponent when calling sendMessage', () => {
        component.message = chatInput;
        component.sendMessage();
        expect(textboxServiceSpy.displayMessage).toHaveBeenCalled();
        expect(websocketServiceSpy.sendMessage).toHaveBeenCalled();
    });
});

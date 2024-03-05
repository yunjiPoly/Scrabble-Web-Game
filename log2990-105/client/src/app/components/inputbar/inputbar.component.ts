import { Component } from '@angular/core';
import { MessageType } from '@app/classes/message';
import { CommandService } from '@app/services/command.service';
import { TextboxService } from '@app/services/textbox.service';
import { WebsocketService } from '@app/services/websocket.service';

const MAX_MESSAGE_LENGTH = 512;

@Component({
    selector: 'app-inputbar',
    templateUrl: './inputbar.component.html',
    styleUrls: ['./inputbar.component.scss'],
})
export class InputbarComponent {
    message: string;

    constructor(private textboxService: TextboxService, private commandService: CommandService, private websocket: WebsocketService) {}

    isCommand(input: string): boolean {
        return input[0] === '!';
    }

    sendMessage(): void {
        if (this.message === '') {
            return;
        }
        const message = this.message;
        this.message = '';

        if (message.length > MAX_MESSAGE_LENGTH) {
            this.textboxService.displayMessage(MessageType.System, `Votre message dépasse ${MAX_MESSAGE_LENGTH} caractères`);
            return;
        }
        this.textboxService.displayMessage(MessageType.Own, message);
        if (this.isCommand(message)) {
            this.commandService.parseCommand(message);
        } else {
            this.websocket.sendMessage(message);
        }
    }
}

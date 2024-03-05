import { Component, OnDestroy } from '@angular/core';
import { Message, MessageType } from '@app/classes/message';
import { TextboxService } from '@app/services/textbox.service';
import { Subscription } from 'rxjs';

const MESSAGE_REFRESH_DELAY = 100;

const messageTypeMap = new Map<string, string>([
    [MessageType.System, 'Système :'],
    [MessageType.User, 'Adversaire :'],
    [MessageType.Own, 'Vous :'],
]);

@Component({
    selector: 'app-textbox',
    templateUrl: './textbox.component.html',
    styleUrls: ['./textbox.component.scss'],
})
export class TextboxComponent implements OnDestroy {
    messages: Message[] = [];
    subscription: Subscription;

    constructor(private textboxService: TextboxService) {
        this.subscription = this.textboxService.messages.subscribe((message) => {
            if (message) {
                this.messages.push(message);
                setTimeout(() => {
                    document.getElementById('thread')?.scrollTo(0, document.getElementById('thread')?.scrollHeight ?? 1);
                }, MESSAGE_REFRESH_DELAY);
            }
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    getMessage(message: Message) {
        return `${messageTypeMap.get(message.type)} ${message.text}`;
    }
}

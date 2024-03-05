import { Injectable } from '@angular/core';
import { Message } from '@app/classes/message';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TextboxService {
    private subject = new Subject<Message>();

    displayMessage(type: string, text: string) {
        this.subject.next({ type, text });
    }

    get messages(): Observable<Message> {
        return this.subject.asObservable();
    }
}

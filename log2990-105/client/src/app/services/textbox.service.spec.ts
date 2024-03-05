import { TestBed } from '@angular/core/testing';

import { TextboxService } from './textbox.service';

describe('TextboxService', () => {
    let service: TextboxService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TextboxService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should emit messages', () => {
        let type = '';
        let text = '';
        service.messages.subscribe((message) => {
            type = message.type;
            text = message.text;
        });
        service.displayMessage('test', 'zest');

        expect(type).toEqual('test');
        expect(text).toEqual('zest');
    });
});

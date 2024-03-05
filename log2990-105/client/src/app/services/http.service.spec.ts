import { TestBed } from '@angular/core/testing';

import { HttpService } from './http.service';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '@app/services/alert.service';

describe('HttpService', () => {
    let service: HttpService;

    let alertServiceSpy: jasmine.SpyObj<AlertService>;
    let httpClientSpy: jasmine.SpyObj<HttpClient>;

    beforeEach(() => {
        alertServiceSpy = jasmine.createSpyObj('AlertService', ['showAlert']);
        httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);
        TestBed.configureTestingModule({
            providers: [
                { provide: AlertService, useValue: alertServiceSpy },
                { provide: HttpClient, useValue: httpClientSpy },
            ],
        });
        service = TestBed.inject(HttpService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

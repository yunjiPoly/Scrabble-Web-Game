import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { HomePageComponent } from './home-page.component';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { MatMenuModule } from '@angular/material/menu';
import { HttpService } from '@app/services/http.service';
import { WebsocketService } from '@app/services/websocket.service';
import { Subject } from 'rxjs';

describe('HomePageComponent', () => {
    let component: HomePageComponent;
    let fixture: ComponentFixture<HomePageComponent>;

    const connectionStatus = new Subject<string>();
    const httpServiceSpy = jasmine.createSpyObj('HttpService', ['getDicts']);
    const websocketServiceSpy = jasmine.createSpyObj('WebsocketService', [], { status: connectionStatus.asObservable() });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HomePageComponent],
            imports: [MatMenuModule, RouterTestingModule.withRoutes([{ path: 'admin', component: AdminPageComponent }])],
            providers: [
                { provide: HttpService, useValue: httpServiceSpy },
                { provide: WebsocketService, useValue: websocketServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HomePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

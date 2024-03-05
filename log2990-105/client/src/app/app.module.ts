import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { ChevaletComponent } from './components/chevalet/chevalet.component';
import { EndGameComponent } from './components/end-game/end-game.component';
import { InputbarComponent } from './components/inputbar/inputbar.component';
import { PanneauInfoComponent } from './components/panneau-info/panneau-info.component';
import { TextboxComponent } from './components/textbox/textbox.component';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { NewGameMenuComponent } from './components/new-game-menu/new-game-menu.component';
import { GameBrowserComponent } from './components/game-browser/game-browser.component';
import { GameBrowserDialogComponent } from '@app/components/game-browser-dialog/game-browser-dialog.component';
import { WaitingRoomComponent } from './components/waiting-room/waiting-room.component';
import { WaitingRoomDialogComponent } from './components/waiting-room-dialog/waiting-room-dialog.component';
import { ObjectivesComponent } from './components/objectives/objectives.component';
import { ScoreboardComponent } from './components/scoreboard/scoreboard.component';
import { BasicActionDialogComponent } from './components/basic-action-dialog/basic-action-dialog.component';
import { BotConfigComponent } from './components/bot-config/bot-config.component';
import { BotConfigSelectComponent } from './components/bot-config/bot-config-select.component';
import { BotConfigDialogComponent } from './components/bot-config-dialog/bot-config-dialog.component';
import { DictConfigComponent } from './components/dict-config/dict-config.component';
import { DictConfigDialogComponent } from './components/dict-config-dialog/dict-config-dialog.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        HomePageComponent,
        GamePageComponent,
        AdminPageComponent,
        PlayAreaComponent,
        ChevaletComponent,
        PanneauInfoComponent,
        TextboxComponent,
        InputbarComponent,
        EndGameComponent,
        MainMenuComponent,
        NewGameMenuComponent,
        GameBrowserComponent,
        GameBrowserDialogComponent,
        WaitingRoomComponent,
        WaitingRoomDialogComponent,
        ObjectivesComponent,
        ScoreboardComponent,
        BasicActionDialogComponent,
        BotConfigComponent,
        BotConfigSelectComponent,
        BotConfigDialogComponent,
        DictConfigComponent,
        DictConfigDialogComponent,
    ],
    imports: [AppMaterialModule, AppRoutingModule, BrowserAnimationsModule, BrowserModule, FormsModule, HttpClientModule, ReactiveFormsModule],

    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}

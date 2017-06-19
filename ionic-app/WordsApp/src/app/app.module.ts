// Project imports
import {NgModule, ErrorHandler} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {IonicApp, IonicModule, IonicErrorHandler} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {IonicStorageModule} from '@ionic/storage';
import {HttpModule} from "@angular/http";

// Project imports
import {MyApp} from './app.component';
import {WordsPage} from '../pages/words/words';
import {SettingsPage} from '../pages/settings/settings';
import {HomePage} from '../pages/home/home';
import {TabsPage} from '../pages/tabs/tabs';
import {LoginPage} from "../pages/login/login";
import {LoginManagerService} from "../providers/login-manager.service";
import {WordsManagerService} from "../providers/words-manager.service";
import {SocketManagerService} from "../providers/socket-manager.service";

@NgModule({
declarations: [
MyApp,
    WordsPage,
    SettingsPage,
    HomePage,
    TabsPage,
    LoginPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    HttpModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    WordsPage,
    SettingsPage,
    HomePage,
    TabsPage,
    LoginPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    SocketManagerService,
    WordsManagerService,
    LoginManagerService
  ]
})
export class AppModule {}

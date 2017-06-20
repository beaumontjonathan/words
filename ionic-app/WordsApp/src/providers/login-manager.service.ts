// Module imports
import {Injectable} from "@angular/core";
import {AlertController, Events, LoadingController} from "ionic-angular";

// Project imports
import {SocketManagerService} from "./socket-manager.service";
import {LogoutResponse} from "../../../../words-server/interfaces/Logout";
import {LoginResponse} from "../../../../words-server/interfaces/Login";
import {SettingsManagerService} from "./settings-manager.service";

/**
 * <h1>Login Manager</h1>
 * Managers logging in and out. Communicates between the model of the
 * app and the <code>SocketManagerService</code>
 *
 * @author  Jonathan Beaumont
 * @version 1.3.0
 * @since   2017-06-16
 */
@Injectable()
export class LoginManagerService {
  
  private _loggedIn: boolean; // Whether the user is logged in.
  private logoutAlert;  // Holds the alert for logging out.
  private loginAlert;  // Holds the alert for logging in.
  // Holds the user's login credentials.
  private credentials: {username: string, password: string, valid: boolean};
  private loggingInLoader: any;
  private reconnecting: boolean;
  
  /**
   * Constructor. Initialises the <code>_loggedIn</code> flag, then
   * binds the application-level events to their respective methods.
   * @param socketManager Manages the socket.
   * @param alertCtrl Alerts controller.
   * @param events  Application-level events.
   * @param settingsManager Manages user settings.
   * @param loadingCtrl   Provides loading screens.
   */
  constructor(private socketManager: SocketManagerService, private alertCtrl: AlertController, private events: Events, private settingsManager: SettingsManagerService, private loadingCtrl: LoadingController) {
    this._loggedIn = false;
    this.reconnecting = false;
    this.bindSubscribeEvents();
  }
  
  /**
   * Binds the application-level events to their respective methods.
   */
  private bindSubscribeEvents() {
    this.events.subscribe('LoginManager socket connect', this.handleSocketConnect.bind(this));
    this.events.subscribe('LoginManager socket disconnect', this.handleSocketDisconnect.bind(this));
    this.events.subscribe('LoginManager login response', this.handleSocketLoginResponse.bind(this));
    this.events.subscribe('LoginManager logout response', this.handleSocketLogoutResponse.bind(this));
  }
  
  /**
   * Returns whether logging in is available = whether the socket is
   * connected to the server.
   * @returns {boolean} Whether logging in is available.
   */
  public loginAvailable() {
    return this.socketManager.socketConnected;
  }
  
  /**
   * Getter for whether the user is logged in.
   * @returns {boolean}
   */
  get loggedIn(): boolean {
    return this._loggedIn;
  }
  
  /**
   * Run when the socket is connected to the server. Automatically
   * logs the user in again if they have chosen that functionality in
   * the settings.
   */
  private handleSocketConnect() {
    if (this.settingsManager.loginOnDisconnect && this.credentials && this.credentials.valid) {
      this.reconnecting = true;
      this.dismissLogoutAlert().then(() => {
        this.login();
      });
    }
  }
  
  /**
   * Run when the socket disconnects. Shows an alert if the user was
   * logged in.
   * @param reason The reason for the disconnect.
   */
  private handleSocketDisconnect(reason: string) {
    this.dismissLoginAlert();
    if (this._loggedIn) {
      this._loggedIn = false;
      this.showLogoutAlert();
    }
  }
  
  /**
   * Run when a login response is send from the server. Dismisses the
   * login loading component.
   * @param res Contains the login response data.
   */
  private handleSocketLoginResponse(res: LoginResponse) {
    // If successful login raise logged in flag.
    this.dismissLoggingInLoader().then(() => {
      this.credentials.valid = res.success;
      if (res.success) {
        this.settingsManager.loginCredentials = {username: this.credentials.username, password: this.credentials.password};
        this._loggedIn = true;
        if (this.reconnecting) {
          this.reconnecting = false;
          this.showLoginAlert(res.success);
        }
      }
    });
  }
  
  /**
   * Run when a logout response is sent from the server.
   * @param res Contains the logout response data.
   */
  private handleSocketLogoutResponse(res: LogoutResponse) {
    // If successful logout lower logged in flag.
    if (res.success) {
      this._loggedIn = false;
    }
  }
  
  /**
   * Attempts to login with a username and password.
   * @param username  The username to login with.
   * @param password  The password to login with.
   */
  public login(username?: string, password?: string) {
    this.showLoggingInLoader().then(() => {
      if (username && password) {
        this.credentials = {username: username, password: password, valid: false};
      }
      this.socketManager.loginRequest({username: this.credentials.username, password: this.credentials.password});
    });
  }
  
  /**
   * Attempts to logout.
   */
  public logout() {
    this.socketManager.logoutRequest();
  }
  
  /**
   * Shows a login alert, stating that reconnection to the server has
   * been made and whether the user is now logged in based on the
   * success of the login.
   * @param success Whether the login was successful, default true.
   */
  private showLoginAlert(success: boolean = true): Promise<object> {
    let message;
    if (success) {
      message = 'You were reconnected to the server and logged in!'
    } else {
      message = 'You were reconnected to the server, but were enable to login.'
    }
    this.loginAlert = this.alertCtrl.create({
      title: 'Logged in',
      subTitle: message,
      buttons: ['Dismiss']
    });
    return this.loginAlert.present();
  }
  
  /**
   * Dismisses the login alert.
   */
  private dismissLoginAlert(): Promise<object> {
    if (this.loginAlert)
      return this.loginAlert.dismiss();
    else
      return new Promise((resolve, reject) => {
        resolve();
      })
  }
  
  /**
   * Shows an alert, stating that connection to the server has been
   * lost and that the user was logged out.
   */
  private showLogoutAlert(): Promise<object> {
    this.logoutAlert = this.alertCtrl.create({
      title: 'Socket disconnected!',
      subTitle: 'Cannot connect to server. You were logged out :(',
      buttons: ['Dismiss']
    });
    return this.logoutAlert.present();
  }
  
  /**
   * Dismisses the logout alert.
   */
  private dismissLogoutAlert(): Promise<object> {
    return this.logoutAlert.dismiss();
  }
  
  /**
   * Shows the logging in loader.
   */
  private showLoggingInLoader(): Promise<object> {
    console.log('showing loader...');
    this.loggingInLoader = this.loadingCtrl.create({
      content: "Logging in..."
    });
    return this.loggingInLoader.present();
  }
  
  /**
   * Dismisses the logging in loader.
   */
  private dismissLoggingInLoader(): Promise<object> {
    return this.loggingInLoader.dismiss();
  }
}

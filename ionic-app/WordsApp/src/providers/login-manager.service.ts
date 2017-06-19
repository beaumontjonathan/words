// Module imports
import {Injectable} from "@angular/core";
import {AlertController, Events} from "ionic-angular";

// Project imports
import {SocketManagerService} from "./socket-manager.service";
import {LogoutResponse} from "../../../../words-server/interfaces/Logout";
import {LoginResponse} from "../../../../words-server/interfaces/Login";

/**
 * <h1>Login Manager</h1>
 * Managers logging in and out. Communicates between the model of the
 * app and the <code>SocketManagerService</code>
 *
 * @author  Jonathan Beaumont
 * @version 1.1.0
 * @since   2017-06-16
 */
@Injectable()
export class LoginManagerService {
  
  private _loggedIn: boolean; // Whether the user is logged in.
  private logoutAlert;  // Holds the alert for logging out.
  
  /**
   * Constructor. Initialises the <code>_loggedIn</code> flag, then
   * binds the application-level events to their respective methods.
   * @param socketManager Manages the socket.
   * @param alertCtrl Alerts controller.
   * @param events  Application-level events.
   */
  constructor(private socketManager: SocketManagerService, private alertCtrl: AlertController, private events: Events) {
    this._loggedIn = false;
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
   * @returns {boolean} Whether loggin in is available.
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
   * Run when the socket is connected to the server. May be used
   * later to automatically log the user in if the socket disconnects
   * the reconnects.
   */
  private handleSocketConnect() {
  
  }
  
  /**
   * Run when the socket disconnects. Shows an alert if the user was
   * logged in.
   * @param reason The reason for the disconnect.
   */
  private handleSocketDisconnect(reason: string) {
    if (this._loggedIn) {
      this._loggedIn = false;
      this.showLogoutAlert();
    }
  }
  
  /**
   * Run when a login response is send from the server.
   * @param res Contains the login response data.
   */
  private handleSocketLoginResponse(res: LoginResponse) {
    // If successful login raise logged in flag.
    if (res.success) {
      this._loggedIn = true;
    }
  }
  
  /**
   *  Run when a logout response is sent from the server.
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
  public login(username: string, password: string) {
    this.socketManager.loginRequest({username: username, password: password});
  }
  
  /**
   * Attempts to logout.
   */
  public logout() {
    this.socketManager.logoutRequest();
  }
  
  /**
   * Shows an alert, stating that connection to the server has been
   * lost and that the user was logged out.
   */
  private showLogoutAlert() {
    this.logoutAlert = this.alertCtrl.create({
      title: 'Socket disconnected!',
      subTitle: 'Cannot connect to server. You were logged out :(',
      buttons: ['Dismiss']
    });
    this.logoutAlert.present();
  }
}

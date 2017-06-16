// Module imports
import {Injectable} from "@angular/core";
import {AlertController, Events, NavController} from "ionic-angular";

// Project imports
import {SocketManagerService} from "./socket-manager.service";
import {LoginPage} from "../pages/login/login";
import {LogoutResponse} from "../../../../words-server/interfaces/Logout";
import {LoginResponse} from "../../../../words-server/interfaces/Login";

/**
 * <h1>Login Manager</h1>
 * Managers logging in and out. Communicates between the model of the
 * app and the <code>SocketManagerService</code>
 *
 * @author  Jonathan Beaumont
 * @version 1.0.1
 * @since   2017-06-16
 */
@Injectable()
export class LoginManager {
  
  // If the login screen is being displayed for the first time.
  private _initialScreen: boolean = true;
  private _loggedIn: boolean; // Whether the user is logged in.
  // Holds the first, highest up nav controller.
  private nav: NavController;
  
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
    this.events.subscribe('socket connect', this.handleSocketConnect.bind(this));
    this.events.subscribe('socket disconnect', this.handleSocketDisconnect.bind(this));
    this.events.subscribe('socket login response', this.handleSocketLoginResponse.bind(this));
    this.events.subscribe('socket logout response', this.handleSocketLogoutResponse.bind(this));
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
   * Getter for whether the login screen has been displayed more than once.
   * @returns {boolean}
   */
  get initialScreen(): boolean {
    return this._initialScreen;
  }
  
  /**
   * Run when the socket is connected to the server. May be used
   * later to automatically log the user in if the socket disconnects
   * the reconnects.
   */
  private handleSocketConnect() {
    console.log('connected from login manager');
  }
  
  /**
   * Run when the socket disconnects. Shows an alert if the user was
   * logged in.
   * @param reason The reason for the disconnect.
   */
  private handleSocketDisconnect(reason: string) {
    if (this._loggedIn) {
      this._loggedIn = false;
      let alert = this.alertCtrl.create({
        title: 'Socket disconnected!',
        subTitle: 'Cannot connect to server. You were logged out :(',
        buttons: ['OK']
      });
      alert.present();
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
  public login(username?: string, password?: string) {
    this.socketManager.loginRequest({username: username, password: password});
  }
  
  /**
   * Attempts to logout.
   */
  public logout() {
    this.socketManager.logoutRequest();
  }
  
  /**
   * Sets up the navigation controller. *Hacky* way to access the top
   * level navigation controller.
   * @param nav The navigation controller.
   */
  public addNav(nav: NavController) {
    this.nav = nav;
  }
  
  /**
   * Navigates the user to the login page.
   */
  public navToLogin() {
    this._initialScreen = false;
    this.nav.push(LoginPage, {}, {animate: true, direction: 'forward'});
  }
}

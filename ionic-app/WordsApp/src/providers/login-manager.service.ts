// Module imports
import {Injectable} from "@angular/core";
import {AlertController, NavController} from "ionic-angular";
import {Observable} from "rxjs/Observable";

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
 * @version 1.0.0
 * @since   2017-06-16
 */
@Injectable()
export class LoginManager {
  
  // If the login screen is being displayed for the first time.
  private _initialScreen: boolean = true;
  public loginPageService: any;
  private loginPageObserver: any;
  private _loggedIn: boolean; // Whether the user is logged in.
  // Holds the first, highest up nav controller.
  private nav: NavController;
  
  /**
   * Constructor.
   * @param socketManager Manages the socket.
   * @param alertCtrl Alerts controller.
   */
  constructor(private socketManager: SocketManagerService, private alertCtrl: AlertController) {
    this._loggedIn = false;
  
    /* Creates an observer and service to send messages to the login
     * page.
     */
    this.loginPageService = Observable.create(observer => {
      this.loginPageObserver = observer;
    });
  
    // Binds the login service event types to their methods.
    this.socketManager.socketLoginService.subscribe(
      this.onSocketLoginServiceEvent.bind(this),
      this.onSocketLoginServiceError.bind(this),
      this.onSocketLoginServiceEnd.bind(this)
    )
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
   * Run when an event is send by the socket login service. Passes
   * the data to a method to process the event.
   * @param data  Data from the event.
   */
  private onSocketLoginServiceEvent(data) {
    this.processSocketServiceEvent(data);
  }
  
  /**
   * Run when an error occurs from the socket login service. Logs the
   * error to the console. Unknown when this will ever be run.
   * @param error Error from the login service.
   */
  private onSocketLoginServiceError(error) {
    console.log('Socket login servie error: ' + error);
  }
  
  /**
   * Run when the socket login service is finished. Unknown when this
   * should ever be run.
   */
  private onSocketLoginServiceEnd() {
    console.log('Socket login service finished!');
  }
  
  /**
   * Processes a socket service event.
   * @param data
   */
  private processSocketServiceEvent(data) {
    
    /* If the data from the event is an object and contains a string
     * event description.
     */
    if (typeof data === 'object' && typeof data.event === 'string') {
      
      // Runs different handler methods based on the type of event.
      switch (data.event) {
        case 'connect':
          this.handleSocketConnect();
          break;
        case 'disconnect':
          this.handleSocketDisconnect(data.reason);
          break;
        case 'login response':
          this.handleSocketLoginResponse(data.res);
          break;
        case 'logout response':
          this.handleSocketLogoutResponse(data.res);
          break;
      }
    }
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
    // Notify login page about login response.
    this.loginPageObserver.next({event: 'login response', res: res});
    
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

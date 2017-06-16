// Module imports
import {Component} from "@angular/core";
import {AlertController, LoadingController, NavController} from "ionic-angular";

// Project imports
import {TabsPage} from "../tabs/tabs";
import {LoginManager} from "../../providers/login-manager.service";
import {LoginResponse} from "../../../../../words-server/interfaces/Login";

/**
 * <h1>Login Page</h1>
 * Provides an interface and methods for allowing a user to login or
 * just return to the app.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.0
 * @since   2017-06-16
 */
@Component({
  templateUrl: 'login.html'
})
export class LoginPage {
  
  private username: string = '';  // The username input text.
  private password: string = '';  // The password input text.
  private loggingInLoader: any; // Login loading screen.
  private loginErrorMessage: string;  // Holds a login error message.
  
  /**
   * Constructor. Subscribes to the <code>LoginManager</code> service
   * <code>loginPageService</code> and binds the events to the
   * respective login service handling methods.
   * @param navCtrl Controls navigation to other pages.
   * @param loginManager  Manages logging in and out.
   * @param alertCtrl Alerts controller.
   * @param loadingCtrl Loading controller.
   */
  constructor(public navCtrl: NavController, private loginManager: LoginManager, private alertCtrl: AlertController, private loadingCtrl:LoadingController) {
    
    /* Allows the <code>LoginManager</code> to access the top
     * navigation controller.
     */
    loginManager.addNav(navCtrl);
    
    this.loginManager.loginPageService.subscribe(
      this.onLoginServiceEvent.bind(this),
      this.onLoginServiceError.bind(this),
      this.onLoginServiceEnd.bind(this)
    );
  }
  
  /**
   * Handles an event from the login service.
   * @param data  Contains the event data.
   */
  private onLoginServiceEvent(data) {
    this.processLoginServiceEvent(data);
  }
  
  /**
   * Handles an error from the login service.
   * @param error Contains the error data.
   */
  private onLoginServiceError(error) {
    console.log('Error from login service:');
    console.log(error);
  }
  
  /**
   * Handles the end of the login service.
   */
  private onLoginServiceEnd() {
    console.log('Login service subscription finished...?');
  }
  
  /**
   * Processes a login service event by switching on the name of the
   * event.
   * @param data Contains the event data.
   */
  private processLoginServiceEvent(data) {
    // Switches on the event name if one exists.
    if (typeof data === 'object' && typeof data.event === 'string') {
      switch(data.event) {
        // If the event if a login response.
        case 'login response':
          this.handleLoginResponse(data.res);
          break;
      }
    }
  }
  
  /**
   * Handles a login response. Either displays an error explaining
   * why the login request was unsuccessful, or if the login was
   * successful, then redirects to the main app.
   * @param res Contains the login response data.
   */
  private handleLoginResponse(res: LoginResponse) {
    
    // Dismiss the login loading screen.
    this.dismissLoggingInLoader().then(() => {
      
      // If the login was a success, then redirect to the main app.
      if (res.success) {
        this.toMainPage();
      } else {
        // Login was unsuccessful.
        
        // Decides on a login error message.
        let error: string = 'Unknown login error.';
        if (res.alreadyLoggedIn) {
          error = 'Login unsuccessful. You are already logged in.';
        } else if (res.invalidUsername) {
          error = 'Login unsuccessful. Username invalid.';
        } else if (res.invalidPassword) {
          error = 'Login unsuccessful. Password invalid.';
        } else if (res.incorrectUsername) {
          error = 'Login unsuccessful. Username incorrect.';
        } else if (res.incorrectPassword) {
          error = 'Login unsuccessful. Password incorrect.';
        }
        
        /* Logs the error message to the console and displays it on
         * the page.
         */
        console.log(error);
        this.loginErrorMessage = error;
      }
    });
  }
  
  /**
   * Redirects to the main app.
   */
  private toMainPage() {
    /* If it is the initial app load, then push the tabs page onto
     * the navigation stack.
     */
    if (this.loginManager.initialScreen)
      this.navCtrl.push(TabsPage, {}, {animate: true, direction: 'backward'});
    /* If it is not the initial app load, then pop off the login page
     * from the navigation stack.
     */
    else
      this.navCtrl.pop();
  }
  
  /**
   * Shows the logging in loader.
   */
  private showLoggingInLoader(): Promise<object> {
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
  
  /**
   * Attempts to login using the username and password values from
   * the input boxes.
   */
  private doLogin() {
    
    if (!this.loginManager.loginAvailable()) {
      /* If logging in is not available, then show an error stating
       * that that app cannot connect to the server.
       */
      let alert = this.alertCtrl.create({
        title: 'Login Error',
        subTitle: 'Cannot connect to server.',
        buttons: ['OK']
      });
      alert.present();
      
    } else if (this.username === '' || this.password === '') {
      /* If then username of password are empty, then display an
       * alert stating that both fields are required.
       */
      let alert = this.alertCtrl.create({
        title: 'Login Error',
        subTitle: 'All fields are required.',
        buttons: ['OK']
      });
      alert.present();
    
    } else {
      /* Attempt to login. Shows the loggin in loader and attempts a
       * login.
       */
      this.showLoggingInLoader();
      this.loginManager.login(this.username, this.password);
    }
  }
  
  /**
   * Handler for the skip login button. Takes the user to the main
   * app without logging in.
   */
  private doSkipLogin() {
    this.toMainPage();
  }
}

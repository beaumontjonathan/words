// Module imports
import {Component, OnDestroy} from "@angular/core";
import {App, Events, LoadingController, NavController} from "ionic-angular";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

// Project imports
import {TabsPage} from "../tabs/tabs";
import {LoginResponse} from "../../../../../words-server/interfaces/Login";
import {LoginManagerService} from "../../providers/login-manager.service";

/**
 * <h1>Login Page</h1>
 * Provides an interface and methods for allowing a uer to login or,
 * if loading the app for the first time, to redirect to the main app
 * page.
 *
 * @author  Jonathan Beaumont
 * @version 1.1.0
 * @since   2017-06-16
 */
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage implements OnDestroy {
  
  private loginErrorMessage: string;
  private loginForm: FormGroup;
  private loggingInLoader: any;
  
  /**
   * Constructor.
   * @param formBuilder   Allows advanced forms to be built.
   * @param app           Angular main app.
   * @param events        Allows communication between components.
   * @param loadingCtrl   Provides loading screens.
   * @param loginManager  Manages logging in and out.
   * @param navCtrl       Controls navigation to other pages.
   */
  constructor(
    formBuilder: FormBuilder,
    private app: App, private events: Events, private loadingCtrl: LoadingController,
    private loginManager: LoginManagerService, private navCtrl: NavController
  ) {
    
    this.loginForm = formBuilder.group({
      username: ['', Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z]{1}[a-zA-Z0-9_]{4,31}$')])],
      password: ['', Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z 0-9 !"£$%^&*()]{5,31}$')])]
    });
    
    this.events.subscribe('LoginPage login response', this.handleLoginResponse.bind(this));
  }
  
  /**
   * Attempts a login with the username and password provided by the
   * respective input boxes, if they are in valid formats.
   */
  private doLogin() {
    if (this.loginForm.valid) {
      this.showLoggingInLoader();
      this.loginManager.login(this.loginForm.value.username, this.loginForm.value.password);
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
        this.doLeavePage();
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
   * Redirects to the main page. If this is the root page, i.e. the
   * app has just opened and the main page is this login page, then
   * then root is changed to the tabs page. Otherwise, pop off this
   * login page to go back to the settings page.
   */
  private doLeavePage() {
    if (this.navCtrl.canGoBack()) {
      this.navCtrl.pop();
    } else {
      this.app.getRootNav().setRoot(TabsPage, {}, {animate: true, direction: 'back'});
    }
  }
  
  /**
   * Shows the logging in loader.
   */
  private showLoggingInLoader(): Promise<object> {
    console.log('show logging in loader');
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
   * Runs when the object is destroyed. Unsubscribes the login
   * response event, to stop listening for it.
   */
  ngOnDestroy() {
    this.events.unsubscribe('LoginPage login response');
  }
  
}

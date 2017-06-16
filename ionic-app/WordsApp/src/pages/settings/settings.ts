// Module imports
import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';

// Project imports
import {LoginManager} from "../../providers/login-manager.service";

/**
 * <h1>Settings Page</h1>
 * Contains data and methods used on the settings page. The settings
 * page allows users to login and logout.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.0
 * @since   2017-06-14
 */
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  
  /**
   * Constructor.
   * @param navCtrl Controls navigation to other pages.
   * @param loginManager  Manages logging in and out.
   */
  constructor(public navCtrl: NavController, private loginManager: LoginManager) {
  
  }
  
  /**
   * Logouts out the user.
   */
  private logout() {
    this.loginManager.logout();
  }
  
  /**
   * Takes the user to the login page.
   */
  private login() {
    this.loginManager.navToLogin();
  }
  
}

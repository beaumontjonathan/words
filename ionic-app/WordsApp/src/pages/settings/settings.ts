// Module imports
import {App, NavController} from 'ionic-angular';
import {Component} from '@angular/core';

// Project imports
import {LoginPage} from "../login/login";
import {LoginManagerService} from "../../providers/login-manager.service";
import {SettingsManagerService} from "../../providers/settings-manager.service";

/**
 * <h1>Settings Page</h1>
 * Contains data and methods used on the settings page. The settings
 * page allows users to login and logout.
 *
 * @author  Jonathan Beaumont
 * @version 1.2.0
 * @since   2017-06-14
 */
@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})
export class SettingsPage {
  
  /**
   * Constructor.
   * @param app
   * @param navCtrl Controls navigation to other pages.
   * @param loginManager  Manages logging in and out.
   */
  constructor(private app: App, public navCtrl: NavController, private loginManager: LoginManagerService, private settingsManager: SettingsManagerService) {
  }
  
  /**
   * Logs the user out.
   */
  private logout() {
    this.loginManager.logout();
  }
  
  /**
   * Takes the user to the login page.
   */
  private login() {
    this.app.getRootNav().push(LoginPage);
  }
  
}

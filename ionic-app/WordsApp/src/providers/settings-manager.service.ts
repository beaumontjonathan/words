// Module imports
import {Injectable} from "@angular/core";
import {Storage} from "@ionic/storage";
import {Events} from "ionic-angular";

/**
 * <h1>Settings Manager Service</h1>
 * Manages setting options. Allows persistent setting changes by
 * storing settings locally.
 *
 * @author  Jonathan Beaumont
 * @version 1.2.0
 * @since   2017-06-16
 */
@Injectable()
export class SettingsManagerService {
  
  // Contains the settings data.
  private settings: {
    loginOnDisconnect: {active: boolean},
    loginOnStart: {active: boolean, credentials?: {username: string, password: string}},
    syncNewWords: {active: boolean}
  };
  
  /**
   * Constructor.
   * @param storage Access to native browser storage.
   * @param events
   */
  constructor(private storage: Storage, private events: Events) {
    // Initialises the settings, then loads the saved ones from storage.
    this.settings = {loginOnDisconnect: {active: false}, loginOnStart: {active: false}, syncNewWords: {active: false}};
    this.retrieveStoredSettings();
  }
  
  /**
   * Attempts to get the settings from native storage. If not
   * settings have been stored, then the default settings are saved
   * to storage, otherwise the settings from storage are used.
   */
  private retrieveStoredSettings() {
    this.storage.get('settings')
      .then(val => {
        if (val) {
          this.settings = val;
          if (val.loginOnStart.active && this.settings.loginOnStart.credentials && this.settings.loginOnStart.credentials.username && this.settings.loginOnStart.credentials.password) {
            this.events.publish('loginOnStart', {username: this.settings.loginOnStart.credentials.username, password: this.settings.loginOnStart.credentials.password});
          }
        } else {
          this.updateStoredSettings()
            .then(() => {
            
            });
        }
      });
  }
  
  /**
   * Updates the settings saved in storage by the settings saved in
   * memory.
   */
  private updateStoredSettings(): Promise<object> {
    return this.storage.set('settings', this.settings);
  }
  
  /**
   * Gets whether the <code>loginOnDisconnect</code> setting has been
   * set by the user.
   * @returns {boolean} Whether the settings is enabled.
   */
  get loginOnDisconnect() {
    return this.settings.loginOnDisconnect.active;
  }
  
  /**
   * Updates the <code>loginOnDisconnect</code> setting in memory and
   * local storage.
   * @param bool  The new value for the setting.
   */
  set loginOnDisconnect(bool: boolean) {
    if (this.loginOnDisconnect !== bool) {
      this.settings.loginOnDisconnect.active = bool;
      this.updateStoredSettings();
    }
  }
  
  /**
   * Gets whether the <code>loginOnStart</coe> setting has been set
   * by the user.
   * @returns {boolean} Whether the settings is enabled.
   */
  get loginOnStart() {
    return this.settings.loginOnStart.active;
  }
  
  /**
   * Updates the <code>loginOnStart</code> setting in memory and
   * local storage.
   * @param bool  The new value for the setting.
   */
  set loginOnStart(bool: boolean) {
    if (this.loginOnStart !== bool) {
      this.settings.loginOnStart.active = bool;
      this.updateStoredSettings();
    }
  }
  
  /**
   * Updates the login credentials for the <code>loginOnStart</code>
   * setting in memory and local storage.
   * @param credentials The updated login credentials.
   */
  set loginCredentials(credentials: {username: string, password: string}) {
    this.settings.loginOnStart.credentials = credentials;
    this.updateStoredSettings();
  }
  
  /**
   * Gets whether the <code>syncNewWords</code> setting has been set
   * by the user.
   * @returns {boolean}
   */
  get syncNewWords() {
    return this.settings.syncNewWords.active;
  }
  
  /**
   * Updates the <code>syncNewWords</code> setting in memory and
   * local storage, and if the setting is set to true, then tells
   * the <code>WordsManager</code> to sync the words.
   * @param bool
   */
  set syncNewWords(bool: boolean) {
    console.log('Settings manager: set syncNewWords');
    if (this.syncNewWords !== bool) {
      this.settings.syncNewWords.active = bool;
      this.updateStoredSettings().then(() => {
        if (bool) {
          console.log('bool true, so publishing login response for WordsManager');
          this.events.publish('WordsManager sync new words');
        }
      });
    }
  }
  
}

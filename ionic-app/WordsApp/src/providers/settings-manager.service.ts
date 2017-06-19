// Module imports
import {Injectable} from "@angular/core";
import {Storage} from "@ionic/storage";

/**
 * <h1>Settings Manager Service</h1>
 * Manages setting options. Allows persistent setting changes by
 * storing settings locally.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.0
 * @since   2017-06-16
 */
@Injectable()
export class SettingsManagerService {
  
  public settings: {loginOnDisconnect: {active: boolean}};
  
  /**
   * Constructor.
   * @param storage Access to native browser storage.
   */
  constructor(private storage: Storage) {
    this.settings = {loginOnDisconnect: {active: false}};
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
        } else {
          this.updateStoredSettings();
        }
      });
  }
  
  /**
   * Updates the settings saved in storage by the settings saved in
   * memory.
   */
  private updateStoredSettings() {
    this.storage.set('settings', this.settings);
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
   * @param bool
   */
  set loginOnDisconnect(bool: boolean) {
    if (this.loginOnDisconnect !== bool) {
      this.settings.loginOnDisconnect.active = bool;
      this.updateStoredSettings();
    }
  }
  
}

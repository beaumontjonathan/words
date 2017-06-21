// Module imports
import {Injectable} from "@angular/core";
import {Storage} from "@ionic/storage";

// Project imports
import {Word} from "../../../../words-server/interfaces/Word";
import {SocketManagerService} from "./socket-manager.service";
import {Events} from "ionic-angular";
import {AddWordResponse} from "../../../../words-server/interfaces/AddWord";
import {SettingsManagerService} from "./settings-manager.service";
import {LoginManagerService} from "./login-manager.service";

/**
 * <h1>Words Manager</h1>
 * Managers the list of words stored on the device.
 *
 * @author  Jonathan Beaumont
 * @version 1.2.0
 * @since   2017-06-15
 */
@Injectable()
export class WordsManagerService {
  
  public allWords: Word[];  // Hold the list of words.
  // Holds the list of unsynced added words.
  private unsyncedWords: string[];
  
  /**
   * Constructor. Sets up the word lists for all words and unsynced words.
   * @param storage Access to native browser storage.
   * @param socketManager Manages the socket.
   * @param events  Application-level events.
   * @param settingsManager Manages user settings.Ye
   * @param loginManager  Manages logging in and out.
   */
  constructor(private storage: Storage, private socketManager: SocketManagerService, private events: Events, private settingsManager: SettingsManagerService, private loginManager: LoginManagerService) {
    this.retrieveStoredUnsyncedWords();
    this.setWordsList();
    
    // Bind methods to application-level events.
    this.events.subscribe('WordsManager addWord response', this.handleAddWordResponseEvent.bind(this));
    this.events.subscribe('WordsManager sync new words', this.handleSyncNewWordsEvent.bind(this));
  }
  
  /**
   * Handles the response from the server once an add word attempt
   * has been made by a user logged in with the same username.
   * @param res
   */
  private handleAddWordResponseEvent(res: AddWordResponse) {
    
    // Removes from, if it exists in, the list of unsynced words.
    this.removeUnsyncedWord(res.word);
    
    if (res.success) {
      // The add word was a success.
      if (this.settingsManager.syncNewWords) {
        /* The sync new words setting is enabled, so add the new word
         * to the list of words.
         */
        this.addWordToList(res.word);
        console.log('WordsManager: Word "%s" added successfully.', res.word);
      } else {
        console.log('WordsManager: not syncing, so won\'t add to the list.');
      }
    } else if (!res.isLoggedIn) {
      console.log('You must login before you can attempt to add a word.')
    } else if (res.wordAlreadyAdded) {
      console.log('Word already added.');
    } else {
      console.log('Error, word not added.');
    }
  }
  
  /**
   * Synchronizes the new words list with the server if the sync new
   * user setting is enabled and the user is logged in.
   */
  private handleSyncNewWordsEvent() {
    if (this.settingsManager.syncNewWords && this.loginManager.loggedIn) {
      this.addUnsyncedNewWords()
    }
  }
  
  /**
   * Sends an add word request for each of the unsynced new words.
   */
  private addUnsyncedNewWords() {
    this.unsyncedWords.forEach((word: string) => {
      this.socketManager.addWordRequest({word: word});
    });
  }
  
  /**
   * Instantiates the <code>allWords</code> <code>Word</code> array
   * as an empty array.
   */
  private setWordsList(): void {
    this.allWords = [];
    this.storage.get('words')
      .then(val => {
      console.log(val);
      if (val) {
        //this.allWords = val;
        for (let i = 0, numWords = val.length; i < numWords; i++) {
          this.allWords.push(val[i]);
          if (i === numWords - 1) {
            this.allWords.sort(this.sortWords('word'));
          }
        }
      } else {
      }
    }, error => {
      console.log('Error! ' + error);
      this.allWords = [];
    });
  }
  
  /**
   * Handles a request to add a new word from the home page. Adds the
   * word to the list of unsynced words. Then either sends an add
   * word request to the server, or adds the word to the list of
   * words, depending on whether the user is logged in and has
   * the <code>syncNewWords</code> setting enabled.
   *
   * Adds a new word to the list of words if the list does not
   * already contain the word, then sorts the list alphabetically.
   * @param word  The word to add.
   */
  public addWord(word: string): void {
    this.addUnsyncedWord(word);
    if (this.loginManager.loggedIn && this.settingsManager.syncNewWords) {
      this.socketManager.addWordRequest({word: word});
    } else {
      this.addWordToList(word);
    }
  }
  
  /**
   * Adds a new word to the list of words if the list does not
   * already contain the word, then sorts the list alphabetically.
   * @param word  The word to add.
   * @param id    The id of the word to add, defaults to null.
   */
  private addWordToList(word: string, id: number = null) {
    if (this.allWords.find(x => x.word === word)) {
    } else {
      this.allWords.push({id: id, word: word});
      this.allWords.sort(this.sortWords('word', 'id'));
      this.updateStorageWords();
    }
  }
  
  /**
   * Removes a word from the list of words if the list already
   * contains the word.
   * @param word  The word to add.
   * @returns {boolean} Whether the word was found and removed.
   */
  public removeWord(word: Word): boolean {
    let index: number = this.allWords.indexOf(word);
    if (index >= 0) {
      this.allWords.splice(index, 1);
      this.updateStorageWords();
      return true;
    }
    return false;
  }
  
  /**
   * Updates the list of words stored locally to match the list
   * stored in memory.
   */
  private updateStorageWords() {
    this.storage.set('words', this.allWords);
  }
  
  /**
   * Used to sort an array of objects by their properties.
   * <p>
   * Usage: 'myArray.sort(this.sortWords('prop1', 'prop2'));'
   * <p>
   * Found at: https://stackoverflow.com/a/4760279
   * @param props An array of properties of the object, sorted in the
   *              order they appear in the list.
   * @returns {(obj1:any, obj2:any)=>number}  The sort function.
   */
  private sortWords(...props: string[]) {
    function dynamicSort(property: string) {
      let sortOrder = 1;
      if (property[0] === '-') {
        sortOrder = -1;
        property = property.substr(1);
      }
      return (a, b) => {
        let result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
      }
    }
    return function (obj1, obj2) {
      let i = 0, result = 0, numberOfProperties = props.length;
      while (result === 0 && i < numberOfProperties) {
        result = dynamicSort(props[i])(obj1, obj2);
        i++;
      }
      return result;
    }
  }
  
  /**
   * Adds a word to the list of unsynced new words if it does not
   * already exist in the list.
   * @param word  The word to add to the list.
   * @returns {boolean} Whether the word was added.
   */
  public addUnsyncedWord(word: string): boolean {
    let index = this.unsyncedWords.indexOf(word);
    if (index === -1) {
      this.unsyncedWords.push(word);
      this.updateStoredUnsyncedWords();
      return true;
    }
    return false;
  }
  
  /**
   * Removes a word from the list of unsynced new word if it exists
   * in the list.
   * @param word  The word to remove from the list.
   * @returns {boolean} Whether the word was removed.
   */
  public removeUnsyncedWord(word: string): boolean {
    let index = this.unsyncedWords.indexOf(word);
    if (index >= 0) {
      this.unsyncedWords.splice(index, 1);
      this.updateStoredUnsyncedWords();
      return true;
    }
    return false;
  }
  
  /**
   * Updates the locally stored list of unsynced words.
   */
  private updateStoredUnsyncedWords() {
    this.storage.set('unsyncedWords', this.unsyncedWords);
  }
  
  /**
   * Retrieves the locally stored list of unsynced words into the
   * <code>unsyncedWords</code> array.
   */
  private retrieveStoredUnsyncedWords() {
    this.storage.get('unsyncedWords')
      .then((unsyncedWords: string[]) => {
        if (unsyncedWords) {
          console.log(unsyncedWords);
          this.unsyncedWords = unsyncedWords;
        } else {
          this.unsyncedWords = [];
        }
      }, () => {
        // error getting words
        this.unsyncedWords = [];
      });
  }
}

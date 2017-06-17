// Module imports
import {Component} from '@angular/core';
import {AlertController, NavController} from 'ionic-angular';

// Project imports
import {WordsManagerService} from "../../providers/words-manager.service";
import {Word} from "../../../../../words-server/interfaces/Word";

/**
 * <h1>Words Page</h1>
 * Contains data and methods used on the words page. The words page
 * shows a list of all words currently held locally on the device in
 * the <code>WordsManagerService</code>.
 *
 * @author  Jonathan Beaumont
 * @version 1.1
 * @since   2017-06-14
 */
@Component({
  selector: 'page-words',
  templateUrl: 'words.html'
})
export class WordsPage {

  private words: Word[];  // Holds the current list of words.
  
  /**
   * Constructor. Instantiates the <code>words</code> array.
   * @param navCtrl Controls navigation to other pages.
   * @param wordsManager  Holds and manipulates the list of words.
   */
  constructor(public navCtrl: NavController, private wordsManager: WordsManagerService, private alertCtrl: AlertController) {
    this.words = wordsManager.allWords;
  }
  
  /**
   * Removes a word from the list of words.
   * @param word  The word to be removed.
   */
  public removeWord(word: Word) {
    let confirm = this.alertCtrl.create({
      title: 'Delete',
      message: 'Are you sure you want to delete \'' + word.word + '\'?',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            // Cancel
          }
        },
        {
          text: 'Delete',
          handler: () => {
            this.wordsManager.removeWord(word);
          }
        }
      ]
    });
    confirm.present()
      .then(data => {
        // word deleted.
      })
      .catch(err => {
        // error from confirm promise.
      })
  }

}

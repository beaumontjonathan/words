import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {WordsManagerService} from "../../providers/words-manager.service";
import {Word} from "../../../../../words-server/interfaces/Word";

/**
 * <h1>Words Page</h1>
 * Contains data and methods used on the words page. The words page
 * shows a list of all words currently held locally on the device in
 * the <code>WordsManagerService</code>.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.1
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
  constructor(public navCtrl: NavController, private wordsManager: WordsManagerService) {
    this.words = wordsManager.allWords;
  }

}

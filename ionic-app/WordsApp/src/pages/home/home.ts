import {Component, ViewChild} from '@angular/core';
import { NavController } from 'ionic-angular';
import {WordsManagerService} from "../../providers/words-manager.service";

/**
 * <h1>Home Page</h1>
 * Contains data and methods used on the home page. The home page
 * allows users to add new words to the list of words.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.1
 * @since   2017-06-14
 */
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  
  @ViewChild('wordInput')wordInput; // The word text input.
  
  /**
   * Constructor.
   * @param navCtrl Controls navigation to other pages.
   * @param wordsManager  Holds and manipulates the list of words.
   */
  constructor(public navCtrl: NavController, private wordsManager: WordsManagerService) {
  
  }
  
  /**
   * Adds a new word to the list of words.
   */
  public addWord(): void {
    let inputWord = (this.wordInput || '').trim();
    this.wordInput = '';
    if (this.isValidWord(inputWord)) {
      console.log('Valid!');
      this.wordsManager.addWord(inputWord, console.log);
    } else {
      console.log('Invalid... :(');
    }
  }
  
  /**
   * Checks whether the word is in a valid format.
   * <p>
   * A valid format required the word to be between 1 and 31
   * characters long, containing only letters and dashes.
   * @param word  The word to check.
   * @returns {boolean} Whether the word is in a valid format.
   */
  private isValidWord(word: string): boolean {
    if (typeof word === 'string' && word != '') {
      let patt = new RegExp('^[a-zA-Z-]{1,31}$');
      return patt.test(word);
    }
    return false;
  }

}

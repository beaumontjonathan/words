// Module imports
import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

// Project imports
import {WordsManagerService} from "../../providers/words-manager.service";

/**
 * <h1>Home Page</h1>
 * Contains data and methods used on the home page. The home page
 * allows users to add new words to the list of words.
 *
 * @author  Jonathan Beaumont
 * @version 1.1.1
 * @since   2017-06-14
 */
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  
  private addWordForm: FormGroup;
  private addWordChange: boolean;
  
  /**
   * Constructor.
   * @param navCtrl Controls navigation to other pages.`
   * @param wordsManager  Holds and manipulates the list of words.
   * @param formBuilder Allows advanced forms to be built.
   */
  constructor(public navCtrl: NavController, private wordsManager: WordsManagerService, private formBuilder: FormBuilder) {
    this.addWordChange = false;
    this.addWordForm = formBuilder.group({
      word: ['', Validators.compose([Validators.required, Validators.pattern('^[a-zA-Z-]{1,31}$')])]
    })
  }
  
  /**
   * Adds a new word to the list of words.
   */
  public addWord(): void {
    if (!this.addWordForm.valid) {
    } else {
      this.addWordChange = false;
      this.wordsManager.addWord(this.addWordForm.value.word);
      this.addWordForm.reset();
    }
  }
  
}

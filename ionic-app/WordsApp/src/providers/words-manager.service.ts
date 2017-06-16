// Module imports
import {Injectable} from "@angular/core";
import {Storage} from "@ionic/storage";

// Project imports
import {Word} from "../../../../words-server/interfaces/Word";

/**
 * <h1>Words Manager</h1>
 * Managers the list of words stored on the device.
 *
 * @author  Jonathan Beaumont
 * @version 1.1.0
 * @since   2017-06-15
 */
@Injectable()
export class WordsManagerService {
  
  public allWords: Word[];  // Hold the list of words.
  
  /**
   * Constructor.
   */
  constructor(private storage: Storage) {
    this.setWordsList();
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
   * Adds a new word to the list of words if the list does not
   * already contain the word, then sorts the list alphabetically.
   * @param word  The word to add.
   * @param callback  Function to be run when word has been added.
   */
  public addWord(word: string, callback?: (added: boolean) => void): void {
    if (this.allWords.find(x => x.word === word)) {
      callback(false);
    } else {
      this.allWords.push({id: null, word: word});
      this.allWords.sort(this.sortWords('word', 'id'));
      this.updateStorageWords();
      callback(true);
    }
  }
  
  /**
   * Removes a word from the list of words if the list already
   * contains the word.
   * @param word  The word to add.
   * @returns {boolean} Whether the word was found and removed.
   */
  public removeWord(word: Word): boolean {
    console.log('Removing word: ' + word.word);
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
}

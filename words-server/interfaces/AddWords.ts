/**
 * <h1>Add Words Request</h1>
 * Contains a list of words necessary for an add words request.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.0
 * @since   2017-06-21
 */
export interface AddWordsRequest {
  words: string[];
}

/**
 * <h1>Add Words Response</h1>
 * Contains the field explaining the success and validity of an add
 * words request.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.0
 * @since   2017-06-21
 */
export interface AddWordsResponse {
  success: boolean;
  isLoggedIn: boolean;
  invalidNumberOfWords: boolean;
  addWordResponses?: {success: boolean, word: string, isValidWord: boolean, wordAlreadyAdded: boolean}[];
}

/**
 * <h1>Add Words Master</h1>
 * Contains the fields for communicating an add words event to the
 * master server, then back out to the worker servers. Contains the
 * username of the user which added the word, an the
 * <code>AddWordsResponse</code> corresponding to the successes of
 * the adding of the words.
 */
export interface AddWordsMaster {
  username: string;
  res: AddWordsResponse;
}
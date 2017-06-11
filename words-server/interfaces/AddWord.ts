import {SocketResponse} from "./Response";
/**
 * <h1>Add Word Request</h1>
 * Contains the word field necessary for a word add request.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.0
 * @since   2017-06-11
 */
export interface AddWordRequest {
  word: string;
}

/**
 * <h1>Add Word Response</h1>
 * Contains the fields explaining the success and validity of an add
 * word request.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.0
 * @since   2017-06-11
 */
export interface AddWordResponse extends SocketResponse {
  word: string;
  isLoggedIn: boolean;
  isValidWord: boolean;
  wordAlreadyAdded: boolean;
}

/**
 * <h1>Add Word Master</h1>
 * Contains the fields for communicating a successful add word event
 * to the master server, then back out to the worker servers.
 * Contains the username of the user which added the word, and the
 * <code>AddWordResponse</code> corresponding to the success of the
 * adding of the word.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.0
 * @since 2017-06-11
 */
export interface AddWordMaster {
  username: string;
  res: AddWordResponse;
}
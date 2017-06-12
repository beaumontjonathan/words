// Project imports
import {SocketResponse} from "./Response";

/**
 * <h1>Remove Word Request</h1>
 * Contains the word field necessary for a remove word request.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.0
 * @since   2017-06-12
 */
export interface RemoveWordRequest {
  word: string;
}

/**
 * <h1>Remove Word Response</h1>
 * Contains the fields explaining the success and validity of a
 * remove word request.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.0
 * @since   2017-06-12
 */
export interface RemoveWordResponse extends SocketResponse {
  word: string;
  isLoggedIn: boolean;
  isValidWord: boolean;
  wordNotYetAdded: boolean;
}

/**
 * <h1>Remove Word Master</h1>
 * Contains the fields necessary for communicating a successful
 * remove word event to the master server, then back out to the
 * worker servers.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.0
 * @since   2017-06-12
 */
export interface RemoveWordMaster {
  username: string;
  res: RemoveWordResponse
}
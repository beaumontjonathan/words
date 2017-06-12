// Project imports
import {SocketResponse} from "./Response";
import {Word} from "./Word";

/**
 * <h1>Get Words Response</h1>
 * Contains a field to contains an array of words and fields to
 * explain the success of getting a list of words.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.0
 * @since   2017-06-12
 */
export interface GetWordsResponse extends SocketResponse {
  words?: Word[];
  isLoggedIn: boolean;
}
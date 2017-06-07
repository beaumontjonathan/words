// Project imports
import {SocketResponse} from "./Response";

/**
 * <h1>Logout Response</h1>
 * Contains the boolean <code>wasLoggedIn</code> field necessary for
 * a socket logout response.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.0
 * @since   2017-06-05
 */
export interface LogoutResponse extends SocketResponse {
  wasLoggedIn: boolean;
}
// Project imports
import {SocketResponse} from "./Response";

/**
 * <h1>Login Request</h1>
 * Contains the username and password fields necessary for a login
 * request.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.0
 * @since   2017-06-07
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * <h1>Login Response</h1>
 * Contains the optional fields explaining why a login response might
 * be unsuccessful.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.0
 * @since   2017-06-07
 */
export interface LoginResponse extends SocketResponse {
  alreadyLoggedIn?: boolean;
  invalidUsername?: boolean;
  invalidPassword?: boolean;
  incorrectUsername?: boolean;
  incorrectPassword?: boolean;
}
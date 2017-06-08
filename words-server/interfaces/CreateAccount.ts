// Project imports
import {SocketResponse} from "./Response";

/**
 * <h1>Create Account Request</h1>
 * Contains the username and password fields necessary for an account
 * creation request.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.0
 * @since   2017-06-08
 */
export interface CreateAccountRequest {
  username: string;
  password: string;
}

/**
 * <h1>Create Account Response</h1>
 * Contains the optional fields to determine whether the account
 * creation request was successful and why/why not.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.0
 * @since   2017-06-08
 */
export interface CreateAccountResponse extends SocketResponse  {
  invalidUsername?: boolean;
  invalidPassword?: boolean;
  usernameTaken?: boolean;
}
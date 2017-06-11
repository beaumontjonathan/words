/**
 * <h1>Login Manager</h1>
 * Stores socket.io sockets and their corresponding passwords and
 * provides methods to check whether a socket or user has logged in,
 * allows more logged in sockets to be added, and allows logged in
 * sockets to logout.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.2
 * @since   2017-06-07
 */
export class LoginManager {
  
  private sockets: SocketIO.Socket[]; // Holds the of logged in sockets.
  private usernames: string[]; //Holds the of logged in usernames.
  
  /**
   * Constructor. Instantiates the empty <code>sockets</code> and
   * <code>usernames</code> arrays.
   */
  constructor() {
    this.sockets = [];
    this.usernames = [];
  }
  
  /**
   * Checks whether the a user has logged in.
   * @param data  Either a socket or username to check the login
   *              status of.
   * @returns {boolean} Whether the user has logged in.
   */
  public isLoggedIn(data: SocketIO.Socket|string): boolean {
    
    // If the data is a username.
    if (typeof data === 'string') {
      return (this.usernames.indexOf(data) !== -1)
    
    // If the data is a socket.
    } else {
      return (this.sockets.indexOf(data) !== -1)
    }
  }
  
  /**
   * Adds a username/socket pair to the arrays of logged in users.
   * @param username  The username logging in.
   * @param socket    The socket connected to the client logging in.
   */
  public login(username: string, socket: SocketIO.Socket): void {
    console.log(username + ' is logging in.');
    this.usernames.push(username);
    this.sockets.push(socket);
  }
  
  /**
   * Removes a username/socket pair from the arrays of logged in
   * users.
   * @param socket  The socket connected to the client logging out.
   * @returns {boolean} Whether the logout was successful.
   */
  public logout(socket: SocketIO.Socket): boolean {
    if (this.isLoggedIn(socket)) {
      console.log(this.getUsernameFromSocket(socket) + ' is logging out.');
      let index = this.sockets.indexOf(socket);
      this.usernames.splice(index);
      this.sockets.splice(index);
      return true;
    } else {
      return false;
    }
  }
  
  /**
   * Returns the username corresponding to a socket. If the socket
   * has not logged in, this is undefined.
   * @param socket  The socket connected to the client.
   * @returns {string}  The username linked to the socket.
   */
  public getUsernameFromSocket(socket: SocketIO.Socket): string {
    let username: string;
    if (this.isLoggedIn(socket)) {
      username = this.usernames[this.sockets.indexOf(socket)];
    }
    return username;
  }
  
  /**
   * Runs a callback function with the socket connection for each
   * logged in user corresponding to the username provided.
   * @param username  The username to find sockets corresponding to.
   * @param callback  Function to be run with each user.
   */
  public forEachSocketWithUsername(username: string, callback: (socket: SocketIO.Socket) => void) {
    this.usernames.forEach((iUsername: string, index: number) => {
      if (iUsername === username) {
        callback(this.sockets[index]);
      }
    });
  }
}
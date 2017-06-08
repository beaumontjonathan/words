// Module imports
import {createServer} from 'http';
import * as socketIO from 'socket.io';

// Project imports
import {MasterClientSocket} from "./MasterClientSocket";
import {ClientSocket} from "./ClientSocket";
import {LoginRequest, LoginResponse} from "../interfaces/Login";
import {LoginManager} from "./LoginManager";
import {LogoutResponse} from "../interfaces/Logout";
import {WordsDatabaseHandler} from "./WordsDatabaseHandler";
import {CreateAccountRequest, CreateAccountResponse} from "../interfaces/CreateAccount";

/**
 * <h1>Worker Server</h1>
 * This is the server worker node for the socket.io based words
 * application. Handles requests from clients and returns responses
 * to them. Allows clients to send messages to each other by sending
 * messages via the master node, which emits messages to all workers.
 *
 * @author  Jonathan Beaumont
 * @version 1.2.0
 * @since   2017-06-05
 */
export class WorkerServer {
  
  private io: SocketIO.Server;      // The socket.io server.
  private server: any;              // The http server.
  // The client socket to the master node.
  private masterClientSocket: MasterClientSocket;
  private loginManager: LoginManager; // Stores logged in sockets.
  // Handles user database storage.
  private dbHandler: WordsDatabaseHandler;
  private port: number;             // The port to listen on.
  
  /**
   * Constructor. Takes the port number, starts the server, starts
   * socket listening for the master node, establishes a database
   * pool, and starts listening for clients on the given port.
   * @param port This is the port number to listen for clients  on.
   */
  constructor(port: number) {
    this.port = port;
    this.loginManager = new LoginManager();
    this.dbHandler = new WordsDatabaseHandler();
    this.server = createServer();
    this.io = socketIO(this.server);
    this.startMasterClientSocket();
    this.listen();
  }
  
  /**
   * Instantiates a <code>MasterClientSocket</code> and then sets it
   * to attempt to connect to the head server, if there is one.
   */
  private startMasterClientSocket(): void {
    this.masterClientSocket = new MasterClientSocket(this, 'localhost', 8000);
    this.masterClientSocket.startSocketConnection();
  }
  
  /**
   * Logs to the console when disconnected from the master node.
   */
  public disconnectedFromMaster(): void {
    console.log('Disconnected from master server.');
  }
  
  /**
   * Removes the socket login data from the <code>LoginManager</code>
   * when the client disconnects.
   * @param socket  The socket which has just disconnected.
   */
  public disconnectFromClient(socket: SocketIO.Socket): void {
    this.loginManager.logout(socket);
  }
  
  /**
   * Starts listening for socket.io connections.
   */
  private listen(): void {
    this.server.listen(this.port, () => {
      console.log('Running server on port %s', this.port);
    });

    this.io.on('connect', this.connectEvent.bind(this));
  }
  
  /**
   * Handles new socket connections by wrapping them in a
   * <code>ClientSocket</code> object.
   * @param socket
   */
  private connectEvent(socket: SocketIO.Socket): void {
    console.log('Connection from client.');
    new ClientSocket(socket, this);
  }
  
  /**
   * Handles the login event. Allows the user to login if they have
   * not already logged in and if their login username and password
   * are correct.
   * @param req       The login request data.
   * @param socket    The socket trying to login.
   * @param callback  Function to be run after the login status has
   *                  been determined.
   */
  public loginRequestEvent(req: LoginRequest, socket: SocketIO.Socket, callback: (res: LoginResponse) => void): void {
    
    // Instantiates the return object containing login response.
    let res: LoginResponse = {success: false};
    res.invalidUsername = !this.isValidUsername(req.username);
    res.invalidPassword = !this.isValidPassword(req.password);
    
    /* Return the login response if the password or username are not
     * in a valid format.
     */
    if (res.invalidUsername || res.invalidPassword) {
      callback(res)
      
    // Returns the login response if the user if already logged in.
    } else if (this.loginManager.isLoggedIn(socket)) {
      res.alreadyLoggedIn = true;
      callback(res);
    } else {
      
      // Returns the response after checking the login credentials.
      this.checkLoginDetails(req.username, req.password, (incorrectUsername, incorrectPassword) => {
        res.incorrectUsername = incorrectUsername;
        res.incorrectPassword = incorrectPassword;
        if (!incorrectUsername && !incorrectPassword) {
          res.success = true;
          this.loginManager.login(req.username, socket);
        }
        callback(res);
      });
    }
  }
  
  /**
   * Checks whether the username is in a valid format.
   * <p>
   * A valid format requires the username to be between 5 and 31
   * characters long, starting with a letter, and only contains
   * letters, number dn the underscore.
   * @param username    The username to check.
   * @returns {boolean} Whether the username is in a valid format.
   */
  private isValidUsername(username: string): boolean {
    if (typeof username === 'string' && username != '') {
      let patt = new RegExp('^[a-zA-Z]{1}[a-zA-Z0-9_]{4,31}$');
      if (patt.test(username)) {
        return true;
      }
      return false;
    }
    return false;
  }
  
  /**
   * Checks whether the password is in a valid format.
   * <p>
   * A valid format requires the password to be between 5 and 31
   * characters long, containing only letters, numbers, spaces and
   * the special characters !, ", £, $, %, ^, &, *, ( and ).
   * @param password    The password to check.
   * @returns {boolean} Whether the password is in a valid format.
   */
  private isValidPassword(password: string): boolean {
    if (typeof password === 'string' && password != '') {
      let patt = new RegExp('^[a-zA-Z 0-9 !"£$%^&*()]{5,31}$');
      if (patt.test(password)) {
        return true;
      }
      return false;
    }
    return false;
  }
  
  /**
   * Uses the <code>WordsDatabaseHandler</code> to check whether the
   * login credentials provided by the user associate with those in
   * the database.
   * @param username  The username to check.
   * @param password  The password to check
   * @param callback  Function to be run once the login username and
   *                  password details have been verified.
   */
  private checkLoginDetails(username: string, password: string, callback: (incorrectUsername: boolean, incorrectPassword: boolean) => void): void {
    this.dbHandler.verifyCredentials(username, password, (incorrectUsername, incorrectPassword) => {
      callback(!incorrectUsername, !incorrectPassword);
    });
  }
  
  /**
   * Handles the logout event. Emits the response of the login
   * request back to the client.
   * @param socket
   * @returns {LogoutResponse}
   */
  public logoutRequestEvent(socket: SocketIO.Socket): LogoutResponse {
    let res: LogoutResponse = {success: false, wasLoggedIn: false};
    if (this.loginManager.isLoggedIn(socket)) {
      res.wasLoggedIn = true;
      if (this.loginManager.logout(socket)) {
        res.success = true;
      }
    }
    return res;
  }
  
  public createAccountRequestEvent(req: CreateAccountRequest, socket: SocketIO.Socket, callback: (res: CreateAccountResponse) => void): void {
    let res: CreateAccountResponse= {success: false};
    res.invalidUsername = !this.isValidUsername(req.username);
    res.invalidPassword = !this.isValidPassword(req.password);
    if (res.invalidUsername|| res.invalidPassword) {
      callback(res);
    } else {
      this.dbHandler.addUser(req.username, req.password, (success: boolean, id: number) => {
        res.success = success;
        if (!success) {
          res.usernameTaken = false;
        }
        callback(res);
      });
    }
  }
}

/* Starts the node server running on the port given by the first
 * argument when run in terminal
 */
let server = new WorkerServer(parseInt(process.argv[2]));
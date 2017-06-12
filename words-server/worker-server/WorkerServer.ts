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
import {AddWordMaster, AddWordRequest, AddWordResponse} from "../interfaces/AddWord";
import {RemoveWordMaster, RemoveWordRequest, RemoveWordResponse} from "../interfaces/RemoveWord";
import {GetWordsResponse} from "../interfaces/GetWord";
import {Word} from "../interfaces/Word";

/**
 * <h1>Worker Server</h1>
 * This is the server worker node for the socket.io based words
 * application. Handles requests from clients and returns responses
 * to them. Allows clients to send messages to each other by sending
 * messages via the master node, which emits messages to all workers.
 *
 * @author  Jonathan Beaumont
 * @version 1.5.0
 * @since   2017-06-05
 */
export class WorkerServer {
  
  private io: SocketIO.Server;      // The socket.io server.
  private server: any;              // The http server.
  // The client socket to the master node.
  private masterClientSocket: MasterClientSocket;
  // Whether the socket to the server is active.
  private masterSocketConnected: boolean;
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
    this.masterSocketConnected = false;
    this.masterClientSocket = new MasterClientSocket(this, 'localhost', 8000);
    this.masterClientSocket.startSocketConnection();
  }
  
  /**
   * Runs whenever the socket to the master server is connected or
   * disconnected, updating the <code>masterSocketConnected</code>
   * field, and logging a message explaining the socket's status to
   * the screen.
   * @param connected
   * @param reason
   */
  public connectedToMaster(connected: boolean, reason?: string): void {
    this.masterSocketConnected = connected;
    if (connected) {
      console.log('Connected to master server.');
    } else {
      console.log('Disconnected from master server. ' + reason);
    }
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
   * Checks whether the word is in a valid format.
   * <p>
   * A valid format required the word to be between 1 and 31
   * characters long, containing only letters and dashes.
   * @param word  The word to check.
   * @returns {boolean} Whether the word is in a valid format.
   */
  private isValidWord(word: string): boolean {
    if (typeof word === 'string' && word != '') {
      let patt = new RegExp('^[a-zA-Z-]{1,31}$');
      return patt.test(word);
    }
    return false
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
  
  /**
   * Handles the create account event. Attempts to add a new user to
   * the database if the username and password are of a valid format.
   * Returns details of the success of adding the new user to a
   * callback function.
   * @param req Contains the new username and password information.
   * @param socket  The socket from which the request was made.
   * @param callback  Function to be run after the request.
   */
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
  
  /**
   * Processes a request to add a word. Returns the success of adding
   * a word to a callback function.
   * @param req Contains the data for adding a new word.
   * @param socket  The socket from which the request came.
   */
  public addWordRequestEvent(req: AddWordRequest, socket: SocketIO.Socket) {
    
    // Sets up the add word response.
    let res: AddWordResponse = {success: false, word: req.word, isLoggedIn: false, isValidWord: false, wordAlreadyAdded: false};
    
    if (this.loginManager.isLoggedIn(socket)) {
      
      // If the user is logged in.
      res.isLoggedIn = true;
      
      if (this.isValidWord(req.word)) {
        // Tells the response that the word is in a valid format.
        res.isValidWord = true;
        let username = this.loginManager.getUsernameFromSocket(socket);
        
        // Checks whether the user has already added the word.
        this.dbHandler.containsWord(username, req.word, (containsWord: boolean) => {
          if (containsWord) {
            /* If the user already has the word, then and response
             * is send explaining so.
             */
            res.wordAlreadyAdded = true;
            this.addWordResponse(socket, res);
          } else {
            
            /* If the user does not have the word, then the word is
             * added.
             */
            this.dbHandler.addWord(username, req.word, (addedSuccessfully: boolean) => {
              res.success = addedSuccessfully;
              if (addedSuccessfully) {
                
                /* If the word was added to the database successfully
                 * then the request is sent to the master server and
                 * to logged in clients with the same username.
                 */
                res.success = true;
                this.addWordMasterRequest(username, res);
                this.addWordForAllConnectedClients(username, res);
              } else {
                
                /* If the word was not added to the database
                 * successfully then the response if sent back to the
                 * original client.
                 */
                this.addWordResponse(socket, res);
              }
            });
          }
        });
      } else {
        /* If the word is not in a valid format then the response is
         * sent.
         */
        this.addWordResponse(socket, res);
      }
    } else {
      
      // If the user is not logged in.
      this.addWordResponse(socket, res);
    }
  }
  
  /**
   * Sends a request to the master server containing the add word
   * data.
   * @param username  Username of the user who added the word.
   * @param res Contains information about adding the word.
   */
  private addWordMasterRequest(username: string, res: AddWordResponse) {
    if (this.masterSocketConnected) {
      this.masterClientSocket.addWordMasterRequest({username: username, res: res});
    }
  }
  
  /**
   * Handles a response from the master server about a word being
   * added. Emits a message to all connected users with the username
   * matching that of the add word username.
   * @param res Contains data about the new word being added.
   */
  public addWordMasterResponse(res: AddWordMaster) {
    this.addWordForAllConnectedClients(res.username, res.res);
  }
  
  /**
   * Runs the <code>addWordResponse</code> method, emitting an add
   * word response, for all logged in sockets with the username
   * provided.
   * @param username  The username of the user who added the word.
   * @param res Contains information about the word which as added.
   */
  private addWordForAllConnectedClients(username: string, res: AddWordResponse) {
    this.loginManager.forEachSocketWithUsername(username, (socket: SocketIO.Socket) => {
      this.addWordResponse(socket, res);
    });
  }
  
  /**
   * Emits a socket.io <code>addWord response</code> message to a
   * socket, containing information about the success of the word.
   * @param socket  The socket to send the response to.
   * @param res Contains the information about adding the word.
   */
  private addWordResponse(socket: SocketIO.Socket, res: AddWordResponse) {
    socket.emit('addWord response', res);
  }
  
  /**
   * Processes a request to remove a word. Returns the success of
   * removing the word to a callback function.
   * @param req Contains the data for adding a new word.
   * @param socket  The socket from which the request came.
   */
  public removeWordRequestEvent(req: RemoveWordRequest, socket: SocketIO.Socket) {
    
    // Sets up the remove word response.
    let res: RemoveWordResponse = {success: false, word: req.word, isLoggedIn: false, isValidWord: false, wordNotYetAdded: true};
    
    if (this.loginManager.isLoggedIn(socket)) {
      // If the user is logged in.
      res.isLoggedIn = true;
      
      if (this.isValidWord(req.word)) {
        // Word is valid.
        res.isValidWord = true;
        let username = this.loginManager.getUsernameFromSocket(socket);
  
        // Checks whether the user has added the word.
        this.dbHandler.containsWord(username, res.word, (containsWord: boolean) => {
          if (containsWord) {
            // User has already added the word.
            res.wordNotYetAdded = false;
            
            // Remove word from database.
            this.dbHandler.deleteWord(username, req.word, (wordRemoved: boolean) => {
              if (wordRemoved) {
                // Word removed successfully.
                res.success = true;
                this.removeWordMasterRequest(username, res);
                this.removeWorkForAllConnectedClients(username, res);
              } else {
                // Word not removed.
                this.removeWordResponse(socket, res);
              }
            });
          } else {
            // USer has not added the word yet.
            this.removeWordResponse(socket, res);
          }
        });
      } else {
        // Word is not valid.
        this.removeWordResponse(socket, res);
      }
    } else {
      // If the user is not logged in.
      this.removeWordResponse(socket, res);
    }
    
  }
  
  /**
   * Sends a request to the master server containing the remove word
   * data.
   * @param username  Username of the user who removed the word.
   * @param res Contains information about removing the word.
   */
  private removeWordMasterRequest(username: string, res: RemoveWordResponse) {
    if (this.masterSocketConnected) {
      this.masterClientSocket.removeWordMasterRequest({username: username, res: res});
    }
  }
  
  /**
   * Handles a response from the master server about a word being
   * removed. Emits a message to all connected users with the
   * username matching that of the remove word username.
   * @param res Contains the data about the word being removed.
   */
  public removeWordMasterResponse(res: RemoveWordMaster) {
    this.removeWorkForAllConnectedClients(res.username, res.res);;
  }
  
  /**
   * Runs the <code>removeWordResponse</code> method, emitting a
   * remove word response for all logged in sockets with the same
   * username.
   * @param username  The username of the user who removed the word.
   * @param res Contains information about the word being removed.
   */
  private removeWorkForAllConnectedClients(username: string, res: RemoveWordResponse) {
    this.loginManager.forEachSocketWithUsername(username, (socket: SocketIO.Socket) => {
      this.removeWordResponse(socket, res);
    });
  }
  
  /**
   * Emits a socket.io <code>removeWord response</code> message to a
   * given socket, containing information about the success of
   * removing a word.
   * @param socket  The socket to send the response to.
   * @param res Contains the information about the word.
   */
  private removeWordResponse(socket: SocketIO.Socket, res: RemoveWordResponse) {
    socket.emit('removeWord response', res);
  }
  
  /**
   * Processes a request from a user to fetch all words they have
   * added. Determines whether the request was successful and returns
   * a suitable response to the socket.
   * @param socket  the socket from which the request came.
   */
  public getWordRequestEvent(socket: SocketIO.Socket) {
    let res: GetWordsResponse = {success: false, isLoggedIn: false};
    if (this.loginManager.isLoggedIn(socket)) {
      // Socket client is logged in.
      res.isLoggedIn = true;
      
      let username = this.loginManager.getUsernameFromSocket(socket);
      
      this.dbHandler.getAllWords(username, (words: Word[]) => {
        res.success = true;
        res.words = words;
        this.getWordsResponse(socket, res);
      });
    } else {
      // Socket client is not logged in.
      this.getWordsResponse(socket, res);
    }
  }
  
  /**
   * Emits a socket.io <code>getWords response</code> message to a
   * socket, containing the information about the success of the get
   * words request.
   * @param socket  The socket to send that response to.
   * @param res Contains response information for the request.
   */
  private getWordsResponse(socket: SocketIO.Socket, res: GetWordsResponse) {
    socket.emit('getWords response', res);
  }
}

/* Starts the node server running on the port given by the first
 * argument when run in terminal
 */
let server = new WorkerServer(parseInt(process.argv[2]));
// Module imports
import * as socketIOClient from 'socket.io-client';
import {createInterface} from 'readline';

// Project imports
import {LoginRequest, LoginResponse} from "../interfaces/Login";
import {LogoutResponse} from "../interfaces/Logout";

/**
 * <h1>Client Socket API Test</h1>
 * A client socket wrapper to help test and build the words
 * application socket.io API. Connects to a Worker Server node.
 *
 * @author  Jonathan Beaumont
 * @version 1.1.0
 * @since   2017-06-06
 */
export class ClientSocket {
  
  private socket: any;  // The client socket.
  private host: string; // The host name of the server.
  private port: number; // The port number of the server.
  private socketConnected: boolean; // Whether the socket is connected
  
  /**
   * Constructor. Sets the host and port fields;
   * @param host  The hostname of the server.
   * @param port  The port number of the server.
   */
  constructor(host: string, port: number) {
    this.host = host;
    this.port = port;
    this.socketConnected = false;
    this.startAcceptingLines();
  }
  
  /**
   * Starts reading lines from the terminal to be treated as commands
   * to process.
   */
  private startAcceptingLines(): void {
    var readLine = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });
    readLine.on('line', this.processCommand.bind(this));
  }
  
  /**
   * Takes a command from the user and determines the action to carry
   * out based on it.
   * @param command
   */
  private processCommand(command: string): void {
    
    // Set the default response.
    let response = 'Unrecognised command';
    let words: string[] = command.split(' ');
    
    // Changes the response based on the first words of the command.
    if (words.length !== 0) {
      switch (words[0].toLowerCase()) {
        
        // Exit command
        case "exit":
          console.log('Goodbye!');
          process.exit(0);
          this.socket.disconnect();
          break;
          
        // Login command
        case "login":
          if (words.length !== 3) {
            response = 'Usage: login <username> <password>';
          } else if (this.socketConnected) {
            this.loginRequest({username: words[1], password: words[2]});
            response = 'Attempting login...';
          } else {
            response = 'You are not connected to the server!\nTry logging in later.'
          }
          break;
          
        // Logout command
        case "logout":
          if (command !== "logout") {
            response = 'Usage: logout';
          } else {
            response = 'Attempting logout...';
            this.logoutRequest();
          }
      }
    }
    console.log(response);
  }
  
  /**
   * Starts attempting to connect to the server on the given host and
   * port, then binds the socket.io events to methods.
   */
  public startSocketConnection(): void {
    this.socket = socketIOClient('http://' + this.host + ':' + this.port);
    this.bindEvents();
  }
  
  /**
   * Binds the socket.io events to their respective methods.
   */
  private bindEvents(): void {
    // socket.io api events
    this.socket.on('connect', this.connectEvent.bind(this));
    this.socket.on('disconnect', this.disconnectEvent.bind(this));
    this.socket.on('error', this.errorEvent.bind(this));
    
    // words api events
    this.socket.on('login response', this.loginResponse.bind(this));
    this.socket.on('logout response', this.logoutResponse.bind(this));
  }
  
  /**
   * Handles the socket <code>connect</code event by logging it to
   * the console.
   */
  private connectEvent(): void {
    this.socketConnected = true;
    console.log('Connected to worker node.');
  }
  
  /**
   * Handles the socket <code>disconnect</code> event by logging it
   * to the console.
   * @param reason The string reason for the socket disconnecting.
   */
  private disconnectEvent(reason: string): void {
    this.socketConnected = false;
    console.log('Disconnecting socket. Reason: ' + reason);
  }
  
  /**
   * Handles the socket <code>error</code> event by logging it to
   * the console.
   * @param error
   */
  private errorEvent(error: object): void {
    console.log('Socket error: ');
    console.log(error);
  }
  
  /**
   * Emits a login request to the server.
   * @param loginData The username and password for the user.
   */
  private loginRequest(loginData: LoginRequest) {
    this.socket.emit('login request', loginData);
  }
  
  /**
   * Processes the response to the login request.
   * @param data  Contains data about the success of the login.
   */
  private loginResponse(data: LoginResponse) {
    if (data.success) {
      console.log('Login successful.');
    } else if (data.alreadyLoggedIn) {
      console.log('Login unsuccessful. You are already logged in.');
    } else if (data.invalidUsername) {
      console.log('Login unsuccessful. Username invalid.');
    } else if (data.invalidPassword) {
      console.log('Login unsuccessful. Password invalid.');
    } else if (data.incorrectUsername) {
      console.log('Login unsuccessful. Username incorrect.');
    } else if (data.incorrectPassword) {
      console.log('Login unsuccessful. Password incorrect.');
    }
  }
  
  /**
   * Emits a logout request to the server.
   */
  private logoutRequest() {
    this.socket.emit('logout request');
  }
  
  /**
   * Processes the response to the logout request.
   * @param data  Contains data about the success of the logout.
   */
  private logoutResponse(data: LogoutResponse) {
    if (data.success) {
      console.log('Logout successful.');
    } else if (data.wasLoggedIn) {
      console.log('Logout unsuccessful, but you were logged in?');
    } else {
      console.log('You must login before you can logout.');
    }
  }
  
}

/* Starts a ClientSocket object with the hostname and port number
 * being respectively the cli arguments.
 */
new ClientSocket(process.argv[2], parseInt(process.argv[3])).startSocketConnection();
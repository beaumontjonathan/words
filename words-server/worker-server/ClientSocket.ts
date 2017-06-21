// Project imports
import {WorkerServer} from "./WorkerServer";
import {LoginRequest, LoginResponse} from "../interfaces/Login";
import {LogoutResponse} from "../interfaces/Logout";
import {CreateAccountRequest, CreateAccountResponse} from "../interfaces/CreateAccount";
import {AddWordRequest} from "../interfaces/AddWord";
import {RemoveWordRequest} from "../interfaces/RemoveWord";
import {AddWordsRequest} from "../interfaces/AddWords";

/**
 * <h1>Worker Server Client socket.io Socket Wrapper</h1>
 * Provides a wrapper class to deal with socket events from clients.
 * Communicates with <code>WorkerServer</code> to handle event
 * requests.
 *
 * @author  Jonathan Beaumont
 * @version 1.6.0
 * @since   2017-06-05
 */
export class ClientSocket {
  
  private socket: SocketIO.Socket;  // The client socket.
  private workerServer: WorkerServer;  // The WorkerServer object.
  
  /**
   * Constructor. Run when a new socket is connected. Sets up the
   * socket bindings and object parameters.
   * @param socket        The client socket.
   * @param workerServer  The WorkerServer object.
   */
  constructor(socket: SocketIO.Socket, workerServer: WorkerServer) {
    this.socket = socket;
    this.workerServer = workerServer;
    this.bindEvents();
  }
  
  /**
   * Binds the socket.io events to their respective methods.
   */
  private bindEvents(): void {
    // socket.io api events
    this.socket.on('disconnect', this.disconnectEvent.bind(this));
    this.socket.on('error', this.errorEvent.bind(this));

    // words api events
    this.socket.on('login request', this.loginRequestEvent.bind(this));
    this.socket.on('logout request', this.logoutRequestEvent.bind(this));
    this.socket.on('createAccount request', this.createAccountEvent.bind(this));
    this.socket.on('addWord request', this.addWordRequestEvent.bind(this));
    this.socket.on('addWords request', this.addWordsRequestEvent.bind(this));
    this.socket.on('removeWord request', this.removeWordRequestEvent.bind(this));
    this.socket.on('getWords request', this.getWordsRequestEvent.bind(this));
  }
  
  /**
   * Handles the socket <code>disconnect</code> event by logging it
   * to the console.
   * @param reason The string reason for the socket disconnecting.
   */
  private disconnectEvent(reason: string): void {
    console.log('Disconnecting socket. Reason: ' + reason);
    this.workerServer.disconnectFromClient(this.socket);
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
   * Handles the socket <code>login request</code> event, then emits
   * the <code>login response</code> back to the client.
   * @param req Contains the login username and password information.
   */
  private loginRequestEvent(req: LoginRequest): void {
    this.workerServer.loginRequestEvent(req, this.socket, (res: LoginResponse) => {
      this.socket.emit('login response', res);
    });
  }
  
  /**
   * Handles the socket <code>logout request</code> event, then emits
   * the <code>logout response</code> back to the client.
   */
  private logoutRequestEvent(): void {
    let res: LogoutResponse = this.workerServer.logoutRequestEvent(this.socket);
    this.socket.emit('logout response', res);
  }
  
  /**
   * Handles the socket <code>createAccount request</code> event,
   * then emits the <code>createAccount response</code> back to the
   * client.
   * @param req Contains the account creation username and password.
   */
  private createAccountEvent(req: CreateAccountRequest): void {
    this.workerServer.createAccountRequestEvent(req, this.socket, (res: CreateAccountResponse) => {
      this.socket.emit('createAccount response', res);
    });
  }
  
  /**
   * Handles the socket <code>addWord request</code> event by passing
   * the request data to the <code>WorkerServer</code> method to
   * process.
   * @param req Contains the add word data.
   */
  private addWordRequestEvent(req: AddWordRequest): void {
    this.workerServer.addWordRequestEvent(req, this.socket);
  }
  
  /**
   * Handles the socket <code>addWords request</code> event by
   * passing the request data to the <code>WorkerServer</code> method
   * to process.
   * @param req Contains the add words data.
   */
  private addWordsRequestEvent(req: AddWordsRequest): void {
    this.workerServer.addWordsRequestEvent(req, this.socket);
  }
  
  /**
   * Handles the socket <code>removeWord request</code> event by
   * passing the request data to the <code>WorkerServer</code> method
   * for processing.
   * @param req Contains the remove word data.
   */
  private removeWordRequestEvent(req: RemoveWordRequest): void {
    this.workerServer.removeWordRequestEvent(req, this.socket);
  }
  
  /**
   * Handles the socket <code>getWords request</code> event by
   * passing the request to the <code>WorkerServer</code> method for
   * processing.
   */
  private getWordsRequestEvent(): void {
    this.workerServer.getWordRequestEvent(this.socket);
  }
}
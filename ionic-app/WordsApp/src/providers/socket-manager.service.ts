// Module imports
import {Injectable} from "@angular/core";
import * as io from 'socket.io-client';
import {Events} from "ionic-angular";

// Project imports
import {LoginRequest, LoginResponse} from "../../../../words-server/interfaces/Login";
import {LogoutResponse} from "../../../../words-server/interfaces/Logout";

/**
 * <h1>Socket Handler</h1>
 * Manages connection and events to and from the socket.io
 * connection.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.1
 * @since   2017-06-16
 */
@Injectable()
export class SocketManagerService {
  
  private socket: any;  // The socket.io cliet socket.
  // Holds whether the socket is connected to the server.
  private _socketConnected: boolean = false;
  // Host to connect the socket to.
  private socketHost: string = 'http://localhost:1234';
  
  /**
   * Constructor.
   * @param events  Application-level events.
   */
  constructor(private events: Events) {
  }
  
  /**
   * Returns whether the socket is connected to the server.
   * @returns {boolean} Whether the socket is connected.
   */
  get socketConnected(): boolean {
    return this._socketConnected;
  }
  
  /**
   * Starts the socket listening on the host provided, then binds the
   * socket events to the socket.
   */
  initialize() {
    this.socket = io.connect(this.socketHost);
    this.bindSocketEvents();
  }
  
  /**
   * Binds the socket.io events to their respective methods.
   */
  private bindSocketEvents(): void {
    // socket.io api events
    this.socket.on('connect', this.connectEvent.bind(this));
    this.socket.on('disconnect', this.disconnectEvent.bind(this));
    this.socket.on('reconnecting', this.reconnectingEvent.bind(this));
    this.socket.on('reconnecting_error', this.reconnectingErrorEvent.bind(this));
    this.socket.on('error', this.errorEvent.bind(this));
    
    // words api events
    this.socket.on('login response', this.loginResponse.bind(this));
    this.socket.on('logout response', this.logoutResponse.bind(this));
  }
  
  /**
   * Handles the socket <code>connect</code event by logging it to
   * the console and publishing it to events.
   */
  private connectEvent(): void {
    this._socketConnected = true;
    console.log('Connected to worker node.');
    this.events.publish('socket connect');
  }
  
  /**
   * Handles the socket <code>disconnect</code> event by logging it
   * to the console and publishing it to events.
   * @param reason The string reason for the socket disconnecting.
   */
  private disconnectEvent(reason: string): void {
    this._socketConnected = false;
    console.log('Disconnecting socket. Reason: ' + reason);
    this.events.publish('socket disconnect', reason);
  }
  
  /**
   * Handles the socket <code>reconnecting</code> event.
   */
  private reconnectingEvent(): void {
  }
  
  /**
   * Handles the socket <code>reconnecting_error</code> event.
   */
  private reconnectingErrorEvent(): void {
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
  public loginRequest(loginData: LoginRequest): void {
    this.socket.emit('login request', loginData);
  }
  
  /**
   * Processes the response to the login request by publishing it to
   * events.
   * @param res  Contains data about the success of the login.
   */
  private loginResponse(res: LoginResponse): void {
    this.events.publish('socket login response', res);
  }
  
  /**
   * Emits a logout request to the server.
   */
  public logoutRequest(): void {
    this.socket.emit('logout request');
  }
  
  /**
   * Processes the response to the logout request by publishing it to
   * events.
   * @param res  Contains data about the success of the logout.
   */
  private logoutResponse(res: LogoutResponse): void {
    this.events.publish('socket logout response', res);
  }

}

// Module imports
import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {Observable} from "rxjs/Observable";
import * as io from 'socket.io-client';

// Project imports
import {LoginRequest, LoginResponse} from "../../../../words-server/interfaces/Login";
import {LogoutResponse} from "../../../../words-server/interfaces/Logout";

/**
 * <h1>Socket Handler</h1>
 * Manages connection and events to and from the socket.io
 * connection.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.0
 * @since   2017-06-16
 */
@Injectable()
export class SocketManagerService {
  
  public socketLoginService: any;
  private socketLoginObserver: any;
  private socket: any;  // The socket.io cliet socket.
  // Holds whether the socket is connected to the server.
  private _socketConnected: boolean = false;
  // Host to connect the socket to.
  socketHost: string = 'http://localhost:1234';
  
  /**
   * Constructor.
   * @param http
   */
  constructor(private http: Http) {
    
    /* Creates an observer and service to send messages to the login
     * manager.
     */
    this.socketLoginService = Observable.create(observer => {
      this.socketLoginObserver = observer;
    });
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
    this.bindEvents();
  }
  
  /**
   * Binds the socket.io events to their respective methods.
   */
  private bindEvents(): void {
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
   * the console, and sending a message to the socket login observer
   * stating that it has connected.
   */
  private connectEvent(): void {
    this._socketConnected = true;
    console.log('Connected to worker node.');
    this.socketLoginObserver.next({event: 'connect'});
  }
  
  /**
   * Handles the socket <code>disconnect</code> event by logging it
   * to the console, and sending a message to the socket login
   * observer stating that is has disconnected along with the reason
   * for the socket disconnecting.
   * @param reason The string reason for the socket disconnecting.
   */
  private disconnectEvent(reason: string): void {
    this._socketConnected = false;
    console.log('Disconnecting socket. Reason: ' + reason);
    this.socketLoginObserver.next({event: 'disconnect', reason: reason});
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
   * Processes the response to the login request by sending a message
   * to the <code>socketLoginObserver</code>.
   * @param res  Contains data about the success of the login.
   */
  private loginResponse(res: LoginResponse): void {
    this.socketLoginObserver.next({event: 'login response', res: res});
  }
  
  /**
   * Emits a logout request to the server.
   */
  public logoutRequest(): void {
    this.socket.emit('logout request');
  }
  
  /**
   * Processes the response to the logout request by sending a
   * message to the <code>socketLoginObserver</code>.
   * @param res  Contains data about the success of the logout.
   */
  private logoutResponse(res: LogoutResponse): void {
    this.socketLoginObserver.next({event: 'logout response', res: res});
  }

}

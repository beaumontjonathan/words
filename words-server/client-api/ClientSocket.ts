// Module imports
import * as socketIOClient from 'socket.io-client';

/**
 * <h1>Client Socket API Test</h1>
 * A client socket wrapper to help test and build the words
 * application socket.io API. Connects to a Worker Server node.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.0
 * @since   2017-06-06
 */
export class ClientSocket {
  
  private socket: any;  // The client socket.
  private host: string; // The host name of the server.
  private port: number; // The port number of the server.
  
  /**
   * Constructor. Sets the host and port fields;
   * @param host  The hostname of the server.
   * @param port  The port number of the server.
   */
  constructor(host: string, port: number) {
    this.host = host;
    this.port = port;
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
  }
  
  /**
   * Handles the socket <code>connect</code event by logging it to
   * the console.
   */
  private connectEvent(): void {
    console.log('Connected to worker node.');
  }
  
  /**
   * Handles the socket <code>disconnect</code> event by logging it
   * to the console.
   * @param reason The string reason for the socket disconnecting.
   */
  private disconnectEvent(reason: string): void {
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
  
}

/* Starts a ClientSocket object with the hostname and port number
 * being respectively the cli arguments.
 */
new ClientSocket(process.argv[2], parseInt(process.argv[3])).startSocketConnection();
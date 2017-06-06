// Project imports
import {WorkerServer} from "./WorkerServer";

/**
 * <h1>Worker Server Client socket.io Socket Wrapper</h1>
 * Provides a wrapper class to deal with socket events from clients.
 * Communicates with <code>WorkerServer</code> to handle event
 * requests.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.0
 * @since   2017-06-05
 */
export class ClientSocket {
  
  private socket: any;        // The client socket.
  private workerServer: any;  // The WorkerServer object.
  
  /**
   * Constructor. Run when a new socket is connected. Sets up the
   * socket bindings and object parameters.
   * @param socket        The client socket.
   * @param workerServer  The WorkerServer object.
   */
  constructor(socket: any, workerServer: WorkerServer) {
    this.socket = socket;
    this.workerServer = workerServer;
    this.bindEvents();
  }
  
  /**
   * Binds the socket.io events to their respective methods.
   */
  private bindEvents() {
    // socket.io api events
    this.socket.on('disconnect', this.disconnectEvent.bind(this));
    this.socket.on('error', this.errorEvent.bind(this));

    // words api events
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
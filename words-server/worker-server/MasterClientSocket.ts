// Module imports
const socketIOClient = require('socket.io-client'); //todo: change to import

// Project imports
import {WorkerServer} from "./WorkerServer";

/**
 * <h1>Client Socket for socket.io Connection to Master Server</h1>
 * Contains code to handle a node server connection to the master
 * server.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.0
 * @since   2017-06-05
 */
export class MasterClientSocket {

  private workerServer: WorkerServer; // WorkerServer object.
  private socket: any;                // The client socket.
  private masterHost: string;         // Hostname of the master node.
  private masterPort: number;         // Port of the master node.
  
  // Default values for the hostname and port of the master node.
  static readonly DEFAULT_HOST: string = 'localhost';
  static readonly DEFAULT_PORT: number = 9000;
  
  /**
   * Constructor. Sets the fields for connecting to the master node.
   * @param workerServer  The workerServer which instantiated this.
   * @param masterHost    The hostname of the master node. (Optional)
   * @param masterPort    The port of the master node. (Optional)
   */
  constructor(
    workerServer: WorkerServer,
    masterHost: string = MasterClientSocket.DEFAULT_HOST,
    masterPort: number = MasterClientSocket.DEFAULT_PORT
  ) {
    this.workerServer = workerServer;
    this.masterPort = masterPort;
    this.masterHost = masterHost;
  }
  
  /**
   * Starts attempting to connect to the master node on the given
   * hostname and port.
   */
  public startSocketConnection(): void {
    this.socket = new socketIOClient('http://' + this.masterHost + ':' + this.masterPort);
    this.bindEvents(); //todo: move to constructor
  }
  
  /**
   * Binds the socket.io events to their respective methods.
   */
  private bindEvents(): void {
    // socket.io api events
    this.socket.on('connect', this.connectEvent.bind(this));
    this.socket.on('disconnect', this.disconnectEvent.bind(this));

    // words api events
  }
  
  /**
   * Handles the socket <code>connect</code> event by logging it to
   * the console.
   */
  private connectEvent() {
    console.log('Connected to master server.');
  }
  
  /**
   * Handles the socket <code>error</code> event by logging it to the
   * console.
   * @param reason
   */
  private disconnectEvent(reason: string): void {
    console.log('Disconnecting socket. Reason: ' + reason);
    this.workerServer.disconnectedFromMaster();
  }

}
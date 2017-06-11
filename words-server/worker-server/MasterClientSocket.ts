// Module imports
import * as socketIOClient from 'socket.io-client';

// Project imports
import {WorkerServer} from "./WorkerServer";
import {AddWordMaster} from "../interfaces/AddWord";

/**
 * <h1>Client Socket for socket.io Connection to Master Server</h1>
 * Contains code to handle a node server connection to the master
 * server.
 *
 * @author  Jonathan Beaumont
 * @version 1.1.0
 * @since   2017-06-05
 */
export class MasterClientSocket {

  private workerServer: WorkerServer; // WorkerServer object.
  private socket: SocketIOClient.Socket;  // The client socket.
  private masterHost: string; // Hostname of the master node.
  private masterPort: number; // Port of the master node.
  
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
    this.socket = socketIOClient('http://' + this.masterHost + ':' + this.masterPort);
    this.bindEvents();
  }
  
  /**
   * Binds the socket.io events to their respective methods.
   */
  private bindEvents(): void {
    // socket.io api events
    this.socket.on('connect', this.connectEvent.bind(this));
    this.socket.on('disconnect', this.disconnectEvent.bind(this));

    // words api events
    this.socket.on('addWordMaster response', this.addWordMasterResponse.bind(this));
  }
  
  /**
   * Handles the socket <code>connect</code> event by running a
   * <code>WorkerServer</code> method.
   */
  private connectEvent() {
    this.workerServer.connectedToMaster(true);
  }
  
  /**
   * Handles the socket <code>disconnect</code> event by running a
   * <code>WorkerServer</code> method.
   */
  private disconnectEvent(reason: string): void {
    this.workerServer.connectedToMaster(false, reason);
  }
  
  /**
   * Sends an add word request to the master server along with the
   * request data about adding the word.
   * @param req
   */
  public addWordMasterRequest(req: AddWordMaster) {
    this.socket.emit('addWordMaster request', req)
  }
  
  /**
   * Handles the socket <code>addWordMaster response</code> by
   * running a <code>WorkerServer</code> method.
   * @param req
   */
  private addWordMasterResponse(req: AddWordMaster) {
    this.workerServer.addWordMasterResponse(req);
  }

}
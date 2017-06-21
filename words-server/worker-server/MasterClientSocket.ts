// Module imports
import * as socketIOClient from 'socket.io-client';

// Project imports
import {WorkerServer} from "./WorkerServer";
import {AddWordMaster} from "../interfaces/AddWord";
import {RemoveWordMaster} from "../interfaces/RemoveWord";
import {AddWordsMaster} from "../interfaces/AddWords";

/**
 * <h1>Client Socket for socket.io Connection to Master Server</h1>
 * Contains code to handle a node server connection to the master
 * server.
 *
 * @author  Jonathan Beaumont
 * @version 1.3.0
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
    this.socket.on('addWordsMaster response', this.addWordsMasterResponse.bind(this));
    this.socket.on('removeWordMaster response', this.removeWordMasterResponse.bind(this));
  }
  
  /**
   * Handles the socket <code>connect</code> event by running a
   * <code>WorkerServer</code> method.
   */
  private connectEvent(): void {
    this.workerServer.connectedToMaster(true);
  }
  
  /**
   * Handles the socket <code>disconnect</code> event by running a
   * <code>WorkerServer</code> method.
   * @param reason  A string explaining the reason for the socket
   *                disconnecting.
   */
  private disconnectEvent(reason: string): void {
    this.workerServer.connectedToMaster(false, reason);
  }
  
  /**
   * Sends an add word request to the master server along with the
   * request data about adding the word.
   * @param req Contains the add word information.
   */
  public addWordMasterRequest(req: AddWordMaster): void {
    this.socket.emit('addWordMaster request', req)
  }
  
  /**
   * Handles the socket <code>addWordMaster response</code> by
   * running a <code>WorkerServer</code> method.
   * @param res Contains the add word information.
   */
  private addWordMasterResponse(res: AddWordMaster): void {
    this.workerServer.addWordMasterResponse(res);
  }
  
  /**
   * Sends an add words request to the master server along with the
   * request data about adding n words.
   * @param req Contains the add words response information.
   */
  public addWordsMasterRequest(req: AddWordsMaster): void {
    this.socket.emit('addWordsMaster request', req);
  }
  
  /**
   * Handles the socket <code>addWordsMaster response</code> by
   * running a <code>WorkerServer</code> method.
   * @param res Contains the add words response information.
   */
  private addWordsMasterResponse(res: AddWordsMaster): void {
    this.workerServer.addWordsMasterResponse(res);
  }
  
  /**
   * Send a remove word request to the master server along with the
   * request data about removing the word.
   * @param req Contains the add word information.
   */
  public removeWordMasterRequest(req: RemoveWordMaster): void {
    this.socket.emit('removeWordMaster request', req);
  }
  
  /**
   * Handles the socket <code>removeWordMaster response</code> by
   * running a <code>WorkerServer</code> method.
   * @param res Contains the remove word information.
   */
  private removeWordMasterResponse(res: RemoveWordMaster): void {
    this.workerServer.removeWordMasterResponse(res);
  }

}
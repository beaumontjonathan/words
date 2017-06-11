// Project imports
import {MasterServer} from "./MasterServer";
import {AddWordMaster} from "../interfaces/AddWord";

/**
 * <h1>Socket for Worker Servers on MasterServer</h1>
 * Contains code to deal with socket connection to worker sockets
 * from the socket.io master server. Handles events emitted from
 * Worker Servers.
 *
 * @author  Jonathan Beaumont
 * @version 1.1.0
 * @since   2017-06-05
 */
export class WorkerServerSocket {

  private socket: SocketIO.Socket;                // The server socket.
  private masterServer: MasterServer; // The MasterServer object.

  /**
   * Constructor. Sets the <code>socket</code> and
   * <code>masterServer</code fields and sets up the socket.
   * @param socket        The server socket.
   * @param masterServer  The MasterServer object.
   */
  constructor(socket: SocketIO.Socket, masterServer: MasterServer) {
    this.socket = socket;
    this.masterServer = masterServer;
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
    this.socket.on('addWordMaster request', this.addWordEvent.bind(this));
  }

  /**
   * Handles the socket <code>disconnect</code> event by logging it
   * to the console.
   * @param reason The string reason for the socket disconnecting
   */
  private disconnectEvent(reason: string) {
    console.log('Disconnecting socket. Reason: ' + reason);
  }

  /**
   * Handles the socket <code>error</code> event by logging it to
   * the console.
   * @param error The socket error.
   */
  private errorEvent(error: object) {
    console.log('Socket error: ');
    console.log(error);
  }
  
  /**
   * Handles the socket <code>addWordMaster</code> event by
   * broadcasting the request to all other worker servers.
   * @param req Contains the add word information.
   */
  private addWordEvent(req: AddWordMaster) {
    this.socket.broadcast.emit('addWordMaster response', req);
  }
}
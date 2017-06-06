// Module imports
import {createServer} from 'http';
import * as socketIO from 'socket.io';

// Project imports
import {MasterClientSocket} from "./MasterClientSocket";
import {ClientSocket} from "./ClientSocket";

/**
 * <h1>Worker Server</h1>
 * This is the server worker node for the socket.io based words
 * application. Handles requests from clients and returns responses
 * to them. Allows clients to send messages to each other by sending
 * messages via the master node, which emits messages to all workers.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.0
 * @since   2017-06-05
 */
export class WorkerServer {
  
  private io: any;                  // The socket.io server.
  private server: any;              // The http server.
  private masterClientSocket: any;  /* The client socket to the
                                     * master node.
                                     */
  private port: number;             // The port to listen on.
  
  /**
   * Constructor. Takes the port number, starts the server, starts
   * socket listening for the master node and starts listening for
   * clients on the given port.
   * @param port This is the port number to listen for clients  on.
   */
  constructor(port: number) {
    this.port = port;
    this.server = createServer();
    this.io = socketIO(this.server);
    this.startMasterClientSocket();
    this.listen();
  }
  
  /**
   * Instantiates a <code>MasterClientSocket</code> and then sets it
   * to attempt to connect to the head server, if there is one.
   */
  private startMasterClientSocket(): void {
    this.masterClientSocket = new MasterClientSocket(this, 'localhost', 8000);
    this.masterClientSocket.startSocketConnection();
  }
  
  /**
   * Logs to the console when disconnected from the master node.
   */
  public disconnectedFromMaster(): void {
    console.log('Disconnected from master server.');
  }
  
  /**
   * Starts listening for socket.io connections.
   */
  private listen(): void {
    this.server.listen(this.port, () => {
      console.log('Running server on port %s', this.port);
    });

    this.io.on('connect', this.connectEvent.bind(this));
  }
  
  /**
   * Handles new socket connections by wrapping them in a
   * <code>ClientSocket</code> object.
   * @param socket
   */
  private connectEvent(socket: any): void {
    console.log('Connection from client.');
    new ClientSocket(socket, this);
  }

}

/* Starts the node server running on the port given by the first
 * argument when run in terminal
 */
let server = new WorkerServer(parseInt(process.argv[2]));
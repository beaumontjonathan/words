// Module imports
import {createServer} from 'http';
import * as socketIO from 'socket.io';

// Project imports
import {WorkerServerSocket} from "./WorkerServerSocket";

/**
 * <h1>Master Server</h1>
 * This is the head node for the words socket.io application. It
 * accepts socket.io connections from worker nodes. These worker
 * nodes can emit messages to this server, which will then pass them
 * on to all other worker nodes. This is used to send messages or
 * updates to all relevant clients on all servers.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.1
 * @since   2017-06-05
 */
export class MasterServer {

    private io: SocketIO.Server;        // The socket.io server.
    private server: any;    // The app http server.
    private port: number;   // The port number.

    /**
     * Constructor. Sets up the server to listen and sets it
     * listening for connections on the given port.
     * @param port This is the port number to listen on.
     */
    constructor(port: number) {
        this.port = port;
        this.server = createServer();
        this.io = socketIO(this.server);
        this.listen();
    }

    /**
     * Starts listening for socket connections, and on a connection
     * it runs is handled by <code>connectEvent()</code>.
     */
    private listen(): void {
        this.server.listen(this.port, () => {
            console.log('Running server on port %s.', this.port);
        });

        this.io.on('connect', this.connectEvent.bind(this));
    }

    /**
     * Handles a new socket connection. Instantiates a new
     * <code>WorkerServerSocket</code> to manage socket events.
     * @param socket The new socket connection.
     */
    private connectEvent(socket: SocketIO.Socket): void {
        console.log('Connection from worker server.');
        new WorkerServerSocket(socket, this);
    }

}

/* Starts the program by instantiating a new server and running it on
 * port 8000.
 */
let server = new MasterServer(8000);
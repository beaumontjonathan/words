"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * <h1>Socket for Worker Servers on MasterServer</h1>
 * Contains code to deal with socket connection to worker sockets
 * from the socket.io master server. Handles events emitted from
 * Worker Servers.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.0
 * @since   2017-06-05
 */
var WorkerServerSocket = (function () {
    /**
     * Constructor. Sets the <code>socket</code> and
     * <code>masterServer</code fields and sets up the socket.
     * @param socket        The server socket.
     * @param masterServer  The MasterServer object.
     */
    function WorkerServerSocket(socket, masterServer) {
        this.socket = socket;
        this.masterServer = masterServer;
        this.bindEvents();
    }
    /**
     * Binds the socket.io events to their respective methods.
     */
    WorkerServerSocket.prototype.bindEvents = function () {
        // socket.io api events
        this.socket.on('disconnect', this.disconnectEvent.bind(this));
        this.socket.on('error', this.errorEvent.bind(this));
        // words api events
    };
    /**
     * Handles the socket <code>disconnect</code> event by logging it
     * to the console.
     * @param reason The string reason for the socket disconnecting
     */
    WorkerServerSocket.prototype.disconnectEvent = function (reason) {
        console.log('Disconnecting socket. Reason: ' + reason);
    };
    /**
     * Handles the socket <code>error</code> event by logging it to
     * the console.
     * @param error The socket error.
     */
    WorkerServerSocket.prototype.errorEvent = function (error) {
        console.log('Socket error: ');
        console.log(error);
    };
    return WorkerServerSocket;
}());
exports.WorkerServerSocket = WorkerServerSocket;
//# sourceMappingURL=WorkerServerSocket.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
var ClientSocket = (function () {
    /**
     * Constructor. Run when a new socket is connected. Sets up the
     * socket bindings and object parameters.
     * @param socket        The client socket.
     * @param workerServer  The WorkerServer object.
     */
    function ClientSocket(socket, workerServer) {
        this.socket = socket;
        this.workerServer = workerServer;
        this.bindEvents();
    }
    /**
     * Binds the socket.io events to their respective methods.
     */
    ClientSocket.prototype.bindEvents = function () {
        // socket.io api events
        this.socket.on('disconnect', this.disconnectEvent.bind(this));
        this.socket.on('error', this.errorEvent.bind(this));
        // words api events
    };
    /**
     * Handles the socket <code>disconnect</code> event by logging it
     * to the console.
     * @param reason The string reason for the socket disconnecting.
     */
    ClientSocket.prototype.disconnectEvent = function (reason) {
        console.log('Disconnecting socket. Reason: ' + reason);
    };
    /**
     * Handles the socket <code>error</code> event by logging it to
     * the console.
     * @param error
     */
    ClientSocket.prototype.errorEvent = function (error) {
        console.log('Socket error: ');
        console.log(error);
    };
    return ClientSocket;
}());
exports.ClientSocket = ClientSocket;
//# sourceMappingURL=ClientSocket.js.map
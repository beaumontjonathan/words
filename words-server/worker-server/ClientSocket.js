"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * <h1>Worker Server Client socket.io Socket Wrapper</h1>
 * Provides a wrapper class to deal with socket events from clients.
 * Communicates with <code>WorkerServer</code> to handle event
 * requests.
 *
 * @author  Jonathan Beaumont
 * @version 1.5.0
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
        this.socket.on('login request', this.loginRequestEvent.bind(this));
        this.socket.on('logout request', this.logoutRequestEvent.bind(this));
        this.socket.on('createAccount request', this.createAccountEvent.bind(this));
        this.socket.on('addWord request', this.addWordRequestEvent.bind(this));
        this.socket.on('removeWord request', this.removeWordRequestEvent.bind(this));
        this.socket.on('getWords request', this.getWordsRequestEvent.bind(this));
    };
    /**
     * Handles the socket <code>disconnect</code> event by logging it
     * to the console.
     * @param reason The string reason for the socket disconnecting.
     */
    ClientSocket.prototype.disconnectEvent = function (reason) {
        console.log('Disconnecting socket. Reason: ' + reason);
        this.workerServer.disconnectFromClient(this.socket);
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
    /**
     * Handles the socket <code>login request</code> event, then emits
     * the <code>login response</code> back to the client.
     * @param req Contains the login username and password information.
     */
    ClientSocket.prototype.loginRequestEvent = function (req) {
        var _this = this;
        this.workerServer.loginRequestEvent(req, this.socket, function (res) {
            _this.socket.emit('login response', res);
        });
    };
    /**
     * Handles the socket <code>logout request</code> event, then emits
     * the <code>logout response</code> back to the client.
     */
    ClientSocket.prototype.logoutRequestEvent = function () {
        var res = this.workerServer.logoutRequestEvent(this.socket);
        this.socket.emit('logout response', res);
    };
    /**
     * Handles the socket <code>createAccount request</code> event,
     * then emits the <code>createAccount response</code> back to the
     * client.
     * @param req Contains the account creation username and password.
     */
    ClientSocket.prototype.createAccountEvent = function (req) {
        var _this = this;
        this.workerServer.createAccountRequestEvent(req, this.socket, function (res) {
            _this.socket.emit('createAccount response', res);
        });
    };
    /**
     * Handles the socket <code>addWord request</code> event by passing
     * the request data to the <code>WorkerServer</code> method to
     * process.
     * @param req Contains the add word data.
     */
    ClientSocket.prototype.addWordRequestEvent = function (req) {
        this.workerServer.addWordRequestEvent(req, this.socket);
    };
    /**
     * Handles the socket <code>removeWord request</code> event by
     * passing the request data to the <code>WorkerServer</code> method
     * for processing.
     * @param req Contains the remove word data.
     */
    ClientSocket.prototype.removeWordRequestEvent = function (req) {
        this.workerServer.removeWordRequestEvent(req, this.socket);
    };
    /**
     * Handles the socket <code>getWords request</code> event by
     * passing the request to the <code>WorkerServer</code> method for
     * processing.
     */
    ClientSocket.prototype.getWordsRequestEvent = function () {
        this.workerServer.getWordRequestEvent(this.socket);
    };
    return ClientSocket;
}());
exports.ClientSocket = ClientSocket;
//# sourceMappingURL=ClientSocket.js.map
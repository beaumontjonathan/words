"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Module imports
var socketIOClient = require("socket.io-client");
/**
 * <h1>Client Socket for socket.io Connection to Master Server</h1>
 * Contains code to handle a node server connection to the master
 * server.
 *
 * @author  Jonathan Beaumont
 * @version 1.2.0
 * @since   2017-06-05
 */
var MasterClientSocket = (function () {
    /**
     * Constructor. Sets the fields for connecting to the master node.
     * @param workerServer  The workerServer which instantiated this.
     * @param masterHost    The hostname of the master node. (Optional)
     * @param masterPort    The port of the master node. (Optional)
     */
    function MasterClientSocket(workerServer, masterHost, masterPort) {
        if (masterHost === void 0) { masterHost = MasterClientSocket.DEFAULT_HOST; }
        if (masterPort === void 0) { masterPort = MasterClientSocket.DEFAULT_PORT; }
        this.workerServer = workerServer;
        this.masterPort = masterPort;
        this.masterHost = masterHost;
    }
    /**
     * Starts attempting to connect to the master node on the given
     * hostname and port.
     */
    MasterClientSocket.prototype.startSocketConnection = function () {
        this.socket = socketIOClient('http://' + this.masterHost + ':' + this.masterPort);
        this.bindEvents();
    };
    /**
     * Binds the socket.io events to their respective methods.
     */
    MasterClientSocket.prototype.bindEvents = function () {
        // socket.io api events
        this.socket.on('connect', this.connectEvent.bind(this));
        this.socket.on('disconnect', this.disconnectEvent.bind(this));
        // words api events
        this.socket.on('addWordMaster response', this.addWordMasterResponse.bind(this));
        this.socket.on('removeWordMaster response', this.removeWordMasterResponse.bind(this));
    };
    /**
     * Handles the socket <code>connect</code> event by running a
     * <code>WorkerServer</code> method.
     */
    MasterClientSocket.prototype.connectEvent = function () {
        this.workerServer.connectedToMaster(true);
    };
    /**
     * Handles the socket <code>disconnect</code> event by running a
     * <code>WorkerServer</code> method.
     * @param reason  A string explaining the reason for the socket
     *                disconnecting.
     */
    MasterClientSocket.prototype.disconnectEvent = function (reason) {
        this.workerServer.connectedToMaster(false, reason);
    };
    /**
     * Sends an add word request to the master server along with the
     * request data about adding the word.
     * @param req Contains the add word information.
     */
    MasterClientSocket.prototype.addWordMasterRequest = function (req) {
        this.socket.emit('addWordMaster request', req);
    };
    /**
     * Handles the socket <code>addWordMaster response</code> by
     * running a <code>WorkerServer</code> method.
     * @param res Contains the add word information.
     */
    MasterClientSocket.prototype.addWordMasterResponse = function (res) {
        this.workerServer.addWordMasterResponse(res);
    };
    /**
     * Send a remove word request to the master server along with the
     * request data about removing the word.
     * @param req Contains the add word information.
     */
    MasterClientSocket.prototype.removeWordMasterRequest = function (req) {
        this.socket.emit('removeWordMaster request', req);
    };
    /**
     * Handles the socket <code>removeWordMaster response</code> by
     * running a <code>WorkerServer</code> method.
     * @param res Contains the remove word information.
     */
    MasterClientSocket.prototype.removeWordMasterResponse = function (res) {
        this.workerServer.removeWordMasterResponse(res);
    };
    return MasterClientSocket;
}());
// Default values for the hostname and port of the master node.
MasterClientSocket.DEFAULT_HOST = 'localhost';
MasterClientSocket.DEFAULT_PORT = 9000;
exports.MasterClientSocket = MasterClientSocket;
//# sourceMappingURL=MasterClientSocket.js.map
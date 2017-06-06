"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Module imports
var http_1 = require("http");
var socketIO = require("socket.io");
// Project imports
var MasterClientSocket_1 = require("./MasterClientSocket");
var ClientSocket_1 = require("./ClientSocket");
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
var WorkerServer = (function () {
    /**
     * Constructor. Takes the port number, starts the server, starts
     * socket listening for the master node and starts listening for
     * clients on the given port.
     * @param port This is the port number to listen for clients  on.
     */
    function WorkerServer(port) {
        this.port = port;
        this.server = http_1.createServer();
        this.io = socketIO(this.server);
        this.startMasterClientSocket();
        this.listen();
    }
    /**
     * Instantiates a <code>MasterClientSocket</code> and then sets it
     * to attempt to connect to the head server, if there is one.
     */
    WorkerServer.prototype.startMasterClientSocket = function () {
        this.masterClientSocket = new MasterClientSocket_1.MasterClientSocket(this, 'localhost', 8000);
        this.masterClientSocket.startSocketConnection();
    };
    /**
     * Logs to the console when disconnected from the master node.
     */
    WorkerServer.prototype.disconnectedFromMaster = function () {
        console.log('Disconnected from master server.');
    };
    /**
     * Starts listening for socket.io connections.
     */
    WorkerServer.prototype.listen = function () {
        var _this = this;
        this.server.listen(this.port, function () {
            console.log('Running server on port %s', _this.port);
        });
        this.io.on('connect', this.connectEvent.bind(this));
    };
    /**
     * Handles new socket connections by wrapping them in a
     * <code>ClientSocket</code> object.
     * @param socket
     */
    WorkerServer.prototype.connectEvent = function (socket) {
        console.log('Connection from client.');
        new ClientSocket_1.ClientSocket(socket, this);
    };
    return WorkerServer;
}());
exports.WorkerServer = WorkerServer;
/* Starts the node server running on the port given by the first
 * argument when run in terminal
 */
var server = new WorkerServer(parseInt(process.argv[2]));
//# sourceMappingURL=WorkerServer.js.map
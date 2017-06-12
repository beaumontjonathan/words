"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Module imports
var http_1 = require("http");
var socketIO = require("socket.io");
// Project imports
var WorkerServerSocket_1 = require("./WorkerServerSocket");
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
var MasterServer = (function () {
    /**
     * Constructor. Sets up the server to listen and sets it
     * listening for connections on the given port.
     * @param port This is the port number to listen on.
     */
    function MasterServer(port) {
        this.port = port;
        this.server = http_1.createServer();
        this.io = socketIO(this.server);
        this.listen();
    }
    /**
     * Starts listening for socket connections, and on a connection
     * it runs is handled by <code>connectEvent()</code>.
     */
    MasterServer.prototype.listen = function () {
        var _this = this;
        this.server.listen(this.port, function () {
            console.log('Running server on port %s.', _this.port);
        });
        this.io.on('connect', this.connectEvent.bind(this));
    };
    /**
     * Handles a new socket connection. Instantiates a new
     * <code>WorkerServerSocket</code> to manage socket events.
     * @param socket The new socket connection.
     */
    MasterServer.prototype.connectEvent = function (socket) {
        console.log('Connection from worker server.');
        new WorkerServerSocket_1.WorkerServerSocket(socket, this);
    };
    return MasterServer;
}());
exports.MasterServer = MasterServer;
/* Starts the program by instantiating a new server and running it on
 * port 8000.
 */
var server = new MasterServer(8000);

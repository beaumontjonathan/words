"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Module imports
var socketIOClient = require("socket.io-client");
/**
 * <h1>Client Socket API Test</h1>
 * A client socket wrapper to help test and build the words
 * application socket.io API. Connects to a Worker Server node.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.0
 * @since   2017-06-06
 */
var ClientSocket = (function () {
    /**
     * Constructor. Sets the host and port fields;
     * @param host  The hostname of the server.
     * @param port  The port number of the server.
     */
    function ClientSocket(host, port) {
        this.host = host;
        this.port = port;
    }
    /**
     * Starts attempting to connect to the server on the given host and
     * port, then binds the socket.io events to methods.
     */
    ClientSocket.prototype.startSocketConnection = function () {
        this.socket = socketIOClient('http://' + this.host + ':' + this.port);
        this.bindEvents();
    };
    /**
     * Binds the socket.io events to their respective methods.
     */
    ClientSocket.prototype.bindEvents = function () {
        // socket.io api events
        this.socket.on('connect', this.connectEvent.bind(this));
        this.socket.on('disconnect', this.disconnectEvent.bind(this));
        this.socket.on('error', this.errorEvent.bind(this));
        // words api events
    };
    /**
     * Handles the socket <code>connect</code event by logging it to
     * the console.
     */
    ClientSocket.prototype.connectEvent = function () {
        console.log('Connected to worker node.');
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
/* Starts a ClientSocket object with the hostname and port number
 * being respectively the cli arguments.
 */
new ClientSocket(process.argv[2], parseInt(process.argv[3])).startSocketConnection();

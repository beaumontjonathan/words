"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Module imports
var http_1 = require("http");
var socketIO = require("socket.io");
// Project imports
var MasterClientSocket_1 = require("./MasterClientSocket");
var ClientSocket_1 = require("./ClientSocket");
var LoginManager_1 = require("./LoginManager");
var WordsDatabaseHandler_1 = require("./WordsDatabaseHandler");
/**
 * <h1>Worker Server</h1>
 * This is the server worker node for the socket.io based words
 * application. Handles requests from clients and returns responses
 * to them. Allows clients to send messages to each other by sending
 * messages via the master node, which emits messages to all workers.
 *
 * @author  Jonathan Beaumont
 * @version 1.2.0
 * @since   2017-06-05
 */
var WorkerServer = (function () {
    /**
     * Constructor. Takes the port number, starts the server, starts
     * socket listening for the master node, establishes a database
     * pool, and starts listening for clients on the given port.
     * @param port This is the port number to listen for clients  on.
     */
    function WorkerServer(port) {
        this.port = port;
        this.loginManager = new LoginManager_1.LoginManager();
        this.dbHandler = new WordsDatabaseHandler_1.WordsDatabaseHandler();
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
     * Removes the socket login data from the <code>LoginManager</code>
     * when the client disconnects.
     * @param socket  The socket which has just disconnected.
     */
    WorkerServer.prototype.disconnectFromClient = function (socket) {
        this.loginManager.logout(socket);
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
    /**
     * Handles the login event. Allows the user to login if they have
     * not already logged in and if their login username and password
     * are correct.
     * @param req       The login request data.
     * @param socket    The socket trying to login.
     * @param callback  Function to be run after the login status has
     *                  been determined.
     */
    WorkerServer.prototype.loginRequestEvent = function (req, socket, callback) {
        var _this = this;
        // Instantiates the return object containing login response.
        var res = { success: false };
        res.invalidUsername = !this.isValidUsername(req.username);
        res.invalidPassword = !this.isValidPassword(req.password);
        /* Return the login response if the password or username are not
         * in a valid format.
         */
        if (res.invalidUsername || res.invalidPassword) {
            callback(res);
            // Returns the login response if the user if already logged in.
        }
        else if (this.loginManager.isLoggedIn(socket)) {
            res.alreadyLoggedIn = true;
            callback(res);
        }
        else {
            // Returns the response after checking the login credentials.
            this.checkLoginDetails(req.username, req.password, function (incorrectUsername, incorrectPassword) {
                res.incorrectUsername = incorrectUsername;
                res.incorrectPassword = incorrectPassword;
                if (!incorrectUsername && !incorrectPassword) {
                    res.success = true;
                    _this.loginManager.login(req.username, socket);
                }
                callback(res);
            });
        }
    };
    /**
     * Checks whether the username is in a valid format.
     * <p>
     * A valid format requires the username to be between 5 and 31
     * characters long, starting with a letter, and only contains
     * letters, number dn the underscore.
     * @param username    The username to check.
     * @returns {boolean} Whether the username is in a valid format.
     */
    WorkerServer.prototype.isValidUsername = function (username) {
        if (typeof username === 'string' && username != '') {
            var patt = new RegExp('^[a-zA-Z]{1}[a-zA-Z0-9_]{4,31}$');
            if (patt.test(username)) {
                return true;
            }
            return false;
        }
        return false;
    };
    /**
     * Checks whether the password is in a valid format.
     * <p>
     * A valid format requires the password to be between 5 and 31
     * characters long, containing only letters, numbers, spaces and
     * the special characters !, ", £, $, %, ^, &, *, ( and ).
     * @param password    The password to check.
     * @returns {boolean} Whether the password is in a valid format.
     */
    WorkerServer.prototype.isValidPassword = function (password) {
        if (typeof password === 'string' && password != '') {
            var patt = new RegExp('^[a-zA-Z 0-9 !"£$%^&*()]{5,31}$');
            if (patt.test(password)) {
                return true;
            }
            return false;
        }
        return false;
    };
    /**
     * Uses the <code>WordsDatabaseHandler</code> to check whether the
     * login credentials provided by the user associate with those in
     * the database.
     * @param username  The username to check.
     * @param password  The password to check
     * @param callback  Function to be run once the login username and
     *                  password details have been verified.
     */
    WorkerServer.prototype.checkLoginDetails = function (username, password, callback) {
        this.dbHandler.verifyCredentials(username, password, function (incorrectUsername, incorrectPassword) {
            callback(!incorrectUsername, !incorrectPassword);
        });
    };
    /**
     * Handles the logout event. Emits the response of the login
     * request back to the client.
     * @param socket
     * @returns {LogoutResponse}
     */
    WorkerServer.prototype.logoutRequestEvent = function (socket) {
        var res = { success: false, wasLoggedIn: false };
        if (this.loginManager.isLoggedIn(socket)) {
            res.wasLoggedIn = true;
            if (this.loginManager.logout(socket)) {
                res.success = true;
            }
        }
        return res;
    };
    WorkerServer.prototype.createAccountRequestEvent = function (req, socket, callback) {
        var res = { success: false };
        res.invalidUsername = !this.isValidUsername(req.username);
        res.invalidPassword = !this.isValidPassword(req.password);
        if (res.invalidUsername || res.invalidPassword) {
            callback(res);
        }
        else {
            this.dbHandler.addUser(req.username, req.password, function (success, id) {
                res.success = success;
                if (!success) {
                    res.usernameTaken = false;
                }
                callback(res);
            });
        }
    };
    return WorkerServer;
}());
exports.WorkerServer = WorkerServer;
/* Starts the node server running on the port given by the first
 * argument when run in terminal
 */
var server = new WorkerServer(parseInt(process.argv[2]));
//# sourceMappingURL=WorkerServer.js.map
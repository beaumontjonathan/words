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
 * @version 1.3.0
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
        this.masterSocketConnected = false;
        this.masterClientSocket = new MasterClientSocket_1.MasterClientSocket(this, 'localhost', 8000);
        this.masterClientSocket.startSocketConnection();
    };
    /**
     * Runs whenever the socket to the master server is connected or
     * disconnected, updating the <code>masterSocketConnected</code>
     * field, and logging a message explaining the socket's status to
     * the screen.
     * @param connected
     * @param reason
     */
    WorkerServer.prototype.connectedToMaster = function (connected, reason) {
        this.masterSocketConnected = connected;
        if (connected) {
            console.log('Connected to master server.');
        }
        else {
            console.log('Disconnected from master server. ' + reason);
        }
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
     * Checks whether the word is in a valid format.
     * <p>
     * A valid format required the word to be between 1 and 31
     * characters long, containing only letters and dashes.
     * @param word  The word to check.
     * @returns {boolean} Whether the word is in a valid format.
     */
    WorkerServer.prototype.isValidWord = function (word) {
        if (typeof word === 'string' && word != '') {
            var patt = new RegExp('^[a-zA-Z-]{1,31}$');
            return patt.test(word);
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
    /**
     * Handles the create account event. Attempts to add a new user to
     * the database if the username and password are of a valid format.
     * Returns details of the success of adding the new user to a
     * callback function.
     * @param req Contains the new username and password information.
     * @param socket  The socket from which the request was made.
     * @param callback  Function to be run after the request.
     */
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
    /**
     * Processes a request to add a word. Returns the success of adding
     * a word to a callback function.
     * @param req Contains the data for adding a new word.
     * @param socket  The socket from which the request came.
     */
    WorkerServer.prototype.addWordRequestEvent = function (req, socket) {
        var _this = this;
        // Sets up the add word response.
        var res = { success: false, word: req.word, isLoggedIn: false, isValidWord: false, wordAlreadyAdded: false };
        if (this.loginManager.isLoggedIn(socket)) {
            // If the user is logged in.
            res.isLoggedIn = true;
            if (this.isValidWord(req.word)) {
                // Tells the response that the word is in a valid format.
                res.isValidWord = true;
                var username_1 = this.loginManager.getUsernameFromSocket(socket);
                // Checks whether the user has already added the word.
                this.dbHandler.containsWord(username_1, req.word, function (containsWord) {
                    if (containsWord) {
                        /* If the user already has the word, then and response
                         * is send explaining so.
                         */
                        res.wordAlreadyAdded = true;
                        _this.addWordResponse(socket, res);
                    }
                    else {
                        /* If the user does not have the word, then the word is
                         * added.
                         */
                        _this.dbHandler.addWord(username_1, req.word, function (addedSuccessfully) {
                            res.success = addedSuccessfully;
                            if (addedSuccessfully) {
                                /* If the word was added to the database successfully
                                 * then the request is sent to the master server and
                                 * to logged in clients with the same username.
                                 */
                                res.success = true;
                                _this.addWordMasterRequest(username_1, res);
                                _this.addWordForAllConnectedClients(username_1, res);
                            }
                            else {
                                /* If the word was not added to the database
                                 * successfully then the response if sent back to the
                                 * original client.
                                 */
                                _this.addWordResponse(socket, res);
                            }
                        });
                    }
                });
            }
            else {
                /* If the word is not in a valid format then the response is
                 * sent.
                 */
                this.addWordResponse(socket, res);
            }
        }
        else {
            // If the user is not logged in.
            this.addWordResponse(socket, res);
        }
    };
    /**
     * Sends a request to the master server containing the add word
     * data.
     * @param username  Username of the user who added the word.
     * @param res Contains information about adding the word.
     */
    WorkerServer.prototype.addWordMasterRequest = function (username, res) {
        if (this.masterSocketConnected) {
            this.masterClientSocket.addWordMasterRequest({ username: username, res: res });
        }
    };
    /**
     * Handles a response from the master server about a word being
     * added. Emits a message to all connected users with the username
     * matching that of the add word username.
     * @param res Contains data about the new word being added.
     */
    WorkerServer.prototype.addWordMasterResponse = function (res) {
        this.addWordForAllConnectedClients(res.username, res.res);
    };
    /**
     * Runs the <code>addWordResponse</code> method, emitting an add
     * word response, for all logged in sockets with the username
     * provided.
     * @param username  The username of the user who added the word.
     * @param res Contains information about the word which as added.
     */
    WorkerServer.prototype.addWordForAllConnectedClients = function (username, res) {
        var _this = this;
        this.loginManager.forEachSocketWithUsername(username, function (socket) {
            _this.addWordResponse(socket, res);
        });
    };
    /**
     * Emits a socket.io <code>addWord response</code> message to a
     * socket, containing information about the success of the word.
     * @param socket  The socket to send the response to.
     * @param res Contains the information about adding the word.
     */
    WorkerServer.prototype.addWordResponse = function (socket, res) {
        socket.emit('addWord response', res);
    };
    return WorkerServer;
}());
exports.WorkerServer = WorkerServer;
/* Starts the node server running on the port given by the first
 * argument when run in terminal
 */
var server = new WorkerServer(parseInt(process.argv[2]));
//# sourceMappingURL=WorkerServer.js.map
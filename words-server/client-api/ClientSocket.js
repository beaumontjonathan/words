"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Module imports
var socketIOClient = require("socket.io-client");
var readline_1 = require("readline");
/**
 * <h1>Client Socket API Test</h1>
 * A client socket wrapper to help test and build the words
 * application socket.io API. Connects to a Worker Server node.
 *
 * @author  Jonathan Beaumont
 * @version 1.5.0
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
        this.socketConnected = false;
        this.startAcceptingLines();
    }
    /**
     * Starts reading lines from the terminal to be treated as commands
     * to process.
     */
    ClientSocket.prototype.startAcceptingLines = function () {
        readline_1.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
        })
            .on('line', this.processCommand.bind(this));
    };
    /**
     * Takes a command from the user and determines the action to carry
     * out based on it.
     * @param command
     */
    ClientSocket.prototype.processCommand = function (command) {
        // Set the default response.
        var response = 'Unrecognised command';
        var words = command.split(' ');
        // Changes the response based on the first words of the command.
        if (words.length !== 0) {
            switch (words[0].toLowerCase()) {
                // Exit command
                case "exit":
                    console.log('Goodbye!');
                    process.exit(0);
                    this.socket.disconnect();
                    break;
                // Login command
                case "login":
                    if (words.length !== 3) {
                        response = 'Usage: login <username> <password>';
                    }
                    else if (this.socketConnected) {
                        this.loginRequest({ username: words[1], password: words[2] });
                        response = 'Attempting login...';
                    }
                    else {
                        response = 'You are not connected to the server!\nTry logging in later.';
                    }
                    break;
                // Logout command
                case "logout":
                    if (command !== "logout") {
                        response = 'Usage: logout';
                    }
                    else {
                        response = 'Attempting logout...';
                        this.logoutRequest();
                    }
                    break;
                // Create account command
                case "create":
                    if (words.length === 4 && words[1] === 'account') {
                        response = 'Attempting account creation...';
                        this.createAccountRequest({ username: words[2], password: words[3] });
                    }
                    else {
                        response = 'Usage: create account <username> <password>';
                    }
                    break;
                // Add word command
                case "add":
                    if (words.length === 3 && words[1] === 'word') {
                        response = 'Attempting to add word...';
                        this.addWordRequest({ word: command.replace('add word ', '').trim() });
                    }
                    else {
                        response = 'Usage: add word <word>';
                    }
                    break;
                // Remove word command
                case "remove":
                    if (words.length === 3 && words[1] === 'word') {
                        response = 'Attempting to remove word...';
                        this.removeWordRequest({ word: command.replace('remove word ', '').trim() });
                    }
                    else {
                        response = 'Usage: remove word <word>';
                    }
                    break;
                // Get words command
                case "get":
                    if (words[1] === 'words') {
                        this.getWordsRequest();
                        response = 'Attempting to get your words...';
                    }
                    else {
                        response = 'Usage: get words';
                    }
                    break;
            }
        }
        console.log(response);
    };
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
        this.socket.on('login response', this.loginResponse.bind(this));
        this.socket.on('logout response', this.logoutResponse.bind(this));
        this.socket.on('createAccount response', this.createAccountResponse.bind(this));
        this.socket.on('addWord response', this.addWordResponse.bind(this));
        this.socket.on('removeWord response', this.removeWordResponse.bind(this));
        this.socket.on('getWords response', this.getWordsResponse.bind(this));
    };
    /**
     * Handles the socket <code>connect</code event by logging it to
     * the console.
     */
    ClientSocket.prototype.connectEvent = function () {
        this.socketConnected = true;
        console.log('Connected to worker node.');
    };
    /**
     * Handles the socket <code>disconnect</code> event by logging it
     * to the console.
     * @param reason The string reason for the socket disconnecting.
     */
    ClientSocket.prototype.disconnectEvent = function (reason) {
        this.socketConnected = false;
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
    /**
     * Emits a login request to the server.
     * @param loginData The username and password for the user.
     */
    ClientSocket.prototype.loginRequest = function (loginData) {
        this.socket.emit('login request', loginData);
    };
    /**
     * Processes the response to the login request.
     * @param data  Contains data about the success of the login.
     */
    ClientSocket.prototype.loginResponse = function (data) {
        if (data.success) {
            console.log('Login successful.');
        }
        else if (data.alreadyLoggedIn) {
            console.log('Login unsuccessful. You are already logged in.');
        }
        else if (data.invalidUsername) {
            console.log('Login unsuccessful. Username invalid.');
        }
        else if (data.invalidPassword) {
            console.log('Login unsuccessful. Password invalid.');
        }
        else if (data.incorrectUsername) {
            console.log('Login unsuccessful. Username incorrect.');
        }
        else if (data.incorrectPassword) {
            console.log('Login unsuccessful. Password incorrect.');
        }
    };
    /**
     * Emits a logout request to the server.
     */
    ClientSocket.prototype.logoutRequest = function () {
        this.socket.emit('logout request');
    };
    /**
     * Processes the response to the logout request.
     * @param data  Contains data about the success of the logout.
     */
    ClientSocket.prototype.logoutResponse = function (data) {
        if (data.success) {
            console.log('Logout successful.');
        }
        else if (data.wasLoggedIn) {
            console.log('Logout unsuccessful, but you were logged in?');
        }
        else {
            console.log('You must login before you can logout.');
        }
    };
    /**
     * Emits an account creation request to the server, containing the
     * username and password information.
     * @param data  Contains the new username and password.
     */
    ClientSocket.prototype.createAccountRequest = function (data) {
        this.socket.emit('createAccount request', data);
    };
    /**
     * Processes the response to the account creation request.
     * @param data  Contains data about the success of the account
     *              creation attempt.
     */
    ClientSocket.prototype.createAccountResponse = function (data) {
        if (data.success) {
            console.log('Account successfully created.');
        }
        else if (data.invalidUsername) {
            console.log('Invalid username.');
        }
        else if (data.invalidPassword) {
            console.log('Invalid password.');
        }
        else if (data.usernameTaken) {
            console.log('Username taken. Please try another.');
        }
    };
    /**
     * Emits an add word request to the server, containing the word to
     * be added.
     * @param req Contains the new word.
     */
    ClientSocket.prototype.addWordRequest = function (req) {
        this.socket.emit('addWord request', req);
    };
    /**
     * Processes the response to adding a new word. This may be after
     * this socket added a word, in which case there may have been an
     * error while adding the word, or the word may have been added
     * from another socket connection somewhere in the system.
     * @param res Contains information about the word addition.
     */
    ClientSocket.prototype.addWordResponse = function (res) {
        //todo notLoggedIn
        if (res.success) {
            console.log('Word "%s" added successfully.', res.word);
        }
        else if (res.wordAlreadyAdded) {
            console.log('Word already added.');
        }
        else {
            console.log('Error, word not added.');
        }
    };
    /**
     * Emits a remove word request to the server, containing the word
     * to be removed.
     * @param req Contains the word to be removed.
     */
    ClientSocket.prototype.removeWordRequest = function (req) {
        this.socket.emit('removeWord request', req);
    };
    /**
     * Processes the response to remove the word. This may be after
     * this socket removed a word, in which case there may have been
     * and error while removing the word, or the word may have been
     * added from another socket connected somewhere else.
     * @param res Contains information about the word removal.
     */
    ClientSocket.prototype.removeWordResponse = function (res) {
        if (res.success) {
            console.log('Word "%s" successfully removed.', res.word);
        }
        else if (!res.isLoggedIn) {
            console.log('You must login before you can attempt to remove word.');
        }
        else if (!res.isValidWord) {
            console.log('Invalid word.');
        }
        else if (res.wordNotYetAdded) {
            console.log('Word not yet removed.');
        }
        else {
            console.log('Remove word failure.');
        }
    };
    /**
     * Emits a get words request to the server.
     */
    ClientSocket.prototype.getWordsRequest = function () {
        this.socket.emit('getWords request');
    };
    /**
     * Processes the response to the get words event. If getting the
     * words was successful, then it will display each of the words and
     * their corresponding id fields, otherwise it will log why the
     * request was not successful; e.g. the user wasn't logged in.
     * @param res Contains information about the get words response.
     */
    ClientSocket.prototype.getWordsResponse = function (res) {
        if (res.success) {
            if (res.words.length > 0) {
                console.log('Your words:');
                res.words.forEach(function (word, index) {
                    console.log('  %s: %s', word.id, word.word);
                });
            }
            else {
                console.log('You do not have any words.');
            }
        }
        else if (!res.isLoggedIn) {
            console.log('You must login before you can attempt to get your words.');
        }
        else {
            console.log('Unknown error getting your words.');
        }
    };
    return ClientSocket;
}());
exports.ClientSocket = ClientSocket;
/* Starts a ClientSocket object with the hostname and port number
 * being respectively the cli arguments.
 */
new ClientSocket(process.argv[2], parseInt(process.argv[3])).startSocketConnection();
//# sourceMappingURL=ClientSocket.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * <h1>Login Manager</h1>
 * Stores socket.io sockets and their corresponding passwords and
 * provides methods to check whether a socket or user has logged in,
 * allows more logged in sockets to be added, and allows logged in
 * sockets to logout.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.2
 * @since   2017-06-07
 */
var LoginManager = (function () {
    /**
     * Constructor. Instantiates the empty <code>sockets</code> and
     * <code>usernames</code> arrays.
     */
    function LoginManager() {
        this.sockets = [];
        this.usernames = [];
    }
    /**
     * Checks whether the a user has logged in.
     * @param data  Either a socket or username to check the login
     *              status of.
     * @returns {boolean} Whether the user has logged in.
     */
    LoginManager.prototype.isLoggedIn = function (data) {
        // If the data is a username.
        if (typeof data === 'string') {
            return (this.usernames.indexOf(data) !== -1);
            // If the data is a socket.
        }
        else {
            return (this.sockets.indexOf(data) !== -1);
        }
    };
    /**
     * Adds a username/socket pair to the arrays of logged in users.
     * @param username  The username logging in.
     * @param socket    The socket connected to the client logging in.
     */
    LoginManager.prototype.login = function (username, socket) {
        console.log(username + ' is logging in.');
        this.usernames.push(username);
        this.sockets.push(socket);
    };
    /**
     * Removes a username/socket pair from the arrays of logged in
     * users.
     * @param socket  The socket connected to the client logging out.
     * @returns {boolean} Whether the logout was successful.
     */
    LoginManager.prototype.logout = function (socket) {
        if (this.isLoggedIn(socket)) {
            console.log(this.getUsernameFromSocket(socket) + ' is logging out.');
            var index = this.sockets.indexOf(socket);
            this.usernames.splice(index);
            this.sockets.splice(index);
            return true;
        }
        else {
            return false;
        }
    };
    /**
     * Returns the username corresponding to a socket. If the socket
     * has not logged in, this is undefined.
     * @param socket  The socket connected to the client.
     * @returns {string}  The username linked to the socket.
     */
    LoginManager.prototype.getUsernameFromSocket = function (socket) {
        var username;
        if (this.isLoggedIn(socket)) {
            username = this.usernames[this.sockets.indexOf(socket)];
        }
        return username;
    };
    /**
     * Runs a callback function with the socket connection for each
     * logged in user corresponding to the username provided.
     * @param username  The username to find sockets corresponding to.
     * @param callback  Function to be run with each user.
     */
    LoginManager.prototype.forEachSocketWithUsername = function (username, callback) {
        var _this = this;
        this.usernames.forEach(function (iUsername, index) {
            if (iUsername === username) {
                callback(_this.sockets[index]);
            }
        });
    };
    return LoginManager;
}());
exports.LoginManager = LoginManager;
//# sourceMappingURL=LoginManager.js.map
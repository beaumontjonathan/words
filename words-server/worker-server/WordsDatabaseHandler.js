"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Module imports
var mysql_1 = require("mysql");
var bcrypt_1 = require("bcrypt");
// Database login details.
var DATABASE_HOST = 'odroid-c2';
var DATABASE_USER = 'jonny';
var DATABASE_PASSWORD = 'password';
/**
 * <h1>User Database Handler</h1>
 * Provides a wrapper for the user mysql database. Allow the
 * addition, deletion, search and credential checks for user data.
 * Uses encryption to store salted and hashed passwords in the
 * database, and then encrypts again to verify their login
 * credentials.
 *
 * @author  Jonathan Beaumont
 * @version 1.0.0
 * @since   2017-06-08
 */
var WordsDatabaseHandler = (function () {
    /**
     * Constructor. Creates the database pool.
     */
    function WordsDatabaseHandler() {
        this.pool = mysql_1.createPool({
            host: DATABASE_HOST,
            user: DATABASE_USER,
            password: DATABASE_PASSWORD,
            database: WordsDatabaseHandler.DATABASE_NAME
        });
    }
    /**
     * Adds a new user to the database, if the username provided does
     * not already belong to a user.
     * @param username  The username of the new user.
     * @param password  The password of the new user.
     * @param callback  Function to be run after user has been added.
     */
    WordsDatabaseHandler.prototype.addUser = function (username, password, callback) {
        this.pool.getConnection(function (err, conn) {
            if (err) {
                console.log('Error getting connection: ' + err);
                callback(false);
            }
            // Hash the password.
            bcrypt_1.hash(password, 10)
                .then(function (hash) {
                var statement = 'INSERT INTO ' + WordsDatabaseHandler.TABLE_USERS + ' (' + WordsDatabaseHandler.USERS_FIELD_USERNAME + ', ' + WordsDatabaseHandler.USERS_FIELD_PASSWORD + ') VALUES (?, ?)';
                // Queries the database with an add user query.
                conn.query(statement, [username, hash], function (err, res) {
                    conn.release();
                    /* If there is an error or the username is taken, then
                     * return false to the callback function. Otherwise,
                     * return true.
                     */
                    if (err) {
                        callback(false);
                    }
                    else if (typeof res === 'object') {
                        callback(res.affectedRows === 1, res.insertId);
                    }
                    else {
                        callback(false);
                    }
                });
                /* Return false to callback function if there was an error while
                 * hashing.
                 */
            }, function (hashError) {
                console.log('Password hashing error: ' + hashError);
                callback(false);
            });
        });
    };
    /**
     * Deletes a user from the database, if the exist in it.
     * @param username  The username of the user to delete.
     * @param callback  Function to be run after user deletion.
     */
    WordsDatabaseHandler.prototype.deleteUser = function (username, callback) {
        this.pool.getConnection(function (err, conn) {
            /* If connection error and callback exists then return false to
             * the callback.
             */
            if (err) {
                if (callback)
                    callback(false);
            }
            else {
                var statement = 'DELETE FROM ' + WordsDatabaseHandler.TABLE_USERS + ' WHERE ' + WordsDatabaseHandler.USERS_FIELD_USERNAME + '=?';
                // Attempt to delete the user from the database.
                conn.query(statement, username, function (err, res) {
                    conn.release();
                    /* If the username is not in the database of there is an
                     * error while running the query, return false to the
                     * callback. Otherwise, return true;
                     */
                    if (callback) {
                        if (err) {
                            callback(false);
                        }
                        else if (typeof res === 'object') {
                            callback(res.affectedRows === 1);
                        }
                        else {
                            callback(false);
                        }
                    }
                });
            }
        });
    };
    /**
     * Returns whether or not a user exists in the database.
     * @param field The field to check by. Either the id or the
     *              username.
     * @param data  The username or id of the user.
     * @param callback  Function to be run after the check.
     */
    WordsDatabaseHandler.prototype.containsUser = function (field, data, callback) {
        this.pool.getConnection(function (err, conn) {
            if (err)
                throw err;
            /* If the field if not the if or username, return false to the
             * callback function.
             */
            if (field !== WordsDatabaseHandler.USERS_FIELD_ID && field !== WordsDatabaseHandler.USERS_FIELD_USERNAME) {
                callback(false);
            }
            var statement = 'SELECT * FROM ' + WordsDatabaseHandler.TABLE_USERS + ' WHERE ' + field + '=?';
            // Attempt the query.
            conn.query(statement, data, function (err, res) {
                conn.release();
                /* If there is an error while running the query, or the user
                 * does not exist in the database, return false to the
                 * callback function. Otherwise, return true.
                 */
                if (err) {
                    callback(false);
                }
                else if (typeof res === 'object') {
                    callback(res.length === 1);
                }
                else {
                    callback(false);
                }
            });
        });
    };
    /**
     * Fetches the id corresponding to a username of a user and returns
     * its value to a callback function.. If the username is not
     * registered, then undefined is returned to the callback.
     * @param username  The username to find the id of.
     * @param callback  Function to be run after the id has been found.
     */
    WordsDatabaseHandler.prototype.getIdFromUsername = function (username, callback) {
        this.pool.getConnection(function (err, conn) {
            if (err)
                throw err;
            var statement = 'SELECT ' + WordsDatabaseHandler.USERS_FIELD_ID + ' from ' + WordsDatabaseHandler.TABLE_USERS + ' where username=?';
            conn.query(statement, username, function (err, res) {
                conn.release();
                if (err) {
                    callback(undefined);
                }
                else if (typeof res === 'object') {
                    if (res.length === 1)
                        callback(res[0].id);
                    else
                        callback(undefined);
                }
                else {
                    callback(undefined);
                }
            });
        });
    };
    /**
     * Verifies whether a username and password correspond to a user
     * entry in the database. Uses encryption to store and verify the
     * password.
     * @param username  Username to check.
     * @param password  Password to check.
     * @param callback  Function to be run after the check.
     */
    WordsDatabaseHandler.prototype.verifyCredentials = function (username, password, callback) {
        this.pool.getConnection(function (err, conn) {
            if (err)
                throw err;
            var statement = 'SELECT * FROM ' + WordsDatabaseHandler.TABLE_USERS + ' WHERE ' + WordsDatabaseHandler.USERS_FIELD_USERNAME + '=?';
            // Runs the fetch query.
            conn.query(statement, username, function (err, res) {
                conn.release();
                /* If there is an error while running the query, or the user
                 * does not exist in the database, return false to the
                 * callback function.
                 */
                if (err) {
                    callback(false);
                }
                else if (typeof res === 'object') {
                    /* If the username exists in the database, check whether
                     * the password matches when encrypted and return the
                     * result to the callback function.
                     */
                    if (res.length === 1 && res[0].username == username) {
                        bcrypt_1.compare(password, res[0].password)
                            .then(function (isValidPassword) {
                            callback(true, isValidPassword);
                        }, function (hashError) {
                            callback(true, false);
                        });
                    }
                    else {
                        callback(false);
                    }
                }
                else {
                    callback(false);
                }
            });
        });
    };
    /**
     * Adds a new word entry linked to a user and returns whether the
     * insert query was successful to a callback function.
     * @param username  The username of the user adding the word.
     * @param word      The word to be added.
     * @param callback  Function to be run after the word is added.
     */
    WordsDatabaseHandler.prototype.addWord = function (username, word, callback) {
        var _this = this;
        this.getIdFromUsername(username, function (userId) {
            if (typeof userId === 'undefined') {
                callback(false);
            }
            else {
                _this.pool.getConnection(function (err, conn) {
                    if (err)
                        throw err;
                    var statement = 'INSERT INTO ' + WordsDatabaseHandler.TABLE_WORDS + ' (' + WordsDatabaseHandler.WORDS_FIELD_USERID + ', ' + WordsDatabaseHandler.WORDS_FIELD_WORD + ') VALUES (?, ?)';
                    conn.query(statement, [userId, word], function (err, res) {
                        if (err) {
                            callback(false);
                        }
                        else if (typeof res === 'object' && res.affectedRows === 1) {
                            callback(true);
                        }
                        else {
                            callback(false);
                        }
                    });
                });
            }
        });
    };
    /**
     * Deletes a word entry from the words table. Takes the username
     * corresponding to the <code>userId</code> and the word to remove.
     * Returns the success of the operation to a callback function.
     * @param username  The username of the user.
     * @param word      The word to remove.
     * @param callback  Function to be run after the word is removed.
     */
    WordsDatabaseHandler.prototype.deleteWord = function (username, word, callback) {
        this.pool.getConnection(function (err, conn) {
            if (err)
                throw err;
            var statement = 'DELETE FROM ' + WordsDatabaseHandler.TABLE_WORDS +
                ' WHERE ' + WordsDatabaseHandler.WORDS_FIELD_USERID + ' = (' +
                'SELECT ' + WordsDatabaseHandler.USERS_FIELD_ID + ' FROM ' + WordsDatabaseHandler.TABLE_USERS + ' WHERE ' + WordsDatabaseHandler.USERS_FIELD_USERNAME + ' = ?)' +
                ' AND ' + WordsDatabaseHandler.WORDS_FIELD_WORD + ' = ?';
            conn.query(statement, [username, word], function (err, res) {
                callback(typeof res === 'object' && res.affectedRows > 0);
            });
        });
    };
    return WordsDatabaseHandler;
}());
WordsDatabaseHandler.DATABASE_NAME = 'words'; // Name of the database.
WordsDatabaseHandler.TABLE_USERS = 'users'; // Name of the users table.
WordsDatabaseHandler.USERS_FIELD_ID = 'id'; // User id field.
WordsDatabaseHandler.USERS_FIELD_USERNAME = 'username'; // Username field.
WordsDatabaseHandler.USERS_FIELD_PASSWORD = 'password'; // Password field.
WordsDatabaseHandler.TABLE_WORDS = 'words'; // Name of the words table.
WordsDatabaseHandler.WORDS_FIELD_ID = 'id'; // Word id field
WordsDatabaseHandler.WORDS_FIELD_USERID = 'userId'; // User id field.
WordsDatabaseHandler.WORDS_FIELD_WORD = 'word'; // Word
exports.WordsDatabaseHandler = WordsDatabaseHandler;
//# sourceMappingURL=WordsDatabaseHandler.js.map
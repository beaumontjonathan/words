// Module imports
import {createPool, IConnection, IError, IPool} from "mysql";
import {hash, compare} from 'bcrypt';

// Project imports
import {Word} from "../interfaces/Word";

// Database login details.
//const DATABASE_HOST = 'odroid-c2';
const DATABASE_HOST = 'localhost';
const DATABASE_USER = 'root';
const DATABASE_PASSWORD = 'password';

/**
 * <h1>User Database Handler</h1>
 * Provides a wrapper for the user mysql database. Allow the
 * addition, deletion, search and credential checks for user data.
 * Uses encryption to store salted and hashed passwords in the
 * database, and then encrypts again to verify their login
 * credentials.
 *
 * @author  Jonathan Beaumont
 * @version 1.1.2
 * @since   2017-06-08
 */
export class WordsDatabaseHandler {
  
  static readonly DATABASE_NAME = 'words';  // Name of the database.
  
  // Contains names of fields and tables in the words database.
  static readonly TABLE = {
    USERS: {
      NAME: 'users',
      FIELD: {
        ID: 'id',
        USERNAME: 'username',
        PASSWORD: 'password'
      }
    },
    WORDS: {
      NAME: 'words',
      FIELD: {
        ID: 'id',
        USERID: 'userId',
        WORD: 'word'
      }
    }
  };
  
  private pool: IPool;  // Stores the database pool.
  
  /**
   * Constructor. Creates the database pool.
   */
  constructor() {
    this.pool = createPool({
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
  public addUser(username: string, password: string, callback: (success: boolean, id?: number) => void): void {
    this.pool.getConnection((err: IError, conn: IConnection) => {
      
      if (err) {
        console.log('Error getting connection: ' + err);
        callback(false);
      }
      
      // Hash the password.
      hash(password, 10)
        .then(hash => {
          let statement = 'INSERT INTO ' + WordsDatabaseHandler.TABLE.USERS.NAME +' (' + WordsDatabaseHandler.TABLE.USERS.FIELD.USERNAME + ', ' + WordsDatabaseHandler.TABLE.USERS.FIELD.PASSWORD+ ') VALUES (?, ?)';
          
          // Queries the database with an add user query.
          conn.query(statement, [username, hash], (err: IError, res) => {
            conn.release();
            
            /* If there is an error or the username is taken, then
             * return false to the callback function. Otherwise,
             * return true.
             */
            if (err) {
              callback(false);
            } else if (typeof res === 'object') {
              callback(res.affectedRows === 1, res.insertId);
            } else {
              callback(false);
            }
          });
          
        /* Return false to callback function if there was an error while
         * hashing.
         */
        }, (hashError) => {
          console.log('Password hashing error: ' + hashError);
          callback(false);
        });
    });
  }
  
  /**
   * Deletes a user from the database, if the exist in it.
   * @param username  The username of the user to delete.
   * @param callback  Function to be run after user deletion.
   */
  public deleteUser(username: string, callback?: (success: boolean) => void): void {
    this.pool.getConnection((err: IError, conn: IConnection) => {
      
      /* If connection error and callback exists then return false to
       * the callback.
       */
      if (err) {
        if (callback)
          callback(false);
      } else {
        let statement = 'DELETE FROM ' + WordsDatabaseHandler.TABLE.USERS + ' WHERE ' + WordsDatabaseHandler.TABLE.USERS.FIELD.USERNAME + '=?';
        
        // Attempt to delete the user from the database.
        conn.query(statement, username, (err: IError, res) => {
          conn.release();
          
          /* If the username is not in the database of there is an
           * error while running the query, return false to the
           * callback. Otherwise, return true;
           */
          if (callback) {
            if (err) {
              callback(false);
            } else if (typeof res === 'object') {
              callback(res.affectedRows === 1);
            } else {
              callback(false);
            }
          }
        });
      }
    });
  }
  
  /**
   * Returns whether or not a user exists in the database to a
   * callback function.
   * @param field The field to check by. Either the id or the
   *              username.
   * @param data  The username or id of the user.
   * @param callback  Function to be run after the check.
   */
  public containsUser(field: string, data: string|number, callback: (contains: boolean) => void): void {
    this.pool.getConnection((err: IError, conn: IConnection) => {
      if (err) throw err;
      
      /* If the field if not the if or username, return false to the
       * callback function.
       */
      if (field !== WordsDatabaseHandler.TABLE.USERS.FIELD.ID && field !== WordsDatabaseHandler.TABLE.USERS.FIELD.ID) {
        callback(false);
      }
      let statement = 'SELECT * FROM ' + WordsDatabaseHandler.TABLE.USERS.NAME + ' WHERE ' + field + '=?';
      
      // Attempt the query.
      conn.query(statement, data, (err: IError, res) => {
        conn.release();
        
        /* If there is an error while running the query, or the user
         * does not exist in the database, return false to the
         * callback function. Otherwise, return true.
         */
        if (err) {
          callback(false);
        } else if (typeof res === 'object') {
          callback(res.length === 1);
        } else {
          callback(false);
        }
      });
    });
  }
  
  /**
   * Fetches the id corresponding to a username of a user and returns
   * its value to a callback function.. If the username is not
   * registered, then undefined is returned to the callback.
   * @param username  The username to find the id of.
   * @param callback  Function to be run after the id has been found.
   */
  public getIdFromUsername(username: string, callback: (id: number) => void): void {
    this.pool.getConnection((err: IError, conn: IConnection) => {
      if (err) throw err;
      
      let statement = 'SELECT ' + WordsDatabaseHandler.TABLE.USERS.FIELD.ID + ' from ' + WordsDatabaseHandler.TABLE.USERS.NAME + ' where username = ?';
      
      conn.query(statement, username, (err: IError, res) => {
        conn.release();
        
        if (err) {
          callback(undefined);
        } else if (typeof res === 'object') {
          if (res.length === 1)
            callback(res[0].id)
          else
            callback(undefined);
        } else {
          callback(undefined);
        }
      })
    });
  }
  
  /**
   * Verifies whether a username and password correspond to a user
   * entry in the database. Uses encryption to store and verify the
   * password.
   * @param username  Username to check.
   * @param password  Password to check.
   * @param callback  Function to be run after the check.
   */
  public verifyCredentials(username: string, password: string, callback: (correctUsername: boolean, correctPassword?: boolean) => void): void {
    console.log('final');
    this.pool.getConnection((err: IError, conn: IConnection) => {
      if (err) throw err;
      let statement = 'SELECT * FROM ' + WordsDatabaseHandler.TABLE.USERS.NAME + ' WHERE ' + WordsDatabaseHandler.TABLE.USERS.FIELD.USERNAME + '=?';
      
      // Runs the fetch query.
      conn.query(statement, username, (err: IError, res) => {
        conn.release();
        
        /* If there is an error while running the query, or the user
         * does not exist in the database, return false to the
         * callback function.
         */
        if (err) {
          callback(false);
        } else if (typeof res === 'object') {
          
          /* If the username exists in the database, check whether
           * the password matches when encrypted and return the
           * result to the callback function.
           */
          if (res.length === 1 && res[0].username == username) {
            compare(password, res[0].password)
              .then(isValidPassword => {
                callback(true, isValidPassword);
              }, hashError => {
                callback(true, false);
              });
          } else {
            callback(false);
          }
        } else {
          callback(false);
        }
      });
    });
  }
  
  /**
   * Adds a new word entry linked to a user and returns whether the
   * insert query was successful to a callback function.
   * @param username  The username of the user adding the word.
   * @param word      The word to be added.
   * @param callback  Function to be run after the word is added.
   */
  public addWord(username: string, word: string, callback: (success: boolean) => void): void {
    this.pool.getConnection((err: IError, conn: IConnection) => {
      if (err) throw err;
      
      let statement = 'INSERT INTO ' + WordsDatabaseHandler.TABLE.WORDS.NAME + ' (' + WordsDatabaseHandler.TABLE.WORDS.FIELD.USERID + ', ' + WordsDatabaseHandler.TABLE.WORDS.FIELD.WORD + ') VALUES (' +
          '(SELECT ' + WordsDatabaseHandler.TABLE.USERS.FIELD.ID + ' FROM ' + WordsDatabaseHandler.TABLE.USERS.NAME + ' WHERE ' + WordsDatabaseHandler.TABLE.USERS.FIELD.USERNAME + ' = ? LIMIT 1), ?)'
      conn.query(statement, [username, word], (err: IError, res) => {
        callback(typeof res === 'object' && res.affectedRows === 1);
      });
    });
  }
  
  /**
   * Deletes a word entry from the words table. Takes the username
   * corresponding to the <code>userId</code> and the word to remove.
   * Returns the success of the operation to a callback function.
   * @param username  The username of the user.
   * @param word      The word to remove.
   * @param callback  Function to be run after the word is removed.
   */
  public deleteWord(username: string, word: string, callback: (success: boolean) => void): void {
    this.pool.getConnection((err: IError, conn: IConnection) => {
      if (err) throw err;
      let statement =
        'DELETE FROM ' + WordsDatabaseHandler.TABLE.WORDS.NAME +
        ' WHERE ' + WordsDatabaseHandler.TABLE.WORDS.FIELD.USERID + ' = (' +
          'SELECT ' + WordsDatabaseHandler.TABLE.USERS.FIELD.ID + ' FROM ' + WordsDatabaseHandler.TABLE.USERS.NAME + ' WHERE ' + WordsDatabaseHandler.TABLE.USERS.FIELD.USERNAME + ' = ?)' +
        ' AND ' + WordsDatabaseHandler.TABLE.WORDS.FIELD.WORD + ' = ?';
      conn.query(statement, [username, word], (err: IError, res) => {
        callback(typeof res === 'object' && res.affectedRows > 0);
      });
    });
  }
  
  /**
   * Deletes all words corresponding to a user. Returns the number of
   * deleted rows to a callback function.
   * @param username  // Username of the user.
   * @param callback  // Function to be run after delete operation.
   */
  public deleteAllWords(username: string, callback: (affectedRows: number) => void): void {
    this.pool.getConnection((err: IError, conn: IConnection) => {
      if (err) throw err;
      let statement = 'DELETE FROM ' + WordsDatabaseHandler.TABLE.WORDS.NAME + ' WHERE ' + WordsDatabaseHandler.TABLE.WORDS.FIELD.USERID + ' = (' +
          'SELECT ' + WordsDatabaseHandler.TABLE.USERS.FIELD.ID + ' FROM ' + WordsDatabaseHandler.TABLE.USERS.NAME + ' WHERE ' + WordsDatabaseHandler.TABLE.USERS.FIELD.USERNAME + ' = ?' +
          ')';
      conn.query(statement, username, (err: IError, res) => {
        if (typeof res === 'object' && typeof res.affectedRows !== 'undefined') {
          callback(res.affectedRows);
        } else {
          callback(0);
        }
      })
    });
  }
  
  /**
   * Fetches all words corresponding to a user and returns them as an
   * array of <code>Word</code> elements to a callback function.
   * @param username  The username of the user.
   * @param callback  Function to be run after select operation.
   */
  public getAllWords(username: string , callback: (words: Word[]) => void): void {
    this.pool.getConnection((err: IError, conn: IConnection) => {
      let words: Word[] = [];
      if (err) throw err;
      let statement = 'SELECT * FROM ' + WordsDatabaseHandler.TABLE.WORDS.NAME + ' WHERE ' + WordsDatabaseHandler.TABLE.WORDS.FIELD.USERID + ' = (SELECT ' + WordsDatabaseHandler.TABLE.USERS.FIELD.ID + ' FROM ' + WordsDatabaseHandler.TABLE.USERS.NAME + ' WHERE ' + WordsDatabaseHandler.TABLE.USERS.FIELD.USERNAME + ' = ?)';
      conn.query(statement, username, (err:IError, res) => {
        if (typeof res === 'object') {
          if (res.length <= 0) {
            callback(words);
          } else {
            for (let i = 0, length = res.length; i < length; i++) {
              words.push({id: res[i].id, word: res[i].word});
              if (i === length - 1) {
                callback(words);
              }
            }
          }
        }
      });
    });
  }
  
  /**
   * Returns whether or not a user knows a word to a callback
   * function.
   * @param username  The username of the user.
   * @param word      The word that the user might know.
   * @param callback  Function to be run after the check.
   */
  public containsWord(username: string, word: string, callback: (success: boolean) => void): void {
    this.pool.getConnection((err: IError, conn: IConnection) => {
      if (err) throw err;
      let statement = 'SELECT * FROM ' + WordsDatabaseHandler.TABLE.WORDS.NAME + ' WHERE ' + WordsDatabaseHandler.TABLE.WORDS.FIELD.USERID + ' = (' +
          'SELECT ' + WordsDatabaseHandler.TABLE.USERS.FIELD.ID + ' FROM ' + WordsDatabaseHandler.TABLE.USERS.NAME + ' WHERE ' + WordsDatabaseHandler.TABLE.USERS.FIELD.USERNAME + ' = ?' +
          ') AND ' + WordsDatabaseHandler.TABLE.WORDS.FIELD.WORD + ' = ?';
      conn.query(statement, [username, word], (err:IError, res) => {
        callback(typeof res === 'object' && res.length > 0);
      });
    });
  }
}
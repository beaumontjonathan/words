// Module imports
import {createPool, IConnection, IError, IPool} from "mysql";
import {hash, compare} from 'bcrypt';

// Database login details.
const DATABASE_HOST = 'odroid-c2';
const DATABASE_USER = 'jonny';
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
 * @version 1.0.0
 * @since   2017-06-08
 */
export class WordsDatabaseHandler {
  
  static readonly DATABASE_NAME = 'words';  // Name of the database.
  static readonly TABLE_USERS =  'users'; // Name of the users table.
  static readonly FIELD_ID = 'id';  // User id field.
  static readonly FIELD_USERNAME = 'username';  // Username field.
  static readonly FIELD_PASSWORD = 'password';  // Password field.
  
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
          let statement = 'INSERT INTO ' + WordsDatabaseHandler.TABLE_USERS +' (' + WordsDatabaseHandler.FIELD_USERNAME + ', ' + WordsDatabaseHandler.FIELD_PASSWORD + ') VALUES (?, ?)';
          
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
        let statement = 'DELETE FROM ' + WordsDatabaseHandler.TABLE_USERS + ' WHERE ' + WordsDatabaseHandler.FIELD_USERNAME + '=?';
        
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
   * Returns whether or not a user exists in the database.
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
      if (field !== WordsDatabaseHandler.FIELD_ID && field !== WordsDatabaseHandler.FIELD_USERNAME) {
        callback(false);
      }
      let statement = 'SELECT * FROM ' + WordsDatabaseHandler.TABLE_USERS + ' WHERE ' + field + '=?';
      
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
   * Verifies whether a username and password correspond to a user
   * entry in the database. Uses encryption to store and verify the
   * password.
   * @param username  Username to check.
   * @param password  Password to check.
   * @param callback  Function to be run after the check.
   */
  public verifyCredentials(username: string, password: string, callback: (correctUsername: boolean, correctPassword?: boolean) => void): void {
    this.pool.getConnection((err: IError, conn: IConnection) => {
      if (err) throw err;
      let statement = 'SELECT * FROM ' + WordsDatabaseHandler.TABLE_USERS + ' WHERE ' + WordsDatabaseHandler.FIELD_USERNAME + '=?';
      
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
  
}
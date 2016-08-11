/**
 * Created by mgoria on 11/6/15.
 */

/* eslint-disable no-unused-vars */

'use strict';

import AWS from 'aws-sdk';
import CognitoSyncManager from 'amazon-cognito-js';
import {CreateCognitoDatasetException} from './Exception/CreateCognitoDatasetException';
import {PutCognitoRecordException} from './Exception/PutCognitoRecordException';
import {SynchronizeCognitoDatasetException} from './Exception/SynchronizeCognitoDatasetException';

export class TokenManager {
  /**
   * @returns {String}
   */
  static get DATASET_NAME() {
    return 'deep_session';
  }

  /**
   * @returns {String}
   */
  static get RECORD_NAME() {
    return 'session_creds';
  }

  /**
   * @param {String} identityPoolId
   * @param {Object|null} cognitoSyncClient
   */
  constructor(identityPoolId, cognitoSyncClient = null) {
    this._identityPoolId = identityPoolId;
    this._cognitoSyncClient = cognitoSyncClient;
  }

  /**
   * @returns {Object}
   */
  get cognitoSyncClient() {
    if (!this._cognitoSyncClient) {
      this._cognitoSyncClient = new AWS.CognitoSyncManager();
    }

    return this._cognitoSyncClient;
  }

  /**
   * @param {Token} token
   * @returns {Promise}
   */
  saveToken(token) {
    return new Promise(
      (resolve, reject) => {
        this._createOrGetDataset((error, dataset) => {
          if (error) {
            return reject(error);
          }

          dataset.put(TokenManager.RECORD_NAME, this._encodeToken(token), (error/*, record*/) => {
            if (error) {
              return reject(new PutCognitoRecordException(
                TokenManager.DATASET_NAME, TokenManager.RECORD_NAME, error
              ));
            }

            this._synchronizeDataset(dataset, (error, savedRecords) => {
              if (error) {
                return reject(new SynchronizeCognitoDatasetException(dataset, error));
              }

              resolve(savedRecords);
            });
          });
        });
      }
    );
  }

  /**
   * @param {String} identityId
   * @returns {Promise}
   */
  loadBackendToken(identityId) {
    let cognitosync = new AWS.CognitoSync();
    let params = {
      DatasetName: TokenManager.DATASET_NAME,
      IdentityId: identityId,
      IdentityPoolId: this._identityPoolId,
    };

    return cognitosync
      .listRecords(params)
      .promise()
      .then(data => {
        let token = null;

        data.Records.forEach(record => {
          if (record.Key === TokenManager.RECORD_NAME) {
            token = this._decodeToken(record.Value);
            return token;
          }
        });

        return token;
      });
  }

  /**
   * @returns {Promise}
   */
  loadFrontendToken() {
    return new Promise(
      (resolve, reject) => {
        this._createOrGetDataset((error, dataset) => {
          if (error) {
            return reject(error);
          }

          dataset.get(TokenManager.RECORD_NAME, (error, rawToken) => {
            if (error) {
              return reject(error);
            }
            
            resolve(this._decodeToken(rawToken));
          });
        });
      }
    );
  }

  /**
   * @returns {String}
   */
  get identityId() {
    return this.cognitoSyncClient.getIdentityId();
  }

  /**
   * Deletes cached Token from local storage
   *
   * @returns {TokenManager}
   */
  deleteToken() {
    this.cognitoSyncClient.wipeData();

    return this;
  }

  /**
   * @param {Function} callback
   * @private
   */
  _createOrGetDataset(callback) {
    this.cognitoSyncClient.openOrCreateDataset(TokenManager.DATASET_NAME, (error, dataset) => {
      if (error) {
        callback(new CreateCognitoDatasetException(TokenManager.DATASET_NAME, error), null);
        return;
      }

      callback(null, dataset);
    });
  }

  /**
   * @param {Object} dataset
   * @param {Function} callback
   * @private
   */
  _synchronizeDataset(dataset, callback) {
    dataset.synchronize({
      onSuccess: (dataset, newRecords) => {
        callback(null, newRecords);
      },
      onFailure: (error) => {
        callback(error, null);
      },
      onConflict: (dataset, conflicts, cb) => {
        let resolved = [];

        for (let i = 0; i < conflicts.length; i++) {
          // take local version. @todo: implement custom merge logic to take latest changes
          resolved.push(conflicts[i].resolveWithLocalRecord());
        }

        dataset.resolve(resolved, () => {
          return cb(true);
        });
      },
      onDatasetDeleted: (dataset, datasetName, cb) => {
        return cb(true);
      },
      onDatasetMerged: (dataset, datasetNames, cb) => {
        return cb(true);
      }
    });
  }

  /**
   * @todo: implement an encoding method
   *
   * @param {Token} token
   * @returns {String}
   */
  _encodeToken(token) {
    return JSON.stringify(token.toJSON());
  }

  /**
   * @todo: implement a decoding method
   *
   * @param {String} rawToken
   * @returns {Object}
   */
  _decodeToken(rawToken) {
    if (rawToken && typeof rawToken === 'string') {
      let tokenObj = JSON.parse(rawToken);

      tokenObj.credentials = this._decodeCredentials(tokenObj.credentials);

      for (let key in tokenObj.rolesCredentials) {
        if (tokenObj.rolesCredentials.hasOwnProperty(key)) {
          tokenObj.rolesCredentials[key] = this._decodeCredentials(tokenObj.rolesCredentials[key]);
        }
      }

      return tokenObj;
    }

    return null;
  }

  /**
   * @todo: implement a decoding method
   *
   * @param {Object} credentials
   * @returns {Object}
   */
  _decodeCredentials(credentials) {
    let expireTime = credentials.expireTime;

    credentials = new AWS.Credentials(credentials);

    // restore expireTime because AWS.Credentials resets it to null
    credentials.expireTime = expireTime;

    // set secretAccessKey property enumerable:true to allow storing it into Cognito datastore
    credentials = this._makeKeyEnumerable(credentials, 'secretAccessKey');

    return credentials;
  }

  /**
   * @param {Object} obj
   * @param {String} key
   * @returns {Object}
   * @private
   */
  _makeKeyEnumerable(obj, key) {
    obj = Object.defineProperty(obj, key, {
      enumerable: true,
      writable: true,
      configurable: true
    });

    return obj;
  }
}

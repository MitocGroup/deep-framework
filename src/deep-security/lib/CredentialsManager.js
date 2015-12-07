/**
 * Created by mgoria on 11/6/15.
 */

'use strict';

import AWS from 'aws-sdk';
import CognitoSyncManager from 'amazon-cognito-js';
import {CreateCognitoDatasetException} from './Exception/CreateCognitoDatasetException';
import {PutCognitoRecordException} from './Exception/PutCognitoRecordException';
import {SynchronizeCognitoDatasetException} from './Exception/SynchronizeCognitoDatasetException';

export class CredentialsManager {
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
   * @param {Object} credentials
   * @param {Function} callback
   */
  saveCredentials(credentials, callback) {
    this._createOrGetDataset((error, dataset) => {
      if (error) {
        callback(error, null);
        return;
      }

      dataset.put(CredentialsManager.RECORD_NAME, this._encodeCredentials(credentials), (error, record) => {
        if (error) {
          callback(new PutCognitoRecordException(
            CredentialsManager.DATASET_NAME, CredentialsManager.RECORD_NAME, error
          ), null);
          return;
        }

        this._synchronizeDataset(dataset, (error, savedRecords) => {
          if (error) {
            callback(new SynchronizeCognitoDatasetException(dataset, error), null);
            return;
          }

          callback(null, savedRecords);
        });
      });
    });
  }

  /**
   * @param {String} identityId
   * @param {Function} callback
   */
  loadCredentials(identityId, callback) {
    let cognitosync = new AWS.CognitoSync();

    let params = {
      DatasetName: CredentialsManager.DATASET_NAME,
      IdentityId: identityId,
      IdentityPoolId: this._identityPoolId,
    };

    cognitosync.listRecords(params, (error, data) => {
      if (error) {
        callback(error, null);
        return;
      }

      let creds = null;
      data.Records.forEach((record) => {
        if (record.Key === CredentialsManager.RECORD_NAME) {
          creds = this._decodeCredentials(record.Value);
          return creds;
        }
      });

      callback(null, creds);
    });
  }

  /**
   * @param {Function} callback
   * @private
   */
  _createOrGetDataset(callback) {
    this.cognitoSyncClient.openOrCreateDataset(CredentialsManager.DATASET_NAME, (error, dataset) => {
      if (error) {
        callback(new CreateCognitoDatasetException(CredentialsManager.DATASET_NAME, error), null);
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
      onConflict: (dataset, conflicts) => {
        let resolved = [];

        for (let i = 0; i < conflicts.length; i++) {
          // take local version. @todo: implement custom merge logic to take latest changes
          resolved.push(conflicts[i].resolveWithLocalRecord());
        }

        dataset.resolve(resolved, () => {
          return callback(true);
        });
      },
      onDatasetDeleted: (dataset, datasetName, cb) => {
        return callback(true);
      },
      onDatasetMerged: (dataset, datasetNames, cb) => {
        return callback(true);
      }
    });
  }

  /**
   * @todo: implement an encoding method
   *
   * @param {Object} credentials
   * @returns {String}
   */
  _encodeCredentials(credentials) {
    // set secretAccessKey property enumerable:true to allow storing it into Cognito datastore
    credentials = Object.defineProperty(credentials, 'secretAccessKey', {
      enumerable: true,
      writable: true,
      configurable: true
    });

    return JSON.stringify(credentials);
  }

  /**
   * @todo: implement an encoding method
   *
   * @param {String} credentials
   * @returns {Object}
   */
  _decodeCredentials(credentials) {
    return JSON.parse(credentials);
  }
}

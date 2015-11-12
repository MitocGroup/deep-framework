/**
 * Created by mgoria on 11/6/15.
 */

'use strict';

import AWS from 'aws-sdk';
import CognitoSyncManager from 'amazon-cognito-js';
import {CreateCognitoDatasetException} from './Exception/CreateCognitoDatasetException';
import {PutCognitoRecordException} from './Exception/PutCognitoRecordException';
import {GetCognitoRecordException} from './Exception/GetCognitoRecordException';
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
   * @param {Object|null} cognitoSyncClient
   */
  constructor(cognitoSyncClient = null) {
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
        return callback(error);
      }

      dataset.put(CredentialsManager.RECORD_NAME, this._encodeCredentials(credentials), (error, record) => {
        if (error) {
          return callback(new PutCognitoRecordException(
            CredentialsManager.DATASET_NAME, CredentialsManager.RECORD_NAME, error
          ));
        }

        this._synchronizeDataset(dataset, (error, savedRecords) => {
          if (error) {
            return callback(new SynchronizeCognitoDatasetException(dataset, error));
          }

          callback(null, savedRecords);
        });
      });
    });
  }

  /**
   * @param {Function} callback
   */
  loadCredentials(callback) {
    this._createOrGetDataset((error, dataset) => {
      if (error) {
        return callback(error);
      }

      dataset.get(CredentialsManager.RECORD_NAME, (error, recordValue) => {
        if (error) {
          return callback(new GetCognitoRecordException(
            CredentialsManager.DATASET_NAME, CredentialsManager.RECORD_NAME, error
          ));
        }

        callback(null, this._decodeCredentials(recordValue));
      });
    });
  }

  /**
   * @param {Function} callback
   * @private
   */
  _createOrGetDataset(callback) {
    this.cognitoSyncClient.openOrCreateDataset(CredentialsManager.DATASET_NAME, (error, dataset) => {
      if (error) {
        return callback(new CreateCognitoDatasetException(CredentialsManager.DATASET_NAME, error));
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
        console.log('onSuccess - ', newRecords);

        callback(null, newRecords);
      },
      onFailure: (error) => {
        console.log('onFailure - ', error);
        callback(error, null);
      },
      onConflict: (dataset, conflicts, callback) => {
        console.log('onConflict - ', conflicts);
        let resolved = [];

        for (let i = 0; i < conflicts.length; i++) {
          // take local version. @todo: implement custom merge logic to take latest changes
          resolved.push(conflicts[i].resolveWithLocalRecord());
        }

        dataset.resolve(resolved, () => {
          return callback(true);
        });
      },
      onDatasetDeleted: (dataset, datasetName, callback) => {
        console.log('onDatasetDeleted - ', datasetName);
        return callback(true);
      },
      onDatasetMerged: (dataset, datasetNames, callback) => {
        console.log('onDatasetMerged - ', datasetNames);
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

/**
 * Created by mgoria on 11/6/15.
 */

'use strict';

import AWS from 'aws-sdk';
import CognitoSyncClient from 'amazon-cognito-js';
import {CreateCognitoDatasetException} from './Exception/CreateCognitoDatasetException';
import {PutCognitoRecordException} from './Exception/PutCognitoRecordException';
import {GetCognitoRecordException} from './Exception/GetCognitoRecordException';

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
    this._cognitoSyncClient = cognitoSyncClient || new AWS.CognitoSyncClient();
  }

  /**
   * @param {Object} credentials
   * @param {Function} callback
   */
  saveCredentials(credentials, callback) {
    this._createOrGetDataset((dataset) => {
      dataset.put(CredentialsManager.RECORD_NAME, this._encodeCredentials(credentials), (error, record) => {
        if (error) {
          throw new PutCognitoRecordException(
            CredentialsManager.DATASET_NAME, CredentialsManager.RECORD_NAME, error
          );
        }

        callback(record);
      });
    });
  }

  /**
   * @param {Function} callback
   */
  loadCredentials(callback) {
    this._createOrGetDataset((dataset) => {
      dataset.get(CredentialsManager.RECORD_NAME, (error, recordValue) => {
        if (error) {
          throw new GetCognitoRecordException(
            CredentialsManager.DATASET_NAME, CredentialsManager.RECORD_NAME, error
          );
        }

        callback(this._decodeCredentials(recordValue));
      });
    });
  }

  /**
   * @param {Function} callback
   * @private
   */
  _createOrGetDataset(callback) {
    this._cognitoSyncClient.openOrCreateDataset(CredentialsManager.DATASET_NAME, (error, dataset) => {
      if (error) {
        throw new CreateCognitoDatasetException(CredentialsManager.DATASET_NAME, error);
      }

      callback(dataset);
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

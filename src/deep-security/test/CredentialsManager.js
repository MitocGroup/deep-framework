'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import AWS from 'aws-sdk';
import {CredentialsManager} from '../lib.compiled/CredentialsManager';
import CognitoSyncManager from 'amazon-cognito-js';
import credentials from './common/credentials';
import cognitoSyncClient from './Mock/cognitoSyncClient';
import {CognitoSyncClientMock} from './Mock/CognitoSyncClientMock';
import requireProxy from 'proxyquire';
import {CreateCognitoDatasetException} from '../lib.compiled/Exception/CreateCognitoDatasetException';
import {PutCognitoRecordException} from '../lib.compiled/Exception/PutCognitoRecordException';
import {SynchronizeCognitoDatasetException} from '../lib.compiled/Exception/SynchronizeCognitoDatasetException';

chai.use(sinonChai);

suite('CredentialsManager', function() {
  let identityPoolId = 'us-east-1:7e2e9d57-wswed-asdasdas-22f4-595e1d8128c5';

  let credentialsManagerExport = requireProxy('../lib.compiled/CredentialsManager', {
    'aws-sdk': cognitoSyncClient,
  });

  let CredentialsManager = credentialsManagerExport.CredentialsManager;
  let credentialsManager = new CredentialsManager(identityPoolId);

  test('Class CredentialsManager exists in CredentialsManager', function() {
    chai.expect(typeof CredentialsManager).to.equal('function');
  });

  test('Check DATASET_NAME static getter returns value "deep_session"', function() {
    chai.expect(CredentialsManager.DATASET_NAME).to.be.equal('deep_session');
  });

  test('Check RECORD_NAME static getter returns value "session_creds"', function() {
    chai.expect(CredentialsManager.RECORD_NAME).to.be.equal('session_creds');
  });

  test('Check _encodeCredentials() returns valid string value', function() {
    let actualResult = credentialsManager._encodeCredentials(credentials);

    chai.expect(actualResult).to.eql(JSON.stringify(credentials));
  });

  test('Check _decodeCredentials() returns valid object', function() {
    //make deep copy of credentials
    let expectedResult = JSON.parse(JSON.stringify(credentials));

    let actualResult = credentialsManager._decodeCredentials(JSON.stringify(credentials));

    chai.expect(actualResult).to.eql(expectedResult);
  });

  test('Check cognitoSyncClient getter returns instance of AWS.CognitoSyncManager', function() {
    AWS.config.region = 'us-east-1';
    AWS.config.credentials = credentials;

    let credentialsManagerExport = requireProxy('../lib.compiled/CredentialsManager', {
      'aws-sdk': cognitoSyncClient,
    });

    let CredentialsManager = credentialsManagerExport.CredentialsManager;
    let credentialsManager = new CredentialsManager(identityPoolId);

    let actualResult = credentialsManager.cognitoSyncClient;

    chai.expect(actualResult.constructor.name).to.equal('CognitoSyncClientMock');
  });

  test('Check _createOrGetDataset executes with success', function() {
    let spyCallback = sinon.spy();

    //set data mode
    credentialsManager.cognitoSyncClient.setMode(CognitoSyncClientMock.DATA_MODE, ['openOrCreateDataset']);

    credentialsManager._createOrGetDataset(spyCallback);

    let callbackArg = spyCallback.args[0];

    chai.expect(callbackArg[0]).to.equal(null);
    chai.expect(callbackArg[1].constructor.name).to.equal('Dataset');
  });

  test('Check _createOrGetDataset() executes with error', function() {
    let spyCallback = sinon.spy();

    //set failure mode
    credentialsManager.cognitoSyncClient.setMode(CognitoSyncClientMock.FAILURE_MODE, ['openOrCreateDataset']);

    credentialsManager._createOrGetDataset(spyCallback);

    let callbackArg = spyCallback.args[0];

    chai.assert.instanceOf(
      callbackArg[0],
      CreateCognitoDatasetException,
      'callback error argument is an instance of CreateCognitoDatasetException'
    );
    chai.expect(callbackArg[1]).to.equal(null);
  });

  test('Check saveCredentials() executes with error in _createOrGetDataset()', function() {
    let spyCallback = sinon.spy();

    //set failure mode
    credentialsManager.cognitoSyncClient.setMode(CognitoSyncClientMock.FAILURE_MODE, ['openOrCreateDataset']);

    credentialsManager.saveCredentials(credentials, spyCallback);

    let callbackArg = spyCallback.args[0];

    chai.assert.instanceOf(
      callbackArg[0],
      CreateCognitoDatasetException,
      'callback error argument is an instance of CreateCognitoDatasetException'
    );
    chai.expect(callbackArg[1]).to.equal(null);
  });

  test('Check saveCredentials() executes with error in put()', function() {
    let spyCallback = sinon.spy();

    //set modes
    credentialsManager.cognitoSyncClient.setMode(CognitoSyncClientMock.DATA_MODE_WITH_ERROR_IN_PUT_DATASET, ['openOrCreateDataset']);

    credentialsManager.saveCredentials(credentials, spyCallback);

    let callbackArg = spyCallback.args[0];

    chai.assert.instanceOf(
      callbackArg[0],
      PutCognitoRecordException,
      'callback error argument is an instance of PutCognitoRecordException'
    );
    chai.expect(callbackArg[1]).to.equal(null);
  });

  test('Check saveCredentials() executes with error in _synchronizeDataset()', function() {
    let spyCallback = sinon.spy();

    //set modes
    credentialsManager.cognitoSyncClient.setMode(CognitoSyncClientMock.DATA_MODE_WITH_ERROR_IN_SYNCHRONIZE_DATASET, ['openOrCreateDataset']);

    credentialsManager.saveCredentials(credentials, spyCallback);

    let callbackArg = spyCallback.args[0];

    //@todo - need to be check if able to check
    //chai.assert.instanceOf(
    //  callbackArg[0],
    //  SynchronizeCognitoDatasetException,
    //  'callback error argument is an instance of SynchronizeCognitoDatasetException'
    //);
    //chai.expect(callbackArg[1]).to.equal(null);
  });
});

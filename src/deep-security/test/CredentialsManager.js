'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import AWS from 'aws-sdk';
import credentials from './common/credentials';
import cognitoSyncClient from './Mock/cognitoSyncClient';
import cognitoSyncDataMode from './Mock/cognitoSyncDataMode';
import cognitoSyncFailureMode from './Mock/cognitoSyncFailureMode';
import {CognitoSyncClientMock} from './Mock/CognitoSyncClientMock';
import {CognitoSyncMock} from './Mock/CognitoSyncMock';
import {Dataset} from './Mock/Dataset';
import requireProxy from 'proxyquire';
import {CreateCognitoDatasetException} from '../lib/Exception/CreateCognitoDatasetException';
import {PutCognitoRecordException} from '../lib/Exception/PutCognitoRecordException';
import {SynchronizeCognitoDatasetException} from '../lib/Exception/SynchronizeCognitoDatasetException';

chai.use(sinonChai);

suite('CredentialsManager', function() {
  AWS.config.region = 'us-east-1';
  AWS.config.credentials = credentials;
  let identityPoolId = 'us-east-1:7e2e9d57-wswed-asdasdas-22f4-595e1d8128c5';

  let credentialsManagerExport = requireProxy('../lib/CredentialsManager', {
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

    actualResult = JSON.parse(JSON.stringify(actualResult));

    chai.expect(actualResult).to.eql(expectedResult);
  });

  test('Check cognitoSyncClient getter returns instance of AWS.CognitoSyncManager', function() {

    let credentialsManagerExport = requireProxy('../lib/CredentialsManager', {
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
    credentialsManager.cognitoSyncClient.setMode(
      CognitoSyncClientMock.DATA_MODE_WITH_ERROR_IN_PUT_DATASET, ['openOrCreateDataset']
    );

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
    credentialsManager.cognitoSyncClient.setMode(
      CognitoSyncClientMock.DATA_MODE_WITH_ERROR_IN_SYNCHRONIZE_DATASET, ['openOrCreateDataset']
    );

    credentialsManager.saveCredentials(credentials, spyCallback);

    let callbackArg = spyCallback.args[0];

    chai.assert.instanceOf(
      callbackArg[0],
      SynchronizeCognitoDatasetException,
      'callback error argument is an instance of SynchronizeCognitoDatasetException'
    );
    chai.expect(callbackArg[1]).to.equal(null);
  });

  test('Check saveCredentials() executes successfully', function() {
    let spyCallback = sinon.spy();

    //set modes
    credentialsManager.cognitoSyncClient.setMode(
      CognitoSyncClientMock.DATA_MODE_WITH_DATA_IN_SYNCHRONIZE_DATASET, ['openOrCreateDataset']
    );

    credentialsManager.saveCredentials(credentials, spyCallback);

    let callbackArg = spyCallback.args[0];

    chai.expect(callbackArg[0]).to.equal(null);
    chai.expect(callbackArg[1]).to.eql(Dataset.DATA);
  });

  test('Check _synchronizeDataset() executes onConflict', function() {
    let spyCallbackSynchronize = sinon.spy();
    let spyCallbackOnConflict = sinon.spy();

    //set modes
    let dataset = new Dataset(Dataset.SYNCRONIZE_CONFLICT_MODE, ['synchronize'], spyCallbackOnConflict);

    credentialsManager._synchronizeDataset(dataset, spyCallbackSynchronize);

    chai.expect(spyCallbackOnConflict).to.have.been.calledWithExactly(true);
  });

  test('Check _synchronizeDataset() executes onDatasetDeleted', function() {
    let spyCallbackSynchronize = sinon.spy();
    let spyCallbackOnDatasetDeleted = sinon.spy();

    //set modes
    let dataset = new Dataset(Dataset.SYNCRONIZE_DATASET_DELETED_MODE, ['synchronize'], spyCallbackOnDatasetDeleted);

    credentialsManager._synchronizeDataset(dataset, spyCallbackSynchronize);

    chai.expect(spyCallbackOnDatasetDeleted).to.have.been.calledWithExactly(true);
  });

  test('Check _synchronizeDataset() executes onDatasetMerged', function() {
    let spyCallbackSynchronize = sinon.spy();
    let spyCallbackOnDatasetMerged = sinon.spy();

    //set modes
    let dataset = new Dataset(Dataset.SYNCRONIZE_DATASET_MERGED_MODE, ['synchronize'], spyCallbackOnDatasetMerged);

    credentialsManager._synchronizeDataset(dataset, spyCallbackSynchronize);

    chai.expect(spyCallbackOnDatasetMerged).to.have.been.calledWithExactly(true);
  });

  test('Check loadBackendCredentials() executes with error in listRecords()', function() {
    let spyCallback = sinon.spy();

    //mocking AWS.CognitoSync
    let credentialsManagerExport = requireProxy('../lib/CredentialsManager', {
      'aws-sdk': cognitoSyncFailureMode,
    });

    CredentialsManager = credentialsManagerExport.CredentialsManager;
    credentialsManager = new CredentialsManager(identityPoolId);

    credentialsManager.loadBackendCredentials('test_identityID', spyCallback);

    let callbackArg = spyCallback.args[0];

    chai.expect(callbackArg[0]).to.eql(CognitoSyncMock.ERROR);
    chai.expect(callbackArg[1]).to.equal(null);
  });

  test('Check loadBackendCredentials() executes with data in listRecords()', function() {
    let spyCallback = sinon.spy();
    let expectedResult = null;

    //mocking AWS.CognitoSync
    let credentialsManagerExport = requireProxy('../lib/CredentialsManager', {
      'aws-sdk': cognitoSyncDataMode,
    });

    CredentialsManager = credentialsManagerExport.CredentialsManager;
    credentialsManager = new CredentialsManager(identityPoolId);

    credentialsManager.loadBackendCredentials('test_identityID', spyCallback);

    for (let record of CognitoSyncMock.DATA.Records) {
      if (record.Key === CredentialsManager.RECORD_NAME) {
        expectedResult = credentialsManager._decodeCredentials(record.Value);
        break;
      }
    }

    chai.expect(spyCallback.args[0][1]).to.eql(expectedResult);
  });

  test('Check loadFrontendCredentials executes with error in _createOrGetDataset()', function() {
    let spyCallback = sinon.spy();

    let credentialsManagerExport = requireProxy('../lib/CredentialsManager', {
      'aws-sdk': cognitoSyncClient,
    });

    let CredentialsManager = credentialsManagerExport.CredentialsManager;
    let credentialsManager = new CredentialsManager(identityPoolId);

    //set failure mode
    credentialsManager.cognitoSyncClient.setMode(CognitoSyncClientMock.FAILURE_MODE, ['openOrCreateDataset']);

    credentialsManager.loadFrontendCredentials(spyCallback);

    let callbackArg = spyCallback.args[0];

    chai.assert.instanceOf(
      callbackArg[0],
      CreateCognitoDatasetException,
      'callback error argument is an instance of CreateCognitoDatasetException'
    );
    chai.expect(callbackArg[1]).to.equal(null);
  });

  test('Check loadFrontendCredentials executes with error in dataset.get()', function() {
    let spyCallback = sinon.spy();

    let credentialsManagerExport = requireProxy('../lib/CredentialsManager', {
      'aws-sdk': cognitoSyncClient,
    });

    let CredentialsManager = credentialsManagerExport.CredentialsManager;
    let credentialsManager = new CredentialsManager(identityPoolId);

    //set failure mode
    credentialsManager.cognitoSyncClient.setMode(CognitoSyncClientMock.DATA_MODE_WITH_ERROR_IN_GET_DATASET, ['openOrCreateDataset']);

    credentialsManager.loadFrontendCredentials(spyCallback);

    let callbackArg = spyCallback.args[0];

    chai.expect(callbackArg[0]).to.eql(Dataset.ERROR);
    chai.expect(callbackArg[1]).to.equal(null);
  });

  test('Check loadFrontendCredentials executes with data in dataset.get()', function() {
    let spyCallback = sinon.spy();

    let credentialsManagerExport = requireProxy('../lib/CredentialsManager', {
      'aws-sdk': cognitoSyncClient,
    });

    let CredentialsManager = credentialsManagerExport.CredentialsManager;
    let credentialsManager = new CredentialsManager(identityPoolId);

    //set failure mode
    credentialsManager.cognitoSyncClient.setMode(CognitoSyncClientMock.DATA_MODE_WITH_DATA_IN_GET_DATASET, ['openOrCreateDataset']);

    credentialsManager.loadFrontendCredentials(spyCallback);

    let callbackArg = spyCallback.args[0];

    chai.expect(callbackArg[0]).to.equal(null);
    chai.expect(callbackArg[1]).to.eql(Dataset.DATA);
  });

  test('Check deleteCredentials()', function() {
    let spyCallback = sinon.spy();

    let credentialsManagerExport = requireProxy('../lib/CredentialsManager', {
      'aws-sdk': cognitoSyncClient,
    });

    let CredentialsManager = credentialsManagerExport.CredentialsManager;
    let credentialsManager = new CredentialsManager(identityPoolId);

    credentialsManager.deleteCredentials();

    chai.expect(credentialsManager.cognitoSyncClient._credentials).to.equal(null);
  });
});

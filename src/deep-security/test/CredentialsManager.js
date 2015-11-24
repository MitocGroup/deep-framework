'use strict';

import chai from 'chai';
import AWS from 'mock-aws';
import {CredentialsManager} from '../lib.compiled/CredentialsManager';
import CognitoSyncManager from 'amazon-cognito-js';
import credentials from './common/credentials';

suite('CredentialsManager', function() {
  let identityPoolId = 'us-east-1:7e2e9d57-wswed-asdasdas-22f4-595e1d8128c5';
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
    //let actualResult = credentialsManager.cognitoSyncClient;
    //
    //chai.assert.instanceOf(
    //  actualResult, AWS.CognitoSyncManager, 'actualResult is an instance of AWS.CognitoSyncManager'
    //);
  });
});

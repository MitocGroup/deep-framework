'use strict';

import chai from 'chai';
import AWS from 'aws-sdk';
import {CredentialsManager} from '../lib.compiled/CredentialsManager';

suite('CredentialsManager', function() {
  let identityPoolId = 'us-east-1:44hgf876-a2v2-465a-877v-12fd264525ef';
  let credentials = {
    security: {
      identityProviders: {
        'www.amazon.com': 'amzn1.application.0987678ba3347fds73dd9f6d3b9ce2b',
      },
    },
  };
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

  //@todo
  //test('Check cognitoSyncClient getter returns instance of AWS.CognitoSyncManager', function() {
  //  let actualResult = credentialsManager.cognitoSyncClient;
  //
  //  chai.assert.instanceOf(
  //    actualResult, AWS.CognitoSyncManager, 'actualResult is an instance of AWS.CognitoSyncManager'
  //  );
  //});
});

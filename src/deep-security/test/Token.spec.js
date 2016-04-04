'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Token} from '../lib/Token';
import {UserProvider} from '../lib/UserProvider';
import {IdentityProvider} from '../lib/IdentityProvider';
import {CredentialsManager} from '../lib/CredentialsManager';
import {DescribeIdentityException} from '../lib/Exception/DescribeIdentityException';
import {AuthException} from '../lib/Exception/AuthException';
import {Exception} from '../lib/Exception/Exception';
import {Exception as CoreException} from 'deep-core';
import {DeepResourceServiceMock} from './Mock/DeepResourceServiceMock';
import {CognitoIdentityMock} from './Mock/CognitoIdentityMock';
import {CognitoSyncMock} from './Mock/CognitoSyncMock';
import {CognitoSyncClientMock} from './Mock/CognitoSyncClientMock';
import cognitoIdentityDataMode from './Mock/cognitoIdentityDataMode';
import cognitoIdentityFailureMode from './Mock/cognitoIdentityFailureMode';
import cognitoSyncDataMode from './Mock/cognitoSyncDataMode';
import cognitoSyncFailureMode from './Mock/cognitoSyncFailureMode';
import cognitoIdentityCredentialsDataMode from './Mock/cognitoIdentityCredentialsDataMode';
import cognitoIdentityCredentialsFailureMode from './Mock/cognitoIdentityCredentialsFailureMode';
import cognitoSyncClient from './Mock/cognitoSyncClient';
import {Dataset} from './Mock/Dataset';
import credentials from './common/credentials';
import requireProxy from 'proxyquire';
import Kernel from 'deep-kernel';
import Log from 'deep-log';
import KernelFactory from './common/KernelFactory';

chai.use(sinonChai);

suite('Token', () => {
  let lambdaContext = {
    context: 'test context',
    identity: {
      cognitoIdentityId: 'us-east-1:b5487645-61bd-4c3b-dd54-5cba66070e7c',
    },
  };
  let identityPoolId = 'us-east-1:44hgf876-a2v2-465a-877v-12fd264525ef';
  let providerName = 'facebook';
  let identityMetadata = {
    access_token: 'test_userToken',
    tokenExpirationTime: new Date(),
    user_id: 'test_userId',
  };
  let providers = {
    'www.amazon.com': {
      name: 'www.amazon.com',
      data: {},
    },
    'graph.facebook.com': {
      name: 'graph.facebook.com',
      data: {},
    },
    'accounts.google.com': {
      name: 'accounts.google.com',
      data: {},
    },
  };
  let identityProvider = new IdentityProvider(providers, providerName, identityMetadata);
  let token = new Token(identityPoolId);
  let logService = null;

  test('Class Token exists in Token', () => {
    chai.expect(Token).to.be.an('function');
  });

  test('Load Kernels by using Kernel.load()', (done) => {
    let callback = (frontendKernel, backendKernel) => {
      chai.assert.instanceOf(backendKernel, Kernel, 'backendKernel is an instance of Kernel');
      logService = backendKernel.get('log');

      // complete the async
      done();
    };
    KernelFactory.create({Log: Log}, callback);
  });

  test('Check constructor sets _identityPoolId', () => {
    chai.expect(token._identityPoolId).to.be.equal(identityPoolId);
  });

  test('Check constructor sets _identityProvider=null', () => {
    chai.expect(token.identityProvider).to.be.equal(null);
  });

  test('Check constructor sets _lambdaContext=null', () => {
    chai.expect(token.lambdaContext).to.be.equal(null);
  });

  test('Check constructor sets _user=null', () => {
    chai.expect(token._user).to.be.equal(null);
  });

  test('Check constructor sets _userProvider=null', () => {
    chai.expect(token._userProvider).to.be.equal(null);
  });

  test('Check constructor sets _credentials=null', () => {
    chai.expect(token.credentials).to.be.equal(null);
  });

  test('Check constructor sets _credsManager as new instance ofCredentialsManager',
    () => {
      chai.assert.instanceOf(
        token._credsManager, CredentialsManager, '_credsManager is an instance of CredentialsManager'
      );
      chai.expect(token._credsManager._identityPoolId).to.be.equal(identityPoolId);
    }
  );

  test('Check isAnonymous getter returns true', () => {
    chai.expect(token.isAnonymous).to.be.equal(true);
  });

  test('Check identityProvider setter',
    () => {
      token.identityProvider = identityProvider;

      chai.expect(token.identityProvider).to.be.equal(identityProvider);
      chai.assert.instanceOf(
        token.identityProvider, IdentityProvider, 'token.identityProvider is an instance of IdentityProvider'
      );
    }
  );

  test('Check lambdaContext setter', () => {
    token.lambdaContext = lambdaContext;

    chai.expect(token.lambdaContext).to.be.equal(lambdaContext);
  });

  test('Check identityId getter for !credentials', () => {
    chai.expect(token.identityId).to.be.equal(lambdaContext.identity.cognitoIdentityId);
  });

  test('Check validCredentials returns null', () => {
    chai.expect(token.validCredentials(token.credentials)).to.be.equal(null);
  });

  test('Check userProvider setter', () => {
    let resourceName = 'sample';
    let deepResourceServiceMock = new DeepResourceServiceMock();
    let userProvider = new UserProvider(resourceName, deepResourceServiceMock);

    token.userProvider = userProvider;

    chai.expect(token._userProvider).to.be.equal(userProvider);
  });

  test('Check _getRegionFromIdentityPoolId returns region', () => {
    let expectedResult = identityPoolId.split(':')[0];
    chai.expect(Token.getRegionFromIdentityPoolId(identityPoolId)).to.be.equal(expectedResult);
  });

  test('Check create() returns new instance of Token', () => {
    let identityPoolId = 'us-east-1:create-a2v2-465a-877v-12fd264525ef';

    let actualResult = Token.create(identityPoolId);

    chai.assert.instanceOf(actualResult, Token, 'actualResult is an instance of Token');
    chai.expect(actualResult._identityPoolId).to.be.equal(identityPoolId);
  });

  test('Check createFromIdentityProvider() returns new instance of Token', () => {
    let identityPoolId = 'us-east-1:provider-a2v2-465a-877v-12fd264525ef';
    identityProvider = new IdentityProvider(providers, 'amazon', identityMetadata);

    let actualResult = Token.createFromIdentityProvider(identityPoolId, identityProvider);

    chai.assert.instanceOf(actualResult, Token, 'actualResult is an instance of Token');
    chai.expect(actualResult._identityPoolId).to.be.equal(identityPoolId);
    chai.expect(actualResult.identityProvider).to.be.equal(identityProvider);
  });

  test('Check createFromLambdaContext() returns new instance of Token', () => {
    let lambdaContext = {context: 'test createFromLambdaContext'};

    let actualResult = Token.createFromLambdaContext(identityPoolId, lambdaContext);

    chai.assert.instanceOf(actualResult, Token, 'actualResult is an instance of Token');
    chai.expect(actualResult._identityPoolId).to.be.equal(identityPoolId);
    chai.expect(actualResult.lambdaContext).to.be.equal(lambdaContext);
  });

  test('Check _describeIdentity() returns []', () => {
    chai.expect(token._identityLogins).to.eql([]);
  });

  test('Check _describeIdentity() throws "DescribeIdentityException"', () => {
    let spyCallback = sinon.spy();
    let error = null;

    //mocking AWS.CognitoIdentity
    let tokenExport = requireProxy('../lib/Token', {
      'aws-sdk': cognitoIdentityFailureMode,
    });

    let Token = tokenExport.Token;
    token = new Token(identityPoolId);

    try {
      token._describeIdentity('test_identityID', spyCallback);
    }
    catch (e) {
      error = e;
    }

    chai.expect(spyCallback).to.not.have.been.calledWith();
    chai.assert.instanceOf(
      error, DescribeIdentityException, 'error is an instance of DescribeIdentityException'
    );
  });

  test('Check _describeIdentity() executes successfully for !_identityMetadata', () => {
    let spyCallback = sinon.spy();

    //mocking AWS.CognitoIdentity
    let tokenExport = requireProxy('../lib/Token', {
      'aws-sdk': cognitoIdentityDataMode,
    });

    let Token = tokenExport.Token;
    token = new Token(identityPoolId);

    token._describeIdentity('test_identityID', spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly(CognitoIdentityMock.DATA);
    chai.expect(token._identityLogins).to.eql(CognitoIdentityMock.DATA.Logins);
  });

  test('Check _describeIdentity() executes successfully for _identityMetadata', () => {
    let spyCallback = sinon.spy();

    token._describeIdentity('test_identityID', spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly(CognitoIdentityMock.DATA);
    chai.expect(token._identityLogins).to.eql(CognitoIdentityMock.DATA.Logins);
  });

  test('Check getUser() executes successfully for !isAnonymous', () => {
    let spyCallback = sinon.spy();

    token.getUser(spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly(null);
  });

  test('Check getUser() method for !_user', () => {
    let spyCallback = sinon.spy();
    let resourceName = 'sample';
    let deepResourceServiceMock = new DeepResourceServiceMock();
    let userProvider = new UserProvider(resourceName, deepResourceServiceMock);

    deepResourceServiceMock.setMode(DeepResourceServiceMock.DATA_MODE, ['send']);
    token.userProvider = userProvider;
    token.lambdaContext = lambdaContext;

    token.getUser(spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly(
      JSON.parse(DeepResourceServiceMock.DATA.data.Payload)
    );
  });

  test('Check getUser() method for _user', () => {
    let spyCallback = sinon.spy();

    token.getUser(spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly(
      JSON.parse(DeepResourceServiceMock.DATA.data.Payload)
    );
  });

  test('Check loadCredentials() executes with error when this.lambdaContext', () => {
    let spyCallback = sinon.spy();

    //mocking AWS.CognitoSync for CredentialsManager
    let credentialsManagerExport = requireProxy('../lib/CredentialsManager', {
      'aws-sdk': cognitoSyncFailureMode,
    });
    let CredentialsManager = credentialsManagerExport.CredentialsManager;
    let credentialsManager = new CredentialsManager(identityPoolId);

    token._credsManager = credentialsManager;

    token.lambdaContext = lambdaContext;
    token.logService = logService;

    token.loadCredentials(spyCallback);

    let callbackArg = spyCallback.args[0];

    chai.expect(callbackArg[0]).to.eql(CognitoSyncMock.ERROR);
    chai.expect(callbackArg[1]).to.eql(null);
  });

  test('Check validCredentials(credentials) returns false', () => {
    //todo - Should be bolean;
    chai.expect(!!token.validCredentials(token.credentials)).to.equal(false);
  });

  test('Check validCredentials(credentials) returns true', () => {
    token._credentials = credentials;
    chai.expect(token.validCredentials(token._credentials)).to.equal(true);
  });

  test('Check loadCredentials() for validCredentials', () => {
    let spyCallback = sinon.spy();

    let actualResult = token.loadCredentials(spyCallback);

    let callbackArg = spyCallback.args[0];

    chai.expect(callbackArg[0]).to.eql(null);
    chai.expect(callbackArg[1]).to.eql(credentials);
    chai.expect(actualResult).to.equal(undefined);
  });

  test('Check loadCredentials() executes for !this.lambdaContext', () => {
    let spyCallback = sinon.spy();

    let credentialsManagerExport = requireProxy('../lib/CredentialsManager', {
      'aws-sdk': cognitoSyncClient,
    });
    let CredentialsManager = credentialsManagerExport.CredentialsManager;

    //mocking AWS.CognitoIdentityCredentials for Token
    let tokenExport = requireProxy('../lib/Token', {
      'CredentialsManager': CredentialsManager,
      'aws-sdk': cognitoIdentityCredentialsDataMode,
    });
    let Token = tokenExport.Token;
    let token = new Token(identityPoolId);

    token.logService = logService;

    //set failure mode openOrCreateDataset
    token._credsManager.cognitoSyncClient.setMode(
      CognitoSyncClientMock.FAILURE_MODE, ['openOrCreateDataset']
    );

    token.loadCredentials(spyCallback);

    let cbArgs = spyCallback.args[0];

    chai.expect(spyCallback.calledOnce).to.equal(true);

    //first cb argument is an instance of AuthException
    chai.assert.instanceOf(
      cbArgs[0], AuthException, 'error is an instance of AuthException'
    );

    //second cb argument equals null
    chai.expect(cbArgs[1]).to.equal(null);
  });

  test('Check _createCognitoIdentityCredentials() for !identityProvider', () => {

    //mocking AWS.CognitoIdentityCredentials for Token
    let tokenExport = requireProxy('../lib/Token', {
      'aws-sdk': cognitoIdentityCredentialsDataMode,
    });
    let Token = tokenExport.Token;
    let token = new Token(identityPoolId);

    let actualResult = token._createCognitoIdentityCredentials();
    chai.expect(actualResult.constructor.name).to.eql('CognitoIdentityCredentialsMock');
  });

  test('Check _createCognitoIdentityCredentials() for identityProvider', () => {

    //mocking AWS.CognitoIdentityCredentials for Token
    let tokenExport = requireProxy('../lib/Token', {
      'aws-sdk': cognitoIdentityCredentialsDataMode,
    });
    let Token = tokenExport.Token;
    let token = new Token(identityPoolId);
    token.identityProvider = identityProvider;

    let actualResult = token._createCognitoIdentityCredentials();
    chai.expect(actualResult.constructor.name).to.eql('CognitoIdentityCredentialsMock');
  });

  test('Check identityId()', () => {
    let identityId = 'identityId_test';

    token._credentials.identityId = identityId;

    chai.expect(token.identityId).to.equal(identityId);
  });

  test('Check identityId()', () => {
    let identityId = 'identityId_test';

    token._credentials.params = { IdentityId: identityId};

    chai.expect(token.identityId).to.equal(identityId);
  });

  test('Check destroy()', () => {

    //mocking AWS.CognitoIdentityCredentials for Token
    let tokenExport = requireProxy('../lib/Token', {
      'aws-sdk': cognitoIdentityCredentialsDataMode,
    });
    let Token = tokenExport.Token;
    let token = new Token(identityPoolId);
    token.identityProvider = identityProvider;

    token.destroy();
    chai.expect(token.credentials).to.equal(null);
    chai.expect(token._credsManager).to.equal(null);
  });

  test('Check _backendLoadCredentials() throws Exception for !this.lambdaContext', () => {
    let spyCallback = sinon.spy();
    let error = null;
    let token = new Token(identityPoolId);

    try {
      token._backendLoadCredentials(spyCallback);
    } catch (e) {
      error = e;
    }

    chai.assert.instanceOf(
      error, Exception, 'error is an instance of Exception'
    );
    chai.expect(spyCallback).to.not.have.been.calledWith();
  });

  test('Check _backendLoadCredentials() executes with data in listRecords()', () => {
    let spyCallback = sinon.spy();
    let expectedResult = null;

    //mocking AWS.CognitoSync
    let credentialsManagerExport = requireProxy('../lib/CredentialsManager', {
      'aws-sdk': cognitoSyncDataMode,
    });
    let CredentialsManager = credentialsManagerExport.CredentialsManager;
    let credentialsManager = new CredentialsManager(identityPoolId);

    //mocking AWS.CognitoIdentityCredentials for Token
    let tokenExport = requireProxy('../lib/Token', {
      'aws-sdk': cognitoIdentityCredentialsDataMode,
    });
    let Token = tokenExport.Token;
    let token = new Token(identityPoolId);
    token.lambdaContext = lambdaContext;
    token._credsManager = credentialsManager;

    token._backendLoadCredentials(spyCallback);

    for (let record of CognitoSyncMock.DATA.Records) {
      if (record.Key === CredentialsManager.RECORD_NAME) {
        expectedResult = credentialsManager._decodeCredentials(record.Value);
        break;
      }
    }

    //check first cb arguments equals null
    chai.expect(spyCallback.args[0][0]).to.equal(null);
    //check first cb arguments equals expectedResult
    chai.expect(spyCallback.args[0][1]).to.eql(expectedResult);
  });

  test('Check _frontendLoadCredentials() executes successfully', () => {
    let spyCallback = sinon.spy();

    let credentialsManagerExport = requireProxy('../lib/CredentialsManager', {
      'aws-sdk': cognitoSyncClient,
    });
    let CredentialsManager = credentialsManagerExport.CredentialsManager;

    //mocking CredentialsManager for Token
    let tokenExport = requireProxy('../lib/Token', {
      'CredentialsManager': CredentialsManager,
    });
    let Token = tokenExport.Token;
    let token = new Token(identityPoolId);
    token.identityProvider = identityProvider;
    token._credsManager.cognitoSyncClient.setMode(
      CognitoSyncClientMock.DATA_MODE_WITH_DATA_IN_GET_DATASET, ['openOrCreateDataset']
    );
    token._frontendLoadCredentials(spyCallback);

    let cbArgs = spyCallback.args[0];

    chai.expect(spyCallback.calledOnce).to.equal(true);
    chai.expect(cbArgs[0]).to.equal(null);
    chai.expect(cbArgs[1].code).to.equal(Dataset.DATA.code);
  });

  test('Check registerTokenExpiredCallback() throws "CoreException.InvalidArgumentException"',
    () => {
      let error = null;

      try {
        token.registerTokenExpiredCallback();
      } catch (e) {
        error = e;
      }

      chai.assert.instanceOf(
        error,
        CoreException.InvalidArgumentException,
        'error is an instance of CoreException.InvalidArgumentException'
      );
    }
  );

  test('Check registerTokenExpiredCallback()',
    () => {
      let spyCallback = sinon.spy();

      let actualResult = token.registerTokenExpiredCallback(spyCallback);

      chai.expect(actualResult.constructor.name).to.equal('Token');
      chai.expect(actualResult._tokenExpiredCallback).to.eql(spyCallback);
      chai.expect(actualResult._tokenExpiredCallback.constructor.name).to.eql('Function');
    }
  );
});

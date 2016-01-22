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
import credentials from './common/credentials';
import requireProxy from 'proxyquire';

chai.use(sinonChai);

suite('Token', function() {
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
    amazon: {
      name: IdentityProvider.AMAZON,
      data: {},
    },
    facebook: {
      name: IdentityProvider.FACEBOOK,
      data: {},
    },
    google: {
      name: IdentityProvider.GOOGLE,
      data: {},
    },
  };
  let identityProvider = new IdentityProvider(providers, providerName, identityMetadata);
  let token = new Token(identityPoolId);


  test('Class Token exists in Token', function() {
    chai.expect(typeof Token).to.equal('function');
  });

  test('Check constructor sets _identityPoolId', function() {
    chai.expect(token._identityPoolId).to.be.equal(identityPoolId);
  });

  test('Check constructor sets _identityProvider=null', function() {
    chai.expect(token.identityProvider).to.be.equal(null);
  });

  test('Check constructor sets _lambdaContext=null', function() {
    chai.expect(token.lambdaContext).to.be.equal(null);
  });

  test('Check constructor sets _user=null', function() {
    chai.expect(token._user).to.be.equal(null);
  });

  test('Check constructor sets _userProvider=null', function() {
    chai.expect(token._userProvider).to.be.equal(null);
  });

  test('Check constructor sets _credentials=null', function() {
    chai.expect(token.credentials).to.be.equal(null);
  });

  test('Check constructor sets _credsManager as new instance ofCredentialsManager',
    function() {
      chai.assert.instanceOf(
        token._credsManager, CredentialsManager, '_credsManager is an instance of CredentialsManager'
      );
      chai.expect(token._credsManager._identityPoolId).to.be.equal(identityPoolId);
    }
  );

  test('Check isAnonymous getter returns true', function() {
    chai.expect(token.isAnonymous).to.be.equal(true);
  });


  test('Check identityProvider setter',
    function() {
      token.identityProvider = identityProvider;

      chai.expect(token.identityProvider).to.be.equal(identityProvider);
      chai.assert.instanceOf(
        token.identityProvider, IdentityProvider, 'token.identityProvider is an instance of IdentityProvider'
      );
    }
  );

  test('Check lambdaContext setter', function() {
    token.lambdaContext = lambdaContext;

    chai.expect(token.lambdaContext).to.be.equal(lambdaContext);
  });

  test('Check identityId getter for !credentials', function() {
    chai.expect(token.identityId).to.be.equal(lambdaContext.identity.cognitoIdentityId);
  });

  test('Check validCredentials returns null', function() {
    chai.expect(token.validCredentials(token.credentials)).to.be.equal(null);
  });


  //@todo - uncomment when credentials uploaded
  //test('Check identityId getter for credentials', function() {
  //  chai.expect(token.identityId).to.be.eql(credentials.IdentityId);
  //});
  //
  //test('Check _validCredentials returns true', function() {
  //  chai.expect(token._validCredentials).to.be.equal(false);
  //});

  test('Check userProvider setter', function() {
    let resourceName = 'sample';
    let deepResourceServiceMock = new DeepResourceServiceMock();
    let userProvider = new UserProvider(resourceName, deepResourceServiceMock);

    token.userProvider = userProvider;

    chai.expect(token._userProvider).to.be.equal(userProvider);
  });

  test('Check _getRegionFromIdentityPoolId returns region', function() {
    let expectedResult = identityPoolId.split(':')[0];
    chai.expect(Token.getRegionFromIdentityPoolId(identityPoolId)).to.be.equal(expectedResult);
  });

  test('Check create() returns new instance of Token', function() {
    let identityPoolId = 'us-east-1:create-a2v2-465a-877v-12fd264525ef';

    let actualResult = Token.create(identityPoolId);

    chai.assert.instanceOf(actualResult, Token, 'actualResult is an instance of Token');
    chai.expect(actualResult._identityPoolId).to.be.equal(identityPoolId);
  });

  test('Check createFromIdentityProvider() returns new instance of Token', function() {
    let identityPoolId = 'us-east-1:provider-a2v2-465a-877v-12fd264525ef';
    identityProvider = new IdentityProvider(providers, 'amazon', identityMetadata);

    let actualResult = Token.createFromIdentityProvider(identityPoolId, identityProvider);

    chai.assert.instanceOf(actualResult, Token, 'actualResult is an instance of Token');
    chai.expect(actualResult._identityPoolId).to.be.equal(identityPoolId);
    chai.expect(actualResult.identityProvider).to.be.equal(identityProvider);
  });

  test('Check createFromLambdaContext() returns new instance of Token', function() {
    let lambdaContext = {context: 'test createFromLambdaContext'};

    let actualResult = Token.createFromLambdaContext(identityPoolId, lambdaContext);

    chai.assert.instanceOf(actualResult, Token, 'actualResult is an instance of Token');
    chai.expect(actualResult._identityPoolId).to.be.equal(identityPoolId);
    chai.expect(actualResult.lambdaContext).to.be.equal(lambdaContext);
  });

  test('Check _describeIdentity() returns []', function() {
    chai.expect(token._identityLogins).to.eql([]);
  });

  test('Check _describeIdentity() throws "DescribeIdentityException"', function() {
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

  test('Check _describeIdentity() executes successfully for !_identityMetadata', function() {
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

  test('Check _describeIdentity() executes successfully for _identityMetadata', function() {
    let spyCallback = sinon.spy();

    token._describeIdentity('test_identityID', spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly(CognitoIdentityMock.DATA);
    chai.expect(token._identityLogins).to.eql(CognitoIdentityMock.DATA.Logins);
  });

  test('Check getUser() executes successfully for !isAnonymous', function() {
    let spyCallback = sinon.spy();

    token.getUser(spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly(null);
  });

  test('Check getUser() method for !_user', function() {
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

  test('Check getUser() method for _user', function() {
    let spyCallback = sinon.spy();

    token.getUser(spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly(
      JSON.parse(DeepResourceServiceMock.DATA.data.Payload)
    );
  });

  test('Check loadCredentials() executes with error when this.lambdaContext', function() {
    let spyCallback = sinon.spy();

    //mocking AWS.CognitoSync for CredentialsManager
    let credentialsManagerExport = requireProxy('../lib/CredentialsManager', {
      'aws-sdk': cognitoSyncFailureMode,
    });
    let CredentialsManager = credentialsManagerExport.CredentialsManager;
    let credentialsManager = new CredentialsManager(identityPoolId);

    token._credsManager = credentialsManager;

    token.lambdaContext = lambdaContext;

    token.loadCredentials(spyCallback);

    let callbackArg = spyCallback.args[0];

    chai.expect(callbackArg[0]).to.eql(CognitoSyncMock.ERROR);
    chai.expect(callbackArg[1]).to.eql(null);
  });

  test('Check loadCredentials() executes with data when this.lambdaContext', function() {
    let spyCallback = sinon.spy();

    //mocking AWS.CognitoSync for CredentialsManager
    let credentialsManagerExport = requireProxy('../lib/CredentialsManager', {
      'aws-sdk': cognitoSyncDataMode,
    });
    let CredentialsManager = credentialsManagerExport.CredentialsManager;
    let credentialsManager = new CredentialsManager(identityPoolId);

    token._credsManager = credentialsManager;

    token.lambdaContext = lambdaContext;

    token.loadCredentials(spyCallback);

    let callbackArg = spyCallback.args[0];

    chai.expect(callbackArg[0]).to.eql(null);

    // @todo - check why it fails
    //chai.expect(callbackArg[1]).to.eql({token: 'test_session_creds'});
  });

  test('Check validCredentials(credentials) returns false', function() {
    chai.expect(token.validCredentials(token.credentials)).to.equal(false);
  });

  test('Check validCredentials(credentials) returns true', function() {
    token._credentials = credentials;
    chai.expect(token.validCredentials(token._credentials)).to.equal(true);
  });

  test('Check loadCredentials() for validCredentials', function() {
    let spyCallback = sinon.spy();

    let actualResult = token.loadCredentials(spyCallback);

    let callbackArg = spyCallback.args[0];

    chai.expect(callbackArg[0]).to.eql(null);
    chai.expect(callbackArg[1]).to.eql(credentials);
    chai.expect(actualResult).to.equal(undefined);
  });

  // @todo - adjust this case to new changes
  //test(
  //  'Check loadCredentials() executes with AuthException in cb when !this.lambdaContext',
  //  function() {
  //    let spyCallback = sinon.spy();
  //
  //    //mocking AWS.CognitoSync for CredentialsManager
  //    let tokenExport = requireProxy('../lib/Token', {
  //      'aws-sdk': cognitoIdentityCredentialsFailureMode,
  //    });
  //    let Token = tokenExport.Token;
  //    let token = new Token(identityPoolId);
  //
  //    token.loadCredentials(spyCallback);
  //
  //    let callbackArg = spyCallback.args[0];
  //
  //    chai.assert.instanceOf(
  //      callbackArg[0], AuthException, 'error in cb is an instance of AuthException'
  //    );
  //  }
  //);

  // @todo - adjust this case to new changes
  //test(
  //  'Check loadCredentials() executes with data in cb when !this.lambdaContext',
  //  function() {
  //    let spyCallback = sinon.spy();
  //
  //    //mocking AWS.CognitoIdentityCredentials for Token
  //    let tokenExport = requireProxy('../lib/Token', {
  //      'aws-sdk': cognitoIdentityCredentialsDataMode,
  //    });
  //    let Token = tokenExport.Token;
  //    let token = new Token(identityPoolId);
  //
  //    //mocking AWS.CognitoSyncClient for CredentialsManager
  //    let credentialsManagerExport = requireProxy('../lib/CredentialsManager', {
  //      'aws-sdk': cognitoSyncClient,
  //    });
  //    let CredentialsManager = credentialsManagerExport.CredentialsManager;
  //    let credentialsManager = new CredentialsManager(identityPoolId);
  //    //set modes
  //    credentialsManager.cognitoSyncClient.setMode(
  //      CognitoSyncClientMock.DATA_MODE_WITH_DATA_IN_SYNCHRONIZE_DATASET, ['openOrCreateDataset']
  //    );
  //    token._credsManager = credentialsManager;
  //
  //    token.loadCredentials(spyCallback);
  //
  //    let callbackArg = spyCallback.args[0];
  //
  //    chai.expect(callbackArg[0]).to.equal(null);
  //    chai.expect(callbackArg[1].constructor.name).to.equal('CognitoIdentityCredentialsMock');
  //  }
  //);

  // @todo - adjust this case to new changes
  //test(
  //  'Check loadCredentials() executes with error in cb when !this.lambdaContext',
  //  function() {
  //    let spyCallback = sinon.spy();
  //
  //    //mocking AWS.CognitoIdentityCredentials for Token
  //    let tokenExport = requireProxy('../lib/Token', {
  //      'aws-sdk': cognitoIdentityCredentialsDataMode,
  //    });
  //    let Token = tokenExport.Token;
  //    let token = new Token(identityPoolId);
  //
  //    //mocking AWS.CognitoSyncClient for CredentialsManager
  //    let credentialsManagerExport = requireProxy('../lib/CredentialsManager', {
  //      'aws-sdk': cognitoSyncClient,
  //    });
  //    let CredentialsManager = credentialsManagerExport.CredentialsManager;
  //    let credentialsManager = new CredentialsManager(identityPoolId);
  //    //set modes
  //    credentialsManager.cognitoSyncClient.setMode(
  //      CognitoSyncClientMock.DATA_MODE_WITH_ERROR_IN_SYNCHRONIZE_DATASET, ['openOrCreateDataset']
  //    );
  //    token._credsManager = credentialsManager;
  //
  //    token.loadCredentials(spyCallback);
  //
  //    let callbackArg = spyCallback.args[0];
  //
  //    chai.expect(callbackArg[0]).to.eql({});
  //    chai.expect(callbackArg[1]).to.equal(null);
  //  }
  //);
});

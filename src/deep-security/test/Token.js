'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import AWS from 'mock-aws';
import {Token} from '../lib.compiled/Token';
import {UserProvider} from '../lib.compiled/UserProvider';
import {IdentityProvider} from '../lib.compiled/IdentityProvider';
import {CredentialsManager} from '../lib.compiled/CredentialsManager';
import {DeepResourceServiceMock} from './Mock/DeepResourceServiceMock';

chai.use(sinonChai);

suite('Token', function() {
  //mocking Config
  //AWS.mock(
  //  'Config',       //the name of the AWS service that the method belongs
  //  'update',       //the service's method to be be mocked
  //  {               //the test data that the mocked method should return
  //    Payload: {dataKey: "testValue"},
  //    StatusCode: 201,
  //  }
  //);

  let lambdaContext = {
    context: 'test context',
    identity: {
      cognitoIdentityId: 'us-east-1:b5487645-61bd-4c3b-dd54-5cba66070e7c',
    },
  };
  let identityPoolId = 'us-east-1:44hgf876-a2v2-465a-877v-12fd264525ef';
  let providerName = 'facebook';
  let userToken = 'test_userToken';
  let userId = 'test_userId';
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
  let identityProvider = new IdentityProvider(providers, providerName, userToken, userId);
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

  test('Check getUser() method for _isAnonymous', function() {
    let spyCallback = sinon.spy();

    token.getUser(spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly(null);
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

  test('Check _validCredentials returns null', function() {
    chai.expect(token._validCredentials()).to.be.equal(null);
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

  //@todo - uncomment when credentials uploaded
  //test('Check getUser() method for !_user', function() {
  //  let spyCallback = sinon.spy();
  //
  //  token.getUser(spyCallback);
  //
  //  chai.expect(spyCallback).to.have.been.calledWithExactly(
  //    JSON.parse(DeepResourceServiceMock.DATA.data.Payload)
  //  );
  //});
  //
  //test('Check getUser() method for !_user', function() {
  //  let spyCallback = sinon.spy();
  //
  //  token.getUser(spyCallback);
  //
  //  chai.expect(spyCallback).to.have.been.calledWithExactly(
  //    JSON.parse(DeepResourceServiceMock.DATA.data.Payload)
  //  );
  //});

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
    identityProvider = new IdentityProvider(providers, 'amazon', userToken, userId);

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

  //test('Check getCredentials() method', function() {
  //  let error = null;
  //  let spyCallback = sinon.spy();
  //  let user = { user: 'testUser' };
  //
  //  try {
  //    token._user = user;
  //    token.getCredentials(spyCallback);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.equal(null);
  //});
});

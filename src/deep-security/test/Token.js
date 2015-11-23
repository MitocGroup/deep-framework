'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import AWS from 'mock-aws';
import {Token} from '../lib.compiled/Token';
import {UserProvider} from '../lib.compiled/UserProvider';
import {IdentityProvider} from '../lib.compiled/IdentityProvider';
import {CredentialsManager} from '../lib.compiled/CredentialsManager';

chai.use(sinonChai);

suite('Token', function () {
  //mocking Config
  //AWS.mock(
  //  'Config',       //the name of the AWS service that the method belongs
  //  'update',       //the service's method to be be mocked
  //  {               //the test data that the mocked method should return
  //    Payload: {dataKey: "testValue"},
  //    StatusCode: 201,
  //  }
  //);

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


  test('Class Token exists in Token', function () {
    chai.expect(typeof Token).to.equal('function');
  });

  test('Check constructor sets _identityPoolId', function () {
    chai.expect(token._identityPoolId).to.be.equal(identityPoolId);
  });

  test('Check constructor sets _identityProvider=null', function () {
    chai.expect(token.identityProvider).to.be.equal(null);
  });

  test('Check constructor sets _lambdaContext=null', function () {
    chai.expect(token.lambdaContext).to.be.equal(null);
  });

  test('Check constructor sets _user=null', function () {
    chai.expect(token._user).to.be.equal(null);
  });

  test('Check constructor sets _userProvider=null', function () {
    chai.expect(token._userProvider).to.be.equal(null);
  });

  test('Check constructor sets _credentials=null', function () {
    chai.expect(token.credentials).to.be.equal(null);
  });

  test('Check constructor sets _credsManager as new instance ofCredentialsManager',
    function () {
      chai.assert.instanceOf(
        token._credsManager, CredentialsManager, '_credsManager is an instance of CredentialsManager'
      );
      chai.expect(token._credsManager._identityPoolId).to.be.equal(identityPoolId);
    }
  );

  //test('Check userProvider setter sets new provider', function() {
  //  token.userProvider = null;
  //  chai.expect(token._userProvider).to.be.equal(null);
  //  let newUserProvider = 'userProviderTest';
  //  token.userProvider = newUserProvider;
  //  chai.expect(token._userProvider).to.be.equal(newUserProvider);
  //});

  test('Check identityProvider setter',
    function () {
      token.identityProvider = identityProvider;

      chai.expect(token.identityProvider).to.be.equal(identityProvider);
      chai.assert.instanceOf(
        token.identityProvider, IdentityProvider, 'token.identityProvider is an instance of IdentityProvider'
      );
    }
  );

  test('Check lambdaContext setter', function () {
    let lambdaContext = {context: 'test context'};
    token.lambdaContext = lambdaContext;

    chai.expect(token.lambdaContext).to.be.equal(lambdaContext);
  });

  test('Check _getRegionFromIdentityPoolId returns region', function () {
    let expectedResult = identityPoolId.split(':')[0];
    chai.expect(Token.getRegionFromIdentityPoolId(identityPoolId)).to.be.equal(expectedResult);
  });

  test('Check create() returns new instance of Token', function () {
    let identityPoolId = 'us-east-1:create-a2v2-465a-877v-12fd264525ef';

    let actualResult = Token.create(identityPoolId);

    chai.assert.instanceOf(actualResult, Token, 'actualResult is an instance of Token');
    chai.expect(actualResult._identityPoolId).to.be.equal(identityPoolId);
  });

  test('Check createFromIdentityProvider() returns new instance of Token', function () {
    let identityPoolId = 'us-east-1:provider-a2v2-465a-877v-12fd264525ef';
    identityProvider = new IdentityProvider(providers, 'amazon', userToken, userId);

    let actualResult = Token.createFromIdentityProvider(identityPoolId, identityProvider);

    chai.assert.instanceOf(actualResult, Token, 'actualResult is an instance of Token');
    chai.expect(actualResult._identityPoolId).to.be.equal(identityPoolId);
    chai.expect(actualResult.identityProvider).to.be.equal(identityProvider);
  });

  test('Check createFromLambdaContext() returns new instance of Token', function () {
    let lambdaContext = {context: 'test createFromLambdaContext'};

    let actualResult = Token.createFromLambdaContext(identityPoolId, lambdaContext);

    chai.assert.instanceOf(actualResult, Token, 'actualResult is an instance of Token');
    chai.expect(actualResult._identityPoolId).to.be.equal(identityPoolId);
    chai.expect(actualResult.lambdaContext).to.be.equal(lambdaContext);
  });

  // @note - this is goning to be refactored (https://github.com/MitocGroup/deep-framework/issues/52)
  //test('Check getUser() method for !_user', function() {
  //  let error = null;
  //  let userProvider = null;
  //  let spyCallback = sinon.spy();
  //  let response = {
  //    data: {
  //      Payload: '{"message":"User loaded successfully"}',
  //    },
  //  };
  //  let deepResourceServiceMock = {
  //    get: function(name) {
  //      return {
  //        data: name,
  //        request: function(id) {
  //          return {
  //            id: id,
  //            send: function(callback) {
  //              callback(response);
  //              return;
  //            },
  //          };
  //        },
  //      };
  //    },
  //  };
  //
  //  try {
  //    token._isAnonymous = false;
  //    userProvider = new UserProvider(null, deepResourceServiceMock);
  //    token.userProvider = userProvider;
  //    token.getUser(spyCallback);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.equal(null);
  //  chai.expect(spyCallback).to.have.been.calledWith(JSON.parse(response.data.Payload));
  //});
  //
  //test('Check getUser() method for _user', function() {
  //  let error = null;
  //  let spyCallback = sinon.spy();
  //  let user = { user: 'testUser' };
  //
  //  try {
  //    token._isAnonymous = false;
  //    token._user = user;
  //    token.getUser(spyCallback);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.equal(null);
  //  chai.expect(spyCallback).to.have.been.calledWith(user);
  //});
  //
  //test('Check getUser() method for _isAnonymous', function() {
  //  let error = null;
  //  let spyCallback = sinon.spy();
  //
  //  try {
  //    token._isAnonymous = true;
  //    token.getUser(spyCallback);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.equal(null);
  //  chai.expect(spyCallback).to.have.been.calledWith();
  //});
  //
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

'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Token} from '../lib.compiled/Token';
import {UserProvider} from '../lib.compiled/UserProvider';
import {CredentialsManager} from '../lib.compiled/CredentialsManager';

chai.use(sinonChai);

suite('Token', function() {
  let identityPoolId = 'us-east-1:44hgf876-a2v2-465a-877v-12fd264525ef';
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

  // @note - this is goning to be refactored (https://github.com/MitocGroup/deep-framework/issues/52)
  //
  //test('Check userProvider setter sets new provider', function() {
  //  token.userProvider = null;
  //  chai.expect(token._userProvider).to.be.equal(null);
  //  let newUserProvider = 'userProviderTest';
  //  token.userProvider = newUserProvider;
  //  chai.expect(token._userProvider).to.be.equal(newUserProvider);
  //});
  //
  //test('Check _getRegionFromIdentityPoolId returns region', function() {
  //  let expectedResult = identityPoolId.split(':')[0];
  //  chai.expect(Token._getRegionFromIdentityPoolId(identityPoolId)).to.be.equal(expectedResult);
  //});
  //
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

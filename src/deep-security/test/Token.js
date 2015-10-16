'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Token} from '../lib.compiled/Token';
import {UserProvider} from '../lib.compiled/UserProvider';

chai.use(sinonChai);

suite('Token', function() {
  let identityPoolId = 'us-west-2:identityPoolIdTest';
  let token = new Token(identityPoolId);

  test('Class Token exists in Token', function() {
    chai.expect(typeof Token).to.equal('function');
  });

  test('Check constructor sets _identityPoolId', function() {
    chai.expect(token._identityPoolId).to.be.equal(identityPoolId);
  });

  test('Check constructor sets _providerName=null', function() {
    chai.expect(token.providerName).to.be.equal(null);
  });

  test('Check constructor sets _providerUserToken=null', function() {
    chai.expect(token.providerUserToken).to.be.equal(null);
  });

  test('Check constructor sets _providerUserId=null', function() {
    chai.expect(token.providerUserId).to.be.equal(null);
  });

  test('Check constructor sets _user=null', function() {
    chai.expect(token._user).to.be.equal(null);
  });

  test('Check constructor sets _userProvider=null', function() {
    chai.expect(token._userProvider).to.be.equal(null);
  });

  test('Check constructor sets _identityId=null', function() {
    chai.expect(token.identityId).to.be.equal(null);
  });

  test('Check constructor sets _credentials=null', function() {
    chai.expect(token.credentials).to.be.equal(null);
  });

  test('Check constructor sets _isAnonymous=true', function() {
    chai.expect(token.isAnonymous).to.be.equal(true);
  });

  test('Check userProvider setter sets new provider', function() {
    token.userProvider = null;
    chai.expect(token._userProvider).to.be.equal(null);
    let newUserProvider = 'userProviderTest';
    token.userProvider = newUserProvider;
    chai.expect(token._userProvider).to.be.equal(newUserProvider);
  });

  test('Check _getRegionFromIdentityPoolId returns region', function() {
    let expectedResult = identityPoolId.split(':')[0];
    chai.expect(Token._getRegionFromIdentityPoolId(identityPoolId)).to.be.equal(expectedResult);
  });

  test('Check getUser() method for !_user', function() {
    let error = null;
    let userProvider = null;
    let spyCallback = sinon.spy();
    let response = {
      data: {
        Payload: '{"message":"User loaded successfully"}',
      },
    };
    let deepResourceServiceMock = {
      get: function(name) {
        return {
          data: name,
          request: function(id) {
            return {
              id: id,
              send: function(callback) {
                callback(response);
                return;
              },
            };
          },
        };
      },
    };

    try {
      token._isAnonymous = false;
      userProvider = new UserProvider(null, deepResourceServiceMock);
      token.userProvider = userProvider;
      token.getUser(spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.calledWith(JSON.parse(response.data.Payload));
  });

  test('Check getUser() method for _user', function() {
    let error = null;
    let spyCallback = sinon.spy();
    let user = { user: 'testUser' };

    try {
      token._isAnonymous = false;
      token._user = user;
      token.getUser(spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.calledWith(user);
  });

  test('Check getUser() method for _isAnonymous', function() {
    let error = null;
    let spyCallback = sinon.spy();

    try {
      token._isAnonymous = true;
      token.getUser(spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.calledWith();
  });

  test('Check getCredentials() method', function() {
    let error = null;
    let spyCallback = sinon.spy();
    let user = { user: 'testUser' };

    try {
      token._user = user;
      token.getCredentials(spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
  });
});
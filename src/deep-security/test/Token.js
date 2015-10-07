'use strict';

import chai from 'chai';
import {Token} from '../lib.compiled/Token';

suite('Token', function() {
  let identityPoolId = 'us-west-2:identityPoolIdTest';
  let token = new Token(identityPoolId);
  let callbackFunction = (data) => {
    return data;
  };

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
});
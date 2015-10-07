'use strict';

import chai from 'chai';
import {LocalToken} from '../lib.compiled/LocalToken';

suite('LocalToken', function() {
  let identityPoolId = 'us-west-2:identityPoolIdTest';
  let localToken = new LocalToken(identityPoolId);
  let callbackFunction = (error, data) => {
    return data;
  };

  test('Class LocalToken exists in LocalToken', function() {
    chai.expect(typeof LocalToken).to.equal('function');
  });

  test('Check constructor sets _identityPoolId', function() {
    chai.expect(localToken._identityPoolId).to.be.equal(identityPoolId);
  });

  test('Check constructor sets _providerName=null', function() {
    chai.expect(localToken.providerName).to.be.equal(null);
  });

  test('Check constructor sets _providerUserToken=null', function() {
    chai.expect(localToken.providerUserToken).to.be.equal(null);
  });

  test('Check constructor sets _providerUserId=null', function() {
    chai.expect(localToken.providerUserId).to.be.equal(null);
  });

  test('Check constructor sets _user=null', function() {
    chai.expect(localToken._user).to.be.equal(null);
  });

  test('Check constructor sets _userProvider=null', function() {
    chai.expect(localToken._userProvider).to.be.equal(null);
  });

  test('Check constructor sets _identityId=null', function() {
    chai.expect(localToken.identityId).to.be.equal(null);
  });

  test('Check constructor sets _credentials=null', function() {
    chai.expect(localToken.credentials).to.be.equal(null);
  });

  test('Check constructor sets _isAnonymous=true', function() {
    chai.expect(localToken.isAnonymous).to.be.equal(true);
  });

  test('Check userProvider setter sets new provider', function() {
    localToken.userProvider = null;
    chai.expect(localToken._userProvider).to.be.equal(null);
    let newUserProvider = 'userProviderTest';
    localToken.userProvider = newUserProvider;
    chai.expect(localToken._userProvider).to.be.equal(newUserProvider);
  });

  test('Check getCredentials method', function() {
    let providerUserId = {data: 'providerUserId'};
    localToken._providerUserId = providerUserId;
    localToken.getCredentials(callbackFunction)
    chai.expect(localToken.identityId).to.be.eql(providerUserId);
  });
});
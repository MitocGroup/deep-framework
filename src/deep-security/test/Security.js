'use strict';

import chai from 'chai';
import {Security} from '../lib.compiled/Security';
import {MissingLoginProviderException} from '../lib.compiled/Exception/MissingLoginProviderException';

suite('Security', function() {
  let identityPoolId = 'us-west-2:identityPoolIdTest';
  let security = new Security(identityPoolId);

  test('Class Security exists in Security', function() {
    chai.expect(typeof Security).to.equal('function');
  });

  test('Check constructor sets _identityPoolId', function() {
    chai.expect(security.identityPoolId).to.be.equal(identityPoolId);
  });

  test('Check constructor sets _identityProviders={}', function() {
    chai.expect(security.identityProviders).to.be.eql({});
  });

  test('Check constructor sets _token=null', function() {
    chai.expect(security.token).to.be.eql(null);
  });

  test('Check constructor sets _userProviderEndpoint=null', function() {
    chai.expect(security._userProviderEndpoint).to.be.eql(null);
  });

  test('Check PROVIDER_AMAZON static getter returns value \'www.amazon.com\'', function() {
    chai.expect(Security.PROVIDER_AMAZON).to.be.equal('www.amazon.com');
  });

  test('Check PROVIDER_FACEBOOK static getter returns value \'graph.facebook.com\'', function() {
    chai.expect(Security.PROVIDER_FACEBOOK).to.be.equal('graph.facebook.com');
  });

  test('Check PROVIDER_GOOGLE static getter returns value \'accounts.google.com\'', function() {
    chai.expect(Security.PROVIDER_GOOGLE).to.be.equal('accounts.google.com');
  });

  test('Check getLoginProviderConfig method throws \'MissingLoginProviderException\' exception:', function() {
    let error = null;
    try {
      security.getLoginProviderConfig(Security.PROVIDER_AMAZON);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.expect(error).to.be.an.instanceof(MissingLoginProviderException);
  });
});

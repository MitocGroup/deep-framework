'use strict';

import chai from 'chai';
import {IdentityProvider} from '../lib/IdentityProvider';
import {MissingLoginProviderException} from '../lib/Exception/MissingLoginProviderException';

suite('IdentityProvider', function() {
  let identityProvider = null;
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

  test('Class IdentityProvider exists in IdentityProvider', function() {
    chai.expect(typeof IdentityProvider).to.equal('function');
  });

  test('Check AMAZON static getter returns value "www.amazon.com"', function() {
    chai.expect(IdentityProvider.AMAZON).to.be.equal('www.amazon.com');
  });

  test('Check FACEBOOK static getter returns value "graph.facebook.com"', function() {
    chai.expect(IdentityProvider.FACEBOOK).to.be.equal('graph.facebook.com');
  });

  test('Check GOOGLE static getter returns value "graph.facebook.com"', function() {
    chai.expect(IdentityProvider.GOOGLE).to.be.equal('accounts.google.com');
  });

  test('Check constructor sets values by default', function() {
    identityProvider = new IdentityProvider(providers, providerName, userToken, userId);

    chai.expect(identityProvider.providers).to.be.eql(providers);
    chai.expect(identityProvider.name).to.be.eql(providerName);
    chai.expect(identityProvider.userToken).to.be.eql(userToken);
    chai.expect(identityProvider.userId).to.be.eql(userId);
  });

  test('Check constructor throws "MissingLoginProviderException" for missing provider', function() {
    let error = null;

    try {
      identityProvider = new IdentityProvider(providers, 'missing_provider', userToken, userId);
    } catch (e) {
      error = e;
    }

    chai.assert.instanceOf(
      error, MissingLoginProviderException, 'error is an instance of MissingLoginProviderException'
    );
  });

  test('Check config() throws "MissingLoginProviderException" for missing provider', function() {
    let actualResult = identityProvider.config(providerName);

    chai.expect(actualResult).to.eql(providers[providerName]);
  });

  test('Check config() throws "MissingLoginProviderException" for missing provider', function() {
    let error = null;

    try {
      identityProvider.config('missing_provider');
    } catch (e) {
      error = e;
    }

    chai.assert.instanceOf(
      error, MissingLoginProviderException, 'error is an instance of MissingLoginProviderException'
    );
  });
});

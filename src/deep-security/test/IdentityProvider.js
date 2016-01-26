'use strict';

import chai from 'chai';
import {IdentityProvider} from '../lib/IdentityProvider';
import {MissingLoginProviderException} from '../lib/Exception/MissingLoginProviderException';
import {IdentityProviderMismatchException} from '../lib/Exception/IdentityProviderMismatchException';
import {InvalidProviderIdentityException} from '../lib/Exception/InvalidProviderIdentityException';

suite('IdentityProvider', function() {
  let identityProvider = null;
  let providerName = 'facebook';
  let date = new Date();

  // add a day
  date.setDate(date.getDate() + 1);

  let identityMetadata = {
    access_token: 'test_userToken',
    tokenExpirationTime: date,
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
    identityProvider = new IdentityProvider(providers, providerName, identityMetadata);

    chai.expect(identityProvider.providers).to.be.eql(providers);
    chai.expect(identityProvider.name).to.be.eql(providerName);
    chai.expect(identityProvider.userToken).to.be.eql(identityMetadata.access_token);
    chai.expect(identityProvider.userId).to.be.eql(identityMetadata.user_id);
    chai.expect(identityProvider.tokenExpirationTime).to.be.eql(identityMetadata.tokenExpirationTime);
  });

  test('Check constructor throws "MissingLoginProviderException" for missing provider', function() {
    let error = null;

    try {
      identityProvider = new IdentityProvider(providers, 'missing_provider', identityMetadata);
    } catch (e) {
      error = e;
    }

    chai.assert.instanceOf(
      error, MissingLoginProviderException, 'error is an instance of MissingLoginProviderException'
    );
  });

  test('Check constructor throws "IdentityProviderMismatchException"', function() {
    let error = null;
    let identityMetadata = {
      access_token: 'test_userToken',
      tokenExpirationTime: date,
      user_id: 'test_userId',
      provider: 'invalid provider',
    };

    try {
      identityProvider = new IdentityProvider(providers, 'amazon', identityMetadata);
    } catch (e) {
      error = e;
    }

    chai.assert.instanceOf(
      error, IdentityProviderMismatchException, 'error is an instance of IdentityProviderMismatchException'
    );
  });

  test('Check constructor throws "InvalidProviderIdentityException"', function() {
    let error = null;
    let identityMetadata = {
      tokenExpirationTime: date,
      user_id: 'test_userId',
    };

    try {
      identityProvider = new IdentityProvider(providers, 'amazon', identityMetadata);
    } catch (e) {
      error = e;
    }

    chai.assert.instanceOf(
      error, InvalidProviderIdentityException, 'error is an instance of InvalidProviderIdentityException'
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

  test('Check ALIASES static method returns valid array of aliases for AMAZON', function() {
    let actualResult = IdentityProvider.ALIASES(IdentityProvider.AMAZON);

    chai.expect(actualResult).to.be.eql(['www.amazon.com', 'amazon']);
  });

  test('Check ALIASES static method returns valid array of aliases for GOOGLE', function() {
    let actualResult = IdentityProvider.ALIASES(IdentityProvider.GOOGLE);

    chai.expect(actualResult).to.be.eql(['accounts.google.com', 'google', 'google-oauth2']);
  });

  test('Check ALIASES static method returns valid array of aliases for FACEBOOK', function() {
    let actualResult = IdentityProvider.ALIASES(IdentityProvider.FACEBOOK);

    chai.expect(actualResult).to.be.eql(['graph.facebook.com', 'facebook']);
  });

  test('Check isTokenValid() returns true', function() {
    chai.expect(identityProvider.isTokenValid()).to.be.equal(true);
  });

  test('Check isTokenValid() returns false for tokenExpirationTime', function() {
    let date = new Date();
    date.setDate(date.getDate() - 1);

    let identityMetadata = {
      access_token: 'test_userToken',
      tokenExpirationTime: date,
      user_id: 'test_userId',
    };

    identityProvider = new IdentityProvider(providers, providerName, identityMetadata);

    chai.expect(identityProvider.isTokenValid()).to.be.equal(false);
  });

  test('Check isTokenValid() returns false when !tokenExpirationTime', function() {
    identityProvider._tokenExpTime = null;

    chai.expect(identityProvider.isTokenValid()).to.be.equal(false);
  });
});

'use strict';

import chai from 'chai';
import {IdentityProvider} from '../lib/IdentityProvider';
import {MissingLoginProviderException} from '../lib/Exception/MissingLoginProviderException';
import {IdentityProviderMismatchException} from '../lib/Exception/IdentityProviderMismatchException';
import {InvalidProviderIdentityException} from '../lib/Exception/InvalidProviderIdentityException';

suite('IdentityProvider', () => {
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
      name: 'amazon',
      data: {},
    },
    facebook: {
      name: 'facebook',
      data: {},
    },
    google: {
      name: 'google',
      data: {},
    },
  };

  test('Class IdentityProvider exists in IdentityProvider', () => {
    chai.expect(IdentityProvider).to.be.an('function');
  });

  test('Check constructor sets values by default', () => {
    identityProvider = new IdentityProvider(providers, providerName, identityMetadata);

    chai.expect(identityProvider.providers).to.be.eql(providers);
    chai.expect(identityProvider.name).to.be.eql(providerName);
    chai.expect(identityProvider.userToken).to.be.eql(identityMetadata.access_token);
    chai.expect(identityProvider.userId).to.be.eql(identityMetadata.user_id);
    chai.expect(identityProvider.tokenExpirationTime).to.be.eql(identityMetadata.tokenExpirationTime);
  });

  test('Check constructor throws "MissingLoginProviderException" for missing provider', () => {
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

  test('Check constructor throws "IdentityProviderMismatchException"', () => {
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

  test('Check constructor throws "InvalidProviderIdentityException"', () => {
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

  test('Check config() throws "MissingLoginProviderException" for missing provider', () => {
    let actualResult = identityProvider.config(providerName);

    chai.expect(actualResult).to.eql(providers[providerName]);
  });

  test('Check config() throws "MissingLoginProviderException" for missing provider', () => {
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

  test('Check isTokenValid() returns true', () => {
    chai.expect(identityProvider.isTokenValid()).to.be.equal(true);
  });

  test('Check isTokenValid() returns false for tokenExpirationTime', () => {
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

  test('Check isTokenValid() returns false when !tokenExpirationTime', () => {
    identityProvider._tokenExpTime = null;

    chai.expect(identityProvider.isTokenValid()).to.be.equal(false);
  });
});

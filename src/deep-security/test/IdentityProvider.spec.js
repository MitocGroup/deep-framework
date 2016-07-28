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
    accessToken: 'test_userToken',
    expiresIn: 3600,
    userID: 'test_userId',
  };
  let providers = {
    'www.amazon.com': {
      name: 'www.amazon.com',
      data: {},
    },
    'graph.facebook.com': {
      name: 'graph.facebook.com',
      data: {},
    },
    'accounts.google.com': {
      name: 'accounts.google.com',
      data: {},
    },
  };
  let checkExperationDate = (checkDate, expiresIn, approxTimeMs = 2000) => {
    let fromDate = new Date();
    let toDate = new Date();

    fromDate.setMilliseconds(fromDate.getMilliseconds() + expiresIn * 1000 - approxTimeMs);
    toDate.setMilliseconds(toDate.getMilliseconds() + expiresIn * 1000 + approxTimeMs);

    return (checkDate <= toDate && checkDate >= fromDate);
  };

  test('Class IdentityProvider exists in IdentityProvider', () => {
    chai.expect(IdentityProvider).to.be.an('function');
  });

  test('Check constructor sets values by default', () => {
    identityProvider = new IdentityProvider(providers, providerName, identityMetadata);

    chai.expect(identityProvider.providers).to.be.eql(providers);
    chai.expect(identityProvider.name).to.be.eql('graph.facebook.com');
    chai.expect(identityProvider.userToken).to.be.eql(identityMetadata.accessToken);
    chai.expect(identityProvider.userId).to.be.eql(identityMetadata.userID);
  });

  test('Check tokenExpirationTime is valid with 5 sec approximation', () => {
    chai.expect(
      checkExperationDate(identityProvider.tokenExpirationTime, identityMetadata.expiresIn, 4000)
    ).to.equal(true);
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
      accessToken: 'test_userToken',
      tokenExpirationTime: date,
      userID: 'test_userId',
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

  test('Check config() returns valid provider', () => {
    let actualResult = identityProvider.config('graph.facebook.com');

    chai.expect(actualResult).to.eql(providers['graph.facebook.com']);
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
    let identityMetadata = {
      accessToken: 'test_userToken',
      expiresIn: -3600,
      userID: 'test_userId',
    };

    identityProvider = new IdentityProvider(providers, providerName, identityMetadata);

    chai.expect(identityProvider.isTokenValid()).to.be.equal(false);
  });

  test('Check isTokenValid() returns false when !tokenExpirationTime', () => {
    identityProvider._tokenExpTime = null;

    chai.expect(identityProvider.isTokenValid()).to.be.equal(false);
  });
});

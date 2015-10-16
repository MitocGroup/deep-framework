'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Security} from '../lib.compiled/Security';
import {MissingLoginProviderException} from '../lib.compiled/Exception/MissingLoginProviderException';

chai.use(sinonChai);

suite('Security', function() {
  let identityPoolId = 'us-west-2:identityPoolIdTest';
  let identityProvidersMock = {
    'www.amazon.com': {
      provider: 'amazonProviderMock',
    },
    'graph.facebook.com': {
      provider: 'facebokProviderMock',
    },
    'accounts.google.com': {
      provider: 'googleProviderMock',
    },
  };
  let security = new Security(identityPoolId, identityProvidersMock);


  test('Class Security exists in Security', function() {
    chai.expect(typeof Security).to.equal('function');
  });

  test('Check constructor sets _identityPoolId', function() {
    chai.expect(security.identityPoolId).to.be.equal(identityPoolId);
  });

  test('Check constructor sets _identityProviders={}', function() {
    chai.expect(security.identityProviders).to.be.eql(identityProvidersMock);
  });

  test('Check constructor sets _token=null', function() {
    chai.expect(security.token).to.be.eql(null);
  });

  test('Check constructor sets _userProviderEndpoint=null', function() {
    chai.expect(security._userProviderEndpoint).to.be.eql(null);
  });

  test('Check userProvider getter for _userProvider', function() {
    let userProvider = 'userProviderTest';
    security._userProvider = userProvider;
    chai.expect(security.userProvider).to.be.equal(userProvider);
    security._userProvider = null;
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

  test('Check getLoginProviderConfig returns amazon provider', function() {
    let error = null;
    let actualResult = null;
    try {
      actualResult = security.getLoginProviderConfig(Security.PROVIDER_AMAZON);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(actualResult).to.be.eql(identityProvidersMock[Security.PROVIDER_AMAZON]);
  });

  test('Check getLoginProviderConfig method throws \'MissingLoginProviderException\' exception', function() {
    let error = null;
    try {
      security.getLoginProviderConfig('test');
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.expect(error).to.be.an.instanceof(MissingLoginProviderException);
  });

  test('Check onTokenAvailable() method add callbacks to _onTokenAvailable[]', function() {
    let error = null;
    let testCallback = () => { return 'testCallback'; };

    chai.expect(security._onTokenAvailable.length).to.equal(0);
    try {
      security.onTokenAvailable(testCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.equal(null);
    chai.expect(security._onTokenAvailable.length).to.equal(1);
    chai.expect(security._onTokenAvailable).to.contains(testCallback);
  });

  test('Check amazonLoginProviderConfig getter returns amazon provider', function() {
    let error = null;
    let actualResult = null;
    try {
      actualResult = security.amazonLoginProviderConfig;
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(actualResult).to.be.eql(identityProvidersMock[Security.PROVIDER_AMAZON]);
  });

  test('Check facebookLoginProviderConfig getter returns facebook provider', function() {
    let error = null;
    let actualResult = null;
    try {
      actualResult = security.facebookLoginProviderConfig;
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(actualResult).to.be.eql(identityProvidersMock[Security.PROVIDER_FACEBOOK]);
  });

  test('Check googleLoginProviderConfig getter returns google provider', function() {
    let error = null;
    let actualResult = null;
    try {
      actualResult = security.googleLoginProviderConfig;
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(actualResult).to.be.eql(identityProvidersMock[Security.PROVIDER_GOOGLE]);
  });

  test('Check login() method returns valid token', function() {
    let error = null;
    let actualResult = null;
    let userToken = 'userToken';
    let userId = 'UserId';
    let spyCallback = sinon.spy();
    chai.expect(security.localBackend).to.be.equal(false);

    try {
      actualResult = security.login(Security.PROVIDER_AMAZON, userToken, userId, spyCallback);
    } catch (e) {
      error = e;
    }

    //todo - Need to finish
    //chai.expect(security._token).to.be.eql({});
    //chai.expect(error.message).to.be.equal('test');
    //chai.expect(spyCallback).to.have.been.calledWith();
  });

  test('Check anonymousLogin() method returns valid token', function() {
    let error = null;
    let actualResult = null;
    let spyCallback = sinon.spy();

    try {
      actualResult = security.anonymousLogin(spyCallback);
    } catch (e) {
      error = e;
    }

    //todo - Need to finish
    //chai.expect(security._token).to.be.eql({});
    //chai.expect(error.message).to.be.equal('test');
    //chai.expect(spyCallback).to.have.been.calledWith();
  });

  test('Check boot() method boots security data and runs callback', function() {
    let error = null;
    let spyCallback = sinon.spy();
    let kernelMock = {
      config: {
        globals: {
          logDrivers: {
            sentry: {
              dns: 'https://test3751cb500b56b4d:test7bf9aa66707c65cc31d@app.getsentry.com/48093'
            },
          },
          userProviderEndpoint: '@deep.test:create',
          security: {
            identityProviders: {
              'www.amazon.com': 'amzn1.application.test',
            },
          },
        },
      },
    };
    try {
      security.boot(kernelMock, spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.calledWith();
  });

});

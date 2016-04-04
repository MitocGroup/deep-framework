'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Security} from '../lib/Security';
import {UserProvider} from '../lib/UserProvider';
import {LocalToken} from '../lib/LocalToken';
import {Token} from '../lib/Token';
import {Exception} from '../lib/Exception/Exception';
import Kernel from 'deep-kernel';
import Log from 'deep-log';
import KernelFactory from './common/KernelFactory';
import {DeepResourceServiceMock} from './Mock/DeepResourceServiceMock';

chai.use(sinonChai);

suite('Security', function () {
  let resourceName = 'sample';
  let deepResourceServiceMock = new DeepResourceServiceMock();
  let lambdaContext = {
    context: 'test context',
    identity: {
      cognitoIdentityId: 'us-east-1:b5487645-61bd-4c3b-dd54-5cba66070e7c',
    },
  };
  let identityPoolId = 'us-east-1:44hgf876-a2v2-465a-877v-12fd264525ef';
  let identityProviders = {'www.amazon.com': 'amzn1.application.3b5k2jb65432352gfd5b23kj5hb'};
  let userProviderEndpoint = '@deep.auth:user-retrieve';
  let userProvider = new UserProvider(resourceName, deepResourceServiceMock);

  let backendKernelInstance = null;
  let frontendKernelInstance = null;
  let securityFrontend = null;
  let securityBackend = null;

  test('Load Kernel by using Kernel.load()', function (done) {
    let callback = (frontendKernel, backendKernel) => {
      chai.assert.instanceOf(
        frontendKernel, Kernel, 'frontendKernel is an instance of Kernel'
      );
      chai.assert.instanceOf(
        backendKernel, Kernel, 'backendKernel is an instance of Kernel'
      );

      frontendKernelInstance = frontendKernel;
      backendKernelInstance = backendKernel;

      securityFrontend = frontendKernel.get('security');
      securityBackend = backendKernel.get('security');

      // complete the async
      done();

    };

    KernelFactory.create({
      Security: Security,
      Log: Log,
    }, callback);
  });


  test('Class Security exists in Security', function () {
    chai.expect(Security).to.be.an('function');
  });

  test('Check constructor sets token=null', function () {
    chai.expect(securityBackend.token).to.be.eql(null);
    chai.expect(securityFrontend.token).to.be.eql(null);
  });

  test('Check constructor sets identityPoolId', function () {
    chai.expect(securityBackend.identityPoolId).to.be.eql(identityPoolId);
    chai.expect(securityFrontend.identityPoolId).to.be.eql(identityPoolId);
  });

  test('Check constructor sets _userProviderEndpoint', () => {
    chai.expect(securityBackend._userProviderEndpoint).to.be.eql(userProviderEndpoint);
    chai.expect(securityFrontend._userProviderEndpoint).to.be.eql(userProviderEndpoint);
  });

  test('Check warmupBackendLogin() throws "Exception" for frontend', function () {
    let error = null;

    try {
      securityFrontend.warmupBackendLogin();
    } catch (e) {
      error = e;
    }

    chai.assert.instanceOf(error, Exception, 'error is an instance of Exception');
  });

  test('Check warmupBackendLogin() returns valid instance of Token for !localBackend', function () {

    //hack for failing during this.container.get('resource')
    securityBackend._userProvider = userProvider;

    let actualResult = securityBackend.warmupBackendLogin(lambdaContext);

    chai.assert.instanceOf(actualResult, Token, 'actualResult is an instance of Token');
    chai.assert.instanceOf(securityBackend.token, Token, 'token is an instance of Token');
    chai.expect(actualResult._userProvider).to.eql(userProvider);
  });

  test('Check warmupBackendLogin() returns valid instance of LocalToken for localBackend', function () {

    //hack for failing during this.container.get('resource')
    securityBackend.localBackend = true;
    securityBackend._userProvider = userProvider;

    let actualResult = securityBackend.warmupBackendLogin(lambdaContext);

    chai.assert.instanceOf(actualResult, LocalToken, 'actualResult is an instance of LocalToken');
    chai.assert.instanceOf(securityBackend.token, LocalToken, 'token is an instance of LocalToken');
    chai.expect(actualResult._userProvider).to.eql(userProvider);
  });

  test('Check login() method returns valid instance of LocalToken for localBackend', () => {
    let providerName = 'amazon';
    let identityMetadata = {
      access_token: 'test_userToken',
      tokenExpirationTime: new Date(),
      user_id: 'test_userId',
    };
    let spyCallback = sinon.spy();

    securityBackend.localBackend = true;
    securityBackend._userProvider = userProvider;

    let actualResult = securityBackend.login(providerName, identityMetadata, spyCallback);

    chai.assert.instanceOf(actualResult, LocalToken, 'actualResult is an instance of LocalToken');
    chai.assert.instanceOf(securityBackend.token, LocalToken, 'token is an instance of LocalToken');
    chai.expect(actualResult._userProvider).to.eql(userProvider);
  });

  test('Check anonymousLogin() returns valid instance of LocalToken for localBackend', () => {
    let spyCallback = sinon.spy();
    securityBackend._userProvider = userProvider;
    securityBackend.localBackend = true;

    let actualResult = securityBackend.anonymousLogin(spyCallback);

    chai.assert.instanceOf(actualResult, LocalToken, 'actualResult is an instance of LocalToken');
    chai.assert.instanceOf(securityBackend.token, LocalToken, 'token is an instance of LocalToken');
    chai.expect(actualResult._userProvider).to.eql(userProvider);
  });

  test('Check boot() method for backend boots security data and runs callback', function () {
    let spyBackendCallback = sinon.spy();

    securityBackend.boot(backendKernelInstance, spyBackendCallback);

    chai.expect(spyBackendCallback).to.have.been.calledWithExactly();
    chai.expect(securityBackend.identityPoolId).to.be.equal(identityPoolId);
    chai.expect(securityBackend._identityProviders).to.be.eql(identityProviders);
    chai.expect(securityBackend._userProviderEndpoint).to.be.equal(userProviderEndpoint);
  });

  test('Check boot() method for frontend boots security data and runs callback', function () {
    let spyFrontendCallback = sinon.spy();

    securityBackend.boot(backendKernelInstance, spyFrontendCallback);

    chai.expect(spyFrontendCallback).to.have.been.calledWithExactly();
    chai.expect(securityFrontend.identityPoolId).to.be.equal(identityPoolId);
    chai.expect(securityFrontend._identityProviders).to.be.eql(identityProviders);
    chai.expect(securityFrontend._userProviderEndpoint).to.be.equal(userProviderEndpoint);
  });

  test('Check logout()', function () {
    let actualResult = securityBackend.logout();

    chai.expect(securityBackend.token).to.equal(null);

    chai.assert.instanceOf(actualResult, Security, 'actualResult is an instance of Security');
  });
});

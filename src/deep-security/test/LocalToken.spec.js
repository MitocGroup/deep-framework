'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {LocalToken} from '../lib/LocalToken';
import {IdentityProvider} from '../lib/IdentityProvider';

chai.use(sinonChai);

suite('LocalToken', function () {
  let identityPoolId = 'us-east-1:44hgf876-a2v2-465a-877v-12fd264525ef';
  let fakeIdentityId = 'us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
  let localToken = new LocalToken(identityPoolId);
  let providerName = 'amazon';
  let identityMetadata = {
    access_token: 'test_userToken',
    tokenExpirationTime: new Date(),
    user_id: 'test_userId',
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
  let identityProvider = new IdentityProvider(providers, providerName, identityMetadata);

  test('Class LocalToken exists in LocalToken', function () {
    chai.expect(LocalToken).to.be.an('function');
  });

  test('Check loadCredentials() method for !identityProvider', function () {
    let spyCallback = sinon.spy();

    localToken.loadCredentials(spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly(null, localToken._credentials);
    chai.expect(localToken._credentials.identityId).to.eql(fakeIdentityId);
  });

  test('Check identityProvider setter',
    function () {
      localToken.identityProvider = identityProvider;

      chai.expect(localToken.identityProvider).to.be.equal(identityProvider);
      chai.assert.instanceOf(
        localToken.identityProvider, IdentityProvider, 'localToken.identityProvider is an instance of IdentityProvider'
      );
    }
  );

  test('Check loadCredentials() method for identityProvider', function () {
    let spyCallback = sinon.spy();

    localToken.loadCredentials(spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly(null, localToken._credentials);
    chai.expect(localToken._credentials.identityId).to.eql(identityProvider.userId);
  });
});
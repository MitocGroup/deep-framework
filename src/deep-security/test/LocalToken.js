'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {LocalToken} from '../lib.compiled/LocalToken';
import {IdentityProvider} from '../lib.compiled/IdentityProvider';

chai.use(sinonChai);

suite('LocalToken', function() {
  let identityPoolId = 'us-east-1:44hgf876-a2v2-465a-877v-12fd264525ef';
  let localToken = new LocalToken(identityPoolId);
  let providerName = 'amazon';
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
  let identityProvider = new IdentityProvider(providers, providerName, userToken, userId);

  test('Class LocalToken exists in LocalToken', function() {
    chai.expect(typeof LocalToken).to.equal('function');
  });

  test('Check loadCredentials() method for !identityProvider', function() {
    let spyCallback = sinon.spy();

    localToken.loadCredentials(spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly(null, localToken);
    chai.expect(localToken._identityId).to.equal(null);
  });

  test('Check identityProvider setter',
    function() {
      localToken.identityProvider = identityProvider;

      chai.expect(localToken.identityProvider).to.be.equal(identityProvider);
      chai.assert.instanceOf(
        localToken.identityProvider, IdentityProvider, 'localToken.identityProvider is an instance of IdentityProvider'
      );
    }
  );

  test('Check loadCredentials() method for identityProvider', function() {
    let spyCallback = sinon.spy();

    localToken.loadCredentials(spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly(null, localToken);
    chai.expect(localToken._identityId).to.equal(identityProvider.userId);
  });
});
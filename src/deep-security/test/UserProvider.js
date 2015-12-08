'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {UserProvider} from '../lib.compiled/UserProvider';
import {LoadUserException} from '../lib.compiled/Exception/LoadUserException';
import {DeepResourceServiceMock} from './Mock/DeepResourceServiceMock';

chai.use(sinonChai);

suite('UserProvider', function() {
  let resourceName = 'sample';
  let deepResourceServiceMock = new DeepResourceServiceMock();
  let userProvider = new UserProvider(resourceName, deepResourceServiceMock);

  test('Class UserProvider exists in UserProvider', function() {
    chai.expect(typeof UserProvider).to.equal('function');
  });

  test('Check constructor sets values', function() {
    chai.expect(userProvider._retrieveUserResource).to.be.equal(resourceName);
    chai.expect(userProvider._deepResource).to.be.equal(deepResourceServiceMock);
  });

  test('Check loadUserByIdentityId() method throws "LoadUserException"', function() {
    let error = null;
    let actualResult = null;
    let spyCallback = sinon.spy();

    deepResourceServiceMock.setMode(DeepResourceServiceMock.FAILURE_MODE, ['send']);

    try {
      actualResult = userProvider.loadUserByIdentityId('test_id', spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(spyCallback).to.not.have.been.calledWith();
    chai.assert.instanceOf(error, LoadUserException, 'error is an instance of LoadUserException');
  });

  test('Check loadUserByIdentityId() method returns valid response', function() {
    let error = null;
    let actualResult = null;
    let spyCallback = sinon.spy();

    deepResourceServiceMock.setMode(DeepResourceServiceMock.DATA_MODE, ['send']);

    actualResult = userProvider.loadUserByIdentityId('test_id', spyCallback);

    chai.expect(error).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.calledWith(
      JSON.parse(DeepResourceServiceMock.DATA.data.Payload)
    );
  });
});

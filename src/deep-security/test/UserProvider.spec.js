'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {UserProvider} from '../lib/UserProvider';
import {LoadUserException} from '../lib/Exception/LoadUserException';
import {DeepResourceServiceMock} from './Mock/DeepResourceServiceMock';

chai.use(sinonChai);

suite('UserProvider', () => {
  let resourceName = 'sample';
  let deepResourceServiceMock = new DeepResourceServiceMock();
  let userProvider = new UserProvider(resourceName, deepResourceServiceMock);

  test('Class UserProvider exists in UserProvider', () => {
    chai.expect(UserProvider).to.be.an('function');
  });

  test('Check constructor sets values', () => {
    chai.expect(userProvider._retrieveUserResource).to.be.equal(resourceName);
    chai.expect(userProvider._deepResource).to.be.equal(deepResourceServiceMock);
  });

  //@todo - to be updated
  //test('Check loadUserByIdentityId() method throws "LoadUserException"', () => {
  //  let error = null;
  //  let actualResult = null;
  //  let spyCallback = sinon.spy();
  //
  //  deepResourceServiceMock.setMode(DeepResourceServiceMock.FAILURE_MODE, ['send']);
  //
  //  try {
  //    actualResult = userProvider.loadUserByIdentityId('test_id', spyCallback);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(spyCallback).to.not.have.been.calledWith();
  //  chai.assert.instanceOf(error, LoadUserException, 'error is an instance of LoadUserException');
  //});

  test('Check loadUserByIdentityId() method returns valid response', () => {
    let error = null;
    let actualResult = null;
    let spyCallback = sinon.spy();

    deepResourceServiceMock.setMode(DeepResourceServiceMock.DATA_MODE, ['send']);

    actualResult = userProvider.loadUserByIdentityId('test_id', spyCallback);

    chai.expect(error).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.calledWith(
      DeepResourceServiceMock.DATA.data
    );
  });
});

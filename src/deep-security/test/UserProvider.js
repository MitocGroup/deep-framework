'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {UserProvider} from '../lib.compiled/UserProvider';
import {LoadUserException} from '../lib.compiled/Exception/LoadUserException';

chai.use(sinonChai);

suite('UserProvider', function() {
  let userProvider = null;

  test('Class UserProvider exists in UserProvider', function() {
    chai.expect(typeof UserProvider).to.equal('function');
  });

  test('Check constructor sets values', function() {
    userProvider = new UserProvider('userResource', 'deepResource');
    chai.expect(userProvider._retrieveUserResource).to.be.equal('userResource');
    chai.expect(userProvider._deepResource).to.be.equal('deepResource');
  });

  test('Check constructor sets default values', function() {
    userProvider = new UserProvider();
    chai.expect(userProvider._retrieveUserResource).to.be.equal(undefined);
    chai.expect(userProvider._deepResource).to.be.equal(undefined);
  });

  test('Check loadUserByIdentityId() method throws \'LoadUserException\' exception', function() {
    let error = null;
    let actualResult = null;
    let spyCallback = sinon.spy();
    let deepResourceServiceMock = {
      get: function(name) {
        return {
          data: name,
          request: function(id) {
            return {
              id: id,
              send: function(callback) {
                callback({error: 'test LoadException'});
                return;
              },
            };
          },
        };
      },
    };

    try {
      userProvider = new UserProvider(null, deepResourceServiceMock);
      actualResult = userProvider.loadUserByIdentityId('idhere', spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.assert.instanceOf(error, LoadUserException, 'error is an instance of LoadUserException');
  });

  test('Check loadUserByIdentityId() method returns valid response', function() {
    let error = null;
    let actualResult = null;
    let spyCallback = sinon.spy();
    let response = {
      data: {
        Payload: '{"message":"User loaded successfully"}',
      },
    };
    let deepResourceServiceMock = {
      get: function(name) {
        return {
          data: name,
          request: function(id) {
            return {
              id: id,
              send: function(callback) {
                callback(response);
                return;
              },
            };
          },
        };
      },
    };

    try {
      userProvider = new UserProvider(null, deepResourceServiceMock);
      actualResult = userProvider.loadUserByIdentityId('idhere', spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.calledWith(JSON.parse(response.data.Payload));
  });
});

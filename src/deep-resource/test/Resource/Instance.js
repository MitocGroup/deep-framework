'use strict';

import chai from 'chai';
import {Instance} from '../../lib.compiled/Resource/Instance';
import {MissingActionException} from '../../lib.compiled/Exception/MissingResourceException';
import {Action} from '../../lib.compiled/Resource/Action';

suite('Resource/Instance', function() {
  let actionName = 'UpdateData';
  let rawActions = ['find', 'update'];
  let instance = new Instance(actionName, rawActions);
  let defaultSecurityCredentials = {
    accessKeyId: null,
    secretAccessKey: null,
    sessionToken: null,
  };

  test('Class Instance exists in Resource/Instance', function() {
    chai.expect(typeof Instance).to.equal('function');
  });

  test('Check constructor sets _name', function() {
    chai.expect(instance.name).to.be.equal(actionName);
  });

  test('Check constructor sets _rawActions', function() {
    chai.expect(instance._rawActions).to.be.equal(rawActions);
  });

  test('Check constructor sets securityCredentials', function() {
    chai.expect(instance.securityCredentials).to.be.eql(defaultSecurityCredentials);
  });

  test('Check constructor sets _actions', function() {
    chai.expect(Object.keys(instance.actions).length).to.be.equal(2);
  });

  test('Check constructor sets _localBackend=false', function() {
    chai.expect(instance.localBackend).to.be.equal(false);
  });

  test('Check constructor sets _cache=null', function() {
    chai.expect(instance.cache).to.be.equal(null);
  });

  test('Check cache() setter sets _cache={}', function() {
    instance.cache = null;
    chai.expect(instance.cache).to.be.equal(null);
    instance.cache = {};
    chai.expect(instance.cache).to.be.eql({});
  });

  test('Check localBackend() setter sets _cache={}', function() {
    instance.localBackend = false;
    chai.expect(instance.localBackend).to.be.equal(false);
    instance.localBackend = true;
    chai.expect(instance.localBackend).to.be.equal(true);
  });

  test('Check cache() setter sets securityCredentials={}', function() {
    let securityCredentials = {
      accessKeyId: 'test_accessKeyId',
      secretAccessKey: 'test_secretAccessKey',
      sessionToken: 'test_sessionToken',
    };
    chai.expect(instance.securityCredentials).to.be.eql(defaultSecurityCredentials);
    instance.securityCredentials = securityCredentials;
    chai.expect(instance.securityCredentials).to.be.eql(securityCredentials);
  });

  test('Check has() method returns false', function() {
    chai.expect(instance.has('find')).to.be.equal(false);
  });

  test('Check action() method throws \'MissingActionException\' exception', function() {
    let error = null;
    let testAction = 'find';
    try {
      instance.action(testAction);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.expect(error.message).to.be.equal(`Missing action ${testAction} in UpdateData resource.`);
  });

  test('Check action() method returns', function() {
    let error = null;
    //let testAction = instance.actions[0];
    try {
      //instance.action(testAction);
    } catch (e) {
      error = e;
    }

    //chai.expect(error).to.be.not.equal(null);
    //chai.expect(error.message).to.be.equal(`Missing action ${testAction} in UpdateData resource.`);
  });
});
'use strict';

import chai from 'chai';
import {Instance} from '../../lib.compiled/Resource/Instance';

suite('Resource/Instance', function() {
  let actionName = 'UpdateData';
  let rawActions = ['find', 'update'];
  let instance = new Instance(actionName, rawActions);

  test('Class Instance exists in Resource/Instance', function() {
    chai.expect(typeof Instance).to.equal('function');
  });

  test('Check constructor sets _name', function() {
    chai.expect(instance.name).to.be.equal(actionName);
  });

  test('Check constructor sets _rawActions', function() {
    chai.expect(instance._rawActions).to.be.equal(rawActions);
  });

  test('Check constructor sets _actions=null', function() {
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
    instance.cache = false;
    chai.expect(instance.localBackend).to.be.equal(false);
    instance.cache = true;
    chai.expect(instance.cache).to.be.equal(true);
  });
});
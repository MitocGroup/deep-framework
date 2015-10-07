'use strict';

import chai from 'chai';
import {Resource} from '../lib.compiled/Resource';
import {MissingResourceException} from '../lib.compiled/Exception/MissingResourceException';
import Kernel from 'deep-kernel';

suite('Resource', function() {
  let resourceInput = {resourceKey: 'resourceObject'};
  let resource = new Resource(resourceInput);

  test('Class Resource exists in Resource', function() {
    chai.expect(typeof Resource).to.equal('function');
  });

  test('Check constructor sets _resources', function() {
    chai.expect(resource._resources).to.be.eql(resourceInput);
  });

  test('Check has() method returns valid object', function() {
    let error = null;
    let actualResult = null;
    try {
      actualResult = resource.has('identifier');
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
  });

  test('Check get() method returns valid object', function() {
    let error = null;
    let actualResult = null;
    try {
      actualResult = resource.get('identifier');
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
  });

  test('Check list() getter returns', function() {
    let error = null;
    let actualResult = null;
    try {
      actualResult = resource.list();
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
  });

  test('Check boot() method', function() {
    let error = null;
    let actualResult = null;
    let deepServices = {
      serviceName: [
        {firstServiceKey: 'ServiceValue'},
        {secondServiceKey: 'ServiceValue'},
      ],
    };
    let kernel = new Kernel(deepServices, Kernel.FRONTEND_CONTEXT);
    let callback = () => '';
    try {
      actualResult = resource.boot(kernel, callback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
  });
});

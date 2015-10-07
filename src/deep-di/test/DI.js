'use strict';

import chai from 'chai';
import {DI} from '../lib.compiled/DI';
import Bottle from 'bottlejs';
import {MissingServiceException} from '../lib.compiled/Exception/MissingServiceException';
import Core from 'deep-core';

class FactoryClass {
  constructor() {
    this.name = 'FactoryClass';
  }
}

class ServiceClass {
  constructor() {
    this.name = 'ServiceClass';
  }
}

suite('DI', function() {
  let di = new DI();

  test('Class DI exists in DI', function() {
    chai.expect(typeof DI).to.equal('function');
  });

  test('Check constructor sets _bottle', function() {
    chai.assert.instanceOf(di._bottle, Bottle, 'this._bottle is an instance of Bottle');
  });

  test('Check get method throws \'MissingServiceException\' exception for invalid service or parameter', function() {
    let error = null;
    try {
      di.get('invalidValue');
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.expect(error).to.be.an.instanceof(MissingServiceException);
  });

  test('Check addService method throws \'Core.Exception.InvalidArgumentException\' exception for invalid service', function() {
    let error = null;
    try {
      di.addService('serviceName', 'invalidService');
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.expect(error).to.be.an.instanceof(Core.Exception.InvalidArgumentException);
  });

  test('Check addService method adds an instantiated service into container', function() {
    let error = null;
    let service = {
      name: 'serviceName',
      value: {
        data: 'testServiceObject',
      },
    };
    try {
      di.addService(service.name, service.value);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(di.get(service.name)).to.be.eql(service.value);
  });

  test('Check addParameter method adds a parameter into container', function() {
    let error = null;
    let parameter = {
      name: 'parameterName',
      value: 'parameterValue',
    };
    try {
      di.addParameter(parameter.name, parameter.value);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(di.get(parameter.name)).to.be.eql(parameter.value);
  });

  test('Check factory method creates a service', function() {
    let error = null;
    let actualResult = null;
    try {
      actualResult = di.factory('testService', FactoryClass);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
  });

  test('Check register method registers a service to container', function() {
    let error = null;
    let actualResult = null;
    let dependencies = ['dep1','dep2','dep3'];
    try {
      actualResult = di.register('testService', ServiceClass, dependencies);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
  });
});
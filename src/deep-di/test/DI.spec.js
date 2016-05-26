'use strict';

import chai from 'chai';
import {DI} from '../lib/DI';
import Bottle from 'bottlejs';
import {MissingServiceException} from '../lib/Exception/MissingServiceException';
import Core from 'deep-core';

class FactoryClass {
  constructor() {
    this.name = 'FactoryClass';
  }
}

class ServiceClass {
  constructor(firstDependencyArg, secondDependencyArg, thirdDependencyArg) {
    this.name = 'ServiceClass';
  }
}

function factoryFunction() {
  return new FactoryClass();
}

suite('DI', () => {
  let di = new DI();

  test('Class DI exists in DI', () => {
    chai.expect(DI).to.be.an('function');
  });


  test('Check constructor sets _bottle', () => {
    chai.assert.instanceOf(di._bottle, Bottle, 'this._bottle is an instance of Bottle');
  });

  test('Check get method throws "MissingServiceException" exception for invalid service or parameter', () => {
    let error = null;
    try {
      di.get('invalidValue');
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.expect(error).to.be.an.instanceof(MissingServiceException);
  });

  test('Check addService method throws "Core.Exception.InvalidArgumentException" exception for invalid service',
   () => {
    let error = null;
    try {
      di.addService('serviceName', 'invalidService');
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.expect(error).to.be.an.instanceof(Core.Exception.InvalidArgumentException);
  });

  test('Check addService method adds an instantiated service into container', () => {
    let service = {
      name: 'serviceName',
      value: {
        data: 'testServiceObject',
      },
    };
    di.addService(service.name, service.value);
    chai.expect(di.get(service.name)).to.be
      .eql(service.value);
  });

  test('Check addParameter method adds a parameter into container', () => {
    let parameter = {
      name: 'parameterName',
      value: 'parameterValue',
    };
    di.addParameter(parameter.name, parameter.value);
  });

  test('Check register method registers a service to container', () => {
    let expectedResult = new ServiceClass('dep1', 'dep2', 'dep3');
    chai.expect(di.register('testServiceWithDeps', ServiceClass, ['dep1', 'dep2', 'dep3'])).
      to.be.equal(undefined);
    let actualResult = di.get('testServiceWithDeps');
    chai.expect(actualResult).to.be.eql(expectedResult);
    chai.assert.instanceOf(actualResult, ServiceClass, 'result is an instance of ServiceClass');
  });

  test('Check factory method creates a service', () => {
    let expectedResult = factoryFunction();
    chai.expect(di.factory('testFactory', factoryFunction)).to.be.equal(undefined);
    let actualResult = di.get('testFactory');
    chai.expect(actualResult).to.be.eql(expectedResult);
    chai.assert.instanceOf(actualResult, FactoryClass, 'result is an instance of FactoryClass');
  });
});
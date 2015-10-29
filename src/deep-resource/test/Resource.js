'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Resource} from '../lib.compiled/Resource';
import {MissingResourceException} from '../lib.compiled/Exception/MissingResourceException';
import Kernel from 'deep-kernel';
import {Instance} from '../node_modules/deep-kernel/lib.compiled/Microservice/Instance';
import {DI} from '../node_modules/deep-kernel/node_modules/deep-di/lib.compiled/DI';


chai.use(sinonChai);

suite('Resource', function() {
  let testResources = {
    'deep-test': {
      test: {
        create: {
          description: 'Lambda for creating test',
          type: 'lambda',
          methods: [
            'POST',
          ],
          source: 'src/Test/Create',
        },
        retrieve: {
          description: 'Retrieves test',
          type: 'lambda',
          methods: ['GET'],
          source: 'src/Test/Retrieve',
        },
        delete: {
          description: 'Lambda for deleting test',
          type: 'lambda',
          methods: ['DELETE'],
          source: 'src/Test/Delete',
        },
        update: {
          description: 'Update test',
          type: 'lambda',
          methods: ['PUT'],
          source: 'src/Test/Update',
        },
      },
    },
  };
  let microserviceIdentifier = 'deep-test';
  let resourceName = 'test';
  let di = null;
  let microserviceInstance = new Instance(microserviceIdentifier, testResources[microserviceIdentifier]);
  let resource = new Resource(testResources);

  let kernel = new Kernel({ Resource: Resource}, Kernel.BACKEND_CONTEXT);

  test('Class Resource exists in Resource', function() {
    chai.expect(typeof Resource).to.equal('function');
  });

  test('Check constructor sets _resources', function() {
    chai.expect(resource._resources).to.be.eql(testResources);
  });

  test('Check container getter/setter', function() {
    chai.expect(resource.container).to.be.equal(null);
    resource.container = new DI();
    chai.assert.instanceOf(resource.container, DI, 'resource.container is an instance of DI');
  });

  test('Check has() method returns false', function() {
    let error = null;
    let actualResult = null;
    try {
      resource.bind(microserviceInstance);
      actualResult = resource.has('invalid_resource_identifier');
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(actualResult).to.be.equal(false);
  });

  test('Check has() method returns true', function() {
    let error = null;
    let actualResult = null;
    try {
      resource.bind(microserviceInstance);
      actualResult = resource.has(resourceName);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(actualResult).to.be.equal(true);
  });

  test('Check get() method returns valid object', function() {
    let error = null;
    let actualResult = null;
    try {
      ////create dependency injection micro container
      //di = new DI();
      //
      ////add microservice
      //di.addService(microserviceIdentifier, testResources[microserviceIdentifier]);
      //resource.container = di;

      actualResult = resource.get(`@${microserviceIdentifier}:${resourceName}`);
    } catch (e) {
      error = e;
    }

    chai.expect(error.message).to.be.eql(null);
    chai.expect(actualResult).to.be.eql(testResources[microserviceIdentifier][resourceName]);
  });

  //test('Check get() method throws \'MissingResourceException\' exception', function() {
  //  let error = null;
  //  try {
  //    resource.get(`@${microserviceIdentifier}:invalid_resource_name`);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.not.equal(null);
  //  chai.expect(error.message).to.be.equal('afdsfsd');
  //  chai.assert.instanceOf(error, MissingResourceException, 'error is an instance of MissingResourceException');
  //});

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
    let spyCallback = sinon.spy();
    let kernelMock = {
      container: {
        get: function(name) {
          if (name === 'security') {
            return {
              onTokenAvailable: function(cb) {
                return cb({credentials: 'testCredentials'});
              },
            };
          }

          return {serviceName: name};
        },
      },
      microservices: {
        'deep.test': {
          identifier: 'deep.test',
          rawResources: testResources[microserviceIdentifier],
        },
      },
    };

    try {
      actualResult = resource.boot(kernelMock, spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.calledWith();
  });
});

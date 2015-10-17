'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Resource} from '../lib.compiled/Resource';
import {MissingResourceException} from '../lib.compiled/Exception/MissingResourceException';
import Kernel from 'deep-kernel';
import {Instance} from '../node_modules/deep-kernel/lib.compiled/Microservice/Instance';

chai.use(sinonChai);

suite('Resource', function() {
  let testResources = {
    'deep.test': {
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
    'deep.second.test': {
      test: {
        create: {
          description: 'Lambda for creating secondTest',
          type: 'lambda',
          methods: [
            'POST',
          ],
          source: 'src/secondTest/Create',
        },
        retrieve: {
          description: 'Retrieves secondTest',
          type: 'lambda',
          methods: ['GET'],
          source: 'src/secondTest/Retrieve',
        },
        delete: {
          description: 'Lambda for deleting secondTest',
          type: 'lambda',
          methods: ['DELETE'],
          source: 'src/secondTest/Delete',
        },
        update: {
          description: 'Update secondTest',
          type: 'lambda',
          methods: ['PUT'],
          source: 'src/secondTest/Update',
        },
      },
    },
  };
  let microserviceIdentifier = 'deep.test';
  let resourceName = 'test';
  let microserviceInstance = new Instance(microserviceIdentifier, testResources[microserviceIdentifier]);
  let resource = new Resource(testResources);

  test('Class Resource exists in Resource', function() {
    chai.expect(typeof Resource).to.equal('function');
  });

  test('Check constructor sets _resources', function() {
    chai.expect(resource._resources).to.be.eql(testResources);
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
      actualResult = resource.get(resourceName);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(actualResult).to.be.eql(testResources[microserviceIdentifier][resourceName]);
  });

  test('Check get() method throws \'MissingResourceException\' exception', function() {
    let error = null;
    try {
      resource.get('identifier');
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.assert.instanceOf(error, MissingResourceException, 'error is an instance of MissingResourceException');
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

'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {ContainerAware} from '../lib.compiled/ContainerAware';
import {Instance} from '../lib.compiled/Microservice/Instance';
import {DI} from '../node_modules/deep-di/lib.compiled/DI';

chai.use(sinonChai);

suite('ContainerAware', function() {

  let containerAware = new ContainerAware();
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

  test('Class ContainerAware exists in ContainerAware', function() {
    chai.expect(typeof ContainerAware).to.equal('function');
  });

  test('Check localBackend getter returns valid default value [false]', function() {
    chai.assert.isFalse(containerAware.localBackend);
  });

  test('Check container getter returns valid default value [null]', function() {
    chai.assert.isNull(containerAware.container);
  });

  test('Check service getter returns valid value [this]', function() {
    chai.expect(containerAware.service).to.equal(containerAware);
  });

  test('Check localBackend setter sets value correctly', function() {
    containerAware.localBackend = true;
    chai.assert.isTrue(containerAware.localBackend);
  });

  test('Check _localBackend setter sets object correctly', function() {
    let _localBackend = {LocalBackend: true};
    containerAware.localBackend = _localBackend;
    chai.expect(containerAware.localBackend).to.equal(_localBackend);
  });

  test('Check name() method returns lower case class name', function() {
    chai.expect(containerAware.name).to.equal('containeraware');
  });

  test('Check boot() method executes callback', function() {
    var spyCallback = sinon.spy();
    containerAware.boot('kernel', spyCallback);
    chai.expect(spyCallback).to.have.been.calledWith();
  });

  test('Check _resolveIdentifier() method for string', function() {
    let inputData = '@mitocgroup.test:resource';
    let error = null;
    let actualResult = null;
    try {
      actualResult = containerAware._resolveIdentifier(inputData);
    } catch (e) {
      error = e;
    }
  });

  test('Check container setter sets object correctly', function() {
    let error = null;
    let di = null;
    try {
      //create dependency injection micro container
      di = new DI();

      //add microservice
      di.addService(microserviceIdentifier, testResources[microserviceIdentifier]);
      containerAware.container = di;
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(containerAware.container).to.be.eql(di);
    chai.expect(containerAware.container.get(microserviceIdentifier)).to.be.eql(testResources[microserviceIdentifier]);
  });

  test('Check bind(microservice) method when microservice is not a string', function() {
    let error = null;
    let microservice = null;
    try {
      //create microservice instance to bind
      microservice = new Instance(microserviceIdentifier, testResources[microserviceIdentifier]);
      containerAware.bind(microservice);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.equal(null);
    chai.expect(containerAware.container._bottle).to.be.not.eql({});
  });
});
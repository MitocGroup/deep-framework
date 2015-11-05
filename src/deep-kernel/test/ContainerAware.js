'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {ContainerAware} from '../lib.compiled/ContainerAware';
import {Instance} from '../lib.compiled/Microservice/Instance';
import {DI} from '../node_modules/deep-di/lib.compiled/DI';
import {InvalidDeepIdentifierException} from '../lib.compiled/Exception/InvalidDeepIdentifierException';
import backendConfig from './common/backend-cfg-json';

chai.use(sinonChai);

suite('ContainerAware', function() {

  let containerAware = new ContainerAware();
  let microserviceIdentifier = 'hello_world_example';
  let testResources = backendConfig.microservices;

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

  test('Check _resolveIdentifier() throws InvalidDeepIdentifierException ' +
    'for invalid identifier', function() {
    let error = null;
    try {
      containerAware._resolveIdentifier('invalid.identifier:resource');
    } catch (e) {
      error = e;
    }

    chai.assert.instanceOf(error, InvalidDeepIdentifierException,
      'error is an instance of InvalidDeepIdentifierException');
  });

  //test('Check _resolveIdentifier() method for string', function() {
  //  let inputData = '@hello_world_example:sample';
  //  let error = null;
  //  let actualResult = null;
  //  try {
  //    actualResult = containerAware._resolveIdentifier(inputData);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.equal(null);
  //  chai.expect(actualResult).to.eql('fdsfsd');
  //});

  test('Check container setter sets object correctly', function() {
    let error = null;
    let di = null;
    let actualResult = null;
    try {
      //create dependency injection micro container
      di = new DI();

      //add microservice
      di.addService(microserviceIdentifier, testResources[microserviceIdentifier]);

      containerAware.container = di;
      actualResult = containerAware.container.get('hello_world_example');
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.equal(null);
    //chai.expect(di._bottle.container).to.be.eql({});
    chai.expect(actualResult).to.eql(testResources[microserviceIdentifier]);
  });


  test('Check bind(microservice) method when microservice is not a string',
    function() {
      let resourcesToBind = {
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
          },
        },
      };
      let microserviceIdentifierToBind = 'deep-test';

      //create microservice instance to bind
      let microservice = new Instance(microserviceIdentifierToBind,
        resourcesToBind[microserviceIdentifierToBind]);
      containerAware.bind(microservice);
      chai.expect(containerAware.microservice).to.be.eql(microservice);
    });
});
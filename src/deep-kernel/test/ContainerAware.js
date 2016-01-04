'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {ContainerAware} from '../lib/ContainerAware';
import {Instance} from '../lib/Microservice/Instance';
import {InvalidDeepIdentifierException} from '../lib/Exception/InvalidDeepIdentifierException';
import KernelFactory from './common/KernelFactory';
import {Kernel} from '../lib/Kernel';

chai.use(sinonChai);

suite('ContainerAware', function() {
  let containerAware = new ContainerAware();
  let backendKernelInstance = null;

  test('Class ContainerAware exists in ContainerAware', function() {
    chai.expect(typeof ContainerAware).to.equal('function');
  });

  test('Load Kernels by using Kernel.load()', function(done) {
    let callback = (frontendKernel, backendKernel) => {
      chai.assert.instanceOf(backendKernel, Kernel, 'backendKernel is an instance of Kernel');
      backendKernelInstance = backendKernel;

      containerAware.kernel = backendKernelInstance;

      // complete the async
      done();
    };
    KernelFactory.create({}, callback);
  });

  test('Check localBackend getter returns valid default value [false]', function() {
    chai.assert.isFalse(containerAware.localBackend);
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

  test('Check _resolveIdentifier() method for string', function() {
    chai.expect(containerAware._resolveIdentifier('@hello.world.example:sample')).to.eql('sample');
  });

  test('Check get() method returns valid array', function() {
    chai.expect(containerAware.get('deep_kernel')).to.eql(backendKernelInstance);
  });
});
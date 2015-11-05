'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Kernel} from '../lib.compiled/Kernel';
import {Instance} from '../lib.compiled/Microservice/Instance';
import {Exception} from '../lib.compiled/Exception/Exception';
import {MissingMicroserviceException} from '../lib.compiled/Exception/MissingMicroserviceException';
import {DI} from '../node_modules/deep-di/lib.compiled/DI';
import {Asset} from '../node_modules/deep-asset/lib.compiled/Asset';
import KernelFactory from './common/KernelFactory';
import backendConfig from './common/backend-cfg-json';
import frontendConfig from './common/frontent-cfg-json';

chai.use(sinonChai);

suite('Kernel', function() {
  let deepServices = {
    serviceName: function() {
      return 'testService';
    },
  };
  let backendKernelInstance = null;
  let frontendKernelInstance = null;

  test('Class Kernel exists in Kernel', function() {
    chai.expect(typeof Kernel).to.equal('function');
  });

  test('Load Kernels by using Kernel.load()', function(done) {
    let callback = (frontendKernel, backendKernel) => {
      chai.assert.instanceOf(backendKernel, Kernel, 'backendKernel is an instance of Kernel');
      backendKernelInstance = backendKernel;
      chai.assert.instanceOf(frontendKernel, Kernel, 'frontendKernel is an instance of Kernel');
      frontendKernelInstance = frontendKernel;

      // complete the async
      done();
    };
    KernelFactory.create({}, callback);
  });

  test('Check constructor of Kernel throws "Exception" exception for invalid context', function() {
    let error = null;
    let context = 'invalid context';
    try {
      let invalidKernel = new Kernel({}, context);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.expect(error).to.be.an.instanceof(Exception);
    chai.expect(error.message).to.be.equal(`Undefined context "${context}"`);
  });

  test('Check constructor sets _config', function() {
    chai.expect(backendKernelInstance.config).to.be.eql(backendConfig);
    chai.expect(frontendKernelInstance.config).to.be.eql(frontendConfig);
  });

  test('Check build getter returns', function() {
    chai.expect(backendKernelInstance.buildId).to.be.eql(backendConfig.deployId);
    chai.expect(frontendKernelInstance.buildId).to.be.eql(frontendConfig.deployId);
  });

  test('Check constructor sets _services', function() {
    chai.expect(backendKernelInstance.services).to.be.eql({});
    chai.expect(frontendKernelInstance.services).to.be.eql({});
  });

  test('Check constructor sets _context', function() {
    chai.expect(backendKernelInstance.context).to.be.equal(Kernel.BACKEND_CONTEXT);
    chai.expect(frontendKernelInstance.context).to.be.equal(Kernel.FRONTEND_CONTEXT);
  });

  test('Check constructor sets _env', function() {
    chai.expect(backendKernelInstance.env).to.be.equal(backendConfig.env);
    chai.expect(frontendKernelInstance.env).to.be.equal(frontendConfig.env);
  });

  test('Check constructor sets _isLoaded', function() {
    chai.expect(backendKernelInstance.isLoaded).to.be.equal(true);
    chai.expect(frontendKernelInstance.isLoaded).to.be.equal(true);
  });

  test('Check constructor sets _container', function() {
    chai.expect(typeof backendKernelInstance.container).to.be.equal('object');
    chai.expect(typeof frontendKernelInstance.container).to.be.equal('object');
    chai.assert.instanceOf(backendKernelInstance.container, DI, 'kernel is an instance of DI');
    chai.assert.instanceOf(frontendKernelInstance.container, DI, 'kernel is an instance of DI');
  });

  test('Check isBackend getter returns false', function() {
    chai.expect(backendKernelInstance.isBackend).to.be.equal(true);
    chai.expect(frontendKernelInstance.isBackend).to.be.equal(false);
  });

  test('Check isFrontend getter returns true', function() {
    chai.expect(backendKernelInstance.isFrontend).to.be.equal(false);
    chai.expect(frontendKernelInstance.isFrontend).to.be.equal(true);
  });

  test('Check FRONTEND_BOOTSTRAP_VECTOR static getter returns value "deep_frontend_bootstrap_vector"', function() {
    chai.expect(Kernel.FRONTEND_BOOTSTRAP_VECTOR).to.be.equal('deep_frontend_bootstrap_vector');
  });

  test('Check CONFIG static getter returns value "deep_config"', function() {
    chai.expect(Kernel.CONFIG).to.be.equal('deep_config');
  });

  test('Check KERNEL static getter returns value "deep_kernel"', function() {
    chai.expect(Kernel.KERNEL).to.be.equal('deep_kernel');
  });

  test('Check CONTEXT static getter returns value "deep_context"', function() {
    chai.expect(Kernel.CONTEXT).to.be.equal('deep_context');
  });

  test('Check MICROSERVICES static getter returns value "deep_microservices"', function() {
    chai.expect(Kernel.MICROSERVICES).to.be.equal('deep_microservices');
  });

  test('Check FRONTEND_CONTEXT static getter returns value "frontend-ctx"', function() {
    chai.expect(Kernel.FRONTEND_CONTEXT).to.be.equal('frontend-ctx');
  });

  test('Check BACKEND_CONTEXT static getter returns value "backend-ctx"', function() {
    chai.expect(Kernel.BACKEND_CONTEXT).to.be.equal('backend-ctx');
  });

  test('Check ALL_CONTEXTS static getter returns valid array', function() {
    chai.expect(Kernel.ALL_CONTEXTS.length).to.be.equal(2);
    chai.expect(Kernel.ALL_CONTEXTS).to.be.contains(Kernel.FRONTEND_CONTEXT);
    chai.expect(Kernel.ALL_CONTEXTS).to.be.contains(Kernel.BACKEND_CONTEXT);
  });

  test('Check MicroserviceInjectable static getter return MicroserviceInjectable class', function() {
    chai.expect(typeof Kernel.MicroserviceInjectable).to.be.equal('function');
  });

  test('Check ContainerAware static getter return ContainerAware class', function() {
    chai.expect(typeof Kernel.ContainerAware).to.be.equal('function');
  });

  test('Check load() _isLoaded=true', function() {
    let frontendSpyCallback = sinon.spy();
    let backendSpyCallback = sinon.spy();
    frontendKernelInstance._isLoaded = true;
    backendKernelInstance._isLoaded = true;
    frontendKernelInstance.load({}, frontendSpyCallback);
    backendKernelInstance.load({}, backendSpyCallback);
    chai.expect(frontendSpyCallback).to.have.been.calledWith(frontendKernelInstance);
    chai.expect(backendSpyCallback).to.have.been.calledWith(backendKernelInstance);
  });

  test('Check get() method returns valid statement', function() {
    chai.expect(backendKernelInstance.get('deep_kernel')).to.be.eql(backendKernelInstance);
    chai.expect(frontendKernelInstance.get('deep_kernel')).to.be.eql(frontendKernelInstance);
  });

  test('Check loadFromFile() _isLoaded=true', function() {
    let spyCallback = sinon.spy();
    frontendKernelInstance._isLoaded = true;
    chai.expect(frontendKernelInstance._isLoaded).to.be.equal(true);
    frontendKernelInstance.loadFromFile('no file', spyCallback);
    chai.expect(spyCallback).to.have.been.calledWith(frontendKernelInstance);
  });

  test('Check loadFromFile() for backend with !_isLoaded', function (done) {
    let callback = (backendKernel) => {
      chai.assert.instanceOf(backendKernel, Kernel, 'backendKernel is an instance of Kernel')

      // complete the async
      done();
    };
    let backendKernelFromFile = new Kernel({
      Asset: Asset,
    }, Kernel.BACKEND_CONTEXT);
    backendKernelFromFile.loadFromFile('./test/common/backend-cfg.json', callback);
  });

  test('Check microservice() method return microservice for "hello_world_example"', function() {
    let actualResult = backendKernelInstance.microservice('hello_world_example');
    chai.assert.instanceOf(actualResult, Instance, 'result is an instance of Microservice');
  });

  test('Check microservice() method throws "MissingMicroserviceException" exception for invalid identifier', function() {
    let error = null;
    try {
      backendKernelInstance.microservice('test');
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.assert.instanceOf(error, MissingMicroserviceException, 'error is an instance of MissingMicroserviceException');
  });

  test('Check microservice() method without args', function() {
    let actualResult = backendKernelInstance.microservice();
    chai.assert.instanceOf(actualResult, Instance, 'result is an instance of Microservice');
  });
});

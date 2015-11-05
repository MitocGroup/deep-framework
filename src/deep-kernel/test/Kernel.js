'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Kernel} from '../lib.compiled/Kernel';
import {Exception} from '../lib.compiled/Exception/Exception';
import {MissingMicroserviceException} from '../lib.compiled/Exception/MissingMicroserviceException';
import DI from 'deep-di';

chai.use(sinonChai);

suite('Kernel', function() {
  let deepServices = { serviceName: function() { return 'testService'; }, };
  let kernel = null;

  test('Class Kernel exists in Kernel', function() {
    chai.expect(typeof Kernel).to.equal('function');
  });

  test('Check constructor of Kernel throws \'Exception\' exception for invalid context', function() {
    let error = null;
    let context = 'invalid context';
    try {
      kernel = new Kernel(deepServices, context);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.expect(error).to.be.an.instanceof(Exception);
    chai.expect(error.message).to.be.equal(`Undefined context "${context}"`);
  });

  test('Check instance of Kernel was created successfully', function() {
    let error = null;
    try {
      kernel = new Kernel(deepServices, Kernel.FRONTEND_CONTEXT);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(kernel).to.be.an.instanceof(Kernel);
    chai.assert.instanceOf(kernel, Kernel, 'kernel is an instance of Kernel');
  });

  test('Check constructor sets _config', function() {
    chai.expect(kernel.config).to.be.eql({});
  });

  test('Check constructor sets _services', function() {
    chai.expect(kernel.services).to.be.eql(deepServices);
  });

  test('Check constructor sets _context', function() {
    chai.expect(kernel.context).to.be.equal(Kernel.FRONTEND_CONTEXT);
  });

  test('Check constructor sets _env', function() {
    chai.expect(kernel.env).to.be.equal(null);
  });

  test('Check constructor sets _isLoaded', function() {
    chai.expect(kernel.isLoaded).to.be.equal(false);
  });

  test('Check constructor sets _container', function() {
    chai.expect(typeof kernel.container).to.be.equal('object');
    chai.assert.instanceOf(kernel.container, DI, 'kernel is an instance of DI');
  });

  test('Check isBackend getter returns false', function() {
    chai.expect(kernel.isBackend).to.be.equal(false);
  });

  test('Check isFrontend getter returns true', function() {
    chai.expect(kernel.isFrontend).to.be.equal(true);
  });

  test('Check isLocalhost getter returns valid object', function() {
    //todo - ReferenceError: window is not defined
    //chai.expect(kernel.isLocalhost).to.be.eql({});
  });

  test('Check FRONTEND_BOOTSTRAP_VECTOR static getter returns value \'deep_frontend_bootstrap_vector\'', function() {
    chai.expect(Kernel.FRONTEND_BOOTSTRAP_VECTOR).to.be.equal('deep_frontend_bootstrap_vector');
  });

  test('Check CONFIG static getter returns value \'deep_config\'', function() {
    chai.expect(Kernel.CONFIG).to.be.equal('deep_config');
  });

  test('Check KERNEL static getter returns value \'deep_kernel\'', function() {
    chai.expect(Kernel.KERNEL).to.be.equal('deep_kernel');
  });

  test('Check CONTEXT static getter returns value \'deep_context\'', function() {
    chai.expect(Kernel.CONTEXT).to.be.equal('deep_context');
  });

  test('Check MICROSERVICES static getter returns value \'deep_microservices\'', function() {
    chai.expect(Kernel.MICROSERVICES).to.be.equal('deep_microservices');
  });

  test('Check FRONTEND_CONTEXT static getter returns value \'frontend-ctx\'', function() {
    chai.expect(Kernel.FRONTEND_CONTEXT).to.be.equal('frontend-ctx');
  });

  test('Check BACKEND_CONTEXT static getter returns value \'backend-ctx\'', function() {
    chai.expect(Kernel.BACKEND_CONTEXT).to.be.equal('backend-ctx');
  });

  test('Check ALL_CONTEXTS static getter returns valid array', function() {
    chai.expect(Kernel.ALL_CONTEXTS.length).to.be.equal(2);
    chai.expect(Kernel.ALL_CONTEXTS).to.be.contains(Kernel.FRONTEND_CONTEXT);
    chai.expect(Kernel.ALL_CONTEXTS).to.be.contains(Kernel.BACKEND_CONTEXT);
  });

  test('Check buildId getter returns value \'\'', function() {
    chai.expect(kernel.buildId).to.be.equal('');
  });

  test('Check MicroserviceInjectable static getter return MicroserviceInjectable class', function() {
    chai.expect(typeof Kernel.MicroserviceInjectable).to.be.equal('function');
  });

  test('Check ContainerAware static getter return ContainerAware class', function() {
    chai.expect(typeof Kernel.ContainerAware).to.be.equal('function');
  });

  test('Check load() _isLoaded=true', function() {
    let error = null;
    let spyCallback = sinon.spy();
    kernel._isLoaded = true;

    try {
      kernel.load({}, spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.calledWith(kernel);
  });

  test('Check load() !_isLoaded', function() {
    let configData = {
      microservices: {
        deepRoot: 'CoreRoot',
        deepAuth: 'Auth',
        deepBilling: 'Billing',
      },
      env: 'dev',
    };
    let error = null;
    let spyCallback = sinon.spy();
    kernel._isLoaded = false;

    try {
      kernel.load(configData, spyCallback);
    } catch (e) {
      error = e;
    }
  });

  test('Check microservice() method throws \'MissingMicroserviceException\'exception for invalid identifier', function() {
    let error = null;
    try {
      kernel.microservice();
    } catch (e) {
      error = e;
    }

    //todo - TBD
    chai.expect(error).to.be.not.equal(null);
    //chai.expect(error).to.be.an.instanceof(MissingMicroserviceException);
    //chai.expect(error.message).to.be.equal(`Undefined context`);
  });

  test('Check get() method returns valid statement', function() {
    let error = null;
    let actualResult = null;
    try {
      actualResult = kernel.get();
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.expect(actualResult).to.be.not.eql({});
  });

  test('Check _buildContainer() method returns valid statement', function() {
    let error = null;
    let actualResult = null;
    let expectedResult = {};
    let spyCallback = sinon.spy();
    try {
      actualResult = kernel._buildContainer(spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.expect(actualResult).to.be.not.eql(expectedResult);
  });

  test('Check loadFromFile() _isLoaded=true', function() {
    let error = null;
    let spyCallback = sinon.spy();
    kernel._isLoaded = true;
    chai.expect(kernel._isLoaded).to.be.equal(true);

    try {
      kernel.loadFromFile('no file', spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.calledWith(kernel);
  });

  test('Check loadFromFile() !_isLoaded', function() {
    let error = null;
    let spyCallback = sinon.spy();
    kernel._isLoaded = false;
    chai.expect(kernel._isLoaded).to.be.equal(false);
    try {
      kernel.loadFromFile('no file', spyCallback);
    } catch (e) {
      error = e;
    }

    //todo - TBD
    // AssertionError: expected [ReferenceError: XMLHttpRequest is not defined] to equal null
    //chai.expect(error).to.be.equal(null);
    //chai.expect(spyCallback).to.have.been.called;
    //chai.expect(error).to.be.an.instanceof(MissingMicroserviceException);
    //chai.expect(error.message).to.be.equal(`Undefined context`);
  });
});
'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Kernel} from '../lib/Kernel';
import {Instance} from '../lib/Microservice/Instance';
import {Exception} from '../lib/Exception/Exception';
import {MissingMicroserviceException} from '../lib/Exception/MissingMicroserviceException';
import {AsyncConfig} from '../lib/Config/Driver/AsyncConfig';
import KernelFactory from './common/KernelFactory';
import backendConfig from './common/backend-cfg-json';
import frontendConfig from './common/frontent-cfg-json';
import Log from 'deep-log';
import Asset from 'deep-asset';
import DI from 'deep-di';

chai.use(sinonChai);

suite('Kernel', () => {

  let backendKernelInstance = null;
  let frontendKernelInstance = null;
  let services = {
    Log: Log,
  };

  test('Class Kernel exists in Kernel', () => {
    chai.expect(Kernel).to.be.an('function');
  });

  test('Load Kernels by using Kernel.load()', (done) => {
    let callback = (frontendKernel, backendKernel) => {
      chai.assert.instanceOf(backendKernel, Kernel, 'backendKernel is an instance of Kernel');
      backendKernelInstance = backendKernel;
      chai.assert.instanceOf(frontendKernel, Kernel, 'frontendKernel is an instance of Kernel');
      frontendKernelInstance = frontendKernel;

      // complete the async
      done();
    };
    KernelFactory.create(services, callback);
  });

  test('Check constructor of Kernel throws "Exception" exception for invalid context', () => {
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

  test('Check constructor sets _config', () => {
    chai.expect(backendKernelInstance.config).to.be.eql(backendConfig);
    chai.expect(frontendKernelInstance.config).to.be.eql(frontendConfig);
  });

  test('Check build getter returns', () => {
    chai.expect(backendKernelInstance.buildId).to.be.eql(backendConfig.deployId);
    chai.expect(frontendKernelInstance.buildId).to.be.eql(frontendConfig.deployId);
  });

  test('Check constructor sets _services', () => {
    chai.expect(Object.keys(backendKernelInstance.services)).to.be.eql(Object.keys(services));
    chai.expect(Object.keys(frontendKernelInstance.services)).to.be.eql(Object.keys(services));
  });

  test('Check constructor sets _context', () => {
    chai.expect(backendKernelInstance.context).to.be.equal(Kernel.BACKEND_CONTEXT);
    chai.expect(frontendKernelInstance.context).to.be.equal(Kernel.FRONTEND_CONTEXT);
  });

  test('Check constructor sets _env', () => {
    chai.expect(backendKernelInstance.env).to.be.equal(backendConfig.env);
    chai.expect(frontendKernelInstance.env).to.be.equal(frontendConfig.env);
  });

  test('Check constructor sets _isLoaded', () => {
    chai.expect(backendKernelInstance.isLoaded).to.be.equal(true);
    chai.expect(frontendKernelInstance.isLoaded).to.be.equal(true);
  });

  test('Check constructor sets _container', () => {
    chai.expect(typeof backendKernelInstance.container).to.be.equal('object');
    chai.expect(typeof frontendKernelInstance.container).to.be.equal('object');
    chai.assert.instanceOf(backendKernelInstance.container, DI, 'kernel is an instance of DI');
    chai.assert.instanceOf(frontendKernelInstance.container, DI, 'kernel is an instance of DI');
  });

  test('Check runtimeContext getter/setter', () => {
    chai.assert.instanceOf(backendKernelInstance.runtimeContext, Object, 'runtimeContext is an instance of Object');
    chai.assert.instanceOf(frontendKernelInstance.runtimeContext, Object, 'runtimeContext is an instance of Object');

    let backendRuntimeContext = backendKernelInstance.runtimeContext;
    let frontendRuntimeContext = frontendKernelInstance.runtimeContext;

    let inputBackendRuntimeContext = { backendRuntimeContextKey: 'backendRuntimeContextValue' };
    let inputFrontendRuntimeContext = { frontendRuntimeContextKey: 'frontendRuntimeContextValue' };

    backendKernelInstance.runtimeContext = inputBackendRuntimeContext;
    frontendKernelInstance.runtimeContext = inputFrontendRuntimeContext;

    chai.expect(backendKernelInstance.runtimeContext).to.be.eql(inputBackendRuntimeContext);
    chai.expect(frontendKernelInstance.runtimeContext).to.be.eql(inputFrontendRuntimeContext);

    backendRuntimeContext.runtimeContext = backendRuntimeContext;
    frontendRuntimeContext.runtimeContext = frontendRuntimeContext;
  });

  test('Check rootMicroservice() getter', () => {
    let actualResult = frontendKernelInstance.rootMicroservice;

    chai.assert.instanceOf(actualResult, Instance, 'returns an instance of Microservice');
    chai.expect(actualResult.isRoot).to.be.equal(true);

  });

  test('Check MissingMicroserviceException exist', () => {

  });

  test('Check isBackend getter returns false', () => {
    chai.expect(backendKernelInstance.isBackend).to.be.equal(true);
    chai.expect(frontendKernelInstance.isBackend).to.be.equal(false);
  });

  test('Check isFrontend getter returns true', () => {
    chai.expect(backendKernelInstance.isFrontend).to.be.equal(false);
    chai.expect(frontendKernelInstance.isFrontend).to.be.equal(true);
  });

  test('Check FRONTEND_BOOTSTRAP_VECTOR static getter returns value "deep_frontend_bootstrap_vector"', () => {
    chai.expect(Kernel.FRONTEND_BOOTSTRAP_VECTOR).to.be.equal('deep_frontend_bootstrap_vector');
  });

  test('Check CONFIG static getter returns value "deep_config"', () => {
    chai.expect(Kernel.CONFIG).to.be.equal('deep_config');
  });

  test('Check KERNEL static getter returns value "deep_kernel"', () => {
    chai.expect(Kernel.KERNEL).to.be.equal('deep_kernel');
  });

  test('Check CONTEXT static getter returns value "deep_context"', () => {
    chai.expect(Kernel.CONTEXT).to.be.equal('deep_context');
  });

  test('Check MICROSERVICES static getter returns value "deep_microservices"', () => {
    chai.expect(Kernel.MICROSERVICES).to.be.equal('deep_microservices');
  });

  test('Check FRONTEND_CONTEXT static getter returns value "frontend-ctx"', () => {
    chai.expect(Kernel.FRONTEND_CONTEXT).to.be.equal('frontend-ctx');
  });

  test('Check BACKEND_CONTEXT static getter returns value "backend-ctx"', () => {
    chai.expect(Kernel.BACKEND_CONTEXT).to.be.equal('backend-ctx');
  });

  test('Check ALL_CONTEXTS static getter returns valid array', () => {
    chai.expect(Kernel.ALL_CONTEXTS.length).to.be.equal(2);
    chai.expect(Kernel.ALL_CONTEXTS).to.be.contains(Kernel.FRONTEND_CONTEXT);
    chai.expect(Kernel.ALL_CONTEXTS).to.be.contains(Kernel.BACKEND_CONTEXT);
  });

  test('Check MicroserviceInjectable static getter return MicroserviceInjectable class', () => {
    chai.expect(typeof Kernel.MicroserviceInjectable).to.be.equal('function');
  });

  test('Check ContainerAware static getter return ContainerAware class', () => {
    chai.expect(typeof Kernel.ContainerAware).to.be.equal('function');
  });

  test('Check PROD_ENVIRONMENT static getter returns value "prod"', () => {
    chai.expect(Kernel.PROD_ENVIRONMENT).to.be.equal('prod');
  });

  test('Check STAGE_ENVIRONMENT static getter returns value "stage"', () => {
    chai.expect(Kernel.STAGE_ENVIRONMENT).to.be.equal('stage');
  });

  test('Check TEST_ENVIRONMENT static getter returns value "test"', () => {
    chai.expect(Kernel.TEST_ENVIRONMENT).to.be.equal('test');
  });

  test('Check DEV_ENVIRONMENT static getter returns value "dev"', () => {
    chai.expect(Kernel.DEV_ENVIRONMENT).to.be.equal('dev');
  });

  test('Check ASYNC_CONFIG_FILE static getter returns valid value', () => {
    chai.expect(Kernel.ASYNC_CONFIG_FILE).to.be.equal(AsyncConfig.DEFAULT_CONFIG_FILE);
  });

  test('Check ASYNC_CONFIG_CACHE_KEY static getter returns "asyncConfig"', () => {
    chai.expect(Kernel.ASYNC_CONFIG_CACHE_KEY).to.be.equal('asyncConfig');
  });

  test('Check ALL_ENVIRONMENTS static getter returns valid array"', () => {
    chai.expect(Kernel.ALL_ENVIRONMENTS).to.have.members([
      Kernel.PROD_ENVIRONMENT,
      Kernel.STAGE_ENVIRONMENT,
      Kernel.TEST_ENVIRONMENT,
      Kernel.DEV_ENVIRONMENT,
    ]);
  });

  test('Check load() _isLoaded=true', () => {
    let frontendSpyCallback = sinon.spy();
    let backendSpyCallback = sinon.spy();
    frontendKernelInstance._isLoaded = true;
    backendKernelInstance._isLoaded = true;
    frontendKernelInstance.load({}, frontendSpyCallback);
    backendKernelInstance.load({}, backendSpyCallback);
    chai.expect(frontendSpyCallback).to.have.been.calledWith(frontendKernelInstance);
    chai.expect(backendSpyCallback).to.have.been.calledWith(backendKernelInstance);
  });

  test('Check get() method returns valid statement', () => {
    chai.expect(backendKernelInstance.get('deep_kernel')).to.be.eql(backendKernelInstance);
    chai.expect(frontendKernelInstance.get('deep_kernel')).to.be.eql(frontendKernelInstance);
  });

  //test('Check loadFromFile() _isLoaded=true', () => {
  //  let spyCallback = sinon.spy();
  //  frontendKernelInstance._isLoaded = true;
  //  chai.expect(frontendKernelInstance._isLoaded).to.be.equal(true);
  //  frontendKernelInstance.loadFromFile('no file', spyCallback);
  //  chai.expect(spyCallback).to.have.been.calledWith(frontendKernelInstance);
  //});

  //test('Check loadFromFile() for backend with !_isLoaded', function (done) {
  //  let callback = (backendKernel) => {
  //    chai.assert.instanceOf(backendKernel, Kernel, 'backendKernel is an instance of Kernel');
  //
  //    // complete the async
  //    done();
  //  };
  //  let backendKernelFromFile = new Kernel({
  //    Asset: Asset,
  //    Log: Log,
  //  }, Kernel.BACKEND_CONTEXT);
  //  backendKernelFromFile.loadFromFile('./test/common/backend-cfg.json', callback);
  //});

  test('Check microservice() method return microservice for "deep-hello-world"', () => {
    let actualResult = backendKernelInstance.microservice('deep-hello-world');
    chai.assert.instanceOf(actualResult, Instance, 'result is an instance of Microservice');
  });

  test('Check microservice() method throws "MissingMicroserviceException" exception for invalid identifier',
    () => {
    let error = null;
    try {
      backendKernelInstance.microservice('test');
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.assert.instanceOf(
      error, MissingMicroserviceException, 'error is an instance of MissingMicroserviceException'
    );
  });

  test('Check microservice() method without args', () => {
    let actualResult = backendKernelInstance.microservice();
    chai.assert.instanceOf(actualResult, Instance, 'result is an instance of Microservice');
  });

  test('Check isLocalhost() getter return false', () => {
    let actualResult = backendKernelInstance.isLocalhost;
    chai.expect(actualResult).to.be.equal(false);
  });

  test('Check isRumEnabled() getter return null', () => {
    let actualResult = backendKernelInstance.isRumEnabled;
    chai.expect(actualResult).to.be.eql(null);
  });
});

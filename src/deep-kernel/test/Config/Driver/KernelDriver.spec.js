/**
 * Created by vcernomschi on 5/27/16.
 */

'use strict';

import chai from 'chai';
import {KernelDriver} from '../../../lib/Config/Driver/KernelDriver';
import {Kernel} from '../../../lib/Kernel';
import KernelFactory from './../../common/KernelFactory';
import Log from 'deep-log';

suite('Config/Driver/KernelDriver', function() {
  let backendKernelInstance = null;
  let frontendKernelInstance = null;
  let services = {
    Log: Log,
  };
  let backendKernelDriver, frontendKernelDriver;

  test('Class KernelDriver exists in Config/Driver/KernelDriver', () => {
    chai.expect(KernelDriver).to.be.an('function');
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

  test('Check KernelDriver constructor sets _kernel', () => {
    backendKernelDriver = new KernelDriver(backendKernelInstance);
    frontendKernelDriver = new KernelDriver(frontendKernelInstance);

    chai.assert.instanceOf(backendKernelDriver.kernel, Kernel, 'backendKernel is an instance of Kernel');
    chai.expect(backendKernelDriver.kernel).to.eql(backendKernelInstance);

    chai.assert.instanceOf(frontendKernelDriver.kernel, Kernel, 'backendKernel is an instance of Kernel');
    chai.expect(frontendKernelDriver.kernel).to.eql(frontendKernelInstance);
  });

  test('Check KernelDriver constructor sets _scopeKey', () => {
    chai.expect(backendKernelDriver.scopeKey).to.eql(KernelDriver.SCOPE_KEY);
  });

  test('Check KernelDriver constructor sets _configFile', () => {
    chai.expect(backendKernelDriver.configFile).to.eql(KernelDriver.DEFAULT_CONFIG_FILE);
  });

  test('Check _globalScope getter returns global object for backend', () => {
    chai.expect(backendKernelDriver._globalScope).to.contain.any.keys(['global']);
  });

  test('Check _globalScope getter returns {}', () => {
    let window = global.window;
    global.window = null;
    chai.assert.instanceOf(frontendKernelDriver._globalScope, Object);
    chai.expect(frontendKernelDriver._globalScope).to.eql({});
    global.window = window;
  });

  test('Check _globalScope getter returns {}', () => {
    let actualResult = backendKernelDriver._load();

    chai.expect(actualResult).to.equal(undefined);
  });
});

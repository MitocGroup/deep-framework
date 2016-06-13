/**
 * Created by vcernomschi on 5/27/16.
 */

'use strict';

import chai from 'chai';
import {KernelDriver} from './../../lib/Config/Driver/KernelDriver';
import {AsyncConfig} from './../../lib/Config/Driver/AsyncConfig';
import {Kernel} from './../../lib/Kernel';
import KernelFactory from './../common/KernelFactory';
import {Loader} from './../../lib/Config/Loader';
import Log from 'deep-log';

suite('Config/Loader', function() {
  let backendKernelInstance = null;
  let frontendKernelInstance = null;
  let services = {
    Log: Log,
  };
  let backendKernelDriver, frontendKernelDriver, loader;

  test('Class Loader exists in Config/Loader', () => {
    chai.expect(Loader).to.be.an('function');
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

  test('Check Loader constructor sets _driver', () => {
    backendKernelDriver = new KernelDriver(backendKernelInstance);

    loader = new Loader(backendKernelDriver);

    chai.assert.instanceOf(loader.driver, KernelDriver, 'is an instance of KernelDriver');
    chai.expect(loader.driver).to.eql(backendKernelDriver);
  });

  test('Check setDriver()', () => {
    frontendKernelDriver = new KernelDriver(frontendKernelInstance);

    loader.setDriver(frontendKernelDriver);

    chai.assert.instanceOf(loader.driver, KernelDriver, 'is an instance of KernelDriver');
    chai.expect(loader.driver).to.eql(frontendKernelDriver);
  });

  test('Check asyncConfigLoader()', () => {
    let actualResult = Loader.asyncConfigLoader(backendKernelInstance);

    chai.assert.instanceOf(actualResult, Loader, 'is an instance of Loader');
    chai.assert.instanceOf(actualResult.driver, AsyncConfig, 'is an instance of AsyncConfig');
  });

  test('Check kernelLoader()', () => {
    let actualResult = Loader.kernelLoader(backendKernelInstance);

    chai.assert.instanceOf(actualResult, Loader, 'is an instance of Loader');
    chai.assert.instanceOf(actualResult.driver, KernelDriver, 'is an instance of KernelDriver');
  });
});

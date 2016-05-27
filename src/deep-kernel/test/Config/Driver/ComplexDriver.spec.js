/**
 * Created by vcernomschi on 5/27/16.
 */

'use strict';

import chai from 'chai';
import {KernelDriver} from '../../../lib/Config/Driver/KernelDriver';
import {ComplexDriver} from '../../../lib/Config/Driver/ComplexDriver';
import {Kernel} from '../../../lib/Kernel';
import KernelFactory from './../../common/KernelFactory';
import Log from 'deep-log';

suite('Config/Driver/ComplexDriver', function () {
  let backendKernelInstance = null;
  let frontendKernelInstance = null;
  let services = {
    Log: Log,
  };
  let backendKernelDriver;
  let frontendKernelDriver;
  let backendComplexDriver;
  let frontendComplexDriver;

  test('Class ComplexDriver exists in Config/Driver/ComplexDriver', () => {
    chai.expect(ComplexDriver).to.be.an('function');
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

  test('Check KernelDriver constructor sets _drivers', () => {
    backendKernelDriver = new KernelDriver(backendKernelInstance);
    frontendKernelDriver = new KernelDriver(frontendKernelInstance);

    backendComplexDriver = new ComplexDriver(backendKernelDriver);
    frontendComplexDriver = new ComplexDriver(frontendKernelDriver);

    backendComplexDriver.drivers.forEach((driver) => {
      chai.assert.instanceOf(driver, KernelDriver, 'is an instance of KernelDriver');
      chai.expect(driver).to.eql(backendKernelDriver);
    });

    frontendComplexDriver.drivers.forEach((driver) => {
      chai.assert.instanceOf(driver, KernelDriver, 'is an instance of KernelDriver');
      chai.expect(driver).to.eql(frontendKernelDriver);
    });
  });
});

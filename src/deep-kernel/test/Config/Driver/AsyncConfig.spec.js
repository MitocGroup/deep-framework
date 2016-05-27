/**
 * Created by vcernomschi on 5/27/16.
 */

'use strict';

import chai from 'chai';
import {AsyncConfig} from '../../../lib/Config/Driver/AsyncConfig';
import {Kernel} from '../../../lib/Kernel';
import {MissingServiceException} from './../../../node_modules/deep-di/lib.compiled/Exception/MissingServiceException';
import KernelFactory from './../../common/KernelFactory';
import Log from 'deep-log';

suite('Config/Driver/AsyncConfig', function () {
  let backendKernelInstance = null;
  let frontendKernelInstance = null;
  let services = {
    Log: Log,
  };
  let backendAsyncConfig, frontendAsyncConfig;

  test('Class AsyncConfig exists in Config/Driver/AsyncConfig', () => {
    chai.expect(AsyncConfig).to.be.an('function');
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

  test('Check AsyncConfig constructor sets _kernel', () => {
    backendAsyncConfig = new AsyncConfig(backendKernelInstance);
    frontendAsyncConfig = new AsyncConfig(frontendKernelInstance);

    chai.assert.instanceOf(backendAsyncConfig.kernel, Kernel, 'backendKernel is an instance of Kernel');
    chai.expect(backendAsyncConfig.kernel).to.eql(backendKernelInstance);

    chai.assert.instanceOf(frontendAsyncConfig.kernel, Kernel, 'backendKernel is an instance of Kernel');
    chai.expect(frontendAsyncConfig.kernel).to.eql(frontendKernelInstance);
  });

  test('Check AsyncConfig constructor sets _configFile', () => {
    chai.expect(backendAsyncConfig.configFile).to.eql(AsyncConfig.DEFAULT_CONFIG_FILE);
  });

  test('Check _load() for frontend', () => {
    let error = null;

    try {
      frontendAsyncConfig._load();
    } catch (e) {
      error = e;
    }

    chai.assert.instanceOf(error, ReferenceError, 'error is an instance of ReferenceError');
  });

  test('Check _load() for backend throws "MissingServiceException"', () => {
    let error = null;

    try {
      backendAsyncConfig._load();
    } catch (e) {
      error = e;
    }

    chai.assert.instanceOf(
      error, MissingServiceException, 'error is an instance of MissingServiceException'
    );
  });
});

'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Asset} from '../lib.compiled/Asset';
import {Instance} from '../node_modules/deep-kernel/lib.compiled/Microservice/Instance';
import Kernel from 'deep-kernel';
import KernelFactory from './common/KernelFactory';

chai.use(sinonChai);

suite('Asset', function() {
  let assetService = null;
  let backendKernelInstance = null;
  let frontendKernelInstance = null;

  test('Class Asset exists in Asset', function() {
    chai.expect(typeof Asset).to.equal('function');
  });

  test('Load Kernels by using Kernel.load()', function(done) {
    let error = null;

    let callback = (frontendKernel, backendKernel) => {
      chai.expect(error).to.be.eql(null);
      chai.expect(backendKernel).to.be.not.eql({});
      backendKernelInstance = backendKernel;
      chai.expect(frontendKernel).to.be.not.eql({});
      frontendKernelInstance = frontendKernel;
      assetService = frontendKernel.get('asset');

      // complete the async
      done();
    };

    try {
      KernelFactory.create({Asset: Asset}, callback);
    } catch (e) {
      error = e;
    }
  });

  test('Check boot() method for !kernel.isFrontend', function() {
    let error = null;
    let spyCallback = sinon.spy();

    try {
      assetService.boot(backendKernelInstance, spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.calledWith();
  });

  test('Check boot() method  for kernel.isFrontend', function() {
    let error = null;
    let spyCallback = sinon.spy();
    let expectedResult = ['hello.world.example/bootstrap.js'];

    try {
      assetService.boot(frontendKernelInstance, spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(frontendKernelInstance.get(Kernel.FRONTEND_BOOTSTRAP_VECTOR)).to.be.eql(expectedResult);
    chai.expect(error).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.calledWith();
  });

  test('Check locate() method returns valid string for isRoot', function() {
    let expectedResult = 'bootstrap.js';
    let actualResult = assetService.locate('@deep.ng.root:bootstrap.js');
    chai.expect(actualResult).to.be.equal(expectedResult);
  });

  test('Check locate() method returns valid string for !isRoot', function() {
    let expectedResult = 'hello.world.example/bootstrap.js';
    let actualResult = assetService.locate('@hello.world.example:bootstrap.js');
    chai.expect(actualResult).to.be.equal(expectedResult);
  });
});

'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Asset} from '../lib/Asset';
import {Instance} from '../node_modules/deep-kernel/lib.compiled/Microservice/Instance';
import Kernel from 'deep-kernel';
import KernelFactory from './common/KernelFactory';

chai.use(sinonChai);

suite('Asset', function() {
  let assetService = null;
  let backendKernelInstance = null;
  let frontendKernelInstance = null;
  let buildId = 'm3hb5jh8';

  test('Class Asset exists in Asset', function() {
    chai.expect(typeof Asset).to.equal('function');
  });

  test('Load Kernels by using Kernel.load()', function(done) {
    let callback = (frontendKernel, backendKernel) => {
      chai.assert.instanceOf(backendKernel, Kernel, 'backendKernel is an instance of Kernel');
      backendKernelInstance = backendKernel;
      chai.assert.instanceOf(frontendKernel, Kernel, 'frontendKernel is an instance of Kernel');
      frontendKernelInstance = frontendKernel;
      assetService = frontendKernel.get('asset');

      assetService.injectBuildId = false;

      // complete the async
      done();
    };
    KernelFactory.create({Asset: Asset}, callback);
  });

  test('Check boot() method for !kernel.isFrontend', function() {
    let spyCallback = sinon.spy();
    assetService.boot(backendKernelInstance, spyCallback);
    chai.expect(spyCallback).to.have.been.calledWith();
  });

  test('Check boot() method  for kernel.isFrontend', function() {
    let spyCallback = sinon.spy();
    let expectedResult = ['hello.world.example/bootstrap.js'];
    assetService.boot(frontendKernelInstance, spyCallback);
    chai.expect(frontendKernelInstance.get(Kernel.FRONTEND_BOOTSTRAP_VECTOR)).to.be.eql(expectedResult);
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

  test(`Check locate() method returns asset with buildId injected (...?_v=${buildId})`, function() {
    assetService._buildId = buildId;
    assetService.injectBuildId = true;

    let expectedResult = `hello.world.example/bootstrap.js?_v=${buildId}`;
    let actualResult = assetService.locate('@hello.world.example:bootstrap.js');
    chai.expect(actualResult).to.be.equal(expectedResult);
  });
});

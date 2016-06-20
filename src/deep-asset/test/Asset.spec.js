'use strict';

import chai from 'chai';
import Kernel from 'deep-kernel';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Asset} from '../lib/Asset';
import {Instance} from '../node_modules/deep-kernel/lib.compiled/Microservice/Instance';
import KernelFactory from './common/KernelFactory';

chai.use(sinonChai);

suite('Asset', () => {
  let assetService = null;
  let backendKernelInstance = null;
  let frontendKernelInstance = null;
  let buildId = 'm3hb5jh8';

  test('Class Asset exists in Asset', () => {
    chai.expect(Asset).to.be.an('function');
  });

  test('Load Kernels by using Kernel.load()', (done) => {
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

  test('Check boot() method for !kernel.isFrontend', () => {
    let spyCallback = sinon.spy();
    assetService.boot(backendKernelInstance, spyCallback);
    chai.expect(spyCallback).to.have.been.calledWith();
  });

  test('Check boot() method  for kernel.isFrontend', () => {
    let spyCallback = sinon.spy();
    let expectedResult = ['deep-hello-world/bootstrap.js'];
    assetService.boot(frontendKernelInstance, spyCallback);
    chai.expect(frontendKernelInstance.get(Kernel.FRONTEND_BOOTSTRAP_VECTOR)).to.be.eql(expectedResult);
    chai.expect(spyCallback).to.have.been.calledWith();
  });

  test('Check locate() method returns valid string for isRoot', () => {
    let expectedResult = 'bootstrap.js';
    let actualResult = assetService.locate('@deep-root-vanilla:bootstrap.js');
    chai.expect(actualResult).to.be.equal(expectedResult);
  });

  test('Check locate() method returns valid string for !isRoot', () => {
    let expectedResult = 'deep-hello-world/bootstrap.js';
    let actualResult = assetService.locate('@deep-hello-world:bootstrap.js');
    chai.expect(actualResult).to.be.equal(expectedResult);
  });

  test('Check locate() method returns absolute url', () => {
    global.window = {
      location: {
        origin: 'http://example.com',
      },
    };

    let expectedResult = 'http://example.com/deep-hello-world/bootstrap.js';
    let actualResult = assetService.locateAbsolute('@deep-hello-world:bootstrap.js');
    chai.expect(actualResult).to.be.equal(expectedResult);

    delete global.window;
  });

  test('Check locate() method returns absolute url IE case (no window.location.origin)', () => {
    global.window = {
      location: {
        protocol: 'http',
        hostname: 'example.com',
        port: 8000,
      },
    };

    let expectedResult = 'http://example.com:8000/deep-hello-world/bootstrap.js';
    let actualResult = assetService.locateAbsolute('@deep-hello-world:bootstrap.js');
    chai.expect(actualResult).to.be.equal(expectedResult);

    delete global.window;
  });

  test(`Check locate() method returns asset without the buildId being injected`, () => {
    assetService._buildId = buildId;
    assetService.injectBuildId = true;

    let expectedResult = `deep-hello-world/bootstrap.js`;
    let actualResult = assetService.locate('@deep-hello-world:bootstrap.js', '', true);
    chai.expect(actualResult).to.be.equal(expectedResult);
  });

  test(`Check locate() method returns asset with buildId injected (...?_v=${buildId})`, () => {
    assetService._buildId = buildId;
    assetService.injectBuildId = true;

    let expectedResult = `deep-hello-world/bootstrap.js?_v=${buildId}`;
    let actualResult = assetService.locate('@deep-hello-world:bootstrap.js');
    chai.expect(actualResult).to.be.equal(expectedResult);
  });
});

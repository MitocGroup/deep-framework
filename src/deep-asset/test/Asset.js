'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Asset} from '../lib.compiled/Asset';
import Kernel from 'deep-kernel';
import Instance from '../node_modules/deep-kernel/lib.compiled/Microservice/Instance';
chai.use(sinonChai);


suite('Asset', function() {
  let asset = new Asset();

  test('Class Asset exists in Asset', function() {
    chai.expect(typeof Asset).to.equal('function');
  });

  test('Check boot() method  for !kernel.isFrontend', function() {
    let kernel = {isFrontend: false};
    let spyCallback = sinon.spy();
    asset.boot(kernel, spyCallback);
    chai.expect(spyCallback).to.have.been.called;
  });

  test('Check boot() method  for kernel.isFrontend', function() {
    let deepServices = { serviceName: 'serviceName' };
    let spyCallback = sinon.spy();
    let error = null;
    let kernel = null;
    try {
      kernel = new Kernel(deepServices, Kernel.FRONTEND_CONTEXT);
      asset.boot(kernel, spyCallback);
    } catch (e) {
      error = e;
    }

  });

  test('Check locate() method  returns valid string', function() {
    let deepServices = new Kernel.MicroserviceInjectable();
    chai.assert.instanceOf(deepServices, Kernel.MicroserviceInjectable, 'deepServices is an instance of MicroserviceInjectable');
    let error = null;
    let kernel = null;
    let actualResult = null;
    try {
      kernel = new Kernel(deepServices, Kernel.FRONTEND_CONTEXT);
      actualResult = asset.locate({});
    } catch (e) {
      error = e;
    }

  });
});

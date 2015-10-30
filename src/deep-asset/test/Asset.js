'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Asset from './../lib.compiled/Asset';
//import Instance from '../node_modules/deep-kernel/lib.compiled/Microservice/Instance';
//import KernelFactory from "./common/KernelFactory";

chai.use(sinonChai);

suite('Asset', function() {

  //test('Class Asset exists in Asset', function() {
  //  chai.expect(typeof Asset).to.equal('function');
  //});

  //test('Load Kernels by using Kernel.loadFromFile()', function (done) {
  //  let error = null;
  //  let backendInstance = null;
  //
  //  let callback = (backendKernel) => {
  //    //let callback = (frontendKernel, backendKernel) => {
  //
  //
  //    chai.expect(error).to.be.eql(null);
  //    chai.expect(backendKernel).to.be.not.eql({});
  //    //chai.expect(frontendKernel).to.be.not.eql({});
  //
  //    // complete the async
  //    done();
  //  };
  //  try {
  //    //KernelFactory.create({'Asset': Asset}, callback);
  //
  //    backendInstance = new Kernel({'Asset': Asset}, Kernel.BACKEND_CONTEXT);
  //
  //    backendInstance.loadFromFile('./test/common/backend.cfg.json', callback);
  //
  //    //return frontendInstance.load(frontendConfig, (frontendKernel) => {
  //    //return backendInstance.load(backendConfig, (backendKernel) => {
  //    //  //callback(frontendKernel, backendKernel);
  //    //  done();
  //    //  callback(backendKernel);
  //    //});
  //
  //  } catch (e) {
  //    error = e;
  //  }
  //});


  //KernelFactory.create({'Asset': Asset}, (frontendKernel, backendKernel) => {
  //  let assetService = new Asset();
  //  let spyCallback = sinon.spy();
  //
  //  test('Class Asset exists in Asset', function() {
  //    chai.expect(typeof Asset).to.equal('function');
  //  });
  //
  //  test('Check boot() method for !kernel.isFrontend', function() {
  //    assetService.boot(backendKernel, spyCallback);
  //    chai.expect(spyCallback).to.have.been.calledWith();
  //  });
  //
  //  test('Check boot() method  for kernel.isFrontend', function() {
  //    let error = null;
  //
  //    try {
  //      assetService.boot(frontendKernel, spyCallback);
  //    } catch (e) {
  //      error = e;
  //    }
  //
  //    // @todo - check if FRONTEND_BOOTSTRAP_VECTOR was created instead of checking for exceptions
  //    chai.expect(error).to.be.equal(null);
  //    chai.expect(spyCallback).to.have.been.calledWith();
  //
  //  });
  //
  //  test('Check locate() method returns valid string', function() {
  //    assetService.boot(frontendKernel, spyCallback);
  //
  //    let expectedResult = "hello.world.example/bootstrap.js";
  //    let actualResult = assetService.locate("@hello.world.example:bootstrap.js");
  //
  //    chai.expect(actualResult).to.be.equal(expectedResult);
  //  });
  //});
});

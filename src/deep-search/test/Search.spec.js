'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Search} from '../lib/Search';
import {UnknownSearchDomainException} from '../lib/Exception/UnknownSearchDomainException';
import Kernel from 'deep-kernel';
import KernelFactory from './common/KernelFactory';

chai.use(sinonChai);

suite('Search', function () {
  let search = null;
  let backendKernelInstance = null;

  test('Class Search exists in Search', () => {
    chai.expect(Search).to.be.an('function');
  });

  test('Load instance of Searcg by using Kernel.load()', (done) => {
    let callback = (backendKernel) => {
      backendKernelInstance = backendKernel;
      search = backendKernel.get('search');

      chai.assert.instanceOf(
        backendKernel, Kernel, 'backendKernel is an instance of Kernel'
      );
      chai.assert.instanceOf(
        search, Search, 'search is an instance of Seacrh'
      );

      // complete the async
      done();
    };

    KernelFactory.create({
      Search: Search,
    }, callback);
  });

  test('Check clientDecorator() returns null for !isRumEnabled', () => {
    let actualResult = search.clientDecorator;

    chai.expect(actualResult).to.eql(null);
  });

  test('Check _createClient() passes "UnknownSearchDomainException" exception in callback', () => {

    let invalidDomainName = 'invalid.domainName';
    let spyCallback = sinon.spy();

    search._createClient(invalidDomainName, spyCallback);

    chai.expect(spyCallback).to.have.been.calledWith();
    chai.assert.instanceOf(
      spyCallback.args[0][0],
      UnknownSearchDomainException,
      '_createClient() throws an instance of UnknownSearchDomainException'
    );
  });
});

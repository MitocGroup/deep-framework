'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {ContainerAware} from '../lib.compiled/ContainerAware';

chai.use(sinonChai);

suite('ContainerAware', function() {

  let containerAware = new ContainerAware();

  test('Class ContainerAware exists in ContainerAware', function() {
    chai.expect(typeof ContainerAware).to.equal('function');
  });

  test('Check localBackend getter returns valid default value [false]', function() {
    chai.assert.isFalse(containerAware.localBackend);
  });

  test('Check container getter returns valid default value [null]', function() {
    chai.assert.isNull(containerAware.container);
  });

  test('Check service getter returns valid value [this]', function() {
    chai.expect(containerAware.service).to.equal(containerAware);
  });

  test('Check localBackend setter sets value correctly', function() {
    containerAware.localBackend = true;
    chai.assert.isTrue(containerAware.localBackend);
  });

  test('Check _localBackend setter sets object correctly', function() {
    let _localBackend = {LocalBackend: true};
    containerAware.localBackend = _localBackend;
    chai.expect(containerAware.localBackend).to.equal(_localBackend);
  });

  test('Check name() method returns lower case class name', function() {
    chai.expect(containerAware.name).to.equal('containeraware');
  });

  test('Check boot() method executes callback', function() {
    var spyCallback = sinon.spy();
    containerAware.boot('kernel', spyCallback);
    chai.expect(spyCallback).to.have.been.calledWith();
  });

  test('Check _resolveIdentifier() method for string', function() {
    let inputData = '@mitocgroup.test:resource';
    let error = null;
    let actualResult = null;
    try {
      actualResult = containerAware._resolveIdentifier(inputData);
    } catch (e) {
      error = e;
    }
  });

  test('Check _resolveIdentifier() method for object', function() {
    let inputData = {testKey: 'testValue'};
    let error = null;
    let actualResult = null;
    try {
      actualResult = containerAware._resolveIdentifier(inputData);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(actualResult).to.be.eql(inputData);
  });

  test('Check container setter sets object correctly', function() {
    let container =  {
      _bottle: {
        container: {
        },
        id: 0,
      },
      testKey: 'test',
    };
    containerAware.container = container;
    chai.expect(containerAware.container).to.eql(container);
  });

  test('Check bind() method executes super.bind()', function() {
    let inputData = 'testMicroservice';
    let error = null;
    let actualResult = null;
    try {
      actualResult = containerAware.bind(inputData);
    } catch (e) {
      error = e;
    }
  });
});
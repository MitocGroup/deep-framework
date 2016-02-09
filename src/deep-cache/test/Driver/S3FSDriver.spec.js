'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {S3FSDriver} from '../../lib.compiled/Driver/S3FSDriver';
import {S3FSDriverMock} from './../Mocks/S3FSDriverMock';
import FSMock from './../Mocks/FSMock';
import {ContainerAware} from '../../node_modules/deep-kernel/lib.compiled/ContainerAware';

chai.use(sinonChai);

suite('Driver/S3FSDriver', () => {
  let containerAware = new ContainerAware();
  let s3FsDriver = new S3FSDriverMock(containerAware);
  let key = 'testKey';
  let fsMock = FSMock();

  test('Class S3FSDriver exists in Driver/S3FSDriver', () => {
    chai.expect(S3FSDriver).to.be.an('function');
  });

  test('Check constructor', () => {
    chai.expect(s3FsDriver, 'is an instance of S3FSDriver').to.be.an.instanceOf(S3FSDriverMock);

    chai.expect(
      s3FsDriver._containerAware, 'is an instance of ContainerAware'
    ).to.be.an.instanceOf(ContainerAware);
  });

  test('Check _fs getter', () => {
    let actualResult = s3FsDriver._fs;

    chai.expect(actualResult).to.be.an('object')
  });

  test('Check _get returns error in callback for readFile', () => {
    let spyCallback = sinon.spy();

    fsMock.setMode(fsMock.constructor.FAILURE_MODE, ['readFile']);

    let actualResult = s3FsDriver._get(key, spyCallback);

    chai.expect(actualResult).to.be.equal(undefined);
    chai.expect(spyCallback).to.have.been.calledWithExactly(fsMock.constructor.ERROR, null);
  });

  test('Check _get executes with exception and returns callback(null, null) an', () => {
    let spyCallback = sinon.spy();

    //set failure mode
    fsMock.setMode(fsMock.constructor.EXCEPTION_MODE, ['readFile']);

    let actualResult = s3FsDriver._get(key, spyCallback);

    chai.expect(actualResult).to.be.equal(undefined);
    chai.expect(spyCallback).to.have.been.calledWithExactly(null, null);
  });

  test('Check _has returns error in callback(error, false)', () => {
    let spyCallback = sinon.spy();

    fsMock.setMode(fsMock.constructor.FAILURE_MODE, ['readFile']);

    let actualResult = s3FsDriver._has(key, spyCallback);

    chai.expect(actualResult).to.be.equal(undefined);
    chai.expect(spyCallback).to.have.been.calledWithExactly(fsMock.constructor.ERROR, false);
  });

  test('Check _invalidate executes callback(null, true) timeout <= 0', () => {
    let spyCallback = sinon.spy();

    fsMock.setMode(fsMock.constructor.DATA_MODE, ['unlink']);

    let actualResult = s3FsDriver._invalidate(key, 0, spyCallback);

    chai.expect(actualResult).to.be.equal(undefined);
    chai.expect(spyCallback).to.have.been.calledWithExactly(null, true);
  });

  test('Check _invalidate executes callback(error, false) for timeout <= 0', () => {
    let spyCallback = sinon.spy();

    fsMock.setMode(fsMock.constructor.FAILURE_MODE, ['unlink']);

    let actualResult = s3FsDriver._invalidate(key, 0, spyCallback);

    chai.expect(actualResult).to.be.equal(undefined);
    chai.expect(spyCallback).to.have.been.calledWithExactly(fsMock.constructor.ERROR, false);
  });

  test('Check _invalidate executes callback(error, null) for !timeout <= 0', () => {
    let spyCallback = sinon.spy();

    fsMock.setMode(fsMock.constructor.FAILURE_MODE, ['readFile']);

    let actualResult = s3FsDriver._invalidate(key, 1, spyCallback);

    chai.expect(actualResult).to.be.equal(undefined);
    chai.expect(spyCallback).to.have.been.calledWithExactly(fsMock.constructor.ERROR, null);
  });


});

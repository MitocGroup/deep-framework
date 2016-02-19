'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {CloudFrontDriverMock} from '../Mocks/CloudFrontDriverMock';
import {AbstractFsDriver} from '../../lib/Driver/AbstractFsDriver';
import {AbstractDriver} from '../../lib/Driver/AbstractDriver';
import {CloudFrontDriver} from '../../lib/Driver/CloudFrontDriver';
import {ContainerAware} from '../../node_modules/deep-kernel/lib.compiled/ContainerAware';
import {DriverException} from '../../lib/Driver/Exception/DriverException';
import {MethodNotAvailableException} from '../../lib/Driver/Exception/MethodNotAvailableException';

chai.use(sinonChai);

suite('Driver/CloudFrontDriver', () => {
  let containerAware = new ContainerAware();
  let cloudFrontDriver = null;
  let key = 'testGetKey';

  test('Class CloudFrontDriver exists in Driver/CloudFrontDriver', () => {
    chai.expect(CloudFrontDriver).to.be.an('function');
  });

  test('Check constructor sets values by default', () => {
    cloudFrontDriver = new CloudFrontDriverMock(containerAware);

    chai.expect(
      cloudFrontDriver, 'is an instance of CloudFrontDriver'
    ).to.be.an.instanceOf(CloudFrontDriver);
    chai.expect(
      cloudFrontDriver._containerAware, 'is an instance of ContainerAware'
    ).to.be.an.instanceOf(ContainerAware);
    chai.expect(cloudFrontDriver._cache).to.eql({});
    chai.expect(cloudFrontDriver._directory).to.equal(AbstractFsDriver.DEFAULT_DIRECTORY);
    chai.expect(cloudFrontDriver._containerAware).to.eql(containerAware);
  });

  test('Check set() throws DriverException', () => {
    let spyCallback = sinon.spy();

    let actualResult = cloudFrontDriver.set('key', 'value', 0, spyCallback);

    chai.expect(actualResult, 'is an instance of AbstractDriver').to.be.an.instanceOf(AbstractDriver);
    chai.expect(spyCallback).to.have.been.calledWith();

    let spyCallbackArgs = spyCallback.args[0];

    chai.expect(spyCallbackArgs[0]).to.be.an.instanceOf(DriverException);
    chai.expect(spyCallbackArgs[1]).to.be.equal(null);
  });

  test('Check _set() throws MethodNotAvailableException', () => {
    let error = null;

    try {
      cloudFrontDriver._set();
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.an.instanceOf(MethodNotAvailableException);
  });

  test('Check _invalidate() throws MethodNotAvailableException', () => {
    let error = null;

    try {
      cloudFrontDriver._invalidate();
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.an.instanceOf(MethodNotAvailableException);
  });

  //todo - need to rework
  test('Check _microservice()', () => {
    let error = null;
    let actualResult = null;

    try {
      actualResult = cloudFrontDriver._microservice;
    } catch (e) {
      error = e;
    }
  });

  test('Check get() passes error in callback', () => {
    let spyCallback = sinon.spy();

    cloudFrontDriver.setMode(CloudFrontDriverMock.FAILURE_MODE);

    let actualResult = cloudFrontDriver._get(key, spyCallback);

    chai.expect(actualResult).to.equal(undefined);
    chai.expect(spyCallback).to.have.been.calledWithExactly(CloudFrontDriverMock.ERROR, null);
  });

  test('Check get() for parsedData.buildId !== this._buildId', () => {
    let spyCallback = sinon.spy();

    cloudFrontDriver.setMode(CloudFrontDriverMock.NO_RESULT_MODE);

    let actualResult = cloudFrontDriver._get(key, spyCallback);

    chai.expect(actualResult).to.equal(undefined);
    chai.expect(spyCallback).to.have.been.calledWithExactly(null, null);
  });

  test('Check get() catches Exception while parsing', () => {
    let spyCallback = sinon.spy();

    cloudFrontDriver.setMode(CloudFrontDriverMock.EXCEPTION_MODE);

    let actualResult = cloudFrontDriver._get(key, spyCallback);

    chai.expect(actualResult).to.equal(undefined);
    chai.expect(spyCallback).to.have.been.calledWithExactly(null, null);
  });

  test('Check get() sets this._cache[]', () => {
    let spyCallback = sinon.spy();

    cloudFrontDriver.setMode(CloudFrontDriverMock.DATA_MODE);

    let actualResult = cloudFrontDriver._get(key, spyCallback);

    chai.expect(actualResult).to.equal(undefined);
    chai.expect(spyCallback).to.have.been.calledWithExactly(null, 'request successfully sent');
  });

  test('Check get() for existed key', () => {
    let spyCallback = sinon.spy();

    cloudFrontDriver.setMode(CloudFrontDriverMock.DATA_MODE);

    let actualResult = cloudFrontDriver._get(key, spyCallback);

    chai.expect(actualResult).to.equal(undefined);
    chai.expect(spyCallback).to.have.been.calledWithExactly(null, 'request successfully sent');
  });

  test('Check get() deletes cache for the different buildId and gets new', () => {
    let spyCallback = sinon.spy();

    cloudFrontDriver._buildId = 'testBuildId01234';
    cloudFrontDriver.setMode(CloudFrontDriverMock.UPDATE_MODE);

    let actualResult = cloudFrontDriver._get(key, spyCallback);

    chai.expect(actualResult).to.equal(undefined);
    chai.expect(spyCallback).to.have.been.calledWithExactly(
      null, 'request successfully sent and updated data'
    );
    chai.expect(cloudFrontDriver._cache).to.eql(
      {testGetKey: JSON.parse(CloudFrontDriverMock.UPDATED_DATA)}
    );
  });

  test('Check has() passes in callback(null, true)', () => {
    let spyCallback = sinon.spy();

    cloudFrontDriver.setMode(CloudFrontDriverMock.DATA);

    let actualResult = cloudFrontDriver._has(key, spyCallback);

    chai.expect(actualResult).to.equal(undefined);
    chai.expect(spyCallback).to.have.been.calledWithExactly(
      null, true
    );
  });

  test('Check has() passes in callback(error, false)', () => {
    let spyCallback = sinon.spy();

    cloudFrontDriver.setMode(CloudFrontDriverMock.FAILURE_MODE);

    let actualResult = cloudFrontDriver._has('newKey', spyCallback);

    chai.expect(actualResult).to.equal(undefined);
    chai.expect(spyCallback).to.have.been.calledWithExactly(
      CloudFrontDriverMock.ERROR, false
    );
  });
});

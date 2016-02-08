'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {SharedCache} from '../lib/SharedCache';
import {AbstractDriver} from '../lib/Driver/AbstractDriver';
import {ContainerAware} from '../node_modules/deep-kernel/lib.compiled/ContainerAware';
import {CloudFrontDriverMock} from './Mocks/CloudFrontDriverMock';

chai.use(sinonChai);

suite('SharedCache', () => {
  let containerAware = new ContainerAware();
  let cloudFrontDriver = null;
  let data = {dataKey: 'Data here'};
  let sharedCache = null;
  let arn = 'arn:aws:lambda:us-west-2:9283468276298:function:test_backend';
  let request = {
    isLambda: true,
    payload: {id1: 'blabla', id3: 'uhuhu', arr: [3, 6, 9], o2: {hey: 's', hey5: 'm'}},
    action: {
      source: {
        original: arn,
      },
    },
    send: (callback = () => { }) => {
      callback({code: 200});
      return this;
    }
  };

  test('Class SharedCache exists in SharedCache', () => {
    chai.expect(SharedCache).to.be.an('function');
  });

  test('Check constructor', () => {
    cloudFrontDriver = new CloudFrontDriverMock(containerAware);
    cloudFrontDriver.fixBabelTranspile();
    sharedCache = new SharedCache(cloudFrontDriver);

    chai.expect(sharedCache, 'is an instance of SharedCache').to.be.an.instanceOf(SharedCache);

    chai.expect(
      sharedCache._driver, 'is an instance of AbstractDriver'
    ).to.be.an.instanceOf(AbstractDriver);
  });

  test('Test SharedCache buildKeyFromRequest() === buildKeyFromLambdaRuntime()', () => {
    let requestCacheKey = sharedCache.buildKeyFromRequest(request);

    let runtimeCacheKey = sharedCache.buildKeyFromLambdaRuntime({
      context: {
        has: () => true,
        getOption: () => arn,
      },
      request: {
        data: {id1: 'blabla', o2: {hey5: 'm', hey: 's'}, id3: 'uhuhu', arr: [3, 9, 6]},
      },
    });

    chai.expect(requestCacheKey).to.equal(runtimeCacheKey);
  });

  test('Class _createSuccessfulResponse returns valid object', () => {
    let expectedResult = {
      data: data,
      statusCode: 200,
      isError: false,
      error: null,
    };

    chai.expect(sharedCache._createSuccessfulResponse(data)).to.eql(expectedResult);
  });

  //@todo - add additional checks
  test('Check assure() if key exists', () => {
    let spyCallback = sinon.spy();
    let key = 'testKey';
    let value = 'testValue';
    let ttl = 0;

    sharedCache._driver.setMode(CloudFrontDriverMock.DATA_MODE);

    let actualResult = sharedCache.assure(key, value, ttl, spyCallback);

    chai.expect(actualResult).to.equal(undefined);
    //chai.expect(spyCallback).to.have.been.calledWithExactly(null, true);
  });

  //@todo - need to clarify with Alex c
  //test('Check assure() if key doesn"t exist', () => {
  //  let spyCallback = sinon.spy();
  //  let key = 'testKey';
  //  let value = 'testValue';
  //  let ttl = 0;
  //
  //  cloudFrontDriver.setMode(CloudFrontDriverMock.NO_RESULT_MODE);
  //
  //  let actualResult = sharedCache.assure(key, value, ttl, spyCallback);
  //
  //  chai.expect(actualResult).to.equal(undefined);
  //  //chai.expect(spyCallback).to.have.been.calledWithExactly(null, true);
  //});

  test('Check request() if key exists', () => {
    let spyCallback = sinon.spy();

    sharedCache._driver.setMode(CloudFrontDriverMock.DATA_MODE);

    let actualResult = sharedCache.request(request, spyCallback);

    chai.expect(actualResult).to.equal(undefined);
    chai.expect(spyCallback).to.have.been.calledWithExactly({code: 200});
  });


});

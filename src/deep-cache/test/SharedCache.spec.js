'use strict';

import chai from 'chai';
import {SharedCache} from '../lib/SharedCache';
import {AbstractDriver} from '../lib/Driver/AbstractDriver';
import {AbstractDriverMock} from './Mocks/AbstractDriverMock';
import {Request} from '../node_modules/deep-core/lib.compiled/AWS/Lambda/Request';

suite('SharedCache', () => {
  let abstractDriver = new AbstractDriverMock();
  let data = {firstKey: 'firstValue'};
  let request = new Request(data);

  test('Class SharedCache exists in SharedCache', () => {
    chai.expect(SharedCache).to.be.an('function');
  });

  test('Test SharedCache buildKeyFromRequest() === buildKeyFromLambdaRuntime()', () => {
    let arn = 'arn:aws:lambda:us-west-2:9283468276298:function:test_backend';

    let sharedCache = new SharedCache(abstractDriver);

    let requestCacheKey = sharedCache.buildKeyFromRequest({
      isLambda: true,
      payload: {id1: 'blabla', id3: 'uhuhu', arr: [3, 6, 9], o2: {hey: 's', hey5: 'm'}},
      action: {
        source: {
          original: arn,
        },
      },
    });

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
});

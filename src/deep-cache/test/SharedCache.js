// THIS TEST WAS GENERATED AUTOMATICALLY ON Thu Jan 14 2016 14:25:30 GMT+0200 (EET)

'use strict';

import chai from 'chai';
import {SharedCache} from '../lib.compiled/SharedCache';

// @todo: Add more advanced tests
suite("SharedCache", function() {
  test('Class SharedCache exists in SharedCache', function() {
    chai.expect(typeof SharedCache).to.equal('function');
  });

  test('Test SharedCache buildKeyFromRequest() === buildKeyFromLambdaRuntime()', function() {
    let arn = 'arn:aws:lambda:us-west-2:9283468276298:function:test_backend';

    let sharedCache = new SharedCache({});

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

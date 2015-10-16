'use strict';

import chai from 'chai';
import {Request} from '../../lib.compiled/Resource/Request';
import {Response} from '../../lib.compiled/Resource/Response';
import {MissingCacheImplementationException} from '../../lib.compiled/Resource/Exception/MissingCacheImplementationException';
import {Exception} from '../../lib.compiled/Exception/Exception';
import {CachedRequestException} from '../../lib.compiled/Resource/Exception/CachedRequestException';


suite('Resource/Request', function() {
  let action = {
    type: 'lambda',
    source: {
      original: 'testLambda',
      api: 'testApiEndpoint',
    },
  };

  let payload = '{"body":"bodyData"}';
  let method = 'method';
  let request = new Request(action, payload, method);

  test('Class Request exists in Resource/Request', function() {
    chai.expect(typeof Request).to.equal('function');
  });

  test('Check constructor sets valid value for _method', function() {
    chai.expect(request.method).to.be.equal(method);
  });

  test('Check constructor sets valid value for _action', function() {
    chai.expect(request.action).to.be.equal(action);
  });

  test('Check constructor sets valid value for _payload', function() {
    chai.expect(request.payload).to.be.equal(payload);
  });

  test('Check constructor sets valid value for _lambda=null', function() {
    chai.expect(request._lambda).to.be.equal(null);
  });

  test('Check constructor sets valid value for _cacheImpl=null', function() {
    chai.expect(request.cacheImpl).to.be.equal(null);
  });

  test('Check constructor sets valid value for _cacheImpl=null', function() {
    chai.expect(request.cacheTtl).to.be.equal(Request.TTL_FOREVER);
  });

  test('Check cache method throws \'MissingCacheImplementationException\' exception for !_cacheImpl', function() {
    let error = null;
    try {
      request.cache();
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.expect(error).to.be.an.instanceof(MissingCacheImplementationException);
  });

  test('Check constructor sets valid value for _cached=false', function() {
    chai.expect(request._cached).to.be.equal(false);
  });

  test('Check isCached getter returns false', function() {
    chai.expect(request.isCached).to.be.equal(null);
  });

  test('Check cacheTtl setter sets value', function() {
    let cacheTtl = 120;
    request.cacheTtl = cacheTtl;
    chai.expect(request.cacheTtl).to.be.equal(cacheTtl);
  });

  test('Check enableCache/disableCache methods', function() {
    request.disableCache();
    chai.expect(request._cached).to.be.equal(false);
    request.enableCache();
    chai.expect(request._cached).to.be.equal(true);
  });

  test('Check TTL_DEFAULT static getter returns value above -1', function() {
    chai.expect(Request.TTL_DEFAULT).to.be.above(0);
  });

  test('Check TTL_INVALIDATE static getter returns value -1', function() {
    chai.expect(Request.TTL_INVALIDATE).to.be.equal(-1);
  });

  test('Check TTL_FOREVER static getter returns value above -1', function() {
    chai.expect(Request.TTL_FOREVER).to.be.above(-1);
  });

  test('Check _rebuildResponse method throws CachedRequestException exception for invalid rawData', function() {
    let error = null;
    let rawData = 'null';
    try {
      request._rebuildResponse(rawData);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.expect(error).to.be.an.instanceof(CachedRequestException);
  });

  test('Check _stringifyResponse() method', function() {
    let requestData = 'responseTest';
    let rawData = {Payload: '{"dataKey":"testResponseValue"}', StatusCode:201};
    let rawError = null;
    let error = null;
    let actualResult = null;
    let response = null;

    try {
      response = new Response(requestData, rawData, rawError);
      actualResult = JSON.parse(Request._stringifyResponse(response));
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(actualResult._class).to.be.equal('Response');
    chai.expect(actualResult.data).to.be.eql(rawData);
    chai.expect(actualResult.error).to.be.equal(rawError);

  });

  test(`Check _buildCacheKey() method returns ${method}:${action.type}:${action.source.api}#${payload} for api calls`, function() {
    request._native = false;
    let actualResult = request._buildCacheKey();
    let expectedResult = `${method}:${action.type}:${action.source.api}#${JSON.stringify(payload)}`;
    chai.expect(actualResult).to.be.equal(expectedResult);
  });

  test(`Check _buildCacheKey() method returns ${method}:${action.type}:${action.source.original}#${payload} for native calls`, function() {
    request._native = true;
    let actualResult = request._buildCacheKey();
    let expectedResult = `${method}:${action.type}:${action.source.original}#${JSON.stringify(payload)}`;
    chai.expect(actualResult).to.be.equal(expectedResult);
  });

  test('Check cacheImpl() setter sets valid value', function() {
    let cache = {cacheIml: 'cacheImlTest'};
    request.cacheImpl = cache;
    chai.expect(request.cacheImpl).to.be.equal(cache);
    chai.expect(request.cacheTtl).to.be.equal(Request.TTL_DEFAULT);
  });

  test('Check _chooseResponseImpl() return valid object', function() {
    let error = null;
    let actualResult = null;
    try {
      actualResult = Request._chooseResponseImpl('TestClass');
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
  });

  test('Check _rebuildResponse() throws \'Exception\'', function() {
    let rawData = '{ "_class":"TestResponseMessage"}';

    let error = null;
    let actualResult = null;
    try {
      actualResult = request._rebuildResponse(rawData);
    } catch (e) {
      error = e;
    }

    chai.assert.instanceOf(error, Exception, 'result is an instance of Exception');
    chai.expect(error.message).to.be.equal('Unknown Response implementation TestResponseMessage');
  });

  test('Check _send() for lambda', function() {
    let error = null;
    try {
      request._send();
    } catch (e) {
      error = e;
    }
  });

  test('Check _send() for external', function() {
    let externalAction = {
      type: 'external',
      source: {
        original: 'testLambda',
        api: 'testApiEndpoint',
      },
      resource: {
        securityCredentials: {
          "AccessKeyId": "ASIAEGERGRE44U2N3YA",
          "Expiration": 87462874658273651,
          "SecretKey": "GkV5SVGRE5fe5m36bSr/zgJmFz14VC/fXomjwlN4H",
          "SessionToken": "AQoDYXdzEEMasAUS4x0+3bzHSergeERBERT4334tB6ScEehiEaPzlyuA7mVDVmWGLmlShoVNFZ0T/YMtmq0z3GB2wxaUAYmbsdQxutMBFGDtvnysM6f7nCJ+1F1c8pIb5vY0S4VM/jWgORq3oGPdsma8S9SbSUz2sHpliC53bMKNXKVknKOu9UiUube4+TQE6ryesNeab2SCiCB//3zISswtNcQdoifjUOWLPVDYRiiDg2A/KFu2CcM/CYgdxsU+QK+omgNGoKY2EcjZF7QZClcR0RhAFrGBLn7vaWxOA+Q0PUh7Pr/awIXGvvjiQl8u47cFQw2UzC9QOS3zNsvIJ2OYQ0L9jG905gVHgVuMMsHYqWfsQLp2zmxkC3YMsFXAcSJvsEdhI/nsXtz4KM4DW7Nm0AhMLRfv65TQz/zrm7mC4B9pH3NK1SAYGjRxGEtAcbHntj4zwKdgurUxPcNSf1lEwDi9jJbGz2fquSdlB21mOGxEwp2UNGc3b81TSTdB9ExXEqyFhGSgQbKH8EwDA6cIlR/85bxmsnU014J+N+dm0kawXdhvlK0hXnvti1mHyUMgrQ8VzaKpODP+zFsFuyX1aS5Y2ol2FlZo1HBB/AGFOMw3p4rlLL9x6aPT4qK8B1lZkWgapwZSQUaxCbfcPGkruSQqbOVlcBMk2TR8s83fHjOfoboRQ0W1PTcqo9hrn9i7lxoePb0Wqadb1h/azwJ3hepEaokanCOYEN7pNa7RbIqJB+AN3EjelEQKlHrnqYE/uqCrWN+sZtZ1SyxBqZyj+iVzbrtcvIg2azIVIC6SzrJfNdyNKgUiQIzHejH+yUMKnjENdldyOzf4RM60jg+hKbXjWLzVbmmfkpwqDxHAouO5N59nRpV39bZtMyTW3Qxk1MBVKOSYotfpJn6sYAtxRHZ3CO8IL2Hg7EF",
        },
      },
    };
    let externalPayload = '{"body":"bodyData"}';
    let externalMethod = 'method';
    let externalRequest = new Request(externalAction, externalPayload, externalMethod);
    let error = null;
    try {
      externalRequest._send();
    } catch (e) {
      error = e;
    }
  });

  test('Check _send() throws \'Exception\'', function() {
    let invalidAction = {
      type: 'invalidAction',
      source: {
        original: 'testLambda',
        api: 'testApiEndpoint',
      },
      resource: {
        securityCredentials: {
          "AccessKeyId": "ASIAEGERGRE44U2N3YA",
          "Expiration": 87462874658273651,
          "SecretKey": "GkV5SVGRE5fe5m36bSr/zgJmFz14VC/fXomjwlN4H",
          "SessionToken": "AQoDYXdzEEMasAUS4x0+3bzHSergeERBERT4334tB6ScEehiEaPzlyuA7mVDVmWGLmlShoVNFZ0T/YMtmq0z3GB2wxaUAYmbsdQxutMBFGDtvnysM6f7nCJ+1F1c8pIb5vY0S4VM/jWgORq3oGPdsma8S9SbSUz2sHpliC53bMKNXKVknKOu9UiUube4+TQE6ryesNeab2SCiCB//3zISswtNcQdoifjUOWLPVDYRiiDg2A/KFu2CcM/CYgdxsU+QK+omgNGoKY2EcjZF7QZClcR0RhAFrGBLn7vaWxOA+Q0PUh7Pr/awIXGvvjiQl8u47cFQw2UzC9QOS3zNsvIJ2OYQ0L9jG905gVHgVuMMsHYqWfsQLp2zmxkC3YMsFXAcSJvsEdhI/nsXtz4KM4DW7Nm0AhMLRfv65TQz/zrm7mC4B9pH3NK1SAYGjRxGEtAcbHntj4zwKdgurUxPcNSf1lEwDi9jJbGz2fquSdlB21mOGxEwp2UNGc3b81TSTdB9ExXEqyFhGSgQbKH8EwDA6cIlR/85bxmsnU014J+N+dm0kawXdhvlK0hXnvti1mHyUMgrQ8VzaKpODP+zFsFuyX1aS5Y2ol2FlZo1HBB/AGFOMw3p4rlLL9x6aPT4qK8B1lZkWgapwZSQUaxCbfcPGkruSQqbOVlcBMk2TR8s83fHjOfoboRQ0W1PTcqo9hrn9i7lxoePb0Wqadb1h/azwJ3hepEaokanCOYEN7pNa7RbIqJB+AN3EjelEQKlHrnqYE/uqCrWN+sZtZ1SyxBqZyj+iVzbrtcvIg2azIVIC6SzrJfNdyNKgUiQIzHejH+yUMKnjENdldyOzf4RM60jg+hKbXjWLzVbmmfkpwqDxHAouO5N59nRpV39bZtMyTW3Qxk1MBVKOSYotfpJn6sYAtxRHZ3CO8IL2Hg7EF",
        },
      },
    };
    let payload = '{"body":"bodyData"}';
    let method = 'method';
    let invalidRequest = new Request(invalidAction, payload, method);
    let error = null;
    try {
      invalidRequest._send();
    } catch (e) {
      error = e;
    }

    chai.assert.instanceOf(error, Exception, 'result is an instance of Exception');
    chai.expect(error.message).to.be.equal('Request of type invalidAction is not implemented');
  });

  test('Check send() !isCached', function() {
    let error = null;
    request.disableCache();
    chai.expect(request.isCached).to.be.equal(false);
    try {
      request.send();
    } catch (e) {
      error = e;
    }
  });

  test('Check send() isCached', function() {
    let error = null;
    request.enableCache();
    chai.expect(request.isCached).to.be.equal(true);
    try {
      request.send();
    } catch (e) {
      error = e;
    }
  });
});

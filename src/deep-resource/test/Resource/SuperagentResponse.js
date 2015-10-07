'use strict';

import chai from 'chai';
import {SuperagentResponse} from '../../lib.compiled/Resource/SuperagentResponse';

suite('Resource/SuperagentResponse', function () {
  let request = 'requestTest';
  let rawData = {status: 201, body: 'bodyTest', error: 'errorMessage',};
  let rawError = {message: 'errorMessage'};

  let superagentResponse = new SuperagentResponse(request, rawData, rawError);

  test('Class SuperagentResponse exists in Resource/SuperagentResponse', function() {
    chai.expect(typeof SuperagentResponse).to.equal('function');
  });

  test('Check constructor sets _data', function() {
    chai.expect(superagentResponse.data).to.be.equal(rawData.body);
  });

  test('Check constructor sets _error', function() {
    chai.expect(superagentResponse.error).to.be.eql(rawError);
  });

  test('Check isError getter returns true', function() {
    chai.expect(superagentResponse.isError).to.be.equal(true);
  });

  test(`Check statusCode getter returns ${rawData.status}`, function() {
    chai.expect(superagentResponse.statusCode).to.be.equal(rawData.status);
  });
});

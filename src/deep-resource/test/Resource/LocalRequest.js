'use strict';

import chai from 'chai';
import {LocalRequest} from '../../lib.compiled/Resource/LocalRequest';

suite('Resource/LocalRequest', function() {
  let action = { type:'lambda', source: 'testLambda'};
  let payload = '{"body":"bodyData"}';
  let method = 'method';
  let request = new LocalRequest(action, payload, method);

  test('Class LocalRequest exists in Resource/LocalRequest', function() {
    chai.expect(typeof LocalRequest).to.equal('function');
  });

  test('Check LOCAL_LAMBDA_ENDPOINT static getter return \'/_/lambda\'', function() {
    chai.expect(LocalRequest.LOCAL_LAMBDA_ENDPOINT).to.be.equal('/_/lambda');
  });
});

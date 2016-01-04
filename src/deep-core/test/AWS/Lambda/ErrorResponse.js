'use strict';

import chai from 'chai';
import {ErrorResponse} from '../../../lib/AWS/Lambda/ErrorResponse';
import {MissingRuntimeContextException} from '../../../lib/AWS/Lambda/Exception/MissingRuntimeContextException';


suite('AWS/Lambda/ErrorResponse', function() {
  let errorResponse = new ErrorResponse({}, {});

  test('Class ErrorResponse exists in AWS/Lambda/ErrorResponse', function() {
    chai.expect(typeof ErrorResponse).to.equal('function');
  });

  test('Check contextMethod getter returns "fail"', function() {
    chai.expect(ErrorResponse.contextMethod).to.be.equal('fail');
  });
});
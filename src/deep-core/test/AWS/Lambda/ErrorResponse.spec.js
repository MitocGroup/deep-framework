'use strict';

import chai from 'chai';
import {ErrorResponse} from '../../../lib/AWS/Lambda/ErrorResponse';
import {MissingRuntimeContextException} from '../../../lib/AWS/Lambda/Exception/MissingRuntimeContextException';


suite('AWS/Lambda/ErrorResponse', () => {
  let errorResponse = new ErrorResponse({}, {});

  test('Class ErrorResponse exists in AWS/Lambda/ErrorResponse', () => {
    chai.expect(ErrorResponse).to.be.an('function');
  });

  test('Check contextMethod getter returns "fail"', () => {
    chai.expect(ErrorResponse.contextMethod).to.be.equal('fail');
  });
});
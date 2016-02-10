'use strict';

import chai from 'chai';
import {Response} from '../../../lib/AWS/Lambda/Response';
import {MissingRuntimeContextException} from '../../../lib/AWS/Lambda/Exception/MissingRuntimeContextException';


suite('AWS/Lambda/Response', () => {
  let response = new Response({}, {});

  test('Class Response exists in AWS/Lambda/Response', () => {
    chai.expect(Response).to.be.an('function');
  });

  test('Check contextMethod getter returns \'succeed\'', () => {
    chai.expect(Response.contextMethod).to.be.equal('succeed');
  });
});

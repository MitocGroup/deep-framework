'use strict';

import chai from 'chai';
import {Response} from '../../../lib/AWS/Lambda/Response';
import {MissingRuntimeContextException} from '../../../lib/AWS/Lambda/Exception/MissingRuntimeContextException';


suite('AWS/Lambda/Response', function() {
  let response = new Response({}, {});

  test('Class Response exists in AWS/Lambda/Response', function() {
    chai.expect(typeof Response).to.equal('function');
  });

  test('Check contextMethod getter returns \'succeed\'', function() {
    chai.expect(Response.contextMethod).to.be.equal('succeed');
  });
});

'use strict';

import chai from 'chai';
import {Response} from '../../../lib/AWS/Lambda/Response';
import {MissingRuntimeContextException} from '../../../lib/AWS/Lambda/Exception/MissingRuntimeContextException';


suite('AWS/Lambda/Response', function() {
  let data = {firstKey: 'firstValue'};
  let runtimeContext = { contextProperty: 'runtimeContext'};
  runtimeContext.succeed = () => {
    runtimeContext.contextProperty = 'sendSuccessContext';
  };

  let response = new Response(data);

  test('Class Response exists in AWS/Lambda/Response', function() {
    chai.expect(typeof Response).to.equal('function');
  });

  test('Check constructor sets _runtimeContext=null', function() {
    chai.expect(response.runtimeContext).to.be.equal(null);
  });

  test('Check constructor sets _data', function() {
    chai.expect(response.data).to.be.equal(data);
  });

  test('Check contextMethod getter returns \'succeed\'', function() {
    chai.expect(response.contextMethod).to.be.equal('succeed');
  });

  test(`Check send() method throws MissingRuntimeContextException exception for empty _runtimeContext`, function() {
    let error = null;
    try {
      response.send();
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.an.instanceof(MissingRuntimeContextException);
  });

  test(`Check send() method returns valid object`, function() {
    let expectedResult = {
      _data: {
        firstKey: 'firstValue',
      },
      _runtimeContext: {
        contextProperty: 'sendSuccessContext',
      },
    };

    //set new valid context
    response.runtimeContext = runtimeContext;
    expectedResult._runtimeContext.succeed = response.runtimeContext.succeed;
    chai.expect(response.runtimeContext).to.be.eql(runtimeContext);
    chai.expect(response.send()).to.be.eql(expectedResult);
  });
});

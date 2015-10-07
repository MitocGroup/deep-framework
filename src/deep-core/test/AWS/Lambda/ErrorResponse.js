'use strict';

import chai from 'chai';
import {ErrorResponse} from '../../../lib.compiled/AWS/Lambda/ErrorResponse';
import {MissingRuntimeContextException} from '../../../lib.compiled/AWS/Lambda/Exception/MissingRuntimeContextException';


suite('AWS/Lambda/ErrorResponse', function() {
  let data = {firstKey: 'firstValue'};
  let runtimeContext = { contextProperty: 'runtimeContext'};
  runtimeContext.fail = () => {
    runtimeContext.contextProperty = 'sendFailContext';
  };

  let errorResponse = new ErrorResponse(data);

  test('Class ErrorResponse exists in AWS/Lambda/ErrorResponse', function() {
    chai.expect(typeof ErrorResponse).to.equal('function');
  });

  test('Check constructor sets _runtimeContext=null', function() {
    chai.expect(errorResponse.runtimeContext).to.be.equal(null);
  });

  test('Check constructor sets _data', function() {
    chai.expect(errorResponse.data).to.be.equal(data);
  });

  test('Check contextMethod getter returns \'fail\'', function() {
    chai.expect(errorResponse.contextMethod).to.be.equal('fail');
  });

  test(`Check send() method throws MissingRuntimeContextException exception for empty _runtimeContext`, function() {
    let error = null;
    try {
      errorResponse.send();
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.an.instanceof(MissingRuntimeContextException);
  });

  test(`Check send() method returns valid object`, function() {
    let error = null;
    let actualResult = null;
    let expectedResult = {
      _data: {
        firstKey: 'firstValue',
      },
      _runtimeContext: {
        contextProperty: 'sendFailContext',
      },
    };

    //set new valid context
    errorResponse.runtimeContext = runtimeContext;
    expectedResult._runtimeContext.fail = errorResponse.runtimeContext.fail;
    chai.expect(errorResponse.runtimeContext).to.be.eql(runtimeContext);
    try {
      actualResult = errorResponse.send();
    } catch (e) {
      error = e;
      chai.expect(error).to.be.equal(null);
    }

    chai.expect(actualResult).to.be.eql(expectedResult);
  });
});
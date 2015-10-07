'use strict';

import chai from 'chai';
import {Request} from '../../../lib.compiled/AWS/Lambda/Request';

suite('AWS/Lambda/Request', function() {
  let data = {firstKey: 'firstValue'};
  let request = new Request();

  test('Class Request exists in AWS/Lambda/Request', function() {
    chai.expect(typeof Request).to.equal('function');
  });

  test('Check constructor sets _data={}', function() {
    chai.expect(request.data).to.be.eql({});
  });

  test('Check constructor sets _data', function() {
    request = new Request(data);
    chai.expect(request.data).to.be.eql(data);
  });

  test('Check getParam() method returns null', function() {
    chai.expect(request.getParam('name')).to.be.equal(null);
  });

  test('Check getParam() method returns param', function() {
    chai.expect(request.getParam('firstKey')).to.be.equal(data.firstKey);
  });
});

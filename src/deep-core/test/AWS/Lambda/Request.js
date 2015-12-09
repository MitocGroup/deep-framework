'use strict';

import chai from 'chai';
import {Request} from '../../../lib/AWS/Lambda/Request';

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

  //test('Check Object.keys(request) returns data keys', function() {
  //  chai.expect(Object.keys(request)).to.be.eql(Object.keys(data));
  //});

  test('Check request.firstKey returns param', function() {
    chai.expect(request.firstKey).to.be.equal(data.firstKey);
  });

  test('Check request.name returns undefined on missing param', function() {
    chai.expect(request.name).to.be.equal(undefined);
  });

  test('Check getParam() method returns undefined on missing param', function() {
    chai.expect(request.getParam('name')).to.be.equal(undefined);
  });

  test('Check getParam() method returns param', function() {
    chai.expect(request.getParam('firstKey')).to.be.equal(data.firstKey);
  });
});

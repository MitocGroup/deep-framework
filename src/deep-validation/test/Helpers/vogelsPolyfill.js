'use strict';

import chai from 'chai';
import {Joi} from '../../lib.compiled/Helpers/Joi';
import Vogels from '../../lib.compiled/Helpers/vogelsPolyfill';

suite('Helpers/vogelsPolyfill', function() {
  let joi = new Joi();

  test('Check Vogels object  exists in Helpers/vogelsPolyfill', function() {
    chai.expect(typeof Vogels).to.equal('object');
  });

  test('Check Vogels.types contains all types', function() {
    chai.expect(Object.keys(Vogels.types).length).to.equal(5);
    chai.expect(Object.keys(Vogels.types)).to.contains('uuid');
    chai.expect(Object.keys(Vogels.types)).to.contains('timeUUID');
    chai.expect(Object.keys(Vogels.types)).to.contains('stringSet');
    chai.expect(Object.keys(Vogels.types)).to.contains('numberSet');
    chai.expect(Object.keys(Vogels.types)).to.contains('binarySet');
  });

  test('Check Vogels.types.stringSet is function', function() {
    chai.expect(typeof Vogels.types.stringSet).to.equal('function');
  });

  test('Check stringSet() returns valid object', function() {
    let actualResult = Vogels.types.stringSet();
    chai.expect(actualResult.isJoi).to.eql(true);
  });
});

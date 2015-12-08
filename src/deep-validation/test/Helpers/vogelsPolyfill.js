'use strict';

import chai from 'chai';
import {Joi} from '../../lib/Helpers/Joi';
import Vogels from '../../lib/Helpers/vogelsPolyfill';

suite('Helpers/vogelsPolyfill', function() {
  let joi = new Joi();

  test('Check Vogels object  exists in Helpers/vogelsPolyfill', function() {
    chai.expect(typeof Vogels).to.equal('object');
  });

  test('Check Vogels.types contains all types', function() {
    chai.expect(Object.keys(Vogels.types)).contains.all.of(
      'uuid', 'timeUUID', 'stringSet', 'numberSet', 'binarySet'
    );
  });

  test('Check Vogels.types.stringSet is function', function() {
    chai.expect(typeof Vogels.types.stringSet).to.equal('function');
  });

  test('Check stringSet() returns valid object', function() {
    let actualResult = Vogels.types.stringSet();
    chai.expect(actualResult.isJoi).to.eql(true);
  });
});

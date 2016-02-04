'use strict';

import chai from 'chai';
import {Joi} from '../../lib/Helpers/Joi';
import Vogels from '../../lib/Helpers/vogelsPolyfill';

suite('Helpers/vogelsPolyfill', () => {
  let joi = new Joi();

  test('Check Vogels object  exists in Helpers/vogelsPolyfill', () => {
    chai.expect(typeof Vogels).to.equal('object');
  });

  test('Check Vogels.types contains all types', () => {
    chai.expect(Object.keys(Vogels.types)).contains.all.of(
      'uuid', 'timeUUID', 'stringSet', 'numberSet', 'binarySet'
    );
  });

  test('Check Vogels.types.stringSet is function', () => {
    chai.expect(Vogels.types.stringSet).to.be.an('function');
  });

  test('Check stringSet() returns valid object', () => {
    let actualResult = Vogels.types.stringSet();
    chai.expect(actualResult.isJoi).to.eql(true);
  });
});

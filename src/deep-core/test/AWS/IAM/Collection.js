'use strict';

import chai from 'chai';
import {Collection} from '../../../lib/AWS/IAM/Collection';
import {Extractable} from '../../../lib/AWS/IAM/Extractable';
import {InvalidArgumentException} from '../../../lib/Exception/InvalidArgumentException';
import {Extractor} from './Extractable';

suite('AWS/IAM/Collection', function() {
  let collection = null;
  let extractor = new Extractor();

  test('Class Collection exists in AWS/IAM/Collection', function() {
    chai.expect(typeof Collection).to.equal('function');
  });

  test('Check constructor throws "ExceptionInvalidArgumentException" exception', function() {
    let error = null;
    try {
      new Collection({});
    } catch (e) {
      error = e;
    }

    chai.assert.instanceOf(error, InvalidArgumentException, 'error is an instance of InvalidArgumentException');
  });

  test('Check constructor sets valid values', function() {
    collection = new Collection(Extractor);
    chai.expect(collection.prototype.__proto__).to.equal(Extractable);
    chai.expect(collection._vector).to.eql([]);
  });

  test('Check add() method sets valid values', function() {
    chai.expect(collection.add([extractor])).to.eql(extractor);
    chai.expect(collection.list()).to.eql([extractor]);
  });

  test('Check extract() method returns valid array', function() {
    chai.expect(collection.extract()).to.eql(['extracted']);
  });
});

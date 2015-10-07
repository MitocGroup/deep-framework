'use strict';

import chai from 'chai';
import {Collection} from '../../../lib.compiled/AWS/IAM/Collection';
import {Extractable} from '../../../lib.compiled/AWS/IAM/Extractable';

class Extractor extends Extractable {
  constructor() {
    super();
  }

  extract() {
    return 'extracted';
  }
}

suite('AWS/IAM/Collection', function() {

  test('Class Collection exists in AWS/IAM/Collection', function() {
    chai.expect(typeof Collection).to.equal('function');
  });
});

'use strict';

import chai from 'chai';
import {Extractable} from '../../../lib/AWS/IAM/Extractable';

export class Extractor extends Extractable {
  constructor() {
    super();
    this.data = 'default data for testing';
  }

  extract() {
    return 'extracted';
  }
}

suite('AWS/IAM/Extractable', function() {
  test('Class Extractable exists in AWS/IAM/Extractable', function() {
    chai.expect(typeof Extractable).to.equal('function');
  });
});

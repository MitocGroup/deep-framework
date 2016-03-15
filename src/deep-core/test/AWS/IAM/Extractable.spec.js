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

suite('AWS/IAM/Extractable', () => {
  test('Class Extractable exists in AWS/IAM/Extractable', () => {
    chai.expect(Extractable).to.be.an('function');
  });
});

'use strict';

import chai from 'chai';
import {CredentialsManager} from '../lib.compiled/CredentialsManager';

suite('CredentialsManager', function() {
  test('Class CredentialsManager exists in CredentialsManager', function() {
    chai.expect(typeof CredentialsManager).to.equal('function');
  });
});

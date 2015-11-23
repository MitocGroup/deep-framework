'use strict';

import chai from 'chai';
import {LocalToken} from '../lib.compiled/LocalToken';

suite('LocalToken', function() {
  let identityPoolId = 'us-east-1:44hgf876-a2v2-465a-877v-12fd264525ef';
  let localToken = new LocalToken(identityPoolId);

  test('Class LocalToken exists in LocalToken', function() {
    chai.expect(typeof LocalToken).to.equal('function');
  });
});
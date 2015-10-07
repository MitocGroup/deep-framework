'use strict';

import chai from 'chai';
import {UserProvider} from '../lib.compiled/UserProvider';

suite('UserProvider', function() {
  let userProvider = null;

  test('Class UserProvider exists in UserProvider', function() {
    chai.expect(typeof UserProvider).to.equal('function');
  });

  test('Check constructor sets default values', function() {
    userProvider = new UserProvider();
    chai.expect(userProvider._retrieveUserResource).to.be.equal(undefined);
    chai.expect(userProvider._deepResource).to.be.equal(undefined);
  });

  test('Check constructor sets values', function() {
    userProvider = new UserProvider('userResource', 'deepResource');
    chai.expect(userProvider._retrieveUserResource).to.be.equal('userResource');
    chai.expect(userProvider._deepResource).to.be.equal('deepResource');
  });
});

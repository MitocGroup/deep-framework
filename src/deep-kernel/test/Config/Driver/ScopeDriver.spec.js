/**
 * Created by vcernomschi on 5/27/16.
 */

'use strict';

import chai from 'chai';
import {ScopeDriver} from '../../../lib/Config/Driver/ScopeDriver';

suite('Config/Driver/ScopeDriver', function() {
  let scopeDriver = null;
  let key = 'key';

  test('Class ScopeDriver exists in Config/Driver/ScopeDriver', () => {
    chai.expect(ScopeDriver).to.be.an('function');
  });

  test('Check AsyncConfig constructor sets _scope', () => {
    scopeDriver = new ScopeDriver(key);

    chai.assert.instanceOf(scopeDriver.scope, Object, 'is an instance of Object');
  });

  test('Check AsyncConfig constructor sets _key', () => {
    chai.expect(scopeDriver.key).to.equal(key);
  });

  test('Check setKey method', () => {
    let newKey = 'new key';

    let actualResult = scopeDriver.setKey(newKey);

    chai.assert.instanceOf(actualResult, ScopeDriver, 'is an instance of ScopeDriver');
    chai.expect(actualResult.key).to.equal(newKey);
  });
});

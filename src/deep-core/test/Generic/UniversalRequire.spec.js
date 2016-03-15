'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {UniversalRequire} from '../../lib/Generic/UniversalRequire';

chai.use(sinonChai);

suite('Generic/UniversalRequire', () => {
  let universalRequire = null;

  test('Class UniversalRequire exists in Generic/UniversalRequire', () => {
    chai.expect(UniversalRequire).to.be.an('function');
  });

  test('Check constructor', () => {
    universalRequire = new UniversalRequire();

    chai.expect(universalRequire).to.be.an.instanceOf(UniversalRequire);
    chai.expect(universalRequire._require).to.be.an('function');
  });

  test('Check _isFrontend', () => {
    chai.expect(UniversalRequire._isFrontend).to.be.equal(false);
  });

  test('Check require', () => {
    let spyCallback = sinon.spy();

    let actualresult = universalRequire.require('sinon', spyCallback);

    let spyCallbackArgs = spyCallback.args[0];

    chai.expect(actualresult).to.be.equal(undefined);
    chai.expect(spyCallbackArgs[0]).to.be.equal(null);
    chai.expect(spyCallbackArgs[1]).to.be.an('object');
    chai.expect(Object.keys(spyCallbackArgs[1].spy)).to.contains(
      'alwaysCalledOn',
      'spyCall',
      'threw'
    );
  });
});

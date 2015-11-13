'use strict';

import chai from 'chai';
import {RavenDriver} from '../../lib.compiled/Driver/RavenDriver';
import Raven from 'raven';

suite('Driver/RavenDriver', function() {
  let ravenDriver = new RavenDriver();

  test('Class RavenDriver exists in Driver/RavenDriver', function() {
    chai.expect(typeof RavenDriver).to.equal('function');
  });

  test('Check constructor sets _clients by default', function() {
    chai.expect(typeof ravenDriver.clients).to.be.equal('object');
  });

  test('Check log() method runs without exception', function() {
    let error = null;
    try {
      ravenDriver.log('test log() from RavenDriver', 'debug', 'context');
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
  });
});

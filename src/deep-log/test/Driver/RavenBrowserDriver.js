'use strict';

import chai from 'chai';
import {RavenBrowserDriver} from '../../lib.compiled/Driver/RavenBrowserDriver';

suite('Driver/RavenBrowserDriver', function() {
  test('Class RavenBrowserDriver exists in Driver/RavenBrowserDriver', function() {
    chai.expect(typeof RavenBrowserDriver).to.equal('function');
  });
});

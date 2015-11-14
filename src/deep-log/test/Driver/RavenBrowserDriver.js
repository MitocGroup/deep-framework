'use strict';

import chai from 'chai';
import {RavenBrowserDriver} from '../../lib.compiled/Driver/RavenBrowserDriver';
import {RavenBrowserDriverMock} from '../Mocks/RavenBrowserDriverMock';
import RequireProxy from 'proxyquire';
import ravenMock from '../Mocks/ravenMock';

suite('Driver/RavenBrowserDriver', function() {

  //mocking raven
  Object.defineProperty(ravenMock, '@global', {
    value: true,
    writable: false,
  });

  let localRavenBrowserDriverExport = RequireProxy(
    '../Mocks/RavenBrowserDriverMock',
    {
      'raven': ravenMock,
    }
  );

  let RavenBrowserDriverMock = localRavenBrowserDriverExport.RavenBrowserDriverMock;
  let ravenDriver = new RavenBrowserDriverMock('https://pycoding.slack.com/messages/sentry-deep-dev/');

  test('Class RavenBrowserDriver exists in Driver/RavenBrowserDriver', function() {
    chai.expect(typeof RavenBrowserDriver).to.equal('function');
  });
});

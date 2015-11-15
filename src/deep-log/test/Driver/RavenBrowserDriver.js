'use strict';

import chai from 'chai';
import {RavenBrowserDriver} from '../../lib.compiled/Driver/RavenBrowserDriver';
import {RavenBrowserDriverMock} from '../Mocks/RavenBrowserDriverMock';
import RequireProxy from 'proxyquire';
import ravenMock from '../Mocks/ravenMock';

suite('Driver/RavenBrowserDriver', function() {

  //@todo - TBD
  //mocking raven
  //Object.defineProperty(ravenMock, '@global', {
  //  value: true,
  //  writable: false,
  //});
  //
  //let localRavenBrowserDriverExport = RequireProxy(
  //  '../Mocks/RavenBrowserDriverMock',
  //  {
  //    'raven': ravenMock,
  //  }
  //);
  //
  //let RavenBrowserDriverMock = localRavenBrowserDriverExport.RavenBrowserDriverMock;
  //let ravenDriver = new RavenBrowserDriverMock('https://pycoding.slack.com/messages/sentry-deep-dev/');

  test('Class RavenBrowserDriver exists in Driver/RavenBrowserDriver', function() {
    chai.expect(typeof RavenBrowserDriver).to.equal('function');
  });

  test(
    'Check _mapLevel() static method for "fatal"/"critical" level returns "fatal"',
    function() {
      chai.expect(RavenBrowserDriver._mapLevel('emergency')).to.equal('fatal');
      chai.expect(RavenBrowserDriver._mapLevel('critical')).to.equal('fatal');
    }
  );

  test(
    'Check _mapLevel() static method for "alert"/"warning"/"notice" level returns "warning"',
    function() {
      chai.expect(RavenBrowserDriver._mapLevel('alert')).to.equal('warning');
      chai.expect(RavenBrowserDriver._mapLevel('warning')).to.equal('warning');
      chai.expect(RavenBrowserDriver._mapLevel('notice')).to.equal('warning');
    }
  );

  test(
    'Check _mapLevel() static method for "error" level returns "error"',
    function() {
      chai.expect(RavenBrowserDriver._mapLevel('error')).to.equal('error');
    }
  );

  test(
    'Check _mapLevel() static method for "info" level returns "info"',
    function() {
      chai.expect(RavenBrowserDriver._mapLevel('info')).to.equal('info');
    }
  );

  test(
    'Check _mapLevel() static method for "debug" level returns "debug"',
    function() {
      chai.expect(RavenBrowserDriver._mapLevel('debug')).to.equal('debug');
    }
  );
});

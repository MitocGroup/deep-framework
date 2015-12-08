'use strict';

import chai from 'chai';
import {RavenBrowserDriver} from '../../lib/Driver/RavenBrowserDriver';
import requireProxy from 'proxyquire';
import ravenMock from '../Mock/ravenMock';

suite('Driver/RavenBrowserDriver', function() {

  //mocking raven
  Object.defineProperty(ravenMock, '@global', {
    value: true,
    writable: false,
  });

  let localRavenBrowserDriverExport = requireProxy(
    '../../lib/Driver/RavenBrowserDriver',
    {
      'raven': ravenMock,
    }
  );

  let RavenBrowserDriver = localRavenBrowserDriverExport.RavenBrowserDriver;
  let ravenBrowserDriver = new RavenBrowserDriver(
    'https://72kshdbrgkebghkrb34iu5yb3ub:23l5hbk2v2jhg52uygvygvhmgv@app.getsentry.com/45747'
  );

  test('Chec constructor successfully instantiates new istance of class',
    function() {
      chai.assert.instanceOf(
        ravenBrowserDriver, RavenBrowserDriver, 'is instance of RavenBrowserDriver'
      );
    }
  );

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

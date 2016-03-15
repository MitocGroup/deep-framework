'use strict';

import chai from 'chai';
import requireProxy from 'proxyquire';
import ravenMock from '../Mock/ravenMock';

suite('Driver/RavenBrowserDriver', () => {

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
    () => {
      chai.assert.instanceOf(
        ravenBrowserDriver, RavenBrowserDriver, 'is instance of RavenBrowserDriver'
      );
    }
  );

  test('Class RavenBrowserDriver exists in Driver/RavenBrowserDriver', () => {
    chai.expect(RavenBrowserDriver).to.be.an('function');
  });

  test(
    'Check _mapLevel() static method for "fatal"/"critical" level returns "fatal"',
    () => {
      chai.expect(RavenBrowserDriver._mapLevel('emergency')).to.equal('fatal');
      chai.expect(RavenBrowserDriver._mapLevel('critical')).to.equal('fatal');
    }
  );

  test(
    'Check _mapLevel() static method for "alert"/"warning"/"notice" level returns "warning"',
    () => {
      chai.expect(RavenBrowserDriver._mapLevel('alert')).to.equal('warning');
      chai.expect(RavenBrowserDriver._mapLevel('warning')).to.equal('warning');
      chai.expect(RavenBrowserDriver._mapLevel('notice')).to.equal('warning');
    }
  );

  test(
    'Check _mapLevel() static method for "error" level returns "error"',
    () => {
      chai.expect(RavenBrowserDriver._mapLevel('error')).to.equal('error');
    }
  );

  test(
    'Check _mapLevel() static method for "info" level returns "info"',
    () => {
      chai.expect(RavenBrowserDriver._mapLevel('info')).to.equal('info');
    }
  );

  test(
    'Check _mapLevel() static method for "debug" level returns "debug"',
    () => {
      chai.expect(RavenBrowserDriver._mapLevel('debug')).to.equal('debug');
    }
  );
});

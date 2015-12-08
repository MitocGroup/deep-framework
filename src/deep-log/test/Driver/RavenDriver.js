'use strict';

import chai from 'chai';
import {RavenDriver} from '../../lib/Driver/RavenDriver';
import requireProxy from 'proxyquire';
import ravenMock from '../Mock/ravenMock';

suite('Driver/RavenDriver', function() {

  //mocking raven
  Object.defineProperty(ravenMock, '@global', {
    value: true,
    writable: false,
  });

  let localRavenDriverExport = requireProxy(
    '../../lib/Driver/RavenDriver',
    {
      'raven': ravenMock,
    }
  );

  let RavenDriver = localRavenDriverExport.RavenDriver;

  let ravenDriver = new RavenDriver();

  test('Class RavenDriver exists in Driver/RavenDriver', function() {
    chai.expect(typeof RavenDriver).to.equal('function');
  });

  test('Check constructor sets _clients by default', function() {
    chai.expect(typeof ravenDriver.clients).to.be.equal('object');
    chai.expect(Object.keys(ravenDriver.clients).length).to.be.equal(5);
    chai.expect(Object.keys(ravenDriver.clients)).to.contains('fatal');
    chai.expect(Object.keys(ravenDriver.clients)).to.contains('warning');
    chai.expect(Object.keys(ravenDriver.clients)).to.contains('error');
    chai.expect(Object.keys(ravenDriver.clients)).to.contains('info');
    chai.expect(Object.keys(ravenDriver.clients)).to.contains('debug');
  });

  test('Check log() method runs without exception', function() {
    let level = 'debug';
    let msg = 'test log() from RavenDriver';
    let context = {context: 'Test context'};

    ravenDriver.log(msg, level, context);

    let actualResult = ravenDriver.clients[level].logs.pop();
    chai.expect(actualResult[0]).to.eql(msg);
  });
});

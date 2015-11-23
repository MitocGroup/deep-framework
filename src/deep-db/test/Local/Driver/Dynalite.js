'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Dynalite} from '../../../lib.compiled/Local/Driver/Dynalite';
import DynaliteServer from 'dynalite';
import dynaliteServerMock from '../../Mock/dynaliteServerMock';
import {FailedToStartServerException} from '../../../lib.compiled/Local/Driver/Exception/FailedToStartServerException';
import requireProxy from 'proxyquire';

chai.use(sinonChai);

suite('Local/Driver/Dynalite', function() {

  //mocking dynalite
  let dynalityExport = requireProxy('../../../lib.compiled/Local/Driver/Dynalite', {
    'dynalite': dynaliteServerMock,
  });

  let Dynalite = dynalityExport.Dynalite;

  let dynalite = new Dynalite();

  test('Class Dynalite exists in Local/Driver/Dynalite', function() {
    chai.expect(typeof Dynalite).to.equal('function');
  });

  test('Check DEFAULT_OPTIONS static getter returns valid object', function() {
    chai.expect(Dynalite.DEFAULT_OPTIONS.createTableMs).to.be.equal(0);
    chai.expect(Dynalite.DEFAULT_OPTIONS.deleteTableMs).to.be.equal(0);
    chai.expect(Dynalite.DEFAULT_OPTIONS.updateTableMs).to.be.equal(0);
  });

  test('Check constructor sets _options', function() {
    chai.expect(dynalite.options).to.be.eql(Dynalite.DEFAULT_OPTIONS);
  });

  test('Check constructor sets _port', function() {
    chai.expect(dynalite.port).to.be.equal(Dynalite.DEFAULT_PORT);
  });

  test('Check _start() method starts DynaliteServer', function() {
    let spyCallback = sinon.spy();

    dynalite._start(spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly(null);
  });

  test('Check _start() throws "FailedToStartServerException" in cb', function() {
    let spyCallback = sinon.spy();

    dynalite._server.setMode(1, ['listen']);
    dynalite._start(spyCallback);

    chai.expect(spyCallback.args[0][0].constructor.name).to.equal('FailedToStartServerException');
  });

  test('Check stop() method stops server', function() {
    let spyCallback = sinon.spy();

    dynalite._stop(spyCallback);

    chai.expect(dynalite._server).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.calledWithExactly(null, null);
  });

  test('Check stop() method stops !server', function() {
    let spyCallback = sinon.spy();

    dynalite._stop(spyCallback);

    chai.expect(dynalite._server).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.calledWith(null);
  });
});

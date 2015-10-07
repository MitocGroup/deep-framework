'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Dynalite} from '../../../lib.compiled/Local/Driver/Dynalite';
import DynaliteServer from 'dynalite';
import {AbstractDriver} from '../../../lib.compiled/Local/Driver/AbstractDriver';
import {FailedToStartServerException} from '../../../lib.compiled/Local/Driver/Exception/FailedToStartServerException';
chai.use(sinonChai);

class DynaliteServerTest extends DynaliteServer {
  constructor(options) {
    super(options);
  }

  listen(port, cb) {
    return cb('error', null);
  }

  throwFailedToStartServerException(){
    throw new FailedToStartServerException();
  }
}

suite('Local/Driver/Dynalite', function() {
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
    chai.expect(dynalite.port).to.be.equal(AbstractDriver.DEFAULT_PORT);
  });

  // todo - unstable tests, takes time to start server
  //test('Check start() method starts DynaliteServer', function() {
  //  let error = null;
  //  let spyCallback = sinon.spy();
  //
  //  try {
  //    dynalite._start(spyCallback);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.equal(null);
  //  chai.expect(typeof dynalite._server).to.be.equal('object');
  //});

  //test('Check stop() method stops server', function() {
  //  let spyCallback = sinon.spy();
  //
  //  dynalite._stop(spyCallback);
  //  chai.expect(dynalite._server).to.be.equal(null);
  //  chai.expect(spyCallback).to.not.have.been.called;
  //});

  test('Check stop() method stops !server', function() {
    let spyCallback = sinon.spy();

    dynalite._stop(spyCallback);
    chai.expect(dynalite._server).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.calledWith(null);
  });

  test('Check FailedToStartServerException can be thrown', function() {
    let error = null;
    let dynaliteException = null;
    try {
      dynaliteException = new DynaliteServerTest();
      dynaliteException.throwFailedToStartServerException(dynaliteException, 'error');
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
  });
});

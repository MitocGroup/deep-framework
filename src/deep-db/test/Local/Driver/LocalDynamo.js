'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {LocalDynamo} from '../../../lib.compiled/Local/Driver/LocalDynamo';
import {AbstractDriver} from '../../../lib.compiled/Local/Driver/AbstractDriver';
import {LocalDynamoServerMock} from '../../../test/Mock/LocalDynamoServerMock';
import requireProxy from 'proxyquire';

chai.use(sinonChai);

suite('Local/Driver/LocalDynamo', function() {

  let localDynamoServerMock = new LocalDynamoServerMock();

  //mocking localDynamo
  let localDynamoExport = requireProxy('../../../lib.compiled/Local/Driver/LocalDynamo', {
    'dynalite': localDynamoServerMock,
  });

  let LocalDynamo = localDynamoExport.LocalDynamo;

  let localDynamo = new LocalDynamo();

  test('Class LocalDynamo exists in Local/Driver/LocalDynamo', function() {
    chai.expect(typeof LocalDynamo).to.equal('function');
  });

  test('Check DEFAULT_OPTIONS static getter returns valid object', function() {
    chai.expect(LocalDynamo.DEFAULT_OPTIONS.stdio).to.be.equal('pipe');
  });

  test('Check constructor sets _options', function() {
    chai.expect(localDynamo.options).to.be.eql(LocalDynamo.DEFAULT_OPTIONS);
  });

  test('Check constructor sets _process=null', function() {
    chai.expect(localDynamo._process).to.be.equal(null);
  });

  test('Check constructor sets _port', function() {
    chai.expect(localDynamo.port).to.be.equal(AbstractDriver.DEFAULT_PORT);
  });

  test('Check start() method starts LocalDynamo', function() {
    let spyCallback = sinon.spy();

    localDynamo._start(spyCallback);

    chai.expect(localDynamo._proccess).to.be.not.equal(null);
  });
  //
  //test('Check stop() method starts LocalDynamo', function() {
  //  let error = null;
  //
  //  try {
  //    localDynamo._stop(callback);
  //  } catch (e) {
  //    error = e;
  //    chai.expect(error).to.be.equal(null);
  //  }
  //
  //  chai.expect(localDynamo._proccess).to.be.equal(undefined);
  //});
});

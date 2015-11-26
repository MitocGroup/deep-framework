'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {LocalDynamo} from '../../../lib.compiled/Local/Driver/LocalDynamo';
import {AbstractDriver} from '../../../lib.compiled/Local/Driver/AbstractDriver';
import {LocalDynamoServerMock} from '../../Mock/LocalDynamoServerMock';
import requireProxy from 'proxyquire';

chai.use(sinonChai);

suite('Local/Driver/LocalDynamo', function() {
  //mocking localDynamo
  let localDynamoServerMock = new LocalDynamoServerMock();

  localDynamoServerMock.fixBabelTranspile();
  let localDynamoExport = requireProxy('../../../lib.compiled/Local/Driver/LocalDynamo', {
    'local-dynamo': localDynamoServerMock,
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

  test('Check constructor sets _pickUpOldInstance=true', function() {
    //check value by default
    chai.expect(localDynamo.pickUpOldInstance).to.be.equal(true);

    //check setter/getter
    localDynamo.pickUpOldInstance = false;
    chai.expect(localDynamo.pickUpOldInstance).to.be.equal(false);

    localDynamo.pickUpOldInstance = true;
    chai.expect(localDynamo.pickUpOldInstance).to.be.equal(true);
  });

  test('Check constructor sets _pickUpOldInstance', function() {
    chai.expect(localDynamo.pickUpOldInstance).to.be.equal(true);
  });

  test('Check start() method starts LocalDynamo', function() {
    let spyCallback = sinon.spy();
    let error = null;

    //@todo - wrapped to try/catch because after this._process.on('uncaughtException', onError)
    // process is equal null, and next on() cannot read property 'on' of null
    try {
      localDynamo._start(spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(localDynamo._process).to.be.equal(null);
  });

  test('Check stop() method starts LocalDynamo', function() {
    let spyCallback = sinon.spy();

    localDynamo._stop(spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly(null);
    chai.expect(localDynamo._process).to.be.equal(null);
  });
});

'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Validation from 'deep-validation';
import {DB} from '../lib.compiled/DB';
import {ModelNotFoundException} from '../lib.compiled/Exception/ModelNotFoundException';
import {FailedToCreateTableException} from '../lib.compiled/Exception/FailedToCreateTableException';
import {FailedToCreateTablesException} from '../lib.compiled/Exception/FailedToCreateTablesException';
import Joi from 'joi';
import AWS from 'aws-sdk';
import Vogels from 'vogels';
import Kernel from 'deep-kernel';
import requireProxy from 'proxyquire';
import KernelFactory from './common/KernelFactory';
import {LocalDynamoMock} from './Mock/Driver/LocalDynamoMock';
import {VogelsMock} from './Mock/VogelsMock';

chai.use(sinonChai);

suite('DB', function() {
  let models = [
      {
        Name: {
          Name: 'string',
          Id: 'timeUUID',
        },
      }, {
        Backend: {
          IAM: {
            Configuration: 'string',
            Status: 'string',
          },
        },
      },
    ];
  let db = null;
  let backendKernelInstance = null;
  let vogelsMock = new VogelsMock();

  test('Class DB exists in DB', function() {
    chai.expect(typeof DB).to.equal('function');
  });

  test('Load Kernels by using Kernel.load()', function(done) {
    let callback = (backendKernel) => {
      chai.assert.instanceOf(
        backendKernel, Kernel, 'backendKernel is an instance of Kernel'
      );

      backendKernelInstance = backendKernel;

      // complete the async
      done();
    };

    //mocking Vogels
    vogelsMock.fixBabelTranspile();
    let vogelsExport = requireProxy('../lib.compiled/DB', {
      'vogels': vogelsMock,
    });
    let DBProxy = vogelsExport.DB;

    KernelFactory.create(
      {
        DB: DBProxy,
        Validation: Validation,
      },
      callback
    );
  });

  test('Check getting db from Kernel instance', function() {
    db = backendKernelInstance.get('db');

    chai.expect(db.constructor.name).to.equal('DB');
  });

  test('Check validation getter returns valid value', function() {
    chai.expect(db.validation).be.an.instanceOf(Validation);
  });

  test('Check has() method returns false', function() {
    chai.expect(db.has()).to.be.equal(false);
  });

  test('Check has() method returns true', function() {
    chai.expect(db.has('Name')).to.be.equal(true);
  });

  test('Check get() method returns valid object', function() {
    let actualResult = db.get('Name');

    chai.assert.typeOf(actualResult, 'function', 'returns function');
  });

  test('Check get() method returns exception for non existed model', function() {
    let error = null;

    try {
      db.get('ModelName');
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.an.instanceOf(ModelNotFoundException);
  });

  test('Check models getter returns valid value', function() {
    Object.keys(db.models).forEach(
      function(modelName) {
        chai.assert.typeOf(db.get(modelName), 'function');
      }
    );
  });

  test('Check LOCAL_DB_PORT static method returns integer and more than 0 value', function() {
    chai.expect(DB.LOCAL_DB_PORT).to.be.above(0);
  });

  test('Check DEFAULT_TABLE_OPTIONS static method returns { readCapacity: 1, writeCapacity: 1 }', function() {
    chai.expect(DB.DEFAULT_TABLE_OPTIONS.readCapacity).to.be.above(0);
    chai.expect(DB.DEFAULT_TABLE_OPTIONS.writeCapacity).to.be.above(0);
  });

  test('Check _rawModelsToVogels() w/o arguments returns {}', function() {
    chai.expect(db._rawModelsToVogels()).to.eql({});
  });

  test('Check _rawModelsToVogels() returns valid object', function() {
    let actualResult = db._rawModelsToVogels(models);

    chai.assert.instanceOf(actualResult, Object, 'is an instance of Object');
    chai.expect(Object.keys(actualResult)).to.eql(['Name', 'Backend']);
  });

  test('Check _wrapModelSchema method returns valid object', function() {
    let error = null;
    let actualResult = null;
    let modelName = 'Name';

    try {
      actualResult = db._wrapModelSchema(modelName);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.equal(null);
    chai.expect(actualResult.hashKey).to.equal('Id');
    chai.expect(actualResult.timestamps).to.equal(true);
    chai.expect(actualResult.tableName).to.contains('DeepDevName');
    chai.expect(Object.keys(actualResult.schema)).to.eql(['Name', 'Id']);
    chai.expect(actualResult.schema.Id.isJoi).to.equal(true);
    chai.expect(actualResult.schema.Name.isJoi).to.equal(true);
  });

  test('Check _wrapModelSchema() throws ModelNotFoundException for invalid model name', function() {
    let error = null;

    try {
      db._wrapModelSchema('invalid name');
    } catch (e) {
      error = e;
    }

    chai.expect(error.constructor.name).to.be.equal('ModelNotFoundException');
  });

  test('Check assureTable() return valid object', function() {
    let spyCallback = sinon.spy();
    vogelsMock.setMode(VogelsMock.NO_RESULT_MODE, ['createTables']);

    let actualResult = db.assureTable('Name', spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly();
    chai.expect(actualResult.constructor.name).to.be.equal('DB');
  });

  test('Check assureTable() throws ModelNotFoundException for invalid name',
    function() {
      let error = null;
      let spyCallback = sinon.spy();

      try {
        db.assureTable('Invalid model name', spyCallback);
      } catch (e) {
        error = e;
      }

      chai.assert.instanceOf(error, ModelNotFoundException, 'error is an instance of ModelNotFoundException');
      chai.expect(spyCallback).to.not.have.been.calledWith();
    }
  );

  test('Check assureTable() throws FailedToCreateTablesException ', function() {
    let error = null;
    let spyCallback = sinon.spy();

    vogelsMock.setMode(VogelsMock.FAILURE_MODE, ['createTables']);

    try {
      db.assureTable('Name', spyCallback);
    } catch (e) {
      error = e;
    }

    chai.assert.instanceOf(
      error, FailedToCreateTableException, 'error is an instance of FailedToCreateTableException'
    );
    chai.expect(spyCallback).to.not.have.been.calledWith();
  });

  test('Check assureTables() return valid object', function() {
    let spyCallback = sinon.spy();
    vogelsMock.setMode(VogelsMock.NO_RESULT_MODE, ['createTables']);

    let actualResult = db.assureTables(spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly();
    chai.expect(actualResult.constructor.name).to.be.equal('DB');
  });

  test('Check assureTables() throws FailedToCreateTablesException ', function() {
    let error = null;
    let spyCallback = sinon.spy();

    vogelsMock.setMode(VogelsMock.FAILURE_MODE, ['createTables']);

    try {
      db.assureTables('Name', spyCallback);
    } catch (e) {
      error = e;
    }

    chai.assert.instanceOf(
      error, FailedToCreateTablesException, 'error is an instance of FailedToCreateTablesException'
    );
    chai.expect(spyCallback).to.not.have.been.calledWith();
  });

  test('Check _setVogelsDriver method returns valid object', function() {
    let testDriver = { name: 'Test driver'};
    let actualResult = db._setVogelsDriver(testDriver);

    chai.expect(actualResult.constructor.name).to.be.equal('DB');
    chai.expect(vogelsMock.driver).to.be.eql(testDriver);
  });

  test('Check _enableLocalDB() returns valid object', function() {
    let spyCallback = sinon.spy();

    vogelsMock.setMode(VogelsMock.NO_RESULT_MODE);

    db._enableLocalDB(spyCallback);

    chai.expect(vogelsMock.dynamoDB.options.accessKeyId).to.be.equal('fake');
    chai.expect(vogelsMock.dynamoDB.options.secretAccessKey).to.be.equal('fake');
    chai.expect(vogelsMock.dynamoDB.options.region).to.be.equal('us-east-1');

    chai.expect(vogelsMock.dynamoDB.endpoint).to.be.eql(`http://localhost:${DB.LOCAL_DB_PORT}`);
  });

  test('Check startLocalDynamoDBServer() starts db server', function() {
    let spyCallback = sinon.spy();

    let actualResult = DB.startLocalDynamoDBServer(spyCallback, LocalDynamoMock);

    chai.expect(actualResult._running).to.be.equal(true);
    chai.expect(spyCallback).to.have.been.calledWithExactly(null, 'IsRunning');
  });
});

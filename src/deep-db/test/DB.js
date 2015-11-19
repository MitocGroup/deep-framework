'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Validation from 'deep-validation';
import {DB} from '../lib.compiled/DB';
import {ModelNotFoundException} from '../lib.compiled/Exception/ModelNotFoundException';
import Joi from 'joi';
import AWS from 'aws-sdk';
import Vogels from 'vogels';
import Kernel from 'deep-kernel';
import KernelFactory from './common/KernelFactory';
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
  //let tablenames = {
  //  Configuration: 'ConfigurationTable',
  //  Status: 'StatusTable',
  //};
  //let dynamodb = new AWS.DynamoDB();
  let db = null;
  let validation = null;
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



    KernelFactory.create(
      {
        DB: DB,
        Validation: Validation,
      },
      callback
    );
  });

  test('Check getting db from Kernel instance', function() {
    db = backendKernelInstance.get('db');

    chai.assert.instanceOf(db, DB, 'db is an instance of DB');
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

  //// @todo - mock Vogels in order to test assureTable, assureTables, etc methods
  ////test('Check assureTable() return valid object', function() {
  ////  let error = null;
  ////  let actualResult = null;
  ////  let spyCallback = sinon.spy();
  ////
  ////  try {
  ////    actualResult = db.assureTable('Lambda', spyCallback);
  ////  } catch (e) {
  ////    error = e;
  ////  }
  ////
  ////  chai.expect(error).to.be.equal(null);
  ////});
  //
  //
  //test('Check _setVogelsDriver method returns valid object', function() {
  //  let error = null;
  //  let actualResult = null;
  //
  //
  //  try {
  //    actualResult = db._setVogelsDriver(dynamodb);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.equal(null);
  //});
  //
  //test('Check boot() returns valid object !_localBackend', function() {
  //  let error = null;
  //  let actualResult = null;
  //  let kernel = {
  //    config: {
  //      models: {},
  //    },
  //  };
  //  let spyCallback = sinon.spy();
  //  try {
  //    actualResult = db.boot(kernel, spyCallback);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.equal(null);
  //  chai.expect(spyCallback).to.have.been.calledWith();
  //});
  //
  //test('Check assureTable() throws ModelNotFoundException', function() {
  //  let error = null;
  //  let actualResult = null;
  //  let spyCallback = sinon.spy();
  //  try {
  //    actualResult = db.assureTable('IAM', spyCallback);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.assert.instanceOf(error, ModelNotFoundException, 'error is an instance of ModelNotFoundException');
  //});
  //
  //test('Check assureTables() returns valid object', function() {
  //  let error = null;
  //  let actualResult = null;
  //  let spyCallback = sinon.spy();
  //  try {
  //    actualResult = db.assureTables(spyCallback);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //});
  //
  //test('Check startLocalDynamoDBServer() starts db server', function() {
  //  let error = null;
  //  let actualResult = null;
  //  let spyCallback = sinon.spy();
  //  try {
  //    actualResult = DB.startLocalDynamoDBServer(spyCallback);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.equal(null);
  //});
  //
  //test('Check _enableLocalDB() returns valid object', function() {
  //  let error = null;
  //  let actualResult = null;
  //  let spyCallback = sinon.spy();
  //  try {
  //    actualResult = db._enableLocalDB(spyCallback);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.equal(null);
  //});
});

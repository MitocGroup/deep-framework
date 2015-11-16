'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Validation} from '../lib.compiled/Validation';
import {ObjectToJoi} from '../lib.compiled/ObjectToJoi';
import {Exception} from '../lib.compiled/Exception/Exception';
import {ModelNotFoundException} from '../lib.compiled/Exception/ModelNotFoundException';
import {ObjectValidationFailedException} from '../lib.compiled/Exception/ObjectValidationFailedException';
chai.use(sinonChai);

import Joi from 'joi';

suite('Validation', function() {
  let validation = new Validation();
  let modelName = 'userModel';
  let modelSchema = {
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string(),
  };

  let rawModelName = 'rawUserModel';
  let rawModelSchema = {username: 'string'};

  test('Class Validation exists in Validation', function() {
    chai.expect(typeof Validation).to.equal('function');
  });

  test('Check contructor sets default values', function() {
    chai.expect(validation.immutable).to.be.equal(false);
    chai.expect(validation.models).to.be.object_;
  });

  test('Check immutable getter returns [false]', function() {
    chai.expect(validation.immutable).to.be.equal(false);
  });

  test(`Check set() method sets models[\'${modelName}\']=${modelSchema} for immutable=false`, function() {
    validation.set(modelName, modelSchema);
    chai.expect(validation.get(modelName)).to.be.eql(modelSchema);
  });

  test(`Check setRaw() method sets models[\'${rawModelName}\']=${rawModelSchema} for immutable=false`, function() {
    validation.setRaw(rawModelName, rawModelSchema);
    let actualResult = validation.get(rawModelName);
    chai.expect(actualResult.username._type).to.be.equal(rawModelSchema.username);
    chai.expect(actualResult.username.isJoi).to.be.equal(true);
  });

  test('Check get() method returns values for existed modelNames', function() {
    chai.expect(validation.get(modelName)).to.be.equal(modelSchema);
  });

  test('Check has() method returns [false] for unexisted modelNames', function() {
    chai.expect(validation.has()).to.be.equal(false);
    chai.expect(validation.has('exist')).to.be.equal(false);
  });

  test('Check has() method returns [true] for existed modelNames', function() {
    chai.expect(validation.has(modelName)).to.be.equal(true);
  });

  test('Check get() method throws ModelNotFoundException', function() {
    let error = null;
    try {
      validation.get('invalidModelKey');
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.expect(error).to.be.an.instanceOf(ModelNotFoundException);
  });

  test('Check get() method throws ModelNotFoundException', function() {
    let error = null;
    try {
      validation.get('invalidModelKey');
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.expect(error).to.be.an.instanceOf(ModelNotFoundException);
  });

  test('Check immutable setter can\'t change value to [false]', function() {
    chai.expect(validation.immutable).to.be.equal(false);
    validation.immutable = true;
    chai.expect(validation.immutable).to.be.equal(true);
  });

  test('Check immutable setter sets [false]', function() {
    let error;
    chai.expect(validation.immutable).to.be.equal(true);
    try {
      validation.immutable = false;
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.an.instanceOf(Exception);
    chai.expect(validation.immutable).to.be.equal(true);
  });

  test('Check _assureImmutable() method throws [Exception]', function() {
    var error = null;

    try {
      validation.immutable = true;
      validation._assureImmutable();
    } catch (e) {
      error = e;
    }

    chai.expect(validation.immutable).to.be.equal(true);
    chai.expect(error).to.be.an.instanceOf(Exception);
  });

  test('Check set() method throws Exception when immutable=true', function() {
    let error = null;
    try {
      validation.set('newModelName', {model: 'newModelValue'});
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.an.instanceOf(Exception);
    chai.expect(validation.has('newModelKey')).to.be.equal(false);
  });

  test('Check validate() method throws ObjectValidationFailedException', function() {
    let error = null;
    let inputObject = {
      username: 'mi',
      password: 'password',
    };
    try {
      validation.validate(modelName, inputObject);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.expect(error).to.be.an.instanceOf(ObjectValidationFailedException);
    chai.expect(error.message).to.be.contains('Object validation failed on schema');
  });

  test('Check validate() returns valid object', function() {
    let error = null;
    let inputObject = {
      username: 'mitocgroup',
      password: 'password',
    };
    let actualResult = null;
    try {
      actualResult = validation.validate(modelName, inputObject);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(actualResult).to.be.eql(inputObject);
  });

  test('Check normalizeSchema() returns valid ObjectToJoi object', function() {
    let error = null;
    let actualResult = null;
    try {
      actualResult = Validation.normalizeSchema({key: 'string'});
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(typeof actualResult).to.be.equal('object');
    chai.expect(typeof actualResult.key).to.be.equal('object');
    chai.expect(actualResult.key._type).to.be.equal('string');
    chai.expect(actualResult.key.isJoi).to.be.equal(true);
  });

  test('Check _rawModelsToSchemas() returns valid object', function() {
    let error = null;
    let actualResult = null;
    let validRawSchema = {
      Backend: {
        IAM: {
          Configuration: 'string',
          Status: 'string',
        },
        Lambda: {
          Configuration: 'string',
          Status: 'string',
        },
      },
    };
    try {
      actualResult = validation._rawModelsToSchemas(validRawSchema);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(typeof actualResult).to.be.equal('object');
  });

  test('Check boot() returns valid object', function() {
    let error = null;
    let actualResult = null;
    let kernel = {
      config: {
        models: {
          Backend: {
            IAM: {
              Configuration: 'string',
              Status: 'string',
            },
            Lambda: {
              Configuration: 'string',
              Status: 'string',
            },
          },
        },
      },
    };
    let spyCallback = sinon.spy();
    let validationInstance = new Validation();
    try {
      actualResult = validationInstance.boot(kernel, spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.calledWith();
  });
});

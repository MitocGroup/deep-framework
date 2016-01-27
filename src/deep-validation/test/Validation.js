'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Validation} from '../lib/Validation';
import {ObjectToJoi} from '../lib/ObjectToJoi';
import {RuntimeMock} from './Mock/RuntimeMock';
import {Context} from '../node_modules/deep-core/lib.compiled/AWS/Lambda/Context';
import {Exception} from '../lib/Exception/Exception';
import {ValidationSchemaNotFoundException} from '../lib/Exception/ValidationSchemaNotFoundException';
import {InvalidJoiSchemaException} from '../lib/Exception/InvalidJoiSchemaException';
import {ObjectValidationFailedException} from '../lib/Exception/ObjectValidationFailedException';
import Kernel from 'deep-kernel';
import KernelFactory from './common/KernelFactory';

chai.use(sinonChai);

suite('Validation', function() {
  let validation = null;
  let modelName = 'ConfigurationModel';
  let rawModelSchema = {username: 'string'};
  let backendKernelInstance = null;
  let frontendKernelInstance = null;
  let testModelSchema = {
    Configuration: 'string',
    Status: 'number',
  };

  test('Class Validation exists in Validation', function() {
    chai.expect(typeof Validation).to.equal('function');
  });

  test('Load Kernels by using Kernel.load()', function(done) {
    let callback = (frontendKernel, backendKernel) => {
      chai.assert.instanceOf(
        backendKernel, Kernel, 'backendKernel is an instance of Kernel'
      );
      chai.assert.instanceOf(
        frontendKernel, Kernel, 'frontendKernel is an instance of Kernel'
      );

      backendKernelInstance = backendKernel;
      frontendKernelInstance = frontendKernel;

      validation = frontendKernel.get('validation');

      chai.assert.instanceOf(
        validation, Validation, 'validation is an instance of Validation'
      );

      // complete the async
      done();
    };

    KernelFactory.create({Validation: Validation}, callback);
  });

  test('Check constructor sets schemas', function() {
    chai.assert.instanceOf(
      validation.schemas, Object, 'schemas is an instance of Object'
    );
    chai.expect(validation.schemasNames).to.be.eql(['Name']);
  });

  test('Check hasSchema() returns true', function() {
    chai.expect(validation.hasSchema('Name')).to.be.equal(true);
  });

  test('Check hasSchema() returns false', function() {
    chai.expect(validation.hasSchema('None-exsting name')).to.be.equal(false);
  });

  test('Check getSchema() returns valid object', function() {
    let actualResult = validation.getSchema('Name');

    chai.assert.instanceOf(
      actualResult, Object, 'getSchema() returns an instance of Object'
    );
    chai.expect(actualResult.isJoi).to.be.equal(true);
  });

  test('Check getSchema() method throws ValidationSchemaNotFoundException',
    function() {
      let error = null;

      try {
        validation.getSchema('invalidSchemaName');
      } catch (e) {
        error = e;
      }

      chai.expect(error).to.be.an.instanceOf(ValidationSchemaNotFoundException);
    }
  );

  test('Check setSchema() method throws InvalidJoiSchemaException', function() {
    let error = null;
    let invalidSchema = {firstKey: 'value1'};

    try {
      validation.setSchema('invalidSchemaName', invalidSchema);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.an.instanceOf(InvalidJoiSchemaException);
  });

  test('Check setSchema() method create new model schema', function() {
    let joi = ObjectToJoi._transform(rawModelSchema);
    let actualResult = validation.setSchema('NewSchema', joi);

    chai.expect(actualResult).to.be.an.instanceOf(Validation);
    chai.expect(validation.schemasNames).to.be.eql(['Name', 'NewSchema']);
  });

  test('Check normalizeSchema() returns valid ObjectToJoi object', function() {
    let actualResult = Validation.normalizeSchema({testKey: 'string'});

    chai.assert.instanceOf(actualResult, Object, 'is an instance of Object');
    chai.expect(actualResult.isJoi).to.be.equal(true);
    chai.expect(actualResult._type).to.be.equal('object');

    chai.expect(actualResult._inner.children[0].key).to.be.equal('testKey');
    chai.expect(actualResult._inner.children[0].schema.isJoi).to.be.equal(true);
    chai.expect(actualResult._inner.children[0].schema._type).to.be.equal('string');
  });


  test('Check setSchemaRaw() set normalized schema to schemas[]', function() {
    let actualResult = validation.setSchemaRaw(modelName, testModelSchema);

    chai.expect(actualResult).to.be.an.instanceOf(Validation);
    chai.expect(validation.schemasNames).to.be.eql(['Name', 'NewSchema', modelName]);
  });

  test('Check _rawModelsToSchemas() returns valid object', function() {
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
    let actualResult = validation._rawModelsToSchemas(validRawSchema);

    chai.assert.instanceOf(actualResult, Object, 'is an instance of Object');
  });

  test('Check validate() method throws ObjectValidationFailedException',
    function() {
      let error = null;
      let inputObject = {
        Configuration: 'test configuration',
        Status: 'should be number here',
      };

      try {
        validation.validate(modelName, inputObject);
      } catch (e) {
        error = e;
      }

      chai.expect(error).to.be.an.instanceOf(ObjectValidationFailedException);
      chai.expect(error.message).to.be.contains(
        'Object validation failed on schema'
      );
    }
  );

  test('Check validate() returns valid object for !returnRaw', function() {
    let inputObject = {
      Configuration: 'test configuration',
      Status: 0,
    };

    let actualResult = validation.validate(modelName, inputObject);

    chai.expect(actualResult).to.be.eql(inputObject);
  });

  test('Check validate() returns valid object for returnRaw', function() {
    let inputObject = {
      Configuration: 'test configuration',
      Status: 0,
    };
    let expectedResult = {
      error: null,
      value: inputObject,
    };

    let actualResult = validation.validate(modelName, inputObject, true);

    chai.expect(actualResult).to.be.eql(expectedResult);
  });

  test('Check boot() returns valid object', function() {
    let spyCallback = sinon.spy();
    let validationInstance = new Validation();

    validationInstance.boot(backendKernelInstance, spyCallback);

    chai.expect(validationInstance.schemasNames).to.be.eql(['Name']);

    chai.expect(
      validationInstance.schemas.Name._inner.children[0].key
    ).to.be.equal('Name');
    chai.expect(
      validationInstance.schemas.Name._inner.children[0].schema._type
    ).to.be.equal('string');
    chai.expect(
      validationInstance.schemas.Name._inner.children[0].schema.isJoi
    ).to.be.equal(true);

    chai.expect(
      validationInstance.schemas.Name._inner.children[1].key
    ).to.be.equal('Id');
    chai.expect(
      validationInstance.schemas.Name._inner.children[1].schema._type
    ).to.be.equal('string');
    chai.expect(
      validationInstance.schemas.Name._inner.children[1].schema.isJoi
    ).to.be.equal(true);

    chai.expect(spyCallback).to.have.been.calledWithExactly();
  });

  test('Check validateRuntimeInput() sends ErrorResponse for none-exisiting schema',
    function() {
      let inputObject = {
        Configuration: 'test configuration',
        Status: 0,
      };
      let spyCallback = sinon.spy();
      let context = new Context({
        contextTest: 'Test',
        fail: () => {
          return this;
        },
      });
      let lambdaRuntime = new RuntimeMock(backendKernelInstance);

      lambdaRuntime._request = {data: inputObject};
      lambdaRuntime._context = context;

      let actualResult = validation.validateRuntimeInput(
        lambdaRuntime, 'none-exisiting schema name', spyCallback
      );

      chai.expect(actualResult).to.be.an.instanceOf(Validation);
      chai.expect(spyCallback).to.not.have.been.calledWith();
      chai.expect(lambdaRuntime.contextSent).to.equal(true);
    }
  );

  test('Check validateRuntimeInput() returns validation result in cb',
    function() {
      let inputObject = {
        Configuration: 'test configuration',
        Status: 0,
      };
      let spyCallback = sinon.spy();
      let lambdaRuntime = new RuntimeMock(backendKernelInstance);
      lambdaRuntime._request = {data: inputObject};

      let actualResult = validation.validateRuntimeInput(
        lambdaRuntime, modelName, spyCallback
      );

      chai.expect(actualResult).to.be.an.instanceOf(Validation);
      chai.expect(spyCallback).to.have.been.calledWithExactly(inputObject);
    }
  );

  test('Check validateRuntimeInput() sends ErrorResponse for validation schema error',
    function() {
      let inputObject = {
        Configuration: 'test configuration',
        Status: '',
      };
      let spyCallback = sinon.spy();
      let context = new Context({
        contextTest: 'Test',
        fail: () => {
          return this;
        },
      });
      let lambdaRuntime = new RuntimeMock(backendKernelInstance);
      lambdaRuntime._request = {data: inputObject};
      lambdaRuntime._context = context;

      let actualResult = validation.validateRuntimeInput(
        lambdaRuntime, modelName, spyCallback
      );

      chai.expect(actualResult).to.be.an.instanceOf(Validation);
      chai.expect(spyCallback).to.not.have.been.calledWith();
      chai.expect(lambdaRuntime.contextSent).to.equal(true);
    }
  );

});

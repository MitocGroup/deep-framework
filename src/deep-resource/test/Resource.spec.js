'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Resource} from '../lib/Resource';
import {Instance as ResourceInstance} from '../lib/Resource/Instance';
import {Action} from '../lib/Resource/Action';
import {MissingResourceException} from '../lib/Exception/MissingResourceException';
import {MissingActionException} from '../lib/Resource/Exception/MissingActionException';
import {InvalidDeepIdentifierException}
  from '../node_modules/deep-kernel/lib.compiled/Exception/InvalidDeepIdentifierException';
import Kernel from 'deep-kernel';
import Log from 'deep-log';
import Cache from 'deep-cache';
import Security from 'deep-security';
import Validation from 'deep-validation';
import KernelFactory from './common/KernelFactory';

chai.use(sinonChai);

suite('Resource', () => {
  let microserviceIdentifier = 'deep-hello-world';
  let microserviceInstance = null;
  let resource = null;
  let resourceName = 'say-hello';
  let actionName = 'create-msg';
  let backendKernelInstance = null;

  test('Class Resource exists in Resource', () => {
    chai.expect(Resource).to.be.an('function');
  });

  test('Load Kernel by using Kernel.load()', (done) => {
    let callback = (backendKernel) => {
      chai.assert.instanceOf(
        backendKernel, Kernel, 'backendKernel is an instance of Kernel'
      );

      backendKernelInstance = backendKernel;

      // complete the async
      done();
    };

    KernelFactory.create({
      Cache: Cache,
      Security: Security,
      Resource: Resource,
      Validation: Validation,
      Log: Log,
    }, callback);
  });

  test('Check getting resource from Kernel instance', () => {
    resource = backendKernelInstance.get('resource');
    chai.assert.instanceOf(
      resource, Resource, 'resource is an instance of Resource'
    );

    chai.expect(resource.actionsConfig).to.be.an('object');
  });

  test('Check constructor sets _resources', () => {
    chai.expect(Object.keys(resource._resources)).to.be.eql(
      ['deep-hello-world', 'deep-root-vanilla']
    );
  });

  test('Check has() method returns false for invalid microservice identifier', () => {
    microserviceInstance = backendKernelInstance.microservice(microserviceIdentifier);
    resource.bind(microserviceInstance);

    chai.expect(resource.has('invalid_res_identifier')).to.be.equal(false);
  });

  test('Check has() method returns true', () => {
    chai.expect(resource.has(resourceName)).to.be.equal(true);
  });

  test(
    'Check get() method returns valid object for valid microservice identifier + resource',
    () => {
      let actualResult = resource.get(
        `@${microserviceIdentifier}:${resourceName}`
      );

      chai.assert.instanceOf(
        actualResult, ResourceInstance, 'result is an instance of ResourceInstance');
      chai.expect(actualResult.name).to.be.equal(resourceName);
      chai.expect(Object.keys(actualResult._rawActions)).to.be.eql(
        ['create-msg', 'create-fs', 'create-db']
      );
    }
  );

  test(
    'Check get() method returns valid object for valid microservice identifier + resource + action',
    () => {
      let actualResult = resource.get(
        `@${microserviceIdentifier}:${resourceName}:${actionName}`
      );

      chai.assert.instanceOf(
        actualResult, Action, 'result is an instance of Action');
      chai.expect(actualResult.name).to.be.equal(actionName);
    }
  );

  test(
    'Check get() method throws "InvalidDeepIdentifierException" for invalid microservice identifier',
    () => {
      let error = null;

      try {
        resource.get(`@invalid_microservice_identifier`);
      } catch (e) {
        error = e;
      }

      chai.assert.instanceOf(
        error, InvalidDeepIdentifierException, 'error is an instance of InvalidDeepIdentifierException'
      );
    }
  );

  test('Check get() method throws "MissingResourceException" exception for invalid resource',
    () => {
      let error = null;

      try {
        resource.get(`@${microserviceIdentifier}:invalid_resource_name`);
      } catch (e) {
        error = e;
      }

      chai.assert.instanceOf(
        error, MissingResourceException, 'error is an instance of MissingResourceException'
      );
    }
  );

  test('Check get() method throws "MissingResourceException" exception for invalid action',
    () => {
      let error = null;

      try {
        resource.get(`@${microserviceIdentifier}:${resourceName}:invalidAction`);
      } catch (e) {
        error = e;
      }

      chai.assert.instanceOf(
        error, MissingActionException, 'error is an instance of MissingActionException'
      );
    }
  );

  test('Check list() getter returns', () => {
    let actualResult = resource.list;
    let expectedResult = {
      'deep-root-vanilla': [
        'async-config',
        'scheduler',
        'ddb-eventual-consistency',
      ],
      'deep-hello-world': [
        'say-hello',
      ],
    };
    chai.expect(actualResult).to.be.eql(expectedResult);
  });

  test('Check boot() method', () => {
    let spyCallback = sinon.spy();

    resource.boot(backendKernelInstance, spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly();
    chai.assert.instanceOf(
      resource._resources[microserviceIdentifier]['say-hello'],
      ResourceInstance,
      'item is an instance of ResourceInstance'
    );
  });

  test('Check getActionConfig returns null', () => {
    chai.expect(resource.getActionConfig('invalid sourceId')).to.be.equal(null);
  });

  test('Check getActionConfig returns an object', () => {
    //sourceId from config
    let sourceId = 'arn:aws:lambda:::function:deep-hello-world-say-hello-create-msg';

    chai.expect(resource.getActionConfig(sourceId)).to.be.an('object');
  });
});

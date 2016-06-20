'use strict';

import chai from 'chai';
import {SuperagentResponse} from '../../lib/Resource/SuperagentResponse';
import {Resource} from '../../lib/Resource';
import {Request} from '../../lib/Resource/Request';
import {Action} from '../../lib/Resource/Action';
import Kernel from 'deep-kernel';
import Cache from 'deep-cache';
import Security from 'deep-security';
import Validation from 'deep-validation';
import Log from 'deep-log';
import KernelFactory from '../common/KernelFactory';

suite('Resource/SuperagentResponse', () => {
  let backendKernelInstance = null;
  let action = null;
  let request = null;
  let superagentResponse = null;
  let microserviceIdentifier = 'deep-hello-world';
  let resourceName = 'say-hello';
  let actionName = 'create-msg';
  let payload = '{"body":"bodyData"}';
  let method = 'POST';
  let rawData = {status: 500, body: 'bodyTest', error: 'errorMessage',};
  let rawError = new Error('errorMessage');

  test('Class SuperagentResponse exists in Resource/SuperagentResponse',
    () => {
      chai.expect(SuperagentResponse).to.be.an('function');
    }
  );

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

  test('Check getting action from Kernel instance', () => {
    action = backendKernelInstance.get('resource').get(
      `@${microserviceIdentifier}:${resourceName}:${actionName}`
    );

    chai.assert.instanceOf(
      action, Action, 'action is an instance of Action'
    );
  });

  test('Check creating request > superagentResponse from action instance', () => {
    request = new Request(action, payload, method);
    superagentResponse = new SuperagentResponse(request, rawData, rawError);

    chai.assert.instanceOf(
      superagentResponse,
      SuperagentResponse,
      'superagentResponse is an instance of SuperagentResponse'
    );
  });

  test('Check isError getter returns true', () => {
    chai.expect(superagentResponse.isError).to.be.equal(true);
  });

  test(`Check statusCode getter returns ${rawData.status}`, () => {
    chai.expect(superagentResponse.statusCode).to.be.equal(rawData.status);
  });

  test('Check constructor for !data.body && status < 300', () => {
    rawData = {Payload: '{"dataKey":"testValue"}', status: 201};
    rawError = null;

    superagentResponse = new SuperagentResponse(request, rawData, rawError);

    chai.expect(superagentResponse.isError).to.be.equal(false);
    chai.expect(superagentResponse.statusCode).to.be.equal(rawData.status);
  });

  test('Check constructor calls _parseExternal() for data && !error', () => {
    let _rawData = {status: 500, body: 'bodyTest', error: 'errorMessage',};
    let _rawError = null;

    superagentResponse = new SuperagentResponse(request, _rawData, _rawError);

    chai.expect(superagentResponse.error).to.be.equal(_rawData.error);
    chai.expect(superagentResponse.data).to.be.equal('bodyTest');
    chai.expect(superagentResponse.statusCode).to.be.equal(500);
  });

  test('Check constructor calls _parseExternal() for !data.status && error', () => {
    let _rawData = {body: 'bodyTest'};
    let _rawError = new Error('errorMessage');

    superagentResponse = new SuperagentResponse(request, _rawData, _rawError);

    chai.expect(superagentResponse.error).to.be.eql(_rawError);
    chai.expect(superagentResponse.data).to.be.equal('bodyTest');
    chai.expect(superagentResponse.statusCode).to.be.equal(500);
  });

  test('Check constructor calls _parseExternal() for !data.status && error', () => {
    let _rawData = {body: 'bodyTest'};
    let _rawError = new Error('errorMessage');

    superagentResponse = new SuperagentResponse(request, _rawData, _rawError);

    chai.expect(superagentResponse.error).to.be.eql(_rawError);
    chai.expect(superagentResponse.data).to.be.equal('bodyTest');
    chai.expect(superagentResponse.statusCode).to.be.equal(500);
  });

  test('Check constructor calls _parseLambda() for typeof data==="string" && !error',
    () => {
      let _rawData = {body: '{"bodyObj":{"key":"Test body value"}}'};
      let _rawError = null;

      superagentResponse = new SuperagentResponse(request, _rawData, _rawError);

      chai.expect(superagentResponse.error).to.be.eql(_rawError);
      chai.expect(superagentResponse.data).to.be.eql(JSON.parse(_rawData.body));
    }
  );

  test('Check constructor calls _parseLambda() for typeof data==="string" with errorMessage',
    () => {
      let _rawData = {
        body: '{"bodyObj":"Test body value","errorMessage":{"errorMessage":"Out of memory"}}'
      };
      let _rawError = null;

      superagentResponse = new SuperagentResponse(request, _rawData, _rawError);

      chai.expect(superagentResponse.data).to.be.eql(null);
      chai.expect(superagentResponse.error).to.be.an.instanceOf(Error);
    }
  );

  test('Check constructor calls _parseLambda() for typeof data==="string" with errorMessage as string',
    () => {
      let _rawData = {
        body: '{"bodyObj":"Test body value","errorMessage":"Out of memory"}'
      };
      let _rawError = null;

      superagentResponse = new SuperagentResponse(request, _rawData, _rawError);

      chai.expect(superagentResponse.data).to.be.eql(null);
      chai.expect(superagentResponse.error).to.be.equal(null);
    }
  );

  test('Check constructor calls _parseLambda() for typeof data==="string" with errorMessage,errorStack,errorType',
    () => {
      let _rawData = {
        body: '{"bodyObj":"Body","errorMessage":"Out of memory","errorStack":"Stack","errorType":"Runtime"}',
      };
      let _rawError = null;

      superagentResponse = new SuperagentResponse(request, _rawData, _rawError);

      chai.expect(superagentResponse.data).to.be.eql(null);
      chai.expect(superagentResponse.error).to.be.an.instanceOf(Error);
    }
  );
});

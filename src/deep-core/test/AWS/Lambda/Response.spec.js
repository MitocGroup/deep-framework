'use strict';

import chai from 'chai';
import {Response} from '../../../lib/AWS/Lambda/Response';
import {Runtime} from '../../../lib/AWS/Lambda/Runtime';
import {RuntimeMock} from '../../Mocks/AWS/Lambda/RuntimeMock';
import {MissingRuntimeContextException} from '../../../lib/AWS/Lambda/Exception/MissingRuntimeContextException';
import {ContextAlreadySentException} from '../../../lib/AWS/Lambda/Exception/ContextAlreadySentException';
import Kernel from 'deep-kernel';
import Validation from 'deep-validation';
import Resource from 'deep-resource';
import Security from 'deep-security';
import Cache from 'deep-cache';
import Log from 'deep-log';
import KernelFactory from './../../common/KernelFactory';

suite('AWS/Lambda/Response', () => {
  let backendKernelInstance = null;
  let data = {
    dataKey: {
      value: false,
    },
  };
  let response = null;

  test('Class Response exists in AWS/Lambda/Response', () => {
    chai.expect(Response).to.be.an('function');
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
      Validation: Validation,
      Security: Security,
      Resource: Resource,
      Cache: Cache,
      Log: Log,
    }, callback);
  });

  test('Check contextMethod getter returns "succeed"', () => {
    chai.expect(Response.contextMethod).to.be.equal('succeed');
  });

  test('Check constructor', () => {
    let runtime = new RuntimeMock(backendKernelInstance);
    response = new Response(runtime, data);
    chai.expect(response, 'is an instance of Response').to.be.an.instanceOf(Response);
    chai.expect(response.data).to.be.an('object');
    chai.expect(response.runtime).to.be.an.instanceOf(Runtime);
  });

  test('Check contextSent returns false', () => {
    chai.expect(response.contextSent).to.be.equal(false);
  });

  test('Check send()', () => {
    response._runtime._context = {
      key: 'test context',
      succeed: (data)=> {
        return data;
      },
    };

    response.send();

    chai.expect(response.contextSent).to.be.equal(true);
    chai.expect(response, 'is an instance of Response').to.be.an.instanceOf(Response);
  });

  test('Check send throws MissingRuntimeContextException', () => {
    let response = new Response({}, data);
    let error = null;

    try {
      response.send();
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.an.instanceOf(MissingRuntimeContextException);
  });

  //@todo - to be re-worked
  //test('Check send throws ContextAlreadySentException', () => {
  //  let error = null;
  //
  //  try {
  //    response.send();
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.an.instanceOf(ContextAlreadySentException);
  //});

  test('Check VALIDATION_SCHEMAS_DIR', () => {
    chai.expect(Runtime.VALIDATION_SCHEMAS_DIR).to.be.equal('__deep_validation_schemas__');
  });
});

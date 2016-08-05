'use strict';

import chai from 'chai';
import sinon from 'sinon';
import {Framework} from '../lib/Framework';
import Security from 'deep-security';
import Cache from 'deep-cache';
import Core from 'deep-core';
import Kernel from 'deep-kernel';

suite('Framework', () => {
  let framework = null;
  let id = 'firstCachedId';

  test('Class Framework exists in Framework', () => {
    chai.expect(Framework).to.be.an('function');
  });

  test('Check FRONTEND_CONTEXT static getter', () => {
    chai.expect(Framework.FRONTEND_CONTEXT).to.be.equal('frontend-ctx');
  });

  test('Check BACKEND_CONTEXT static getter', () => {
    chai.expect(Framework.BACKEND_CONTEXT).to.be.equal('backend-ctx');
  });

  test('Check ANONYMOUS_IDENTITY_KEY static getter', () => {
    chai.expect(Framework.ANONYMOUS_IDENTITY_KEY).to.be.equal('anonymous');
  });

  test('Check constructor', () => {
    let serviceMap = {
      Cache: Cache,
      Security: Security,
    };
    let pattern = /\d+\.\d+.\d+/g;

    framework = new Framework(serviceMap, Framework.FRONTEND_CONTEXT);

    chai.expect(framework, 'is an instance of Framework').to.be.an.instanceOf(Framework);
    chai.expect(framework.context).to.be.equal(Framework.FRONTEND_CONTEXT);
    chai.expect(pattern.test(framework.version)).to.be.equal(true);
    chai.expect(framework._kernelsMap).to.be.eql({});
  });

  test('Check _resolveServicesMap() for typeof serviceObj === "string"', () => {
    let serviceMap = {
      sinon: 'sinon',
    };

    let actualResult = framework._resolveServicesMap(serviceMap);

    chai.expect(actualResult, 'is an instance of Object').to.be.an.instanceOf(Object);
    chai.expect(actualResult.sinon).to.be.eql(sinon);
  });

  test('Check Core', () => {

    let actualResult = framework.Core;

    chai.expect(actualResult).to.be.eql(Core);
  });

  test('Check _createKernel', () => {

    let actualResult = framework._createKernel();

    chai.expect(actualResult, 'is an instance of Kernel').to.be.an.instanceOf(Kernel);
  });

  test('Check _kernelCached for non-existed id', () => {

    let actualResult = framework._kernelCached(id);

    chai.expect(actualResult, 'is an instance of Kernel').to.be.an.instanceOf(Kernel);
    chai.expect(framework._kernelsMap[id], 'is an instance of Kernel').to.be.an.instanceOf(Kernel);
  });

  test('Check _kernelCached for cached id', () => {

    let actualResult = framework._kernelCached(id);

    chai.expect(actualResult, 'is an instance of Kernel').to.be.an.instanceOf(Kernel);
    chai.expect(framework._kernelsMap[id], 'is an instance of Kernel').to.be.an.instanceOf(Kernel);
  });

  test('Check Kernel getter', () => {

    let actualResult = framework.Kernel;

    chai.expect(actualResult, 'is an instance of Kernel').to.be.an.instanceOf(Kernel);
    chai.expect(
      framework._kernelsMap[Framework.ANONYMOUS_IDENTITY_KEY], 'is an instance of Kernel'
    ).to.be.an.instanceOf(Kernel);
  });

  test('Check KernelFromLambdaContext for lambdaContext w/o identity, cognitoIdentityPoolId, cognitoIdentityId',
    () => {
      let lambdaContext = {};
      let lambdaEvent = {};
      let actualResult = framework.KernelFromLambdaContext(lambdaContext, lambdaEvent);

      chai.expect(actualResult, 'is an instance of Kernel').to.be.an.instanceOf(Kernel);
      chai.expect(
        framework._kernelsMap[Framework.ANONYMOUS_IDENTITY_KEY], 'is an instance of Kernel'
      ).to.be.an.instanceOf(Kernel);
    }
  );

  test('Check KernelFromLambdaContext for lambdaContext with identity, cognitoIdentityPoolId, cognitoIdentityId',
    () => {
      let lambdaContext = {
        identity: {
          cognitoIdentityPoolId: 'test cognitoIdentityPoolId',
          cognitoIdentityId: 'test cognitoIdentityId',
        },
      };
      let lambdaEvent = {};
      let actualResult = framework.KernelFromLambdaContext(lambdaContext, lambdaEvent);

      chai.expect(actualResult, 'is an instance of Kernel').to.be.an.instanceOf(Kernel);
      chai.expect(
        framework._kernelsMap[Framework.ANONYMOUS_IDENTITY_KEY], 'is an instance of Kernel'
      ).to.be.an.instanceOf(Kernel);
    }
  );
});

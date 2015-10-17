'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Asset} from '../lib.compiled/Asset';
import Kernel from 'deep-kernel';
import Instance from '../node_modules/deep-kernel/lib.compiled/Microservice/Instance';

chai.use(sinonChai);

suite('Asset', function() {
  let asset = new Asset();

  test('Class Asset exists in Asset', function() {
    chai.expect(typeof Asset).to.equal('function');
  });

  test('Check boot() method  for !kernel.isFrontend', function() {
    let kernel = {isFrontend: false};
    let spyCallback = sinon.spy();
    asset.boot(kernel, spyCallback);
    chai.expect(spyCallback).to.have.been.calledWith();
  });

  test('Check boot() method  for kernel.isFrontend', function() {
    let spyCallback = sinon.spy();
    let error = null;
    let kernelMock = {
      isFrontend: true,
      microservices: {
        'deep.test': {
          identifier: 'deep.test',
          rawResources: {
            test: {
              create: {
                description: 'Lambda for creating test',
                type: 'lambda',
                methods: [
                  'POST',
                ],
                source: 'src/Test/Create',
              },
              retrieve: {
                description: 'Retrieves test',
                type: 'lambda',
                methods: ['GET'],
                source: 'src/Test/Retrieve',
              },
              delete: {
                description: 'Lambda for deleting test',
                type: 'lambda',
                methods: ['DELETE'],
                source: 'src/Test/Delete',
              },
              update: {
                description: 'Update test',
                type: 'lambda',
                methods: ['PUT'],
                source: 'src/Test/Update',
              },
            },
          },
          isRoot: true,
        },
        'deep.second.test': {
          identifier: 'deep.second.test',
          rawResources: {
            test: {
              create: {
                description: 'Lambda for creating secondTest',
                type: 'lambda',
                methods: [
                  'POST',
                ],
                source: 'src/secondTest/Create',
              },
              retrieve: {
                description: 'Retrieves secondTest',
                type: 'lambda',
                methods: ['GET'],
                source: 'src/secondTest/Retrieve',
              },
              delete: {
                description: 'Lambda for deleting secondTest',
                type: 'lambda',
                methods: ['DELETE'],
                source: 'src/secondTest/Delete',
              },
              update: {
                description: 'Update secondTest',
                type: 'lambda',
                methods: ['PUT'],
                source: 'src/secondTest/Update',
              },
            },
          },
          isRoot: true,
        },
      },
      container: {
        addParameter: function() {
          return 'parameter added';
        },
      },
    };

    try {
      asset.boot(kernelMock, spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.calledWith();

  });

  test('Check locate() method  returns valid string', function() {
    let deepServices = new Kernel.MicroserviceInjectable();
    chai.assert.instanceOf(deepServices, Kernel.MicroserviceInjectable, 'deepServices is an instance of MicroserviceInjectable');
    let error = null;
    let kernel = null;
    let actualResult = null;
    try {
      kernel = new Kernel(deepServices, Kernel.FRONTEND_CONTEXT);
      actualResult = asset.locate({});
    } catch (e) {
      error = e;
    }

  });
});

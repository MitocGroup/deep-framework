'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {Resource} from '../lib.compiled/Resource';
import {MissingResourceException} from '../lib.compiled/Exception/MissingResourceException';
import {Instance} from '../node_modules/deep-kernel/lib.compiled/Microservice/Instance';
import Kernel from 'deep-kernel';
import Cache from 'deep-cache';
import Security from 'deep-security';

chai.use(sinonChai);

suite('Resource', function() {
  let testResources = {
    'hello.world.example': {
      sample: {
        'say-bye': {
          type: 'lambda',
          methods: ['GET',],
          region: 'us-west-2',
          source: {
            api: 'https://1zf47jpvxd.execute-api.us-west-2.amazonaws.com/dev/hello-world-example/sample/say-bye',
            original: 'arn:aws:lambda:us-west-2:389617777922:function:DeepDevSampleSayBye64211f3705a',
          },
        },
        'say-hello': {
          type: 'lambda',
          methods: ['POST',],
          region: 'us-west-2',
          source: {
            api: 'https://1zf47jpvxd.execute-api.us-west-2.amazonaws.com/dev/hello-world-example/sample/say-hello',
            original: 'arn:aws:lambda:us-west-2:389617777922:function:DeepDevSampleSayHello64211f3705a',
          },
        },
        'say-test': {
          type: 'external',
          methods: ['GET',],
          region: 'us-west-2',
          source: {
            api: 'https://1zf47jpvxd.execute-api.us-west-2.amazonaws.com/dev/hello-world-example/sample/say-test',
            original: 'http://petstore.swagger.io/v2/store/inventory',
          },
        },
      },
    },
  };
  let microserviceIdentifier = 'hello.world.example';
  let microserviceInstance = new Instance(microserviceIdentifier, testResources[microserviceIdentifier]);
  let resource = null;
  let resourceName = 'sample';

  test('Class Resource exists in Resource', function() {
    resource = new Resource(testResources);
    chai.expect(typeof Resource).to.equal('function');
  });

  test('Load Kernel by using Kernel.loadFromFile()', function(done) {
    let error = null;
    let backendKernelInstanse = null;

    let callback = (backendKernel) => {
      resource = backendKernel.get('resource');
      chai.expect(backendKernel).to.be.not.eql({});
      chai.expect(resource).to.be.not.eql({});

      // complete the async
      done();
    };
    try {
      backendKernelInstanse = new Kernel({
        Cache: Cache,
        Security: Security,
        Resource: Resource,
      }, Kernel.BACKEND_CONTEXT);
      backendKernelInstanse.loadFromFile('./test/common/backend-cfg-json.json', callback);
    } catch (e) {
      error = e;
    }
  });

  test('Check constructor sets _resources', function() {
    chai.expect(Object.keys(resource._resources)).to.be.eql(['hello.world.example', 'deep.ng.root']);
    chai.expect(resource._resources).to.be.not.eql({});
  });


  test('Check has() method returns false', function() {
    let error = null;
    let actualResult = null;
    try {
      resource.bind(microserviceInstance);
      actualResult = resource.has('invalid_resource_identifier');
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(actualResult).to.be.equal(false);
  });

  test('Check has() method returns true', function() {
    let error = null;
    let actualResult = null;
    try {
      resource.bind(microserviceInstance);
      actualResult = resource.has(resourceName);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(actualResult).to.be.equal(true);
  });

  test('Check get() method returns valid object', function() {
    let error = null;
    let actualResult = null;
    try {
      actualResult = resource.get(`@${microserviceIdentifier}:${resourceName}`);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.eql(null);
    chai.expect(actualResult.name).to.be.eql(resourceName);
    chai.expect(Object.keys(actualResult._rawActions)).to.be.
      contains(Object.keys(testResources[microserviceIdentifier][resourceName])[0]);
  });

  test('Check get() method throws \'MissingResourceException\' exception', function() {
    let error = null;
    try {
      resource.get(`@${microserviceIdentifier}:invalid_resource_name`);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.assert.instanceOf(error, MissingResourceException, 'error is an instance of MissingResourceException');
  });

  test('Check list() getter returns', function() {
    let error = null;
    let actualResult = null;
    try {
      actualResult = resource.list();
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
  });

  test('Check boot() method', function() {
    let error = null;
    let actualResult = null;
    let spyCallback = sinon.spy();
    let kernelMock = {
      container: {
        get: function(name) {
          if (name === 'security') {
            return {
              onTokenAvailable: function(cb) {
                return cb({credentials: 'testCredentials'});
              },
            };
          }

          return {serviceName: name};
        },
      },
      microservices: {
        'deep.test': {
          identifier: 'deep.test',
          rawResources: testResources[microserviceIdentifier],
        },
      },
    };

    try {
      actualResult = resource.boot(kernelMock, spyCallback);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(spyCallback).to.have.been.calledWith();
  });
});

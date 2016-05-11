'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _deepKernel = require('deep-kernel');

var _deepKernel2 = _interopRequireDefault(_deepKernel);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _sinonChai = require('sinon-chai');

var _sinonChai2 = _interopRequireDefault(_sinonChai);

var _Asset = require('../lib/Asset');

var _Instance = require('../node_modules/deep-kernel/lib.compiled/Microservice/Instance');

var _KernelFactory = require('./common/KernelFactory');

var _KernelFactory2 = _interopRequireDefault(_KernelFactory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_chai2.default.use(_sinonChai2.default);

suite('Asset', () => {
  let assetService = null;
  let backendKernelInstance = null;
  let frontendKernelInstance = null;
  let buildId = 'm3hb5jh8';

  test('Class Asset exists in Asset', () => {
    _chai2.default.expect(_Asset.Asset).to.be.an('function');
  });

  test('Load Kernels by using Kernel.load()', done => {
    let callback = (frontendKernel, backendKernel) => {
      _chai2.default.assert.instanceOf(backendKernel, _deepKernel2.default, 'backendKernel is an instance of Kernel');
      backendKernelInstance = backendKernel;
      _chai2.default.assert.instanceOf(frontendKernel, _deepKernel2.default, 'frontendKernel is an instance of Kernel');
      frontendKernelInstance = frontendKernel;
      assetService = frontendKernel.get('asset');

      assetService.injectBuildId = false;

      // complete the async
      done();
    };
    _KernelFactory2.default.create({ Asset: _Asset.Asset }, callback);
  });

  test('Check boot() method for !kernel.isFrontend', () => {
    let spyCallback = _sinon2.default.spy();
    assetService.boot(backendKernelInstance, spyCallback);
    _chai2.default.expect(spyCallback).to.have.been.calledWith();
  });

  test('Check boot() method  for kernel.isFrontend', () => {
    let spyCallback = _sinon2.default.spy();
    let expectedResult = ['hello.world.example/bootstrap.js'];
    assetService.boot(frontendKernelInstance, spyCallback);
    _chai2.default.expect(frontendKernelInstance.get(_deepKernel2.default.FRONTEND_BOOTSTRAP_VECTOR)).to.be.eql(expectedResult);
    _chai2.default.expect(spyCallback).to.have.been.calledWith();
  });

  test('Check locate() method returns valid string for isRoot', () => {
    let expectedResult = 'bootstrap.js';
    let actualResult = assetService.locate('@deep.ng.root:bootstrap.js');
    _chai2.default.expect(actualResult).to.be.equal(expectedResult);
  });

  test('Check locate() method returns valid string for !isRoot', () => {
    let expectedResult = 'hello.world.example/bootstrap.js';
    let actualResult = assetService.locate('@hello.world.example:bootstrap.js');
    _chai2.default.expect(actualResult).to.be.equal(expectedResult);
  });

  test('Check locate() method returns absolute url', () => {
    global.window = {
      location: {
        origin: 'http://example.com'
      }
    };

    let expectedResult = 'http://example.com/hello.world.example/bootstrap.js';
    let actualResult = assetService.locateAbsolute('@hello.world.example:bootstrap.js');
    _chai2.default.expect(actualResult).to.be.equal(expectedResult);

    delete global.window;
  });

  test('Check locate() method returns absolute url IE case (no window.location.origin)', () => {
    global.window = {
      location: {
        protocol: 'http',
        hostname: 'example.com',
        port: 8000
      }
    };

    let expectedResult = 'http://example.com:8000/hello.world.example/bootstrap.js';
    let actualResult = assetService.locateAbsolute('@hello.world.example:bootstrap.js');
    _chai2.default.expect(actualResult).to.be.equal(expectedResult);

    delete global.window;
  });

  test(`Check locate() method returns asset without the buildId being injected`, () => {
    assetService._buildId = buildId;
    assetService.injectBuildId = true;

    let expectedResult = `hello.world.example/bootstrap.js`;
    let actualResult = assetService.locate('@hello.world.example:bootstrap.js', '', true);
    _chai2.default.expect(actualResult).to.be.equal(expectedResult);
  });

  test(`Check locate() method returns asset with buildId injected (...?_v=${ buildId })`, () => {
    assetService._buildId = buildId;
    assetService.injectBuildId = true;

    let expectedResult = `hello.world.example/bootstrap.js?_v=${ buildId }`;
    let actualResult = assetService.locate('@hello.world.example:bootstrap.js');
    _chai2.default.expect(actualResult).to.be.equal(expectedResult);
  });
});
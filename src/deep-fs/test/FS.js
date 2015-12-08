'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import S3FS from 's3fs';
import {FS} from '../lib/FS';
import {UnknownFolderException} from '../lib/Exception/UnknownFolderException';
import Kernel from 'deep-kernel';
import KernelFactory from './common/KernelFactory';
import OS from 'os';
import Path from 'path';
import nodeFS from 'fs';

chai.use(sinonChai);

suite('FS', function() {
  let fs = null;
  let backendKernelInstance = null;
  let path = 'hello.world.example/';

  test('Class FS exists in FS', function() {
    chai.expect(typeof FS).to.equal('function');
  });

  test('Load instance of FS by using Kernel.load()', function(done) {
    let callback = (backendKernel) => {
      backendKernelInstance = backendKernel;
      fs = backendKernel.get('fs');

      chai.assert.instanceOf(
        backendKernel, Kernel, 'backendKernel is an instance of Kernel'
      );
      chai.assert.instanceOf(
        fs, FS, 'fs is an instance of FS'
      );

      // complete the async
      done();
    };

    KernelFactory.create({FS: FS}, callback);
  });

  test('Check TMP static getter returns "temp"', function() {
    chai.expect(FS.TMP).to.be.equal('temp');
  });

  test('Check PUBLIC static getter returns "public"', function() {
    chai.expect(FS.PUBLIC).to.be.equal('public');
  });

  test('Check SYSTEM static getter returns "system"', function() {
    chai.expect(FS.SYSTEM).to.be.equal('system');
  });

  test('Check FOLDERS static getter returns array of levels', function() {
    chai.expect(FS.FOLDERS.length).to.be.equal(3);
    chai.expect(FS.FOLDERS).to.be.include(FS.TMP);
    chai.expect(FS.FOLDERS).to.be.include(FS.PUBLIC);
    chai.expect(FS.FOLDERS).to.be.include(FS.SYSTEM);
  });

  test('Check boot() method boots a certain service', function() {
    let spyCallback = sinon.spy();

    fs.boot(backendKernelInstance, spyCallback);

    chai.expect(Object.keys(fs._buckets)).to.eql(['temp', 'public', 'system']);
    chai.expect(spyCallback).to.have.been.calledWithExactly();
  });

  test('Check tmp() getter returns valid mounted tmp folder', function() {
    let bucketName = 'deep.dev.temp.32f3705a';

    let actualResult = fs.tmp;

    chai.assert.instanceOf(actualResult, S3FS, 'result is an instance of S3FS');
    chai.expect(actualResult.bucket).to.equal(bucketName);
    chai.expect(actualResult.path).to.equal(path);
  });

  test('Check public() getter returns valid mounted public folder', function() {
    let bucketName = 'deep.dev.public.32f3705a';

    let actualResult = fs.public;

    chai.assert.instanceOf(actualResult, S3FS, 'result is an instance of S3FS');
    chai.expect(actualResult.bucket).to.equal(bucketName);
    chai.expect(actualResult.path).to.equal(path);
  });

  test('Check system() getter returns valid mounted system folder', function() {
    let bucketName = 'deep.dev.system.32f3705a';

    let actualResult = fs.system;

    chai.assert.instanceOf(actualResult, S3FS, 'result is an instance of S3FS');
    chai.expect(actualResult.bucket).to.equal(bucketName);
    chai.expect(actualResult.path).to.equal(path);
  });

  test('Check getFolder() throws "UnknownFolderException" for invalid path',
    function() {
      let error = null;

      try {
        fs.getFolder('invalidPath');
      } catch (e) {
        error = e;
      }

      chai.expect(error).to.be.an.instanceof(UnknownFolderException);
    }
  );

  test('Check getFolder() method returns valid value', function() {
    let actualResult = fs.getFolder(FS.TMP);

    chai.assert.instanceOf(actualResult, S3FS, 'result is an instance of S3FS');
    chai.expect(actualResult.bucket).to.equal('deep.dev.temp.32f3705a');
    chai.expect(actualResult.path).to.equal('hello.world.example/');
  });

  test('Check _getTmpDir() static method returns valid value', function() {
    let subpath = 'test/Path/To/' + FS.TMP;
    let expectedResult = Path.join(OS.tmpdir(), subpath);

    let actualResult = FS._getTmpDir(subpath);

    chai.expect(actualResult).to.be.equal(expectedResult);
    chai.expect(nodeFS.existsSync(actualResult)).to.equal(true);

    //remove directory
    nodeFS.rmdirSync(actualResult);
    chai.expect(nodeFS.existsSync(actualResult)).to.equal(false);
  });
});

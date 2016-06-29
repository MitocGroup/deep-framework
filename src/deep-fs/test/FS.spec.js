'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import S3FS from 's3fs';
import {FS} from '../lib/FS';
import {UnknownFolderException} from '../lib/Exception/UnknownFolderException';
import Kernel from 'deep-kernel';
import Log from 'deep-log';
import KernelFactory from './common/KernelFactory';
import OS from 'os';
import Path from 'path';
import nodeFS from 'fs';

chai.use(sinonChai);

suite('FS', () => {
  let fs = null;
  let backendKernelInstance = null;
  let path = 'deep-hello-world/';

  test('Class FS exists in FS', () => {
    chai.expect(FS).to.be.an('function');
  });

  test('Load instance of FS by using Kernel.load()', (done) => {
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

    KernelFactory.create({
      FS: FS,
      Log: Log,
    }, callback);
  });

  test('Check TMP static getter returns "temp"', () => {
    chai.expect(FS.TMP).to.be.equal('temp');
  });

  test('Check PUBLIC static getter returns "public"', () => {
    chai.expect(FS.PUBLIC).to.be.equal('public');
  });

  test('Check PRIVATE static getter returns "private"', () => {
    chai.expect(FS.PRIVATE).to.be.equal('private');
  });

  test('Check SHARED static getter returns "shared"', () => {
    chai.expect(FS.SHARED).to.be.equal('shared');
  });

  test('Check FOLDERS static getter returns array of levels', () => {
    chai.expect(FS.FOLDERS.length).to.be.equal(4);
    chai.expect(FS.FOLDERS).to.be.include(FS.TMP);
    chai.expect(FS.FOLDERS).to.be.include(FS.PUBLIC);
    chai.expect(FS.FOLDERS).to.be.include(FS.PRIVATE);
    chai.expect(FS.FOLDERS).to.be.include(FS.SHARED);
  });

  test('Check boot() method boots a certain service', () => {
    let spyCallback = sinon.spy();

    fs.boot(backendKernelInstance, spyCallback);

    chai.expect(Object.keys(fs._buckets)).to.eql(['temp', 'public', 'private', 'shared']);
    chai.expect(spyCallback).to.have.been.calledWithExactly();
  });

  test('Check shared() getter returns valid mounted shared folder', () => {
    let bucketName = 'fdgfd56765gfhjgj768768ghjjhgjhg898-private';
    let actualResult = fs.shared();

    chai.assert.instanceOf(actualResult, S3FS, 'result is an instance of S3FS');
    chai.expect(actualResult.bucket).to.equal(bucketName);
    chai.expect(actualResult.path).to.equal(`shared/${path}`);
  });

  test('Check tmp() getter returns valid mounted tmp folder', () => {
    let bucketName = 'fdgfd56765gfhjgj768768ghjjhgjhg898-private';
    let actualResult = fs.tmp;

    chai.assert.instanceOf(actualResult, S3FS, 'result is an instance of S3FS');
    chai.expect(actualResult.bucket).to.equal(bucketName);
    chai.expect(actualResult.path).to.equal(`temp/${path}`);
  });

  test('Check public() getter returns valid mounted public folder', () => {
    let bucketName = 'fdgfd56765gfhjgj768768ghjjhgjhg898-public';

    let actualResult = fs.public;

    chai.assert.instanceOf(actualResult, S3FS, 'result is an instance of S3FS');
    chai.expect(actualResult.bucket).to.equal(bucketName);
    chai.expect(actualResult.path).to.equal(path);
  });

  test('Check system() getter returns valid mounted system folder', () => {
    let bucketName = 'fdgfd56765gfhjgj768768ghjjhgjhg898-private';
    let actualResult = fs.system;

    chai.assert.instanceOf(actualResult, S3FS, 'result is an instance of S3FS');
    chai.expect(actualResult.bucket).to.equal(bucketName);
    chai.expect(actualResult.path).to.equal(`private/${path}`);
  });

  test('Check getFolder() throws "UnknownFolderException" for invalid path',
    () => {
      let error = null;

      try {
        fs.getFolder('invalidPath');
      } catch (e) {
        error = e;
      }

      chai.expect(error).to.be.an.instanceof(UnknownFolderException);
    }
  );

  test('Check getFolder() method returns valid value', () => {
    let bucketName = 'fdgfd56765gfhjgj768768ghjjhgjhg898-private';
    let actualResult = fs.getFolder(FS.TMP);

    chai.assert.instanceOf(actualResult, S3FS, 'result is an instance of S3FS');
    chai.expect(actualResult.bucket).to.equal(bucketName);
    chai.expect(actualResult.path).to.equal(`temp/${path}`);
  });

  test('Check _getTmpDir() static method returns valid value', () => {
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

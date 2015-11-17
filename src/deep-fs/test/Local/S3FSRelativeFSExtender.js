'use strict';

import chai from 'chai';
import {S3FSRelativeFSExtender} from '../../lib.compiled/Local/S3FSRelativeFSExtender';
import path from 'path';

suite('Local/S3FSRelativeFSExtender', function() {

  let s3FSRelativeFSExtender = null;
  let relativeFsPath = 'relativeTestPath/To';

  test('Class S3FSRelativeFSExtender exists in Local/S3FSRelativeFSExtender', function() {
    chai.expect(typeof S3FSRelativeFSExtender).to.equal('function');
  });

  test('Check constructor throws exception for invalid relativeFsPath', function() {
    s3FSRelativeFSExtender = new S3FSRelativeFSExtender(relativeFsPath);

    chai.expect(s3FSRelativeFSExtender.relativeFs.constructor.name).to.eql('Object');
    chai.expect(s3FSRelativeFSExtender.cwd).to.eql(relativeFsPath);
  });

  test('Check constructor throws exception for invalid relativeFsPath', function() {
    let relativeFsPath = {
      path: 'testPath/To',
    };
    let error = null;

    try {
      s3FSRelativeFSExtender = new S3FSRelativeFSExtender(relativeFsPath);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.an.instanceof(Error);
  });

  test('Check _readdirp() returns falid [] of files ib dir', function() {
    let expectedResult = [
      'deep-framework/src/deep-fs/test/.gitkeep',
      'deep-framework/src/deep-fs/test/FS.js',
      'deep-framework/src/deep-fs/test/Local/S3FSRelativeFSExtender.js',
      'deep-framework/src/deep-fs/test/common/KernelFactory.js',
      'deep-framework/src/deep-fs/test/common/backend-cfg-json.js',
    ];
    let dir = process.cwd() + '/test';

    let actualResult = S3FSRelativeFSExtender._readdirp(dir);

    chai.expect(actualResult.length).to.equal(expectedResult.length);
    for (let i = 0; i < expectedResult.length; i++) {
      chai.expect(actualResult[i]).to.contains(expectedResult[i]);
    }
  });

  test('Check _readdirp() returns empty array for invalid dir', function() {
    let dir = process.cwd() + '/test/invalid';
    let error = null;

    try {
      S3FSRelativeFSExtender._readdirp(dir);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.an.instanceof(Error);
  });

  test(
    'Check relativeFsExtended() copies the prototype of this.EXTEND_OBJECT to this._relativeFsObject',
    function() {
      chai.expect(s3FSRelativeFSExtender.relativeFsExtended.constructor.name).to.eql('Object');
      chai.expect(typeof s3FSRelativeFSExtender.relativeFsExtended.getPath).to.eql('function');
      chai.expect(typeof s3FSRelativeFSExtender.relativeFsExtended.clone).to.eql('function');
      chai.expect(typeof s3FSRelativeFSExtender.relativeFsExtended.copyFile).to.eql('function');
      chai.expect(typeof s3FSRelativeFSExtender.relativeFsExtended.create).to.eql('function');
      chai.expect(typeof s3FSRelativeFSExtender.relativeFsExtended.destroy).to.eql('function');
      chai.expect(typeof s3FSRelativeFSExtender.relativeFsExtended.headObject).to.eql('function');
      chai.expect(typeof s3FSRelativeFSExtender.relativeFsExtended.listContents).to.eql('function');
      chai.expect(typeof s3FSRelativeFSExtender.relativeFsExtended.readdirp).to.eql('function');
      chai.expect(typeof s3FSRelativeFSExtender.relativeFsExtended.mkdirp).to.eql('function');
      chai.expect(typeof s3FSRelativeFSExtender.relativeFsExtended.rmdirp).to.eql('function');
      chai.expect(typeof s3FSRelativeFSExtender.relativeFsExtended.copyDir).to.eql('function');
      // defect ???
      chai.expect(typeof s3FSRelativeFSExtender.relativeFsExtended.delete).to.eql('function');
      chai.expect(typeof s3FSRelativeFSExtender.relativeFsExtended.putBucketLifecycle).to.eql('function');
    }
  );

  test(
    'Check getPath() w/o argument returns valid path',
    function() {
      chai.expect(s3FSRelativeFSExtender.relativeFsExtended.getPath()).to.eql(relativeFsPath);
    }
  );

  test(
    'Check getPath() argument returns valid path',
    function() {
      let pathStr = 'testPath/Str';
      let expectedResult = path.join(relativeFsPath, pathStr)

      chai.expect(s3FSRelativeFSExtender.relativeFsExtended.getPath(pathStr)).to.eql(expectedResult);
    }
  );
});

'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {S3FSRelativeFSExtender} from '../../lib.compiled/Local/S3FSRelativeFSExtender';
import path from 'path';

chai.use(sinonChai);

suite('Local/S3FSRelativeFSExtender', function() {

  let s3FSRelativeFSExtender = null;
  let relativeFsPath = process.cwd() + '/test/relativeTestPath/To';

  test('Class S3FSRelativeFSExtender exists in Local/S3FSRelativeFSExtender', function() {
    chai.expect(typeof S3FSRelativeFSExtender).to.equal('function');
    chai.expect(relativeFsPath).to.equal('fdfs')
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
      chai.expect(s3FSRelativeFSExtender.relativeFsExtended.getPath()).to.equal(relativeFsPath);
    }
  );

  test(
    'Check getPath() argument returns valid path',
    function() {
      let pathStr = '/testPath/Str';
      let expectedResult = path.join(relativeFsPath, pathStr);

      chai.expect(s3FSRelativeFSExtender.relativeFsExtended.getPath(pathStr)).to.equal(expectedResult);
    }
  );

  test(
    'Check clone() argument returns valid object',
    function() {
      let storeS3FSRelativeFSExtender = s3FSRelativeFSExtender;
      let pathStr = process.cwd() + '/testPath/Str/ToClone';

      let actualResult = s3FSRelativeFSExtender.relativeFsExtended.clone(pathStr);

      chai.expect(actualResult.constructor.name).to.eql('Object');
      chai.expect(actualResult.getPath()).to.eql(relativeFsPath + pathStr);
    }
  );

  test(
    'Check headObject() argument returns result in cb',
    function() {
      let spyCallback = sinon.spy();
      let pathStr = 'testPath/Str';
      let cbArg = null;

      //arround to first 9 chars
      let lastModified = new Date().getTime().toString().substr(0, 9);
      let expectedResultObj = {
        AcceptRanges: '',
        Restore: '',
        LastModified: lastModified,
        ContentLength: 0,
        ETag: '55ad340609f4b302',
        MissingMeta: 0,
        VersionId: '55ad340609f4b302',
        StorageClass: 'REDUCED_REDUNDANCY',
      };

      chai.expect(
        s3FSRelativeFSExtender.relativeFsExtended.headObject(pathStr, spyCallback)
      ).to.eql(undefined);
      chai.expect(spyCallback).to.have.been.calledWith();
      cbArg = spyCallback.args[0][0];
      chai.expect(cbArg.AcceptRanges).to.eql(expectedResultObj.AcceptRanges);
      chai.expect(cbArg.Restore).to.eql(expectedResultObj.Restore);
      chai.expect(cbArg.LastModified.toString()).to.contains(expectedResultObj.LastModified);
      chai.expect(cbArg.ContentLength).to.eql(expectedResultObj.ContentLength);
      chai.expect(cbArg.ETag).to.eql(expectedResultObj.ETag);
      chai.expect(cbArg.MissingMeta).to.eql(expectedResultObj.MissingMeta);
      chai.expect(cbArg.VersionId).to.eql(expectedResultObj.VersionId);
      chai.expect(cbArg.StorageClass).to.eql(expectedResultObj.StorageClass);
    }
  );

  test(
    'Check headObject() argument returns Promise',
    function() {
      let pathStr = 'testPath/Str';

      //arround to first 9 chars
      let lastModified = new Date().getTime().toString().substr(0, 9);
      let expectedResultObj = {
        AcceptRanges: '',
        Restore: '',
        LastModified: lastModified,
        ContentLength: 0,
        ETag: '55ad340609f4b302',
        MissingMeta: 0,
        VersionId: '55ad340609f4b302',
        StorageClass: 'REDUCED_REDUNDANCY',
      };

      s3FSRelativeFSExtender.relativeFsExtended.headObject(pathStr).then(
        function(response) {
          chai.expect(response.AcceptRanges).to.eql(expectedResultObj.AcceptRanges);
          chai.expect(response.Restore).to.eql(expectedResultObj.Restore);
          chai.expect(response.LastModified.toString()).to.contains(expectedResultObj.LastModified);
          chai.expect(response.ContentLength).to.eql(expectedResultObj.ContentLength);
          chai.expect(response.ETag).to.eql(expectedResultObj.ETag);
          chai.expect(response.MissingMeta).to.eql(expectedResultObj.MissingMeta);
          chai.expect(response.VersionId).to.eql(expectedResultObj.VersionId);
          chai.expect(response.StorageClass).to.eql(expectedResultObj.StorageClass);
        })
        .catch(
        function(reason) {
          chai.assert.ok(false, 'Handle rejected promise (' + reason + ') here.');
        }
      );
    }
  );
});

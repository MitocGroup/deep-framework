'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {S3FSRelativeFSExtender} from '../../lib.compiled/Local/S3FSRelativeFSExtender';
import path from 'path';
import nodeFS from 'fs';

chai.use(sinonChai);

suite('Local/S3FSRelativeFSExtender', function() {

  let s3FSRelativeFSExtender = null;
  let relativeFsPath = process.cwd() + '/test';
  let actualResult = null;

  test('Class S3FSRelativeFSExtender exists in Local/S3FSRelativeFSExtender', function() {
    chai.expect(typeof S3FSRelativeFSExtender).to.equal('function');
  });

  test('Check _readdirp() returns valid [] of files ib dir', function() {
    let expectedResult = [
      'deep-framework/src/deep-fs/test/.gitkeep',
      'deep-framework/src/deep-fs/test/FS.js',
      'deep-framework/src/deep-fs/test/Local',
      'deep-framework/src/deep-fs/test/Local/S3FSRelativeFSExtender.js',
      'deep-framework/src/deep-fs/test/common',
      'deep-framework/src/deep-fs/test/common/KernelFactory.js',
      'deep-framework/src/deep-fs/test/common/backend-cfg-json.js',
    ];
    let dir = process.cwd() + '/test';

    actualResult = S3FSRelativeFSExtender._readdirp(dir);

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

      actualResult = s3FSRelativeFSExtender.relativeFsExtended.clone(pathStr);

      chai.expect(actualResult.constructor.name).to.eql('Object');
      chai.expect(actualResult.getPath()).to.eql(relativeFsPath + pathStr);
    }
  );

  test(
    'Check copyFile() with cb copies file or directory',
    function(done) {
      let sourcePath = 'FS.js';
      let destinationPath = 'copied/cd_FS.txt';
      let expectedResultPath = path.join(relativeFsPath, destinationPath);

      let callback = () => {
        chai.expect(actualResult).to.equal(undefined);
        chai.expect(nodeFS.existsSync(expectedResultPath)).to.equal(true);

        // complete the async
        done();
      };

      actualResult = s3FSRelativeFSExtender.relativeFsExtended.copyFile(
        sourcePath, destinationPath, callback
      );
    }
  );

  test(
    'Check copyFile() copies file or directory, and returns Promise',
    function() {
      let sourcePath = 'FS.js';
      let destinationPath = 'copied/promised_FS.txt';
      let expectedResultPath = path.join(relativeFsPath, destinationPath);

      s3FSRelativeFSExtender.relativeFsExtended.copyFile(sourcePath, destinationPath).then(
        function(response) {
          chai.expect(response).to.equal(undefined, 'response equals to undefined');
          chai.expect(nodeFS.existsSync(expectedResultPath)).to.equal(true);
        })
        .catch(
        function(reason) {
          chai.assert.ok(false, 'Rejected promise (' + reason + ') here.');
        }
      );
    }
  );

  test(
    'Check create() argument returns error in cb',
    function() {
      let spyCallback = sinon.spy();
      let options = {Bucket: 'testBucket'};

      actualResult = s3FSRelativeFSExtender.relativeFsExtended.create(
        options, spyCallback
      );

      chai.expect(actualResult).to.equal(undefined);
      chai.expect(spyCallback).to.have.been.calledWith();
      chai.assert.instanceOf(
        spyCallback.args[0][0], Error, 'callback arg is an instance of Error'
      );
    }
  );

  test(
    'Check create() argument returns Promise',
    function() {
      let options = {Bucket: 'testBucket'};

      s3FSRelativeFSExtender.relativeFsExtended.create(options).then(
        function(response) {
          chai.assert.instanceOf(
            response, Error, 'response is an instance of Error'
          );
        })
        .catch(
        function(reason) {
          chai.assert.ok(false, 'Rejected promise (' + reason + ') here.');
        }
      );
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

      actualResult = s3FSRelativeFSExtender.relativeFsExtended.headObject(pathStr, spyCallback);

      chai.expect(actualResult).to.eql(undefined);
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
          chai.assert.ok(false, 'Rejected promise (' + reason + ') here.');
        }
      );
    }
  );

  test(
    'Check listContents() lists content of files in directory with cb',
    function(done) {
      let pathStr = 'common';
      let marker = '*';
      let expectedResult = {
        Marker: marker,
        IsTruncated: false,
        Contents: [],
        Name: s3FSRelativeFSExtender.cwd,
        Prefix: pathStr,
        Delimiter: '/',
        MaxKeys: 1000000000,
        CommonPrefixes: [],
        EncodingType: 'url',
      };
      let files = [
        'deep-framework/src/deep-fs/test/common/backend-cfg-json.js',
        'deep-framework/src/deep-fs/test/common/KernelFactory.js',
      ];

      let callback = (globResponseObj) => {
        chai.expect(actualResult).to.equal(undefined);
        chai.expect(globResponseObj.constructor.name).to.equal('Object');
        chai.expect(globResponseObj.Marker).to.equal(expectedResult.Marker);
        chai.expect(globResponseObj.IsTruncated).to.equal(expectedResult.IsTruncated);
        chai.expect(globResponseObj.Name).to.equal(expectedResult.Name);
        chai.expect(globResponseObj.Prefix).to.equal(expectedResult.Prefix);
        chai.expect(globResponseObj.Delimiter).to.equal(expectedResult.Delimiter);
        chai.expect(globResponseObj.MaxKeys).to.equal(expectedResult.MaxKeys);
        chai.expect(globResponseObj.CommonPrefixes).to.eql(expectedResult.CommonPrefixes);
        chai.expect(globResponseObj.EncodingType).to.equal(expectedResult.EncodingType);

        //@todo - uncomment when method will be updated because got duplicate content of first file, u
        //chai.expect(globResponseObj.Contents.length).to.equal(files.length);
        //for (let i = 0; i < files.length; i++) {
        //  chai.expect(globResponseObj.Contents[i].Key).to.contains(files[i]);
        //}

        // complete the async
        done();
      };

      actualResult = s3FSRelativeFSExtender.relativeFsExtended.listContents(
        pathStr, marker, callback
      );
    }
  );

  test(
    'Check listContents() lists content, and returns Promise',
    function() {
      let pathStr = 'common';
      let marker = '*';
      let expectedResult = {
        Marker: marker,
        IsTruncated: false,
        Contents: [],
        Name: s3FSRelativeFSExtender.cwd,
        Prefix: pathStr,
        Delimiter: '/',
        MaxKeys: 1000000000,
        CommonPrefixes: [],
        EncodingType: 'url',
      };
      let files = [
        'deep-framework/src/deep-fs/test/common/backend-cfg-json.js',
        'deep-framework/src/deep-fs/test/common/KernelFactory.js',
      ];

      s3FSRelativeFSExtender.relativeFsExtended.listContents(pathStr, marker).then(
        function(response) {
          chai.expect(response.length).to.equal(expectedResult.length);
          for (let i = 0; i < expectedResult.length; i++) {
            chai.expect(response.constructor.name).to.equal('Object');
            chai.expect(response.Marker).to.equal(expectedResult.Marker);
            chai.expect(response.IsTruncated).to.equal(expectedResult.IsTruncated);
            chai.expect(response.Name).to.equal(expectedResult.Name);
            chai.expect(response.Prefix).to.equal(expectedResult.Prefix);
            chai.expect(response.Delimiter).to.equal(expectedResult.Delimiter);
            chai.expect(response.MaxKeys).to.equal(expectedResult.MaxKeys);
            chai.expect(response.CommonPrefixes).to.eql(expectedResult.CommonPrefixes);
            chai.expect(response.EncodingType).to.equal(expectedResult.EncodingType);

            //@todo - uncomment when method will be updated because got duplicate content of first file, u
            //chai.expect(response.Contents.length).to.equal(files.length);
            //for (let i = 0; i < files.length; i++) {
            //  chai.expect(response.Contents[i].Key).to.contains(files[i]);
            //}
          }
        })
        .catch(
        function(reason) {
          chai.assert.ok(false, 'Rejected promise (' + reason + ') here.');
        }
      );
    }
  );

  test(
    'Check readdirp() reads files in directory with cb',
    function() {
      let pathStr = 'common';
      let spyCallback = sinon.spy();
      let callbackArgs = null;
      let expectedResult = [
        'common/KernelFactory.js',
        'common/backend-cfg-json.js',
      ];

      actualResult = s3FSRelativeFSExtender.relativeFsExtended.readdirp(
        pathStr, spyCallback
      );

      chai.expect(actualResult).to.equal(undefined);
      chai.expect(spyCallback).to.have.been.calledWith();

      callbackArgs = spyCallback.args[0];

      chai.expect(callbackArgs[0]).to.equal(null);
      chai.expect(callbackArgs[1].length).to.equal(expectedResult.length);
      for (let i = 0; i < expectedResult.length; i++) {
        chai.expect(callbackArgs[1][i]).to.contains(expectedResult[i]);
      }
    }
  );

  test(
    'Check readdirp() reads files in directory, and returns Promise',
    function() {
      let pathStr = 'common';
      let expectedResult = [
        'common/KernelFactory.js',
        'common/backend-cfg-json.js',
      ];

      s3FSRelativeFSExtender.relativeFsExtended.readdirp(pathStr).then(
        function(response) {
          chai.expect(response.length).to.equal(expectedResult.length);
          for (let i = 0; i < expectedResult.length; i++) {
            chai.expect(response[i]).to.contains(expectedResult[i]);
          }
        })
        .catch(
        function(reason) {
          chai.assert.ok(false, 'Rejected promise (' + reason + ') here.');
        }
      );
    }
  );

  test(
    'Check mkdirp() with cb creates directory',
    function(done) {
      let pathStr = '/mkdirp_cb_test';
      let expectedResultPath = path.join(relativeFsPath, pathStr);

      let callback = () => {
        chai.expect(actualResult).to.equal(undefined);
        chai.expect(nodeFS.existsSync(expectedResultPath)).to.equal(true);

        // complete the async
        done();
      };

      actualResult = s3FSRelativeFSExtender.relativeFsExtended.mkdirp(
        pathStr, callback
      );
    }
  );

  test(
    'Check mkdirp() creates directory and returns Promise',
    function() {
      let pathStr = '/mkdirp_promise_test';
      let expectedResultPath = path.join(relativeFsPath, pathStr);

      s3FSRelativeFSExtender.relativeFsExtended.mkdirp(pathStr).then(
        function(response) {
          chai.expect(response).to.equal(undefined, 'response equals to undefined');
          chai.expect(nodeFS.existsSync(expectedResultPath)).to.equal(true);
        })
        .catch(
        function(reason) {
          chai.assert.ok(false, 'Rejected promise (' + reason + ') here.');
        }
      );
    }
  );

  test(
    'Check rmdirp() with cb removes directory',
    function(done) {
      let pathStr = '/mkdirp_cb_test';
      let expectedResultPath = path.join(relativeFsPath, pathStr);

      let callback = () => {
        chai.expect(actualResult).to.equal(undefined);
        chai.expect(nodeFS.existsSync(expectedResultPath)).to.equal(false);

        // complete the async
        done();
      };

      actualResult = s3FSRelativeFSExtender.relativeFsExtended.rmdirp(
        pathStr, callback
      );
    }
  );

  test(
    'Check rmdirp() removes directory and returns Promise',
    function() {
      let pathStr = '/mkdirp_promise_test';
      let expectedResultPath = path.join(relativeFsPath, pathStr);

      s3FSRelativeFSExtender.relativeFsExtended.rmdirp(pathStr).then(
        function(response) {
          chai.expect(response).to.equal(undefined, 'response equals to undefined');
          chai.expect(nodeFS.existsSync(expectedResultPath)).to.equal(false);
        })
        .catch(
        function(reason) {
          chai.assert.ok(false, 'Rejected promise (' + reason + ') here.');
        }
      );
    }
  );

  test(
    'Check destroy() with cb removes directory with 2 files',
    function(done) {
      let relativeFsPathToDestroy = process.cwd().toString() + '/test/copied';
      let s3FSRelativeFSExtender = new S3FSRelativeFSExtender(relativeFsPathToDestroy);

      let callback = () => {
        chai.expect(actualResult).to.equal(undefined);
        chai.expect(nodeFS.existsSync(relativeFsPathToDestroy)).to.equal(false);

        // complete the async
        done();
      };

      actualResult = s3FSRelativeFSExtender.relativeFsExtended.destroy(callback);
    }
  );

  test(
    'Check destroy() removes non-existing directory and returns Promise',
    function() {
      let relativeFsPathToDestroy = process.cwd().toString() + '/test/copied';
      let s3FSRelativeFSExtender = new S3FSRelativeFSExtender(relativeFsPathToDestroy);

      s3FSRelativeFSExtender.relativeFsExtended.destroy().then(
        function(response) {
          chai.expect(response).to.equal(undefined, 'response equals to undefined');
          chai.expect(nodeFS.existsSync(relativeFsPathToDestroy)).to.equal(false);
        })
        .catch(
        function(reason) {
          chai.assert.ok(false, 'Rejected promise (' + reason + ') here.');
        }
      );
    }
  );
});

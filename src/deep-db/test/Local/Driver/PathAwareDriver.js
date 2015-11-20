'use strict';

import chai from 'chai';
import {PathAwareDriver} from '../../../lib.compiled/Local/Driver/PathAwareDriver';
import {PathAwareDriverMock} from '../../../test/Mock/Driver/PathAwareDriverMock';
import nodeFS from 'fs';

suite('Local/Driver/PathAwareDriver', function() {
  let pathAwareDriver = new PathAwareDriverMock();

  test('Class PathAwareDriver exists in Local/Driver/PathAwareDriver', function() {
    chai.expect(typeof PathAwareDriver).to.equal('function');
  });

  test('Check DBPath static getter returns valid value', function() {
    chai.expect(PathAwareDriver.DBPath).to.be.contains('/PathAwareDriver');
  });

  test('Check path getter/setter returns/sets _path value', function() {
    pathAwareDriver.path = PathAwareDriver.DBPath;
    chai.expect(pathAwareDriver.path).to.be.equal(PathAwareDriver.DBPath);

    let newPath = 'newPath';
    pathAwareDriver.path = newPath;
    chai.expect(pathAwareDriver.path).to.be.equal(newPath);
  });

  test('Check path getter/setter returns/sets _path value', function() {
    pathAwareDriver.path = PathAwareDriver.DBPath;
    chai.expect(pathAwareDriver.path).to.be.equal(PathAwareDriver.DBPath);

    let newPath = 'newPath';
    pathAwareDriver.path = newPath;
    chai.expect(pathAwareDriver.path).to.be.equal(newPath);
  });

  test('Check DBPath() static method returns DBPath dir', function() {
    let actualResult = PathAwareDriver.DBPath;

    chai.expect(actualResult).to.contains('/PathAwareDriver');
    chai.expect(nodeFS.existsSync(actualResult)).to.equal(true);
  });

  test('Check DBPath() static method returns creates DBPath dir and returns it',
    function() {
      //remove directory
      nodeFS.rmdirSync(PathAwareDriver.DBPath);
      chai.expect(nodeFS.existsSync(actualResult)).to.equal(false);

      let actualResult = PathAwareDriver.DBPath;

      chai.expect(actualResult).to.contains('/PathAwareDriver');
      chai.expect(nodeFS.existsSync(actualResult)).to.equal(true);
    }
  );
});

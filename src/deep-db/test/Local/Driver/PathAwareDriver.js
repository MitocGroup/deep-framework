'use strict';

import chai from 'chai';
import {PathAwareDriver} from '../../../lib.compiled/Local/Driver/PathAwareDriver';

class PathAwareDriverTest extends PathAwareDriver {
  constructor(path = PathAwareDriver.DBPath, port = PathAwareDriver.DEFAULT_PORT) {
    super(path, port);
  }

  _stop(cb) {
    this._running = false;
    return 'stopped';
  }

  _start(cb, tts) {
    this._running = true;
    return 'started';
  }
}

suite('Local/Driver/PathAwareDriver', function() {
  let pathAwareDriver = new PathAwareDriverTest();

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
});

'use strict';

import chai from 'chai';
import {ConsoleDriver} from '../../lib.compiled/Driver/ConsoleDriver';

suite('Driver/ConsoleDriver', function() {
  let consoleDriver = new ConsoleDriver();

  test('Class ConsoleDriver exists in Driver/ConsoleDriver', function() {
    chai.expect(typeof ConsoleDriver).to.equal('function');
  });

  test('Check that instance was created successfully for inherit classes', function() {
    chai.assert.typeOf(consoleDriver, 'object', 'created abstractDriver object');
    chai.assert.instanceOf(consoleDriver, ConsoleDriver, 'abstractDriver is instance of AbstractDriver');
  });

  test('Check log() method runs without exception', function() {
    let error = null;
    try {
      consoleDriver.log('test log() from ConsoleDriver', 'debug', 'context');
    } catch (e) {
      error = e;
    }

    if (error) console.log(error, error.stack);//@todo:remove after debugging!!!
    
    chai.expect(error).to.be.equal(null);
  });
});
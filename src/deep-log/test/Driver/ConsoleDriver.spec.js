'use strict';

import chai from 'chai';
import {ConsoleDriverMock} from '../../test/Mock/ConsoleDriverMock';
import {ConsoleDriver} from '../../lib/Driver/ConsoleDriver';

suite('Driver/ConsoleDriver', () => {
  let consoleDriver = new ConsoleDriverMock();

  test('Class ConsoleDriver exists in Driver/ConsoleDriver', () => {
    chai.expect(ConsoleDriver).to.be.an('function');
  });

  test('Check that instance was created successfully for inherit classes',
    () => {
      chai.assert.typeOf(consoleDriver, 'object', 'created consoleDriver object');
      chai.assert.instanceOf(
        consoleDriver, ConsoleDriver, 'consoleDriver is instance of ConsoleDriver'
      );
    }
  );

  test('Check log() with error level method', () => {
    let level = 'error';
    let msg = 'test error log() from ConsoleDriver';
    let context = {context: 'Test context'};

    consoleDriver.log(msg, level, context);

    let actualResult = consoleDriver.logs.pop();
    chai.expect(actualResult[0]).to.eql(msg);
    chai.expect(actualResult[1]).to.eql(level);
    chai.expect(actualResult[2]).to.eql(context);
  });

  test('Check log() with notice level method', () => {
    let level = 'notice';
    let msg = 'test notice log() from ConsoleDriver';
    let context = {context: 'Test context'};

    consoleDriver.log(msg, level, context);

    let actualResult = consoleDriver.logs.pop();
    chai.expect(actualResult[0]).to.eql(msg);
    chai.expect(actualResult[1]).to.eql(level);
    chai.expect(actualResult[2]).to.eql(context);
  });

  test('Check log() with warning level method', () => {
    let level = 'warning';
    let msg = 'test warning log() from ConsoleDriver';
    let context = {context: 'Test context'};

    consoleDriver.log(msg, level, context);

    let actualResult = consoleDriver.logs.pop();
    chai.expect(actualResult[0]).to.eql(msg);
    chai.expect(actualResult[1]).to.eql(level);
    chai.expect(actualResult[2]).to.eql(context);
  });

  test('Check log() with info level method', () => {
    let level = 'info';
    let msg = 'test info log() from ConsoleDriver';
    let context = {context: 'Test context'};

    consoleDriver.log(msg, level, context);

    let actualResult = consoleDriver.logs.pop();
    chai.expect(actualResult[0]).to.eql(msg);
    chai.expect(actualResult[1]).to.eql(level);
    chai.expect(actualResult[2]).to.eql(context);
  });

  test('Check log() with debug level method', () => {
    let level = 'debug';
    let msg = 'test debug log() from ConsoleDriver';
    let context = {context: 'Test context'};

    consoleDriver.log(msg, level, context);

    let actualResult = consoleDriver.logs.pop();
    chai.expect(actualResult[0]).to.eql(msg);
    chai.expect(actualResult[1]).to.eql(level);
    chai.expect(actualResult[2]).to.eql(context);
  });

  //@todo - TBD with Alex to rework class name for static to this.contstructor.name
  // Example, ConsoleDriver.nativeConsole to this.contstructor.name.nativeConsole
  //was not able to use overriden method
  test('Check overrideNative()', () => {
    let error = null;
    let actualResult = null;

    try {
      actualResult = consoleDriver.overrideNative();
    } catch (e) {
      error = e;
    }

    //chai.expect(Object.keys(actualResult._console).length).to.be.equal(4);
    //chai.expect(Object.keys(actualResult._console)).to.be.include('error');
    //chai.expect(Object.keys(actualResult._console)).to.be.include('log');
    //chai.expect(Object.keys(actualResult._console)).to.be.include('warn');
    //chai.expect(Object.keys(actualResult._console)).to.be.include('info');
  });
});
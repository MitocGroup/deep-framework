'use strict';

import chai from 'chai';
import {DBServer} from '../../lib/Local/DBServer';
import {LocalDynamo} from '../../lib/Local/Driver/LocalDynamo';
import {Dynalite} from '../../lib/Local/Driver/Dynalite';

suite('Local/DBServer', function() {
  let dbServer = new DBServer();

  test('Class DBServer exists in Local/DBServer', function() {
    chai.expect(typeof DBServer).to.equal('function');
  });

  test('DBServer object was created successfully', function() {
    chai.expect(dbServer).to.be.an.instanceof(DBServer);
  });

  test('Check _findDriverPrototype() returns driver prototype for Dynalite', function() {
    let actualResult = DBServer._findDriverPrototype('Dynalite');

    chai.expect(actualResult).to.be.equal(Dynalite);
    chai.expect(typeof actualResult).to.be.equal('function');
  });

  test('Check _findDriverPrototype() returns driver prototype for LocalDynamo', function() {
    let actualResult = DBServer._findDriverPrototype('LocalDynamo');

    chai.expect(actualResult).to.be.equal(LocalDynamo);
    chai.expect(typeof actualResult).to.be.equal('function');
  });

  test('Check _findDriverPrototype() returns null for invalid driver name', function() {
    let actualResult = DBServer._findDriverPrototype('dynalite');

    chai.expect(actualResult).to.be.equal(null);
  });

  test('Check create() static method for default DriveProto', function() {
    let actualResult = DBServer.create();

    chai.expect(actualResult).to.an.instanceof(DBServer.DEFAULT_DRIVER);
  });

  test('Check create() static method for LocalDynamo', function() {
    let actualResult = DBServer.create(LocalDynamo);

    chai.expect(actualResult).to.an.instanceof(LocalDynamo);
  });

  test('Check create() static method for Dynalite', function() {
    let actualResult = DBServer.create(Dynalite, Dynalite.DEFAULT_OPTIONS);

    chai.expect(actualResult).to.an.instanceof(Dynalite);
  });

  test('Check create() static method throws Error', function() {
    let error = null;
    let driver = 'test';
    try {
      DBServer.create(driver);
    } catch (e) {
      error = e;
    }

    chai.assert.instanceOf(error, Error, 'error is an instance of Error');
  });

  test('Check DEFAULT_DRIVER static getter returns LocalDynamo', function() {
    chai.expect(typeof DBServer.DEFAULT_DRIVER).to.be.equal('function');
    chai.expect(DBServer.DEFAULT_DRIVER).to.be.equal(LocalDynamo);
  });

  test('Check DRIVERS static getter returns [LocalDynamo,Dynalite]', function() {
    chai.expect(DBServer.DRIVERS.length).to.be.equal(2);
    chai.expect(DBServer.DRIVERS).to.be.contains(LocalDynamo);
    chai.expect(DBServer.DRIVERS).to.be.contains(Dynalite);
  });
});

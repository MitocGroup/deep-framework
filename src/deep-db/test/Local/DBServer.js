'use strict';

import chai from 'chai';
import {DBServer} from '../../lib.compiled/Local/DBServer';
import {LocalDynamo} from '../../lib.compiled/Local/Driver/LocalDynamo';
import {Dynalite} from '../../lib.compiled/Local/Driver/Dynalite';

suite('Local/DBServer', function() {
  let dbServer = new DBServer();

  test('Class DBServer exists in Local/DBServer', function() {
    chai.expect(typeof DBServer).to.equal('function');
  });

  test('DBServer object was created successfully', function() {
    chai.expect(dbServer).to.be.an.instanceof(DBServer);
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

  test('Check _findDriverPrototype() static method returns valid driver prototype', function() {
    let actualResult = DBServer._findDriverPrototype('Dynalite');
    chai.expect(actualResult).to.be.not.equal(null);
    chai.expect(typeof actualResult).to.be.equal('function');
  });

  test('Check _findDriverPrototype() static method returns null', function() {
    let actualResult = DBServer._findDriverPrototype('dynalite');
    chai.expect(actualResult).to.be.equal(null);
  });

  test('Check create() static method for default DriveProto', function() {
    let error = null;
    try {
      DBServer.create();
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
  });

  test('Check create() static method throws Error', function() {
    let error = null;
    let driver = 'test';
    try {
      DBServer.create(driver);
    } catch (e) {
      error = e;
    }

    chai.expect(error.message).to.be.equal(`Missing DB server driver ${driver}`);
  });
});

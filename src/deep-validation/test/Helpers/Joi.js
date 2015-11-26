'use strict';

import chai from 'chai';
import {Joi} from '../../lib.compiled/Helpers/Joi';
import Vogels from '../../lib.compiled/Helpers/vogelsPolyfill';
import BaseJoi from 'joi';

suite('Helpers/Joi', function() {
  let joi = new Joi();

  test('Class Joi exists in Helpers/Joi', function() {
    chai.expect(typeof Joi).to.equal('function');
  });

  test('Check uuid static getter returns valid object', function() {
    let actualResult = Joi.uuid;
    let expectedResult = Vogels.types.uuid();

    chai.expect(actualResult.isJoi).to.be.eql(expectedResult.isJoi);
    chai.expect(actualResult._type).to.be.eql(expectedResult._type);
  });

  test('Check timeUUID static getter returns valid object', function() {
    let actualResult = Joi.timeUUID;
    let expectedResult = Vogels.types.timeUUID();

    chai.expect(actualResult.isJoi).to.be.eql(expectedResult.isJoi);
    chai.expect(actualResult._type).to.be.eql(expectedResult._type);
  });

  test('Check stringSet static getter returns valid object', function() {
    let actualResult = Joi.stringSet;
    let expectedResult = Vogels.types.stringSet();

    chai.expect(actualResult.isJoi).to.be.eql(expectedResult.isJoi);
    chai.expect(actualResult._type).to.be.eql(expectedResult._type);
  });

  test('Check numberSet static getter returns valid object', function() {
    let actualResult = Joi.numberSet;
    let expectedResult = Vogels.types.numberSet();
    chai.expect(actualResult.isJoi).to.be.eql(expectedResult.isJoi);
    chai.expect(actualResult._type).to.be.eql(expectedResult._type);
  });

  test('Check binarySet static getter returns valid object', function() {
    let actualResult = Joi.binarySet;
    let expectedResult = Vogels.types.binarySet();

    chai.expect(actualResult.isJoi).to.be.eql(expectedResult.isJoi);
    chai.expect(actualResult._type).to.be.eql(expectedResult._type);
  });

  test('Check binary static getter returns valid object', function() {
    let actualResult = Joi.binary;
    let expectedResult = BaseJoi.binary();

    chai.expect(actualResult.isJoi).to.be.eql(expectedResult.isJoi);
    chai.expect(actualResult._type).to.be.eql(expectedResult._type);
  });

  test('Check number static getter returns valid object', function() {
    let actualResult = Joi.number;
    let expectedResult = BaseJoi.number();

    chai.expect(actualResult.isJoi).to.be.eql(expectedResult.isJoi);
    chai.expect(actualResult._type).to.be.eql(expectedResult._type);
  });

  test('Check string static getter returns valid object', function() {
    let actualResult = Joi.string;
    let expectedResult = BaseJoi.string();

    chai.expect(actualResult.isJoi).to.be.eql(expectedResult.isJoi);
    chai.expect(actualResult._type).to.be.eql(expectedResult._type);
  });

  test('Check boolean static getter returns valid object', function() {
    let actualResult = Joi.boolean;
    let expectedResult = BaseJoi.boolean();

    chai.expect(actualResult.isJoi).to.be.eql(expectedResult.isJoi);
    chai.expect(actualResult._type).to.be.eql(expectedResult._type);
  });

  test('Check email static getter returns valid object', function() {
    let actualResult = Joi.email;
    let expectedResult = BaseJoi.string().email();

    chai.expect(actualResult.isJoi).to.be.eql(expectedResult.isJoi);
    chai.expect(actualResult._type).to.be.eql(expectedResult._type);
  });

  test('Check website static getter returns valid object', function() {
    let actualResult = Joi.website;
    let expectedResult = BaseJoi.string().uri();

    chai.expect(actualResult.isJoi).to.be.eql(expectedResult.isJoi);
    chai.expect(actualResult._type).to.be.eql(expectedResult._type);
  });

  test('Check map static getter returns valid object', function() {
    let actualResult = Joi.map;
    let expectedResult = BaseJoi.object();

    chai.expect(actualResult.isJoi).to.be.eql(expectedResult.isJoi);
    chai.expect(actualResult._type).to.be.eql(expectedResult._type);
  });

  test('Check mapSet static getter returns valid object', function() {
    let actualResult = Joi.mapSet;
    let array = BaseJoi.array();

    if (array.includes) {
      return array.includes(BaseJoi.object());
    }

    let expectedResult = array.items(BaseJoi.object());
    chai.expect(actualResult.isJoi).to.be.eql(expectedResult.isJoi);
    chai.expect(actualResult._type).to.be.eql(expectedResult._type);
  });
});

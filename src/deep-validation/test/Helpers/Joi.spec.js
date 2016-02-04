'use strict';

import chai from 'chai';
import {Joi} from '../../lib/Helpers/Joi';
import Vogels from '../../lib/Helpers/vogelsPolyfill';
import BaseJoi from 'joi';

suite('Helpers/Joi', () => {
  let joi = new Joi();

  test('Class Joi exists in Helpers/Joi', () => {
    chai.expect(Joi).to.be.an('function');
  });

  test('Check uuid static getter returns valid object', () => {
    let actualResult = Joi.uuid;
    let expectedResult = Vogels.types.uuid();

    chai.expect(actualResult.isJoi).to.be.eql(expectedResult.isJoi);
    chai.expect(actualResult._type).to.be.eql(expectedResult._type);
  });

  test('Check timeUUID static getter returns valid object', () => {
    let actualResult = Joi.timeUUID;
    let expectedResult = Vogels.types.timeUUID();

    chai.expect(actualResult.isJoi).to.be.eql(expectedResult.isJoi);
    chai.expect(actualResult._type).to.be.eql(expectedResult._type);
  });

  test('Check stringSet static getter returns valid object', () => {
    let actualResult = Joi.stringSet;
    let expectedResult = Vogels.types.stringSet();

    chai.expect(actualResult.isJoi).to.be.eql(expectedResult.isJoi);
    chai.expect(actualResult._type).to.be.eql(expectedResult._type);
  });

  test('Check numberSet static getter returns valid object', () => {
    let actualResult = Joi.numberSet;
    let expectedResult = Vogels.types.numberSet();
    chai.expect(actualResult.isJoi).to.be.eql(expectedResult.isJoi);
    chai.expect(actualResult._type).to.be.eql(expectedResult._type);
  });

  test('Check binarySet static getter returns valid object', () => {
    let actualResult = Joi.binarySet;
    let expectedResult = Vogels.types.binarySet();

    chai.expect(actualResult.isJoi).to.be.eql(expectedResult.isJoi);
    chai.expect(actualResult._type).to.be.eql(expectedResult._type);
  });

  test('Check binary static getter returns valid object', () => {
    let actualResult = Joi.binary;
    let expectedResult = BaseJoi.binary();

    chai.expect(actualResult.isJoi).to.be.eql(expectedResult.isJoi);
    chai.expect(actualResult._type).to.be.eql(expectedResult._type);
  });

  test('Check number static getter returns valid object', () => {
    let actualResult = Joi.number;
    let expectedResult = BaseJoi.number();

    chai.expect(actualResult.isJoi).to.be.eql(expectedResult.isJoi);
    chai.expect(actualResult._type).to.be.eql(expectedResult._type);
  });

  test('Check string static getter returns valid object', () => {
    let actualResult = Joi.string;
    let expectedResult = BaseJoi.string();

    chai.expect(actualResult.isJoi).to.be.eql(expectedResult.isJoi);
    chai.expect(actualResult._type).to.be.eql(expectedResult._type);
  });

  test('Check boolean static getter returns valid object', () => {
    let actualResult = Joi.boolean;
    let expectedResult = BaseJoi.boolean();

    chai.expect(actualResult.isJoi).to.be.eql(expectedResult.isJoi);
    chai.expect(actualResult._type).to.be.eql(expectedResult._type);
  });

  test('Check email static getter returns valid object', () => {
    let actualResult = Joi.email;
    let expectedResult = BaseJoi.string().email();

    chai.expect(actualResult.isJoi).to.be.eql(expectedResult.isJoi);
    chai.expect(actualResult._type).to.be.eql(expectedResult._type);
  });

  test('Check website static getter returns valid object', () => {
    let actualResult = Joi.website;

    chai.expect(actualResult.isJoi).to.be.equal(true);
    chai.expect(actualResult._type).to.be.equal('string');
  });

  test('Check map static getter returns valid object', () => {
    let actualResult = Joi.map;
    let expectedResult = BaseJoi.object();

    chai.expect(actualResult.isJoi).to.be.eql(expectedResult.isJoi);
    chai.expect(actualResult._type).to.be.eql(expectedResult._type);
  });

  test('Check mapSet static getter returns valid object', () => {
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

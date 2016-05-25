'use strict';

import chai from 'chai';
import {Statement} from '../../../lib/AWS/IAM/Statement';
import {InvalidArgumentException} from '../../../lib/Exception/InvalidArgumentException';

suite('AWS/IAM/Statement', () => {
  let statement = new Statement();
  let invalidEffect = 'invalidEffect';
  let condition = 'conditionTest';
  let principal = 'principalTest';

  test('Class Statement exists in AWS/IAM/Statement', () => {
    chai.expect(Statement).to.be.an('function');
  });

  test('Check constructor sets _effect', () => {
    chai.expect(statement.effect).to.be.equal('Allow');
  });

  test('Check constructor sets _action', () => {
    chai.assert.typeOf(statement.action, 'object', 'created Action object');
  });

  test('Check constructor sets _notAction', () => {
    chai.assert.typeOf(statement.notAction, 'object', 'created Action object');
  });

  test('Check constructor sets _resource', () => {
    chai.assert.typeOf(statement.resource, 'object', 'created Resource object');
  });

  test('Check constructor sets _notResource', () => {
    chai.assert.typeOf(statement.notResource, 'object', 'created Resource object');
  });

  test('Check constructor sets _condition=null', () => {
    chai.expect(statement.condition).to.be.equal(null);
  });

  test('Check constructor sets _principal=null', () => {
    chai.expect(statement.principal).to.be.equal(null);
  });

  test('Check DENY static getter returns value \'Deny\'', () => {
    chai.expect(Statement.DENY).to.be.equal('Deny');
  });

  test('Check ALLOW static getter returns value \'Allow\'', () => {
    chai.expect(Statement.ALLOW).to.be.equal('Allow');
  });

  test(`Check effect setter throws exception for invalid value: ${invalidEffect}`, () => {
    let error = null;
    try {
      statement.effect = invalidEffect;
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.expect(error).to.be.an.instanceof(InvalidArgumentException);
  });

  test(`Check effect setter sets value: ${Statement.DENY}`, () => {
    let error = null;
    try {
      statement.effect = Statement.DENY;
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.equal(null);
    chai.expect(statement.effect).to.be.equal(Statement.DENY);
  });

  test(`Check effect setter sets value: ${Statement.ALLOW}`, () => {
    let error = null;
    try {
      statement.effect = Statement.ALLOW;
    } catch (e) {
      error = e;
      chai.expect(error).to.be.equal(null);
    }

    chai.expect(statement.effect).to.be.equal(Statement.ALLOW);
  });

  test(`Check condition setter sets _condition=${condition}`, () => {
    statement.condition = condition;
    chai.expect(statement.condition).to.be.equal(condition);
  });

  test(`Check principal setter sets _principal=${principal}`, () => {
    statement.principal = principal;
    chai.expect(statement.principal).to.be.equal(principal);
  });

  test('Check extract() method returns valid statement', () => {
    let expectedResult = {
      Action: '*',
      Effect: 'Allow',
      Principal: 'principalTest',
    };
    chai.expect(statement.extract()).to.be.eql(expectedResult);
  });
});

'use strict';

import chai from 'chai';
import {Action} from '../../../lib/AWS/IAM/Action';
import {Policy} from '../../../lib/AWS/IAM/Policy';
import {InvalidArgumentException} from '../../../lib/Exception/InvalidArgumentException';

suite('AWS/IAM/Action', () => {
  let action = new Action();
  let actionName = 'GET';
  let validServiceName = 'sns';
  let invalidServiceName = 'invalidServiceTest';

  test('Class Action exists in AWS/IAM/Action', () => {
    chai.expect(Action).to.be.an('function');
  });

  test(`Check constructor sets _service=${Policy.ANY}`, () => {
    chai.expect(action.service).to.be.equal(Policy.ANY);
  });

  test(`Check constructor sets _action=${Policy.ANY}`, () => {
    chai.expect(action.action).to.be.equal(Policy.ANY);
  });

  test(`Check action setter sets value ${actionName}`, () => {
    action.action = actionName;
    chai.expect(action.action).to.be.equal(actionName);
  });

  test(`Check service setter sets value ${validServiceName}`, () => {
    action.service = validServiceName;
    chai.expect(action.service).to.be.equal(validServiceName);
  });

  //@todo - to be updated
  //test(`Check service setter throws exception for invalid value: ${invalidServiceName}`, () => {
  //  let error = null;
  //  try {
  //    action.service = invalidServiceName;
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.an.instanceof(InvalidArgumentException);
  //});

  test(`Check exract() method returns: ${validServiceName}:${actionName}`, () => {
    chai.expect(action.extract()).to.be.equal(`${validServiceName}:${actionName}`);
  });
});

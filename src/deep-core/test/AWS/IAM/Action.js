'use strict';

import chai from 'chai';
import {Action} from '../../../lib.compiled/AWS/IAM/Action';
import {Policy} from '../../../lib.compiled/AWS/IAM/Policy';
import {InvalidArgumentException} from '../../../lib.compiled/Exception/InvalidArgumentException';

suite('AWS/IAM/Action', function() {
  let action = new Action();
  let actionName = 'GET';
  let validServiceName = 'sns';
  let invalidServiceName = 'invalidServiceTest';

  test('Class Action exists in AWS/IAM/Action', function() {
    chai.expect(typeof Action).to.equal('function');
  });

  test(`Check constructor sets _service=${Policy.ANY}`, function() {
    chai.expect(action.service).to.be.equal(Policy.ANY);
  });

  test(`Check constructor sets _action=${Policy.ANY}`, function() {
    chai.expect(action.action).to.be.equal(Policy.ANY);
  });

  test(`Check action setter sets value ${actionName}`, function() {
    action.action = actionName;
    chai.expect(action.action).to.be.equal(actionName);
  });

  test(`Check service setter sets value ${validServiceName}`, function() {
    action.service = validServiceName;
    chai.expect(action.service).to.be.equal(validServiceName);
  });

  test(`Check service setter throws exception for invalid value: ${invalidServiceName}`, function() {
    let error = null;
    try {
      action.service = invalidServiceName;
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.an.instanceof(InvalidArgumentException);
  });

  test(`Check exract() method returns: ${validServiceName}:${actionName}`, function() {
    chai.expect(action.extract()).to.be.equal(`${validServiceName}:${actionName}`);
  });
});

'use strict';

import chai from 'chai';
import {Resource} from '../../../lib/AWS/IAM/Resource';
import {InvalidArgumentException} from '../../../lib/Exception/InvalidArgumentException';
import {InvalidArnException} from '../../../lib/AWS/IAM/Exception/InvalidArnException';

suite('AWS/IAM/Resource', () => {
  let resource = new Resource();
  let validServiceName = 'lambda';
  let validRegion = 'us-west-2';
  let accountId = 'accountIdTest';
  let descriptor = 'descriptorTest';
  let validArn = 'arn:aws:sns:us-west-1:accountIdFromArn:descriptorFromArn';
  let invalidServiceName = 'invalidServiceTest';
  let invalidRegion = 'invalidRegionTest';
  let invalidArn = 'invalidArnTest';

  test('Class Resource exists in AWS/IAM/Resource', () => {
    chai.expect(Resource).to.be.an('function');
  });

  test('Check constructor sets _descriptor=""', () => {
    chai.expect(resource.descriptor).to.be.equal('');
  });

  test('Check constructor sets _accountId=""', () => {
    chai.expect(resource.accountId).to.be.equal('');
  });

  test('Check constructor sets _region=""', () => {
    chai.expect(resource.region).to.be.equal('');
  });

  test('Check constructor sets _service="*"', () => {
    chai.expect(resource.service).to.be.equal("*");
  });

  test(`Check accountId setter sets value ${accountId}`, () => {
    resource.accountId = accountId;
    chai.expect(resource.accountId).to.be.equal(accountId);
  });

  test(`Check service setter sets value ${validServiceName}`, () => {
    resource.service = validServiceName;
    chai.expect(resource.service).to.be.equal(validServiceName);
  });

  test(`Check region setter sets value ${validRegion}`, () => {
    resource.region = validRegion;
    chai.expect(resource.region).to.be.equal(validRegion);
  });

  test(`Check descriptor setter sets value ${descriptor}`, () => {
    resource.descriptor = descriptor;
    chai.expect(resource.descriptor).to.be.equal(descriptor);
  });

  //@todo - to be updated
  //test(`Check region setter throws InvalidArgumentException for invalid value: ${invalidRegion}`, () => {
  //  let error = null;
  //  try {
  //    resource.region = invalidRegion;
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.an.instanceof(InvalidArgumentException);
  //});
  //
  //test(`Check service setter throws InvalidArgumentException for invalid value: ${invalidServiceName}`, () => {
  //  let error = null;
  //  try {
  //    resource.service = invalidServiceName;
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.an.instanceof(InvalidArgumentException);
  //});
  //
  //test(`Check updateFromArn method throws InvalidArnException for invalid value: ${invalidArn}`, () => {
  //  let error = null;
  //  try {
  //    resource.updateFromArn(invalidArn);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.an.instanceof(InvalidArnException);
  //});

  test(`Check extract() method returns: arn:aws:${validServiceName}:${validRegion}:${accountId}:${descriptor}`, () => {
    chai.expect(resource.extract()).to.be.equal(`arn:aws:${validServiceName}:${validRegion}:${accountId}:${descriptor}`);
  });

  test('Check updateFromArn() method sets values correctly', () => {
    let arnParts = validArn.split(':');
    resource.updateFromArn(validArn);
    chai.expect(arnParts.length).to.be.equal(6);
    chai.expect(resource.service).to.be.equal(arnParts[2]);
    chai.expect(resource.region).to.be.equal(arnParts[3]);
    chai.expect(resource.accountId).to.be.equal(arnParts[4]);
    chai.expect(resource.descriptor).to.be.equal(arnParts.slice(5).join(':'));
  });
});

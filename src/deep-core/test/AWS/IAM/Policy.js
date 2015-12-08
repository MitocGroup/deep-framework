'use strict';

import chai from 'chai';
import {Policy} from '../../../lib/AWS/IAM/Policy';
import {Collection} from '../../../lib/AWS/IAM/Collection';

suite('AWS/IAM/Policy', function() {
  let policy = new Policy();
  let newVersion = '2015-09-23';
  let expectedResult = '{"Version":"2015-09-23","Statement":[]}';

  test('Class Policy exists in AWS/IAM/Policy', function() {
    chai.expect(typeof Policy).to.equal('function');
  });

  test('Check constructor sets _version="2012-10-17"', function() {
    chai.expect(policy.version).to.be.equal('2012-10-17');
  });

  test('Check constructor sets _statement', function() {
    chai.assert.typeOf(policy.statement, 'object', 'created Statement object');
  });

  test('Check ANY static getter return "*"', function() {
    chai.expect(Policy.ANY).to.be.equal('*');
  });

  test('Check DEFAULT_VERSION static getter return "2012-10-17"', function() {
    chai.expect(Policy.DEFAULT_VERSION).to.be.equal('2012-10-17');
  });

  test(`Check version setter sets _version=${newVersion}`, function() {
    policy.version = newVersion;
    chai.expect(policy.version).to.be.equal(newVersion);
  });

  test('Check exract() method returns valid object', function() {
    policy.version = newVersion;
    chai.expect(policy.extract().Version).to.be.equal(newVersion);
    chai.expect(policy.extract().Statement).to.be.eql([]);
  });

  test('Check toString() method returns valid string', function() {
    chai.expect(policy.toString()).to.be.eql(expectedResult);
  });
});

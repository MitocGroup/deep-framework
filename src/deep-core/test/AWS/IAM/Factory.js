'use strict';

import chai from 'chai';
import {Factory} from '../../../lib.compiled/AWS/IAM/Factory';
import {Statement} from '../../../lib.compiled/AWS/IAM/Statement';

suite('AWS/IAM/Factory', function() {
  let factory = new Factory();
  let objectPrototype = {key1: 'value'};
  let stringPrototype = 'proto';

  test('Class Factory exists in AWS/IAM/Factory', function() {
    chai.expect(typeof Factory).to.equal('function');
  });

  test('Object of class Factory created successfully', function() {
    chai.expect(typeof factory).to.equal('object');
  });

  test('Check _assurePrototype static method returns valid prototype', function() {
    chai.expect(Factory._assurePrototype(objectPrototype)).to.be.equal(objectPrototype);
  });

  test('Check _assurePrototype static method returns valid prototype', function() {
    //todo - TBD
    //chai.expect(Factory._assurePrototype(stringPrototype)).to.be.eql({});
  });

  test('Check create() static method returns new prototype', function() {
    //todo - TBD
    //chai.expect(Factory.create(objectPrototype)).to.be.eql(objectPrototype);
  });

  test('Check POLICY static getter returns Policy class', function() {
    chai.expect(typeof Factory.POLICY).to.be.equal('function');
  });

  test('Check RESOURCE static getter returns Resources class', function() {
    chai.expect(typeof Factory.RESOURCE).to.be.equal('function');
  });

  test('Check ACTION static getter returns Action class', function() {
    chai.expect(typeof Factory.ACTION).to.be.equal('function');
  });

  test('Check STATEMENT static getter returns Statement class', function() {
    chai.expect(typeof Factory.STATEMENT).to.be.equal('function');
  });
});

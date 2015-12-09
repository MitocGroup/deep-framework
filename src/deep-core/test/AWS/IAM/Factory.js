'use strict';

import chai from 'chai';
import {Factory} from '../../../lib/AWS/IAM/Factory';
import {Collection} from '../../../lib/AWS/IAM/Collection';
import {Policy} from '../../../lib/AWS/IAM/Policy';
import {Extractor} from './Extractable';

suite('AWS/IAM/Factory', function() {
  let factory = new Factory();
  let testObject = {key1: 'value'};

  test('Class Factory exists in AWS/IAM/Factory', function() {
    chai.expect(typeof Factory).to.equal('function');
  });

  test('Object of class Factory created successfully', function() {
    chai.expect(typeof factory).to.equal('object');
  });

  test('Check _assurePrototype static method returns Object prototype', function() {
    chai.expect(Factory._assurePrototype(testObject)).to.be.equal(testObject);
  });

  test('Check _assurePrototype static method returns Extractable prototype', function() {
    chai.expect(Factory._assurePrototype(Extractor)).to.be.equal(Extractor);
  });

  test('Check _assurePrototype static method returns valid prototype by string', function() {
    let actualResult = Factory._assurePrototype('POLICY');
    chai.expect(actualResult).to.be.eql(Policy);
    chai.expect(typeof actualResult.__proto__).to.be.equal('function');
  });

  test('Check create() static method returns new prototype', function() {
    let actualResult = Factory.create(Extractor);
    chai.assert.instanceOf(actualResult, Extractor, 'create() method returns instance of Extractor');
  });

  test('Check createCollection() static method returns valid collection', function() {
    let actualResult = Factory.createCollection(Extractor);
    chai.assert.instanceOf(actualResult, Collection, 'createCollection() method returns instance of Collection');
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

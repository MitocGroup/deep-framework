'use strict';

import chai from 'chai';
import {Factory} from '../../../lib/AWS/IAM/Factory';
import {Collection} from '../../../lib/AWS/IAM/Collection';
import {Policy} from '../../../lib/AWS/IAM/Policy';
import {Extractor} from './Extractable.spec';

suite('AWS/IAM/Factory', () => {
  let factory = new Factory();
  let testObject = {key1: 'value'};

  test('Class Factory exists in AWS/IAM/Factory', () => {
    chai.expect(Factory).to.be.an('function');
  });

  test('Object of class Factory created successfully', () => {
    chai.expect(typeof factory).to.equal('object');
  });

  test('Check _assurePrototype static method returns Object prototype', () => {
    chai.expect(Factory._assurePrototype(testObject)).to.be.equal(testObject);
  });

  test('Check _assurePrototype static method returns Extractable prototype', () => {
    chai.expect(Factory._assurePrototype(Extractor)).to.be.equal(Extractor);
  });

  test('Check _assurePrototype static method returns valid prototype by string', () => {
    let actualResult = Factory._assurePrototype('POLICY');
    chai.expect(actualResult).to.be.eql(Policy);
    chai.expect(typeof actualResult.__proto__).to.be.equal('function');
  });

  test('Check create() static method returns new prototype', () => {
    let actualResult = Factory.create(Extractor);
    chai.assert.instanceOf(actualResult, Extractor, 'create() method returns instance of Extractor');
  });

  test('Check createCollection() static method returns valid collection', () => {
    let actualResult = Factory.createCollection(Extractor);
    chai.assert.instanceOf(actualResult, Collection, 'createCollection() method returns instance of Collection');
  });

  test('Check POLICY static getter returns Policy class', () => {
    chai.expect(typeof Factory.POLICY).to.be.equal('function');
  });

  test('Check RESOURCE static getter returns Resources class', () => {
    chai.expect(typeof Factory.RESOURCE).to.be.equal('function');
  });

  test('Check ACTION static getter returns Action class', () => {
    chai.expect(typeof Factory.ACTION).to.be.equal('function');
  });

  test('Check STATEMENT static getter returns Statement class', () => {
    chai.expect(typeof Factory.STATEMENT).to.be.equal('function');
  });
});

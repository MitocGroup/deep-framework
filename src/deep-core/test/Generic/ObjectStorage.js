'use strict';

import chai from 'chai';
import {ObjectStorage} from '../../lib/Generic/ObjectStorage';

suite('Generic/ObjectStorage', function() {
  let inputArray = [{firstItem: 'value0'}, {secondItem: 'value1'}];
  let objectStorage = new ObjectStorage(inputArray);
  let itemToAdd = {thirdItem: 'value2'};
  let item = {fourth: 'value3'};

  test('Class ObjectStorage exists in Generic/ObjectStorage', function() {
    chai.expect(typeof ObjectStorage).to.equal('function');
  });

  test('Check constructor sets _vector', function() {
    chai.expect(objectStorage.iterator).to.be.eql(inputArray);
  });

  test('Check add() method adds new item to _vector', function() {
    chai.expect(objectStorage.iterator.length).to.be.equal(2);
    objectStorage.add(itemToAdd);
    chai.expect(objectStorage.iterator.length).to.be.equal(3);
    chai.expect(objectStorage._vector[2]).to.be.eql(itemToAdd);
  });

  test('Check find() method in strict mode returns valid object', function() {
    let actualResult = objectStorage.find(itemToAdd, true);
    chai.expect(actualResult).to.be.eql(itemToAdd);
  });

  test('Check find() method in non-strict mode returns valid object', function() {
    let actualResult = objectStorage.find(Object);
    chai.expect(actualResult).to.be.eql(objectStorage._vector[0]);
  });

  test('Check find() method in non-strict mode returns valid string', function() {
    objectStorage.add(3);
    let actualResult = objectStorage.find(Number);
    chai.expect(actualResult).to.be.eql(null);
  });
});
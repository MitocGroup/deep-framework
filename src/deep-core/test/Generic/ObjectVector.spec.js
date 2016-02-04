'use strict';

import chai from 'chai';
import {ObjectVector} from '../../lib/Generic/ObjectVector';

suite('Generic/ObjectVector', () => {
  var TestProto = () => {
    return 'test';
  };
  let firstItemToAdd = new TestProto();
  firstItemToAdd.testData = 'firstItemToAdd';
  let secondItemToAdd = new TestProto();
  secondItemToAdd.testData = 'secondItemToAdd';
  let thirdItemToAdd = {testData: 'thirdItemToAdd'};
  let objectVector = null;

  test('Class ObjectVector exists in Generic/ObjectVector', () => {
    chai.expect(ObjectVector).to.be.an('function');
  });

  test('Check constructor throws exception for invalid input', () => {
    let error = null;
    try {
      new ObjectVector(TestProto, firstItemToAdd, secondItemToAdd, thirdItemToAdd);
    } catch (e) {
      error = e;
    }

    chai.assert.instanceOf(error, Error, 'error is an instance of Error');
  });

  test('Check constructor for valid input', () => {
    objectVector = new ObjectVector(TestProto, firstItemToAdd, secondItemToAdd);
    chai.expect(objectVector.collection).to.be.eql([firstItemToAdd, secondItemToAdd]);
  });
});
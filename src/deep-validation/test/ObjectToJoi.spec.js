'use strict';

import chai from 'chai';
import {ObjectToJoi} from '../lib/ObjectToJoi';
import {InvalidSchemaException} from '../lib/Exception/InvalidSchemaException';

suite('ObjectToJoi', () => {
  let baseObject = 'baseObject';
  let objectToJoi = new ObjectToJoi(baseObject);

  test('Class ObjectToJoi exists in ObjectToJoi', () => {
    chai.expect(ObjectToJoi).to.be.an('function');
  });

  test(`Check constructor sets _baseObject to: ${baseObject}`, () => {
    chai.expect(objectToJoi.baseObject).to.be.eql(baseObject);
  });

  test('Check _transform() static method returns valid object', () => {
    let validObjectInput = {firstKey: 'string'};

    let actualResult = ObjectToJoi._transform(validObjectInput);

    chai.expect(typeof actualResult).to.be.equal('object');
  });

  test(
    'Check _transform(obj) static method returns valid object typeof value === "object"',
    () => {
      let validObjectInput = {
        firstKey: {
          name: 'string',
        },
      };

      let actualResult = ObjectToJoi._transform(validObjectInput);

      chai.expect(typeof actualResult).to.be.equal('object');
    }
  );

  //@todo - to be updated
  //test('Check _transform() static method throws "InvalidSchemaException"',
  //  () => {
  //    let error = null;
  //    let invalidObjectInput = {firstKey: 'value1'};
  //
  //    try {
  //      ObjectToJoi._transform(invalidObjectInput);
  //    } catch (e) {
  //      error = e;
  //    }
  //
  //    chai.expect(error).to.be.an.instanceof(InvalidSchemaException);
  //    chai.expect(error.message).to.be.equal(
  //      `deep-db model ${
  //        JSON.stringify(invalidObjectInput)
  //        } validation schema fails: Unknown field type ${
  //        invalidObjectInput.firstKey
  //        }`
  //    );
  //  }
  //);
  //
  //test('Check transform() method throws "InvalidSchemaException"', () => {
  //  let error = null;
  //  let invalidObjectInput = {firstKey: 'value1'};
  //  let objectToJoiTest = new ObjectToJoi(invalidObjectInput);
  //
  //  try {
  //    objectToJoiTest.transform();
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.expect(error).to.be.an.instanceof(InvalidSchemaException);
  //});

  test('Check transform() method returns valid object', () => {
    let validObjectInput = {firstKey: 'string'};
    let objectToJoiTest = new ObjectToJoi(validObjectInput);

    let actualResult = objectToJoiTest.transform();

    chai.expect(typeof actualResult).to.be.equal('object');
  });
});

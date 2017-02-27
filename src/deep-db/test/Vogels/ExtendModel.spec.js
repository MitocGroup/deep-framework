'use strict';

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {ExtendModel} from '../../lib/Vogels/ExtendModel';
import {Exception} from '../../lib/Vogels/Exceptions/Exception';
import {UndefinedMethodException} from '../../lib/Vogels/Exceptions/UndefinedMethodException';
import {ModelMock} from '../../test/Mock/ModelMock';
import {ExtendModelMock} from '../../test/Mock/ExtendModelMock';
import resultSegments from './scan.segments';

chai.use(sinonChai);

suite('Vogels/ExtendModel', () => {
  let model = {
    Name: {
      Name: 'string',
      Id: 'timeUUID',
    },
  };
  let extendModel = new ExtendModel(model);

  let modelMock = new ModelMock();
  modelMock.setMode(ModelMock.NO_RESULT_MODE);
  let mockedExtendModel = new ExtendModel(modelMock);

  test('Class ExtendModel exists in Vogels/ExtendModel', () => {
    chai.expect(ExtendModel).to.be.an('function');
  });

  test('Check constructor sets _model', () => {
    chai.expect(extendModel.model).to.be.equal(model);
  });

  test('Check DEFAULT_LIMIT static getter returns value more than 0', () => {
    chai.expect(ExtendModel.DEFAULT_LIMIT).to.be.above(0);
  });

  test('Check DEFAULT_SEGMENTS_NUMBER static getter returns value more than 0', () => {
    chai.expect(ExtendModel.DEFAULT_SEGMENTS_NUMBER).to.be.above(0);
  });

  test('Check buildScanParameters static getter returns value more than 0', () => {
    let expectedResult = {
      filterExpression: '#firstKey = :firstKey AND #secondKey = :secondKey',
      filterExpressionNames: {
        '#firstKey': 'firstKey',
        '#secondKey': 'secondKey',
      },
      filterExpressionValues: {
        ':firstKey': 'Value0',
        ':secondKey': 'Value0',
      },
    };
    let acttualResult = ExtendModel.buildScanParameters({firstKey: 'Value0', secondKey: 'Value0',})
    chai.expect(acttualResult).to.be.eql(expectedResult);
  });

  test('Check inject() method with methods=null', () => {
    chai.expect(extendModel.inject()).to.be.eql(model);
  });

  test('Check methods() getter', () => {
    let actualResult = extendModel.methods;
    let methods = Object.keys(actualResult);

    let expectedMethodNames = ['findAll', 'findAllPaginated', 'findOneById', 'findOneBy',
      'findBy', 'findAllBy', 'findAllByPaginated', 'findMatching', 'findOneMatching',
      'findAllMatching', 'findAllMatchingPaginated', 'deleteById',
      'deleteByIdConditional', 'createItem', 'createUniqueOnFields',
      'updateItem', 'updateItemConditional', 'findItems'];
    chai.expect(methods.length).to.be.eql(expectedMethodNames.length);

    //check all items is fucntions
    for (let methodName of expectedMethodNames) {
      chai.expect(methods).to.be.contains(methodName);
      chai.expect(typeof actualResult[methodName]).to.be.equal('function');
    }
  });
  
  test('Check method._findUntilLimitCb() passes one/multi/offset call', () => {
    let segmentKeys = Object.keys(resultSegments);
    let query = (new function() {
      let startKey = segmentKeys[0];
      
      return {
        limit() {
          return this;
        },
        startKey(key) {
          startKey = key || startKey;
          return this;
        },
        exec(cb) {
          const result = resultSegments[startKey];
          
          process.stdout.write(
            '\nDDB::SCAN::SEG#{' + startKey + '}-->' + 
            JSON.stringify(result) + 
            '\n'
          );
          cb(null, result);
        },
      };
    });
    
    
    let spyOneCallback = sinon.spy();
    mockedExtendModel.methods._findUntilLimitCb(spyOneCallback, query, 1);
    chai.expect(spyOneCallback).to.have.been.calledWithExactly(null, {
      ScannedCount: 3,
      Count: 1,
      Items: [ 'a1' ],
    });
    
    let spyManyCallback = sinon.spy();
    mockedExtendModel.methods._findUntilLimitCb(spyManyCallback, query, 7);
    chai.expect(spyManyCallback).to.have.been.calledWithExactly(null, {
      ScannedCount: 9,
      Count: 7,
      Items: [ 'a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'c1' ],
    });
    
    let spyAllOffsetCallback = sinon.spy();
    mockedExtendModel.methods._findUntilLimitCb(
      spyAllOffsetCallback, query, 1, 0, [], segmentKeys[segmentKeys.length - 3]
    );
    chai.expect(spyAllOffsetCallback).to.have.been.calledWithExactly(null, {
      ScannedCount: 6,
      Count: 6,
      Items: [ 'c1', 'c2', 'c3', 'd1', 'd2', 'd3' ],
    });
  });

  test('Check method.findAll() exist and can be called', () => {
    let spyCallback = sinon.spy();

    mockedExtendModel.methods.findAll(spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly(null, null);
  });

  // test('Check method.findAllPaginated() exist and can be called', () => {
  //   let spyCallback = sinon.spy();
  // 
  //   mockedExtendModel.methods.findAllPaginated('startKey', 'limit', spyCallback);
  // 
  //   chai.expect(spyCallback).to.have.been.calledWithExactly(null, null);
  // });

  test('Check method.findOneById() exist and can be called', () => {
    let spyCallback = sinon.spy();

    mockedExtendModel.methods.findOneById('id', spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly(null, null);
  });

  // test('Check method.findOneBy() exist and can be called', () => {
  //   let spyCallback = sinon.spy();
  // 
  //   mockedExtendModel.methods.findOneBy('fieldName', 'value', spyCallback);
  // 
  //   chai.expect(spyCallback).to.have.been.calledWithExactly(null, null);
  // });

  // test('Check method.findBy() exist and can be called', () => {
  //   let spyCallback = sinon.spy();
  // 
  //   mockedExtendModel.methods.findBy('fieldName', 'value', spyCallback);
  // 
  //   chai.expect(spyCallback).to.have.been.calledWithExactly(null, null);
  // });

  test('Check method.findAllBy() exist and can be called', () => {
    let spyCallback = sinon.spy();

    mockedExtendModel.methods.findAllBy('fieldName', 'value', spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly(null, null);
  });

  test('Check method.findAllByPaginated() exist and can be called', () => {
    let spyCallback = sinon.spy();

    mockedExtendModel.methods.findAllByPaginated('fieldName', 'value', 'startKey', 'limit', spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly(null, null);
  });

  // test('Check method.findMatching() exist and can be called', () => {
  //   let spyCallback = sinon.spy();
  // 
  //   mockedExtendModel.methods.findMatching({}, spyCallback);
  // 
  //   chai.expect(spyCallback).to.have.been.calledWithExactly(null, null);
  // });

  // test('Check method.findOneMatching() exist and can be called', () => {
  //   let spyCallback = sinon.spy();
  // 
  //   mockedExtendModel.methods.findOneMatching({}, spyCallback);
  // 
  //   chai.expect(spyCallback).to.have.been.calledWithExactly(null, null);
  // });

  test('Check method.findAllMatching() exist and can be called', () => {
    let spyCallback = sinon.spy();

    mockedExtendModel.methods.findAllMatching({}, spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly(null, null);
  });

  test('Check method.findAllMatchingPaginated() exist and can be called', () => {
    let spyCallback = sinon.spy();

    mockedExtendModel.methods.findAllMatchingPaginated({}, 'startKey', 'limit', spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly(null, null);
  });

  test('Check method.deleteById() exist and can be called', () => {
    let spyCallback = sinon.spy();

    mockedExtendModel.methods.deleteById('id', spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly(null, null);
  });

  test('Check method.deleteByIdConditional() exist and can be called', () => {
    let spyCallback = sinon.spy();

    mockedExtendModel.methods.deleteByIdConditional('id', spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly(null, null);
  });

  test('Check method.createItem() exist and can be called', () => {
    let spyCallback = sinon.spy();

    mockedExtendModel.methods.createItem('data', spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly(null, null);
  });

  test('Check method.updateItem() exist and can be called', () => {
    let spyCallback = sinon.spy();

    mockedExtendModel.methods.updateItem('id', {key: 'test value'}, spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly(null, null);
  });

  test('Check method.updateItemConditional() exist and can be called', () => {
    let spyCallback = sinon.spy();

    mockedExtendModel.methods.updateItemConditional('id', {key: 'test value'}, spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly(null, null);
  });

  test('Check method.createUniqueOnFields() for already existed item', () => {
    let spyCallback = sinon.spy();

    modelMock.setMode(ModelMock.DATA_WITH_COUNT_MODE, ['exec']);

    mockedExtendModel.methods.createUniqueOnFields('fields', {Count: false}, spyCallback);

    chai.expect(spyCallback).to.have.been.calledWith();

    chai.expect(spyCallback.args[0][0]).to.contains('already exists');
  });

  test('Check method.createUniqueOnFields() for new fields', () => {
    let spyCallback = sinon.spy();

    modelMock.setMode(ModelMock.DATA_MODE, ['exec']);

    mockedExtendModel.methods.createUniqueOnFields('fields', {Count: false}, spyCallback);

    chai.expect(spyCallback).to.have.been.calledWithExactly(null, null);
  });

  //@todo - to be updated
  //test('Check "Exception" exception can be called', () => {
  //  let extendModelMock = new ExtendModelMock();
  //  let error = null;
  //  let msg = 'Test message';
  //
  //  try {
  //    extendModelMock.throwException(msg);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.assert.instanceOf(error, Exception, 'error is an instance of Exception');
  //});
  //
  //test('Check "UndefinedMethodException" exception can be called', () => {
  //  let error = null;
  //  let method = 'test';
  //  let predefinedMethods = ['firstMethod', 'secondMethod'];
  //  let extendModelMock = new ExtendModelMock();
  //
  //  try {
  //    extendModelMock.throwUndefinedMethodException(method, predefinedMethods);
  //  } catch (e) {
  //    error = e;
  //  }
  //
  //  chai.assert.instanceOf(
  //    error, UndefinedMethodException, 'error is an instance of UndefinedMethodException'
  //  );
  //});
});

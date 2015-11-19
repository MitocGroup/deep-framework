'use strict';

import chai from 'chai';
import {ExtendModel} from '../../lib.compiled/Vogels/ExtendModel';
import {ExtendModelMock} from '../../test/Mock/ExtendModelMock';
import {Exception} from '../../lib.compiled/Vogels/Exceptions/Exception';
import {UndefinedMethodException} from '../../lib.compiled/Vogels/Exceptions/UndefinedMethodException';

suite('Vogels/ExtendModel', function() {
  let model = {name: 'userName'};
  let extendModel = new ExtendModel(model);

  test('Class ExtendModel exists in Vogels/ExtendModel', function() {
    chai.expect(typeof ExtendModel).to.equal('function');
  });

  test('Check constructor sets _model', function() {
    chai.expect(extendModel.model).to.be.equal(model);
  });

  test('Check DEFAULT_LIMIT static getter returns value more than 0', function() {
    chai.expect(ExtendModel.DEFAULT_LIMIT).to.be.above(0);
  });

  test('Check DEFAULT_SEGMENTS_NUMBER static getter returns value more than 0', function() {
    chai.expect(ExtendModel.DEFAULT_SEGMENTS_NUMBER).to.be.above(0);
  });

  test('Check buildScanParameters static getter returns value more than 0', function() {
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

  test('Check inject() method with methods=null', function() {
    chai.expect(extendModel.inject()).to.be.eql(model);
  });

  test('Check inject() method with one method ', function() {
    let error = null;

    try {
      extendModel.inject('findAlll');
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
  });

  test('Check methods() getter', function() {
    let actualResult = extendModel.methods;
    let methods = Object.keys(actualResult);

    let expectedMethodNames = ['findAll', 'findAllPaginated', 'findOneById', 'findOneBy',
      'findBy', 'findAllBy', 'findAllByPaginated', 'findMatching', 'findOneMatching',
      'findAllMatching', 'findAllMatchingPaginated', 'deleteById',
      'deleteByIdConditional', 'createItem', 'createUniqueOnFields',
      'updateItem', 'updateItemConditional',];
    chai.expect(methods.length).to.be.eql(expectedMethodNames.length);

    //check all items is fucntions
    for (let methodName of expectedMethodNames) {
      chai.expect(methods).to.be.contains(methodName);
      chai.expect(typeof actualResult[methodName]).to.be.equal('function');
    }
  });

  test('Check method.findAll() exist and can be called', function() {
    let mockedExtendModel = new ExtendModelMock({name: 'userName'});
    let error = null;
    try {
      mockedExtendModel.methods.findAll();
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
  });

  test('Check method.findAllPaginated() exist and can be called', function() {
    let mockedExtendModel = new ExtendModelMock({name: 'userName'});
    let error = null;
    try {
      mockedExtendModel.methods.findAllPaginated();
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
  });

  test('Check method.findOneById() exist and can be called', function() {
    let mockedExtendModel = new ExtendModelMock({name: 'userName'});
    let error = null;
    try {
      mockedExtendModel.methods.findOneById();
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
  });

  test('Check method.findOneBy() exist and can be called', function() {
    let mockedExtendModel = new ExtendModelMock({name: 'userName'});
    let error = null;
    try {
      mockedExtendModel.methods.findOneBy();
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
  });

  test('Check method.findBy() exist and can be called', function() {
    let mockedExtendModel = new ExtendModelMock({name: 'userName'});
    let error = null;
    try {
      mockedExtendModel.methods.findBy();
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
  });

  test('Check method.findAllBy() exist and can be called', function() {
    let mockedExtendModel = new ExtendModelMock({name: 'userName'});
    let error = null;
    try {
      mockedExtendModel.methods.findAllBy();
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
  });

  test('Check method.findAllByPaginated() exist and can be called', function() {
    let mockedExtendModel = new ExtendModelMock({name: 'userName'});
    let error = null;
    try {
      mockedExtendModel.methods.findAllByPaginated();
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
  });

  test('Check method.findMatching() exist and can be called', function() {
    let mockedExtendModel = new ExtendModelMock({name: 'userName'});
    let error = null;
    try {
      mockedExtendModel.methods.findMatching();
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
  });

  test('Check method.findOneMatching() exist and can be called', function() {
    let mockedExtendModel = new ExtendModelMock({name: 'userName'});
    let error = null;
    try {
      mockedExtendModel.methods.findOneMatching();
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
  });

  test('Check method.findAllMatching() exist and can be called', function() {
    let mockedExtendModel = new ExtendModelMock({name: 'userName'});
    let error = null;
    try {
      mockedExtendModel.methods.findAllMatching();
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
  });

  test('Check method.findAllMatchingPaginated() exist and can be called', function() {
    let mockedExtendModel = new ExtendModelMock({name: 'userName'});
    let error = null;
    try {
      mockedExtendModel.methods.findAllMatchingPaginated();
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
  });

  test('Check method.deleteById() exist and can be called', function() {
    let mockedExtendModel = new ExtendModelMock({name: 'userName'});
    let error = null;
    try {
      mockedExtendModel.methods.deleteById();
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
  });

  test('Check method.deleteByIdConditional() exist and can be called', function() {
    let mockedExtendModel = new ExtendModelMock({name: 'userName'});
    let error = null;
    try {
      mockedExtendModel.methods.deleteByIdConditional();
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
  });

  test('Check method.createItem() exist and can be called', function() {
    let mockedExtendModel = new ExtendModelMock({name: 'userName'});
    let error = null;
    try {
      mockedExtendModel.methods.createItem();
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
  });

  test('Check method.updateItem() exist and can be called', function() {
    let mockedExtendModel = new ExtendModelMock({name: 'userName'});
    let error = null;
    try {
      mockedExtendModel.methods.updateItem('id', {});
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
  });

  test('Check method.updateItemConditional() exist and can be called', function() {
    let mockedExtendModel = new ExtendModelMock({name: 'userName'});
    let error = null;
    try {
      mockedExtendModel.methods.updateItemConditional('id', {}, 'condition');
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
  });

  test('Check method.createUniqueOnFields() exist and can be called', function() {
    let mockedExtendModel = new ExtendModelMock({name: 'userName'});
    let error = null;
    try {
      mockedExtendModel.methods.createUniqueOnFields(['id', 'name'], {id: 'testId', name: 'testName'});
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
  });

  test('Check "Exception" exception can be called', function() {
    let mockedExtendModel = new ExtendModelMock();
    let error = null;
    let msg = 'Test message';
    try {
      mockedExtendModel.throwException(msg);
    } catch (e) {
      error = e;
    }

    chai.assert.instanceOf(error, Exception, 'error is an instance of Exception');
  });

  test('Check "UndefinedMethodException" exception can be called', function() {
    let mockedExtendModel = new ExtendModelMock();
    let error = null;
    let method = 'test';
    let predefinedMethods = ['firstMethod', 'secondMethod'];
    try {
      mockedExtendModel.throwUndefinedMethodException(method, predefinedMethods);
    } catch (e) {
      error = e;
    }

    chai.assert.instanceOf(error, UndefinedMethodException, 'error is an instance of UndefinedMethodException');
  });
});

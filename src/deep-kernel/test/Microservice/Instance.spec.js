'use strict';

import chai from 'chai';
import {Instance} from '../../lib/Microservice/Instance';
import {Injectable} from '../../lib/Microservice/Injectable';
import Core from 'deep-core';
import backendConfig from '../common/backend-cfg-json';

suite('Microservice/Instance', () => {
  let identifier = 'deep-hello-world';
  let rawResources = backendConfig.microservices[identifier].resources;
  let instance = new Instance(identifier, rawResources);

  test('Class Instance exists in Microservice/Instance', () => {
    chai.expect(Instance).to.be.an('function');
  });

  test('Check constructor sets _isRoot=false', () => {
    chai.expect(instance.isRoot).to.be.equal(false);
  });

  test('Check constructor sets _identifier', () => {
    chai.expect(instance.identifier).to.be.equal(identifier);
  });

  test('Check constructor sets _rawResources', () => {
    chai.expect(instance.rawResources).to.be.equal(rawResources);
  });

  test('Check toString() method returns _identifier', () => {
    chai.expect(instance.toString()).to.be.equal(instance.identifier);
  });

  test('Check isRoot getter/setter', () => {
    chai.expect(instance.isRoot).to.be.equal(false);
    instance.isRoot = true;
    chai.expect(instance.isRoot).to.be.equal(true);
    instance.isRoot = false;
    chai.expect(instance.isRoot).to.be.equal(false);
  });

  test('Check createVector() static method returns valid vector', () => {
    let actualResult = Instance.createVector(backendConfig);

    //check if all items are objects of Instance
    chai.expect(actualResult.length).to.be.equal(2);
    for (let result of actualResult) {
      chai.assert.instanceOf(result, Instance, ' is an instance of Instance');
    }
  });

  test('Check inject() method throws "Core.Exception.InvalidArgumentException" ' +
    'exception for invalid args', () => {
    let error = null;
    let invalidInstance = 'invalidInstance';
    try {
      instance.inject(invalidInstance);
    } catch (e) {
      error = e;
    }

    chai.expect(error).to.be.not.equal(null);
    chai.expect(error).to.be.an.instanceof(Core.Exception.InvalidArgumentException);
    chai.expect(error.message).to.be.contains('Invalid argument');
  });

  test('Check inject() method returns valid object', () => {
    let injectable = new Injectable();
    let actualResult = instance.inject(injectable);
    chai.assert.instanceOf(actualResult, Injectable, 'is an instance of Injectable');
    chai.assert.instanceOf(actualResult.microservice, Instance, 'is an instance of Instance');
  });
});

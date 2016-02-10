'use strict';

import chai from 'chai';
import {AbstractFsDriver} from '../../lib.compiled/Driver/AbstractFsDriver';
import {AbstractFsDriverMock} from '../Mocks/AbstractFsDriverMock';

suite('Driver/AbstractFsDriver', () => {
  let abstractFsDriver = null;

  test('Class AbstractFsDriver exists in Driver/AbstractFsDriver', () => {
    chai.expect(AbstractFsDriver).to.be.an('function');
  });

  test('Check constructor', () => {
    abstractFsDriver = new AbstractFsDriverMock();

    chai.expect(abstractFsDriver, 'is an instance of AbstractFsDriver').to.be.an.instanceOf(AbstractFsDriverMock);

    chai.expect(abstractFsDriver._directory).to.equal(AbstractFsDriver.DEFAULT_DIRECTORY);
  });

  test('Check DEFAULT_DIRECTORY', () => {
    chai.expect(AbstractFsDriver.DEFAULT_DIRECTORY).to.equal('__cache__');
  });

  test('Check _now is a number', () => {
    chai.expect(AbstractFsDriverMock._now).to.be.an('number');
  });

  test('Check _now is a string', () => {
    chai.expect(AbstractFsDriverMock._hash('test text', 'sha1')).to.be.an('string');
  });

  test('Check _buildKey', () => {
    let pattern = /.*\/.*\..*/g;
    chai.expect(pattern.test(abstractFsDriver._buildKey('key'))).to.equal(true);
  });
});

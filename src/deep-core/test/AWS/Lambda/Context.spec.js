'use strict';

import chai from 'chai';
import {Context} from '../../../lib/AWS/Lambda/Context';

suite('AWS/Lambda/Context', () => {
  let context = null;
  let options = {optionKey: 'Test value'};

  test('Class Context exists in AWS/Lambda/Context', () => {
    chai.expect(Context).to.be.an('function');
  });

  test('Check constructor', () => {
    context = new Context(options);

    chai.expect(context).to.be.an.instanceOf(Context);
    chai.expect(context.options).to.be.eql(options);
  });

  test('Check getOption returns option value', () => {
    let option = 'optionKey';

    chai.expect(context.getOption(option)).to.be.eql(options[option]);
  });

  test('Check getOption returns defaul value', () => {
    let defaultValue = 'test default value';

    chai.expect(context.getOption('invalid option', defaultValue)).to.be.equal(defaultValue);
  });
});

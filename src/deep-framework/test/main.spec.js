'use strict';

const chai = require('chai');
const lib = require('../lib.es6/Framework.js').Framework;

describe('Sample suit for deep-framework', () => {  
  it('Check Framework.js to export an instanceof Function', () => {
    chai.expect(lib).to.be.a('function');
  });
});

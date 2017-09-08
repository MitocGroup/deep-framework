'use strict';

const chai = require('chai');
const lib = require('../lib.es6/bootstrap.js');

describe('Sample suit for deep-kernel', () => {  
  it('Check bootstrap.js to export an instanceof Function', () => {
    chai.expect(lib).to.be.a('function');
  });
});

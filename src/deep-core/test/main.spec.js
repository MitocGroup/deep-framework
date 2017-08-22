'use strict';

const chai = require('chai');
const lib = require('../lib.es6/bootstrap.js');

describe('Sample suit for deep-core', () => {  
  it('Check bootstrap.js to export an Object', () => {
    chai.expect(lib).to.be.an('object');
  });
});

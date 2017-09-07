'use strict';

const chai = require('chai');
const lib = require('../lib.es6/bootstrap.js');

describe('Sample suit for deep-notification', () => {  
  it('Check bootstrap.js to export an instanceof Object', () => {
    chai.expect(lib).to.be.instanceof(Object);
  });
});
